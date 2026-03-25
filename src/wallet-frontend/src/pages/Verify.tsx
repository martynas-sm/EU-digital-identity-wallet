import { useState } from "react";
import { getData, type Credential } from "@/data/wallet_data";
import styles from "../components/VerifyPage/Verify.module.css";
import { ShieldCheck } from "lucide-react";
import { SDJwtInstance } from '@sd-jwt/core';
import { digest, generateSalt } from '@sd-jwt/crypto-browser';

type VerificationRequest = {
  requested_claims: string[];
  nonce: string;
  proof_endpoint: string;
  relyingParty?: string;
};

function Verify() {
  const [jsonInput, setJsonInput] = useState(`{
    "requested_claims": ["Given Name", "Family Name", "Date of Birth"],
    "nonce": "1234567890",
    "proof_endpoint": "http://localhost:8000/api/proof"
}`);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [matchedCredential, setMatchedCredential] = useState<Credential | null>(
    null,
  );
  const [checkedAttributes, setCheckedAttributes] = useState<
    Record<string, boolean>
  >({});
  const [shared, setShared] = useState(false);

  const handleVerify = async () => {
    setError("");
    setRequest(null);
    setMatchedCredential(null);
    setCheckedAttributes({});
    setShared(false);

    let parsed: VerificationRequest;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setError("Invalid JSON. Please check the format and try again.");
      return;
    }

    if (!Array.isArray(parsed.requested_claims) || !parsed.nonce || !parsed.proof_endpoint) {
      setError(
        'JSON must contain "requested_claims", "nonce", and "proof_endpoint".'
      );
      return;
    }

    // Find the best credential that has the requested claims
    // Alternatively, credential_type could be used but that requires modifying specs/relying-party.md
    const credentials = (await getData()).credentials;
    const credential = credentials.find((c) =>
      parsed.requested_claims.some((claim) => Object.keys(c.subject).includes(claim))
    ) || credentials[0];

    if (!credential) {
      setError(`No valid credential found in your wallet.`);
      return;
    }

    const initialChecked: Record<string, boolean> = {};
    for (const attr of Object.keys(credential.subject)) {
      initialChecked[attr] = parsed.requested_claims.includes(attr);
    }

    setRequest(parsed);
    setMatchedCredential(credential);
    setCheckedAttributes(initialChecked);
  };

  const toggleAttribute = (attr: string) => {
    setCheckedAttributes((prev) => ({ ...prev, [attr]: !prev[attr] }));
  };


  const handleShare = async () => {
    if (!request || !matchedCredential) return;

    try {
      // https://github.com/openwallet-foundation/sd-jwt-js/tree/main/examples/sd-jwt-vc-example for reference
      const sdjwt = new SDJwtInstance({
        signer: async () => 'mock_signature',
        signAlg: 'ES256',
        hasher: digest,
        hashAlg: 'sha-256',
        saltGenerator: generateSalt,
        kbSigner: async () => 'mock_kb_signature',
        kbSignAlg: 'ES256'
      });

      const claims = matchedCredential.subject;
      const disclosureFrame: any = { _sd: Object.keys(claims) };

      const encodedSdjwt = await sdjwt.issue(claims, disclosureFrame);

      const presentationFrame: Record<string, boolean> = {};
      for (const [attr, checked] of Object.entries(checkedAttributes)) {
        if (checked) presentationFrame[attr] = true;
      }

      const kbPayload = {
        nonce: request.nonce,
        iat: Math.floor(Date.now() / 1000),
        aud: request.proof_endpoint,
      };

      const presentedSdJwt = await sdjwt.present(encodedSdjwt, presentationFrame, {
        kb: {
          payload: kbPayload
        }
      });

      await fetch(request.proof_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof: presentedSdJwt }),
      });
      setShared(true);
    } catch (err) {
      setError("Failed to share proof with relying party. " + String(err));
    }
  };

  const handleReset = () => {
    setJsonInput("");
    setError("");
    setRequest(null);
    setMatchedCredential(null);
    setCheckedAttributes({});
    setShared(false);
  };

  const selectedCount = Object.values(checkedAttributes).filter(Boolean).length;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <ShieldCheck size={28} /> Verify
      </h1>

      {!request && (
        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="json-input">
            Paste a verification request (JSON)
          </label>
          <textarea
            id="json-input"
            className={styles.textarea}
            rows={10}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{
                "requested_claims": ["Given Name", "Family Name", "Date of Birth"],
                "nonce": "1234567890",
                "proof_endpoint": "http://localhost:8000/api/proof"
                }`}
            spellCheck={false}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.verifyButton}
            onClick={handleVerify}
            disabled={!jsonInput.trim()}
          >
            Verify
          </button>
        </div>
      )}

      {request && matchedCredential && !shared && (
        <div className={styles.reviewSection}>
          {request.relyingParty && (
            <p className={styles.rpInfo}>
              <strong>{request.relyingParty}</strong> is requesting attributes
              from your <strong>{matchedCredential.title}</strong>
            </p>
          )}
          {!request.relyingParty && (
            <p className={styles.rpInfo}>
              A relying party is requesting attributes from your{" "}
              <strong>{matchedCredential.title}</strong>
            </p>
          )}

          <div className={styles.credentialInfo}>
            <span className={styles.credType}>{matchedCredential.title}</span>
            <span className={styles.issuer}>
              Issued by {matchedCredential.issuer.name}
            </span>
          </div>

          <div className={styles.attributeList}>
            <div className={styles.attributeHeader}>
              <span>Attribute</span>
              <span>Value</span>
              <span>Share</span>
            </div>
            {Object.entries(matchedCredential.subject).map(([attr, value]) => {
              const isRequested = request.requested_claims.includes(attr);
              return (
                <label
                  key={attr}
                  className={`${styles.attributeRow} ${isRequested ? styles.requested : ""}`}
                >
                  <span className={styles.attrName}>
                    {attr}
                    {isRequested && (
                      <span className={styles.requiredBadge}>requested</span>
                    )}
                  </span>
                  <span className={styles.attrValue}>{value}</span>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={checkedAttributes[attr] ?? false}
                    onChange={() => toggleAttribute(attr)}
                  />
                </label>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={handleReset}>
              Decline
            </button>
            <button
              className={styles.shareButton}
              onClick={handleShare}
              disabled={selectedCount === 0}
            >
              Share {selectedCount} attribute{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {shared && (
        <div className={styles.successSection}>
          <div className={styles.successIcon}>
            <ShieldCheck size={48} />
          </div>
          <h2 className={styles.successTitle}>Attributes Shared</h2>
          <p className={styles.successText}>
            The following attributes were shared
            {request?.relyingParty ? ` with ${request.relyingParty}` : ""}:
          </p>
          <ul className={styles.sharedList}>
            {Object.entries(checkedAttributes)
              .filter(([, checked]) => checked)
              .map(([attr]) => (
                <li key={attr} className={styles.sharedItem}>
                  <span className={styles.sharedLabel}>{attr}</span>
                  <span className={styles.sharedValue}>
                    {matchedCredential?.subject[attr]}
                  </span>
                </li>
              ))}
          </ul>
          <button className={styles.resetButton} onClick={handleReset}>
            New Verification
          </button>
        </div>
      )}
    </div>
  );
}

export default Verify;
