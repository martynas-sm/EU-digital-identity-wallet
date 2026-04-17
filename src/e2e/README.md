# E2E Tests

Playwright tests for the EUDI Wallet ecosystem running via `docker compose up`.

## Requirements

- Docker Compose environment must be running
- Node.js and npm

## Setup

```
npm install
npx playwright install chromium
```

## Run

```
npx playwright test
```

The three tests run in order:
1. Register and login to the wallet
2. Add a PID credential from the PID provider
3. Use the wallet to post a verified review on the Relying Party

## Report

```
npx playwright show-report
```
