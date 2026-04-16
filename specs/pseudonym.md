# Relying Party – Pseudonym Account

The basic idea is that sensitive account data is stored in the wallet not the relying party.

## Issuance Flow

### 1. Relying party creates pseudonym account

The relying party creates a pseudonym account object containing:

* User attributes (uuid, username, name, email, etc.)
* Endpoint to call to login
* Issuance metadata (e.g. timestamps)

### 2. Relying party signs account object

The account is then **signed by the Relying Party private key**.

**Example PseudonymAccountJWT**

*header*
```json
{
    "alg": "ES256",
    "typ": "PSEUDONYM"
}
```
*payload*
```json
{
    "iss": "https://relying-party.wallet.test",
    "iat": 1710000000,
    "login": "https://relying-party.wallet.test/pseudonym/login",

    "account": {
        "uuid": "b18e3b6c-ccb7-4308-b527-35e5e6ee2145",
        "username": "alice123",
        "name": "Alice Example",
        "email": "alice@wallet.test"
    }
}
```

### 3. Relying Party returns signed account as JWT

The user copies the account object from Relying Party back to the wallet.

**Format:**

```
eyJhbGciOiJFUzI1NiIsInR5cCI6IlBTRVVET05ZTSJ9.eyJpc3MiOiJodHRwczovL3JlbHlpbmctcGFydHkud2FsbGV0LnRlc3QiLCJpYXQiOjE3MTAwMDAwMDAsImxvZ2luIjoiaHR0cHM6Ly9yZWx5aW5nLXBhcnR5LndhbGxldC50ZXN0L3BzZXVkb255bS9sb2dpbiIsImFjY291bnQiOnsidXVpZCI6ImIxOGUzYjZjLWNjYjctNDMwOC1iNTI3LTM1ZTVlNmVlMjE0NSIsInVzZXJuYW1lIjoiYWxpY2UxMjMiLCJuYW1lIjoiQWxpY2UgRXhhbXBsZSIsImVtYWlsIjoiYWxpY2VAd2FsbGV0LnRlc3QifX0.gjziL_4C0mN9ahr-w0K7iG-63Ke9JHDbUhTegB22QmschhoEsmz97aOLGSTy78OXdmy9qwRiCiX4QRkPR54r0w
```

### 4. Wallet stores pseudonym

Wallet stores:

* Relying Party signed pseudonym account
* Metadata (optional)

## Authentication Flow

### 1. User selects the account

User chooses the account, wallet parses PseudonymAccountJWT to extract login url.

### 2. Wallet redirects to Relying Party

Wallet redirects user to the extracted login url with PseudonymAccountJWT in the url.

**Example Redirect**

```
https://relying-party.wallet.test/pseudonym/login?account=eyJhbGciOiJFUzI1NiIsInR5cCI6IlBTRVVET05ZTSJ9.eyJpc3MiOiJodHRwczovL3JlbHlpbmctcGFydHkud2FsbGV0LnRlc3QiLCJpYXQiOjE3MTAwMDAwMDAsImxvZ2luIjoiaHR0cHM6Ly9yZWx5aW5nLXBhcnR5LndhbGxldC50ZXN0L3BzZXVkb255bS9sb2dpbiIsImFjY291bnQiOnsidXVpZCI6ImIxOGUzYjZjLWNjYjctNDMwOC1iNTI3LTM1ZTVlNmVlMjE0NSIsInVzZXJuYW1lIjoiYWxpY2UxMjMiLCJuYW1lIjoiQWxpY2UgRXhhbXBsZSIsImVtYWlsIjoiYWxpY2VAd2FsbGV0LnRlc3QifX0.gjziL_4C0mN9ahr-w0K7iG-63Ke9JHDbUhTegB22QmschhoEsmz97aOLGSTy78OXdmy9qwRiCiX4QRkPR54r0w
```

## Verification Flow (Relying Party)

### 1. Verify Relying Party signature on account

* Decode pseudonym account
* Validate Relying Party signature

