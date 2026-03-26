export async function requestAgeOver18() {
    const data = await handleWalletRequest({
        requested_claims: ["birth_date"]
    });
    const birthYear = data["birth_date"] ? new Date(data["birth_date"]).getFullYear() : 2000;
    return { age_over_18: new Date().getFullYear() - birthYear >= 18 };
}

export async function requestCheckoutInfo() {
    const data = await handleWalletRequest({
        requested_claims: ["email_address", "resident_address"]
    });
    return { email: data["email_address"], address: data["resident_address"] };
}

export async function requestReviewClaims() {
    const data = await handleWalletRequest({
        requested_claims: ["given_name", "family_name", "nationality"]
    });
    return {
        first_name: data["given_name"],
        family_name: data["family_name"],
        nationality: data["nationality"]
    };
}

import { showWalletRequestDialog } from '../components/WalletRequestDialog';

async function handleWalletRequest(requestPayload) {
    const res = await fetch('/api/wallet/request', { method: 'POST' });
    const { nonce } = await res.json();

    const specRequest = {
        ...requestPayload,
        nonce,
        proof_endpoint: `${window.location.origin}/api/proof`,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    };

    const requestJson = JSON.stringify(specRequest, null, 2);
    const request = btoa(requestJson);

    return showWalletRequestDialog({ request, nonce });
}
