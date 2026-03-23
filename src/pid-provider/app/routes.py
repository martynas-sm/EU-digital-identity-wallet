from functools import partial
from quart import request, session, redirect, url_for, render_template, jsonify, Blueprint
from jwcrypto import jwk
from sd_jwt.issuer import SDJWTIssuer
from sd_jwt.common import SDObj
from quart_cors import cors
import time
import hashlib
import urllib.parse
import pyotp

MAIN_DOMAIN = 'pid-provider.wallet.test'
PUBLIC_DOMAIN = 'public.pid-provider.wallet.test'


def register_routes(app, db):
    main = Blueprint('main', __name__)
    public = Blueprint('public', __name__)

    cors(public, allow_origin="*")

    main_route = partial(main.route, host=MAIN_DOMAIN)
    public_route = partial(public.route, host=PUBLIC_DOMAIN)

    @main_route('/')
    async def index():
        return redirect(url_for('main.login'))

    @main_route('/login', methods=['GET', 'POST'])
    async def login():
        if request.method == 'GET':
            # Checks if the user is already logged in
            if session.get('totp_authenticated'):
                # Checks if the session has parameters to generate PID,
                # if not, redirect to dashboard
                if 'generate_state' in session:
                    return redirect(url_for('main.generate_pid', **session['generate_state']))
                return redirect(url_for('main.dashboard'))

            # If not logged in, clear the session but keep generate_state to generate the PID
            if not session.get('totp_authenticated'):
                gen_state = session.get('generate_state')
                session.clear()
                if gen_state:
                    session['generate_state'] = gen_state

        if request.method == 'POST':
            form = await request.form
            pan = form.get('personal_administrative_number')

            if pan:
                # Fetches the citizen from the database by personal ID
                async with db.connection() as conn:
                    record = await conn.fetch_first(
                        "SELECT * FROM citizens WHERE personal_administrative_number = :pan",
                        {"pan": pan}
                    )
                if record:
                    # On successful fetch, stores Personal ID in session
                    session['pan'] = pan

                    # If request to generate PID exists, binds Personal ID to parameters
                    if 'generate_state' in session:
                        session['generate_state']['target_pan'] = pan
                    return redirect(url_for('main.verify_totp'))
                error = "Citizen not found"

        return await render_template('login.html', error=error)

    @main_route('/totp/verify', methods=['GET', 'POST'])
    async def verify_totp():
        # Gets Personal ID from session
        pan = session.get('pan')
        if not pan:
            return redirect(url_for('main.login'))

        error = None
        if request.method == 'POST':
            form = await request.form
            user_code = form.get('code')

            # Fetches 2FA secret by users Personal ID
            async with db.connection() as conn:
                record = await conn.fetch_first(
                    "SELECT totp_secret FROM citizens WHERE personal_administrative_number = :pan",
                    {"pan": pan}
                )

            if record and record['totp_secret']:
                # Verifies 2FA code and stores authenticated status in session
                totp = pyotp.TOTP(record['totp_secret'])
                if totp.verify(user_code, valid_window=1):
                    session['totp_authenticated'] = True

                    # If it's a request to generate PID, redirects to generate PID
                    if 'generate_state' in session:
                        gen_state = session.get('generate_state')
                        return redirect(url_for('main.generate_pid', **gen_state))

                    # Otherwise, redirects to dashboard
                    return redirect(url_for('main.dashboard'))
                # If code is wrong
                error = "Invalid code."
            else:
                # If user has no 2FA code in the database
                error = "No 2FA configured."

        return await render_template('verify_totp.html', error=error)

    @main_route('/logout')
    async def logout():
        session.clear()
        return redirect(url_for('main.login'))

    @main_route('/dashboard')
    async def dashboard():
        # If the user is not logged in
        pan = session.get('pan')
        if not pan or not session.get('totp_authenticated'):
            return redirect(url_for('main.login'))

        # Fetches the citizen from the database by personal ID
        async with db.connection() as conn:
            record = await conn.fetch_first("SELECT * FROM citizens WHERE personal_administrative_number = :pan", {"pan": pan})

        return await render_template('dashboard.html', citizen=dict(record))

    @main_route('/api/request-pid', methods=['GET'])
    async def generate_pid():

        # Arguments from URL
        pub_key = request.args.get('pub_key')
        passkey = request.args.get('passkey')
        redirect_uri = request.args.get('redirect_uri')

        if not all([pub_key, passkey, redirect_uri]):
            return jsonify({"error": "Missing parameters"}), 400

        pan = session.get('pan')
        totp_ok = session.get('totp_authenticated')
        gen_state = session.get('generate_state')

        # Checks if the person logged in is the one allowed for this session
        if gen_state and gen_state.get('target_pan') and gen_state.get('target_pan') != pan:
            session.clear()
            return jsonify({"error": "Identity mismatch"}), 403

        # Stores URL parameters in session if not logged in
        if not pan or not totp_ok:
            session['generate_state'] = {
                'pub_key': pub_key, 'passkey': passkey, 'redirect_uri': redirect_uri
            }
            return redirect(url_for('main.login'))

        try:
            async with db.connection() as conn:
                record = await conn.fetch_first(
                    "SELECT * FROM citizens WHERE personal_administrative_number = :pan",
                    {"pan": session.get('pan')}
                )

            parsed_pub_key = None

            try:
                # Decodes url encoding of JWK key
                decoded_key = urllib.parse.unquote(pub_key)
                parsed_pub_key = jwk.JWK.from_json(decoded_key)
            except Exception as e:
                return jsonify({"error": f"Invalid JWK format from wallet: {str(e)}"}), 400

            # Mandatory (and some optional) attributes according to
            # https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog/blob/main/rulebooks/pid/pid-rulebook.md#2-pid-attributes-and-metadata

            # Attributes wrapped in SDObj are Selective Disclose Objects, and are
            # hashed individually. This allows the wallet user to prove individual
            # facts

            user_claims = {
                SDObj("given_name"): record["given_name"],
                SDObj("family_name"): record["family_name"],
                SDObj("birth_date"): str(record["birth_date"]),
                SDObj("birth_place"): record["birth_place"],
                SDObj("nationality"): record["nationality"],
                SDObj("resident_address"): record["resident_address"],
                SDObj("resident_country"): record["resident_country"],
                SDObj("resident_state"): record["resident_state"],
                SDObj("resident_city"): record["resident_city"],
                SDObj("resident_postal_code"): record["resident_postal_code"],
                SDObj("resident_street"): record["resident_street"],
                SDObj("resident_house_number"): record["resident_house_number"],
                SDObj("sex"): record["sex"],
                "issuing_authority": "Nacionalinis Gyventojų Registras",
                "issuing_country": "LT",
                "iss": "https://pid-provider.wallet.test",
                "iat": int(time.time()),
                "exp": int(time.time()) + (60*60*24*120),
                "cnf": {"jwk": parsed_pub_key.export_public(as_dict=True)}
            }

            issuer = SDJWTIssuer(
                user_claims=user_claims,
                issuer_key=app.issuer_key,
                holder_key=parsed_pub_key,
                sign_alg="ES256"
            )
            token = issuer.sd_jwt_issuance

            # Save to Issued PID to database
            hashed_passkey = hashlib.sha256(passkey.encode()).hexdigest()
            async with db.connection() as conn:
                await conn.execute(
                    "INSERT INTO issued_pids (passkey, sd_jwt) VALUES (:passkey, :sd_jwt)",
                    {"passkey": hashed_passkey, "sd_jwt": token}
                )

            # Clear generate_state if it was set
            session.pop('generate_state', None)

            return redirect(redirect_uri)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @public_route('/api/receive-pid', methods=['POST', 'OPTIONS'])
    async def issue_pid():
        if request.method == 'OPTIONS':
            return jsonify({"success": True}), 200
        data = await request.get_json()
        passkey = data.get('passkey')
        hashed_passkey = hashlib.sha256(passkey.encode()).hexdigest()
        # Fetches the token by the hashed passkey
        async with db.connection() as conn:
            record = await conn.fetch_first("SELECT sd_jwt FROM issued_pids WHERE passkey = :passkey AND created_at >= NOW() - INTERVAL '2 minutes'", {"passkey": hashed_passkey})
            # If token is found, delete it from database and return it
            if record:
                await conn.execute("DELETE FROM issued_pids WHERE passkey = :passkey", {"passkey": hashed_passkey})
                return jsonify({"pid": record['sd_jwt']})
        # If token is not found
        return jsonify({"error": "passkey doesn't match or expired"}), 404

    app.register_blueprint(main)
    app.register_blueprint(public)
