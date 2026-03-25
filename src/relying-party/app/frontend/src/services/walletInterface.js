export async function requestAgeOver18() {
    const data = await handleWalletRequest({
        requested_claims: ["Date of Birth"]
    });
    const birthYear = data["Date of Birth"] ? new Date(data["Date of Birth"]).getFullYear() : 2000;
    return { age_over_18: new Date().getFullYear() - birthYear >= 18 };
}

export async function requestCheckoutInfo() {
    const data = await handleWalletRequest({
        requested_claims: ["email", "address"]
    });
    return { email: data["email"], address: data["address"] };
}

export async function requestReviewClaims() {
    const data = await handleWalletRequest({
        requested_claims: ["Given Name", "Family Name", "Nationality"]
    });
    return {
        first_name: data["Given Name"],
        family_name: data["Family Name"],
        nationality: data["Nationality"]
    };
}

import { showWalletRequestDialog } from '../components/WalletRequestDialog';

async function handleWalletRequest(requestPayload) {
    const res = await fetch('/api/wallet/request', { method: 'POST' });
    const { nonce } = await res.json();

    const specRequest = {
        ...requestPayload,
        nonce,
        proof_endpoint: `${window.location.origin}/api/proof`
    };

    const requestJson = JSON.stringify(specRequest, null, 2);

    return showWalletRequestDialog({ requestJson, nonce });
}
