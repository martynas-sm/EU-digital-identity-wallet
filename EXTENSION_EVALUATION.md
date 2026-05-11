# Wallet Browser Extension Viability Evaluation (Revised)

This document provides an evaluation of the viability of porting the existing Wallet application to a browser extension, with a specific focus on the complexities of a *partial* port.

## 1. Porting Existing Wallet App Viability (Partial Port)

**Evaluation: Moderate to Complex**

While the tech stack (React/Vite) is conducive to extensions, a *partial* port introduces significant challenges:

- **Build Process Complexity**: The current Vite setup is designed for a Single Page Application (SPA). For an extension, you need a highly customized build configuration (e.g., using `@crxjs/vite-plugin` or Rollup configurations). You must instruct the bundler to extract only specific components (like the "sign document" or "verify" views) into distinct entry points (popup, options page, or content scripts) while excluding irrelevant parts of the app.
- **Routing and Context**: The existing app heavily relies on `react-router-dom`. In a partial extension port (e.g., just a popup), routing is often shallow or unnecessary. You will need to carefully decouple the desired components from the global routing context (`BrowserRouter`) and potentially implement `MemoryRouter` or standalone component rendering.
- **State Management & Context**: If the extension only handles a subset of features (like approving a transaction), it still needs access to the global state (authentication tokens, user profile). Extracting a component means you must also extract its entire dependency tree, including React Context providers, which might be tightly coupled to the main app's lifecycle.
- **Hardware Access Restrictions**: Features like the `html5-qrcode` scanner are notoriously difficult in extensions. Content scripts cannot access the camera directly. The popup can, but it closes immediately if the user clicks away, interrupting the scan. This requires careful UX redesign or delegating scanning to a dedicated extension tab.

## 2. Communication to Backend Viability

**Evaluation: Feasible, but Requires Auth Synchronization**

The Python Quart backend provides a standard REST API, which is highly compatible with extensions. However, challenges arise with authentication in a partial port scenario:

- **Authentication State**: If the user is logged into the main web wallet, the extension does not automatically know this. You cannot easily share cookies or `localStorage` between a standard website (e.g., `wallet-frontend.wallet.test`) and a browser extension environment (`chrome-extension://...`).
- **Token Passing**: To make the partial extension seamless, you must implement a secure mechanism to pass the Bearer token from the web app to the extension. This usually involves:
    1. The web app sending a message to the extension (requires the extension's ID).
    2. The extension storing the token in `chrome.storage.local`.
    3. The extension's background script (Service Worker) intercepting API calls to inject the token.
- **CORS Requirements**: The backend's CORS configuration (`allow_origin=["https://wallet-frontend.wallet.test"]`) must be updated to either accept requests from the specific extension ID or be relaxed (which is a security risk). Extensions rely on `host_permissions` in the manifest to bypass CORS, but the backend must still be configured to handle the preflight requests correctly.

## 3. Publishing/Installing Extension Viability

**Evaluation: Viable, but Manifest V3 Constraints Apply**

- **Service Workers vs. Background Pages**: Manifest V3 enforces the use of Service Workers instead of persistent background pages. Service workers can be terminated by the browser at any time to save resources. Any ongoing processes (like waiting for a long-polling signature response or managing a WebSocket connection) must be completely rewritten to be stateless and resilient to sudden termination.
- **Content Security Policy (CSP)**: Manifest V3 has strict CSP rules. Inline scripts (`<script>...</script>`) and `eval()` are banned. If any frontend dependency relies on these, the extension build will fail or be rejected by the Web Store.

## 4. General Viability Summary

**Evaluation: Proceed with Caution**

A full port is relatively straightforward, but a **partial port is significantly more complex**.

The main hurdles are **build configuration** (isolating specific components without breaking their dependencies) and **authentication synchronization** (seamlessly sharing the login state between the web app and the extension).

**Recommendation:** Before committing to a partial port, conduct a technical spike specifically focused on:
1. Configuring Vite to output a single, isolated React component as an extension popup.
2. Establishing a secure message-passing channel between the existing web app and the extension to share the authentication token.
