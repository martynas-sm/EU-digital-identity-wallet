import { asn1, md, pkcs12, pki } from "node-forge";

async function generateKeyPair() {
  const keyPair = await new Promise<pki.rsa.KeyPair>((resolve, reject) => {
    pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, kp) => {
      if (err || !kp) reject(err);
      else resolve(kp);
    });
  });

  return keyPair;
}

async function generateCsr(keyPair: pki.rsa.KeyPair, name: string) {
  const csr = pki.createCertificationRequest();

  csr.publicKey = keyPair.publicKey;
  csr.setSubject([
    { name: "commonName", value: name },
    { name: "organizationName", value: "WalletBy" },
    { shortName: "OU", value: "WalletBy" },
  ]);
  csr.sign(keyPair.privateKey, md.sha256.create());

  const csrPem = pki.certificationRequestToPem(csr);

  return csrPem;
}

async function getCertFromCa(csrPem: string, caCode: string): Promise<string> {
  const response = await fetch(
    `https://wallet-ca.wallet.test/api/sign/${caCode}`,
    {
      method: "POST",
      body: JSON.stringify({ csr: csrPem }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `CSR signing failed: ${response.status} ${await response.text()}`,
    );
  }

  const certPem = (await response.json()).crt;
  return certPem;
}

function privateKeyToPem(keyPair: pki.rsa.KeyPair): string {
  const privateKeyPkcs8 = pki.privateKeyToPem(keyPair.privateKey);
  return privateKeyPkcs8;
}

export interface SigningData {
  privateKeyPem: string;
  certPem: string;
}

export async function getSigningData(
  caCode: string,
  name: string,
): Promise<SigningData> {
  const keyPair = await generateKeyPair();
  const csrPem = await generateCsr(keyPair, name);
  const certPem = await getCertFromCa(csrPem, caCode);
  const privateKeyPem = privateKeyToPem(keyPair);

  return { privateKeyPem, certPem };
}
