"use strict";

const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const { SDJwtInstance } = require('@sd-jwt/core');
const { digest } = require('@sd-jwt/crypto-nodejs');

// ---------------------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------------------

const DB_PATH = process.env.DB_PATH || "/data/shop.db";
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL,
    scoville    INTEGER NOT NULL,
    price_cents INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL REFERENCES products(id),
    first_name  TEXT    NOT NULL,
    family_name TEXT,
    nationality TEXT,
    body        TEXT    NOT NULL,
    rating      INTEGER NOT NULL DEFAULT 5,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    login_token TEXT    UNIQUE,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    total_cents INTEGER NOT NULL,
    items_count INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

try {
    db.exec("ALTER TABLE reviews ADD COLUMN rating INTEGER NOT NULL DEFAULT 5;");
} catch (e) {
    // Column exists
}

try {
    db.exec("ALTER TABLE users ADD COLUMN login_token TEXT UNIQUE;");
} catch (e) {
    // Column exists
}

// Seed products only if table is empty
const count = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
if (count === 0) {
    const insert = db.prepare(`
    INSERT INTO products (name, description, scoville, price_cents)
    VALUES (@name, @description, @scoville, @price_cents)
  `);
    const seedMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    seedMany([
        {
            name: "Mild Mango Bliss",
            description: "A fruity, gentle heat perfect for everyday cooking. Mango, lime, and a whisper of jalapeno.",
            scoville: 5_000,
            price_cents: 799,
        },
        {
            name: "Garden Serrano",
            description: "Crisp serrano peppers with roasted garlic and light vinegar. A kitchen staple.",
            scoville: 15_000,
            price_cents: 649,
        },
        {
            name: "Chipotle Smoke",
            description: "Deep smoky chipotle with a sweet molasses finish. Great on grilled meats.",
            scoville: 45_000,
            price_cents: 899,
        },
        {
            name: "Habanero Gold",
            description: "Fruity habanero heat with passion fruit and turmeric. Bold but balanced.",
            scoville: 200_000,
            price_cents: 1099,
        },
        {
            name: "Ghost Whisper",
            description: "Pure ghost pepper extract. Handle with care.",
            scoville: 900_000,
            price_cents: 1399,
        },
        {
            name: "Scorpion's Curse",
            description: "Trinidad Moruga Scorpion at full strength. Not for the faint-hearted.",
            scoville: 1_200_000,
            price_cents: 1799,
        },
        {
            name: "Carolina Reaper Reserve",
            description: "The world-famous Carolina Reaper. Intense, fruity pain with a cinnamon undertone.",
            scoville: 2_200_000,
            price_cents: 2199,
        },
        {
            name: "Dragon's Breath Elixir",
            description: "One of the hottest peppers ever cultivated. A few drops is more than enough.",
            scoville: 2_480_000,
            price_cents: 2999,
        },
        {
            name: "Pepper X Oblivion",
            description: "Pepper X, the current Guinness record holder. Approach with extreme caution.",
            scoville: 3_180_000,
            price_cents: 3499,
        },
    ]);
}

// Seed user and transactions if users table is empty
const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
if (userCount === 0) {
    const insertUser = db.prepare(`
        INSERT INTO users (username, password)
        VALUES (@username, @password)
    `);
    const insertTransaction = db.prepare(`
        INSERT INTO transactions (user_id, total_cents, items_count)
        VALUES (@user_id, @total_cents, @items_count)
    `);

    db.transaction(() => {
        const result = insertUser.run({ username: "johndoe", password: "password123" });
        const userId = result.lastInsertRowid;

        insertTransaction.run({ user_id: userId, total_cents: 1448, items_count: 2 });
        insertTransaction.run({ user_id: userId, total_cents: 3499, items_count: 1 });
    })();
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

const walletSessions = new Map();
const crypto = require("crypto");

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

app.get("/api/products", (_req, res) => {
    const products = db.prepare("SELECT * FROM products ORDER BY scoville ASC").all();
    res.json(products);
});

app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const reviews = db
        .prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC")
        .all(req.params.id);
    res.json({ product, reviews });
});

app.get("/api/wallet/mode", async (_req, res) => {
    res.json({ mode: "wallet" }); // Change to "mock" to not depend on wallet app
});

app.post("/api/wallet/request", (req, res) => {
    const nonce = crypto.randomBytes(32).toString('hex');
    walletSessions.set(nonce, { status: 'pending' });
    res.json({ nonce });
});

app.get("/api/wallet/status/:nonce", (req, res) => {
    const session = walletSessions.get(req.params.nonce);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status === 'complete') {
        walletSessions.delete(req.params.nonce);
        res.status(200).json(session.data);
    } else if (session.status === 'declined') {
        walletSessions.delete(req.params.nonce);
        res.status(400).json({ status: "declined", error: session.error, error_description: session.error_description });
    } else {
        res.status(202).json({ status: "pending" });
    }
});

app.options("/api/proof", (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.send();
});

