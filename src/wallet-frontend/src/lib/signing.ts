import { asn1, md, pkcs12, pki, type Bytes } from "node-forge";

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
    throw new Error(`CSR signing failed: ${response.status}`);
  }

  const certPem = (await response.json()).crt;
  return certPem;
}

function getP12FromSigningData(
  keyPair: pki.rsa.KeyPair,
  certPem: string,
): Uint8Array {
  const cert = pki.certificateFromPem(certPem);
  const p12Asn1 = pkcs12.toPkcs12Asn1(keyPair.privateKey, cert, null);

  const derBytes = asn1.toDer(p12Asn1).getBytes();
  const u8 = new Uint8Array(derBytes.length);
  for (let i = 0; i < derBytes.length; i++) {
    u8[i] = derBytes.charCodeAt(i);
  }
  return u8;
}

export async function getSigningData(
  caCode: string,
  name: string,
): Promise<Uint8Array> {
  const keyPair = await generateKeyPair();
  const csrPem = await generateCsr(keyPair, name);
  const certPem = await getCertFromCa(csrPem, caCode);

  return getP12FromSigningData(keyPair, certPem);
}
