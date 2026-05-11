# Wallet Browser Extension Viability Evaluation

This document provides an evaluation of the viability of porting the existing Wallet application to a browser extension.

## 1. Porting Existing Wallet App Viability

**Evaluation: High Viability**

The current `wallet-frontend` is built using React, Vite, and Tailwind CSS. This is a very common and well-supported stack for building modern browser extensions.

- **UI Integration**: The React application can be easily configured to build as a static HTML/JS/CSS bundle that serves as the extension's popup UI, side panel, or an options page.
- **Routing**: `react-router-dom` is currently used. To ensure compatibility within an extension environment (where standard URLs aren't used), `BrowserRouter` may need to be replaced with `MemoryRouter` or `HashRouter`.
- **Dependencies**: Most dependencies like `crypto-js`, `lucide-react`, and `radix-ui` are fully compatible with extension environments.
- **Hardware Access**: If features like QR code scanning (`html5-qrcode`) are required, the extension will need explicit camera permissions requested in the `manifest.json`.

## 2. Communication to Backend Viability

**Evaluation: High Viability**

The `wallet-backend` is a Python Quart application providing a standard RESTful API (`/api/register`, `/api/login`, `/api/get_blob`, `/api/sign`, etc.).

- **API Requests**: Browser extensions can natively use the `fetch()` API to communicate with external servers. The authentication flow using Bearer tokens (via QuartAuth) will work seamlessly from the extension's background script or UI components.
- **CORS Constraints**: Extensions are not bound by the same strict Same-Origin Policy constraints as standard web pages, provided the backend domain is explicitly declared in the extension's `host_permissions` within `manifest.json`. This makes cross-origin communication with the backend straightforward.
- **Architecture**: The clear separation between frontend and backend makes this communication standard and robust.

## 3. Publishing/Installing Extension Viability

**Evaluation: High Viability**

Publishing and installing the extension follows standard industry procedures.

- **Manifest V3**: The extension should be built targeting Manifest V3, which is the current standard for Chrome, Edge, and Firefox.
- **Build Process**: Vite can be easily configured (e.g., using plugins like `@crxjs/vite-plugin`) to bundle the React application into the required format for an extension package (a `.zip` file containing HTML, JS, CSS, and the `manifest.json`).
- **Distribution**: The packaged extension can be published to the Chrome Web Store, Mozilla Add-ons, and Microsoft Edge Add-ons without any obvious technical blockers based on the current technology stack.

## 4. General Viability

**Evaluation: Highly Viable**

Overall, porting the wallet to a browser extension is **highly viable**.

The current architecture—a decoupled React frontend and a Python REST backend—lends itself perfectly to this transition. By adjusting the frontend build process to output a Manifest V3 compliant bundle and modifying the routing mechanism, the existing UI and logic can be reused extensively. Background scripts or content scripts can be added later if the wallet needs to interact directly with web pages (e.g., injecting a provider object for e-commerce integration).