app.post("/api/proof", async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.body.error) {
        walletSessions.set(req.body.nonce, { status: 'declined', error: req.body.error, error_description: req.body.error_description });
        return res.status(200).json({ status: "declined" });
    }
    const { proof } = req.body;
    if (!proof || typeof proof !== 'string') return res.status(400).json({ error: "Invalid proof format" });

    try {
        const tlRes = await fetch("https://public.trusted-list.wallet.test/api/trusted-list/pid-provider");
        if (!tlRes.ok) throw new Error("Failed to fetch trusted list");
        const pidProviders = await tlRes.json();

        if (!pidProviders || pidProviders.length === 0 || !pidProviders[0].public_key) {
            throw new Error("No trusted PID Providers found");
        }
        const fetchedJwk = pidProviders[0].public_key;
        const publicKey = crypto.createPublicKey({ key: fetchedJwk, format: 'jwk' });

        const verifier = async (data, sig) => {
            return crypto.verify(
                'SHA256',
                Buffer.from(data),
                { key: publicKey, dsaEncoding: 'ieee-p1363' },
                Buffer.from(sig, 'base64url')
            );
        };

        const sdjwt = new SDJwtInstance({
            verifier,
            hasher: digest
        });

        await sdjwt.verify(proof);

        const decoded = await sdjwt.decode(proof);

        const kb = decoded.kb || decoded.kbJwt;
        if (!kb || !kb.payload) throw new Error("Missing KeyBinding");

        const nonce = kb.payload.nonce;

        if (!nonce || !walletSessions.has(nonce)) {
            return res.status(404).json({ error: "Session not found or expired" });
        }

        const claims = await sdjwt.getClaims(proof);

        walletSessions.set(nonce, { status: 'complete', data: claims });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Proof processing error:", err);
        res.status(400).json({ error: "Proof processing failed" });
    }
});

/**
 * POST /api/reviews
 * Body: { product_id, first_name, family_name?, nationality?, body }
 * first_name is mandatory (SCRUM-48).
 */
app.post("/api/reviews", (req, res) => {
    const { product_id, first_name, family_name, nationality, body, rating = 5 } = req.body;
    if (!product_id || !first_name || !body)
        return res.status(400).json({ error: "product_id, first_name, and body are required" });
    const product = db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const result = db
        .prepare(
            `INSERT INTO reviews (product_id, first_name, family_name, nationality, body, rating)
       VALUES (@product_id, @first_name, @family_name, @nationality, @body, @rating)`
        )
        .run({ product_id, first_name, family_name: family_name || null, nationality: nationality || null, body, rating });
    res.status(201).json({ id: result.lastInsertRowid });
});

app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password are required" });

    try {
        const result = db.prepare("INSERT INTO users (username, password) VALUES (@username, @password)").run({ username, password });
        res.status(201).json({ id: result.lastInsertRowid, username });
    } catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: "Username already exists" });
        }
        res.status(500).json({ error: "Registration failed" });
    }
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password are required" });

    const user = db.prepare("SELECT id, username FROM users WHERE username = ? AND password = ?").get(username, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ token: user.id.toString(), username: user.username });
});

app.get("/api/login", (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Token is required");

    const user = db.prepare("SELECT id, username FROM users WHERE login_token = ?").get(token);
    if (!user) return res.status(401).send("Invalid or expired token");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authenticating...</title>
    </head>
    <body>
        <p>Authenticating...</p>
        <script>
            // Avoid XSS by safely replacing script end tags
            const username = ${JSON.stringify(user.username).replace(/<\//g, "<\\/")};
            const token = ${JSON.stringify(user.id.toString()).replace(/<\//g, "<\\/")};
            localStorage.setItem('hss_user', JSON.stringify({ username }));
            localStorage.setItem('hss_token', token);
            window.location.href = '/profile';
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

app.get("/api/user/login-link", (req, res) => {
    const userId = req.headers.authorization;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = db.prepare("SELECT id, username, login_token FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let token = user.login_token;
    if (!token) {
        token = crypto.randomBytes(32).toString('base64url');
        db.prepare("UPDATE users SET login_token = ? WHERE id = ?").run(token, userId);
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    res.json({ link: `${protocol}://${host}/api/login?token=${token}` });
});

app.get("/api/transactions", (req, res) => {
    const userId = req.headers.authorization;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(transactions);
});

/**
 * POST /api/checkout
 * Body: { age_confirmed, items: [{product_id, qty}], email?, address? }
 */
app.post("/api/checkout", (req, res) => {
    const { age_confirmed, items, email, address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ error: "Cart is empty" });

    const productIds = items.map((i) => i.product_id);
    const placeholders = productIds.map(() => "?").join(",");
    const products = db
        .prepare(`SELECT id, scoville, price_cents FROM products WHERE id IN (${placeholders})`)
        .all(...productIds);

    if (products.some((p) => p.scoville > 1_000_000) && !age_confirmed)
        return res.status(403).json({ error: "Age verification required for extreme hot sauces" });

    const userId = req.headers.authorization;
    if (userId) {
        const total_cents = items.reduce((sum, item) => {
            const p = products.find(prod => prod.id === item.product_id);
            return sum + (p ? p.price_cents * item.qty : 0);
        }, 0);
        const items_count = items.reduce((sum, item) => sum + item.qty, 0);

        try {
            db.prepare("INSERT INTO transactions (user_id, total_cents, items_count) VALUES (?, ?, ?)")
                .run(userId, total_cents, items_count);
        } catch (e) {
            console.error("Failed to record transaction", e);
        }
    }

    res.json({
        ok: true,
        message: "Order placed successfully!",
        summary: { items: items.length, email: email || null, address: address || null },
    });
});

// SPA fallback
app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = Number(process.env.PORT || 8000);
app.listen(PORT, "0.0.0.0", () => console.log(`Hot Sauce Shop listening on port ${PORT}`));
