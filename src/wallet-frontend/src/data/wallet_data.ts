import { AES, enc } from "crypto-js";

export type Credential = {
  id: string;
  type: string;
  title: string;
  issuer: {
    name: string;
    did: string;
    logo?: string;
  };
  issuanceDate: string;
  expirationDate: string;
  format: string;
  status: "valid" | "expired" | "revoked";
  subject: Record<string, string>;
  raw: Record<string, unknown>;
};

export type Transaction = {
  id: number;
  credentialType: string;
  credentialTitle: string;
  requester: string;
  sharedAttributes: string[];
  timestamp: string;
  status: "shared" | "declined";
};

export type WalletData = {
  credentials: Credential[];
  transactions: Transaction[];
};

const walletData: WalletData = {
  credentials: [
    {
      id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      type: "EuropeanDigitalIdentity",
      title: "EU Digital Identity",
      issuer: {
        name: "Republic of Lithuania",
        did: "did:web:issuer.gov.lt",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
      format: "vc+sd-jwt",
      status: "valid",
      subject: {
        "Given Name": "Jonas",
        "Family Name": "Jonaitis",
        "Date of Birth": "1995-03-22",
        "Personal Code": "39503220001",
        Nationality: "Lithuanian",
        "Document Number": "ID-LT-2025-001",
        "Place of Birth": "Vilnius, Lithuania",
        Gender: "Male",
      },
      raw: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://europa.eu/digital-identity/v1",
        ],
        type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
        credentialSubject: {
          id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
          givenName: "Jonas",
          familyName: "Jonaitis",
          dateOfBirth: "1995-03-22",
          personalCode: "39503220001",
          nationality: "Lithuanian",
          documentNumber: "ID-LT-2025-001",
          placeOfBirth: "Vilnius, Lithuania",
          gender: "Male",
        },
        issuer: {
          id: "did:web:issuer.gov.lt",
          name: "Republic of Lithuania",
        },
        issuanceDate: "2025-09-15T10:30:00Z",
        expirationDate: "2035-09-15T10:30:00Z",
      },
    },
    {
      id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567891",
      type: "EuropeanDigitalIdentity",
      title: "EU Digital Identity",
      issuer: {
        name: "Republic of Lithuania",
        did: "did:web:issuer.gov.lt",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
      format: "vc+sd-jwt",
      status: "expired",
      subject: {
        "Given Name": "Jonas",
        "Family Name": "Jonaitis",
        "Date of Birth": "1995-03-22",
        "Personal Code": "39503220001",
        Nationality: "Lithuanian",
        "Document Number": "ID-LT-2025-001",
        "Place of Birth": "Vilnius, Lithuania",
        Gender: "Male",
      },
      raw: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://europa.eu/digital-identity/v1",
        ],
        type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
        credentialSubject: {
          id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
          givenName: "Jonas",
          familyName: "Jonaitis",
          dateOfBirth: "1995-03-22",
          personalCode: "39503220001",
          nationality: "Lithuanian",
          documentNumber: "ID-LT-2025-001",
          placeOfBirth: "Vilnius, Lithuania",
          gender: "Male",
        },
        issuer: {
          id: "did:web:issuer.gov.lt",
          name: "Republic of Lithuania",
        },
        issuanceDate: "2025-09-15T10:30:00Z",
        expirationDate: "2035-09-15T10:30:00Z",
      },
    },
    {
      id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567892",
      type: "EuropeanDigitalIdentity",
      title: "EU Digital Identity",
      issuer: {
        name: "Republic of Lithuania",
        did: "did:web:issuer.gov.lt",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
      format: "vc+sd-jwt",
      status: "revoked",
      subject: {
        "Given Name": "Jonas",
        "Family Name": "Jonaitis",
        "Date of Birth": "1995-03-22",
        "Personal Code": "39503220001",
        Nationality: "Lithuanian",
        "Document Number": "ID-LT-2025-001",
        "Place of Birth": "Vilnius, Lithuania",
        Gender: "Male",
      },
      raw: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://europa.eu/digital-identity/v1",
        ],
        type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
        credentialSubject: {
          id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
          givenName: "Jonas",
          familyName: "Jonaitis",
          dateOfBirth: "1995-03-22",
          personalCode: "39503220001",
          nationality: "Lithuanian",
          documentNumber: "ID-LT-2025-001",
          placeOfBirth: "Vilnius, Lithuania",
          gender: "Male",
        },
        issuer: {
          id: "did:web:issuer.gov.lt",
          name: "Republic of Lithuania",
        },
        issuanceDate: "2025-09-15T10:30:00Z",
        expirationDate: "2035-09-15T10:30:00Z",
      },
    },
    {
      id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567893",
      type: "EuropeanDigitalIdentity",
      title: "EU Digital Identity",
      issuer: {
        name: "Republic of Lithuania",
        did: "did:web:issuer.gov.lt",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
      format: "vc+sd-jwt",
      status: "valid",
      subject: {
        "Given Name": "Jonas",
        "Family Name": "Jonaitis",
        "Date of Birth": "1995-03-22",
        "Personal Code": "39503220001",
        Nationality: "Lithuanian",
        "Document Number": "ID-LT-2025-001",
        "Place of Birth": "Vilnius, Lithuania",
        Gender: "Male",
      },
      raw: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://europa.eu/digital-identity/v1",
        ],
        type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
        credentialSubject: {
          id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
          givenName: "Jonas",
          familyName: "Jonaitis",
          dateOfBirth: "1995-03-22",
          personalCode: "39503220001",
          nationality: "Lithuanian",
          documentNumber: "ID-LT-2025-001",
          placeOfBirth: "Vilnius, Lithuania",
          gender: "Male",
        },
        issuer: {
          id: "did:web:issuer.gov.lt",
          name: "Republic of Lithuania",
        },
        issuanceDate: "2025-09-15T10:30:00Z",
        expirationDate: "2035-09-15T10:30:00Z",
      },
    },
  ],

  transactions: [
    {
      id: 1,
      credentialType: "EuropeanDigitalIdentity",
      credentialTitle: "EU Digital Identity",
      requester: "Vilnius Airport Authority",
      sharedAttributes: [
        "Given Name",
        "Family Name",
        "Document Number",
        "Nationality",
      ],
      timestamp: "2026-03-15T14:22:00Z",
      status: "shared",
    },
    {
      id: 2,
      credentialType: "EuropeanDigitalIdentity",
      credentialTitle: "EU Digital Identity",
      requester: "Swedbank Lithuania",
      sharedAttributes: [
        "Given Name",
        "Family Name",
        "Personal Code",
        "Date of Birth",
      ],
      timestamp: "2026-03-12T09:45:00Z",
      status: "shared",
    },
    {
      id: 3,
      credentialType: "EuropeanDigitalIdentity",
      credentialTitle: "EU Digital Identity",
      requester: "Unknown Service Provider",
      sharedAttributes: [
        "Given Name",
        "Family Name",
        "Personal Code",
        "Gender",
        "Place of Birth",
      ],
      timestamp: "2026-03-10T18:05:00Z",
      status: "declined",
    },
    {
      id: 4,
      credentialType: "EuropeanDigitalIdentity",
      credentialTitle: "EU Digital Identity",
      requester: "Vilnius University",
      sharedAttributes: ["Given Name", "Family Name", "Date of Birth"],
      timestamp: "2026-03-05T11:30:00Z",
      status: "shared",
    },
    {
      id: 5,
      credentialType: "EuropeanDigitalIdentity",
      credentialTitle: "EU Digital Identity",
      requester: "Lithuanian Police Department",
      sharedAttributes: [
        "Given Name",
        "Family Name",
        "Personal Code",
        "Document Number",
      ],
      timestamp: "2026-02-28T16:10:00Z",
      status: "shared",
    },
    {
      id: 6,
      credentialType: "EuropeanDigitalIdentity",
      credentialTitle: "EU Digital Identity",
      requester: "Bolt Technology",
      sharedAttributes: ["Given Name", "Family Name"],
      timestamp: "2026-02-20T08:55:00Z",
      status: "shared",
    },
  ],
};

export const initData = async () => {
  try {
    await getData();
  } catch {
    await updateData(walletData);
  }
};

export const updateData = async (newData: WalletData) => {
  const key = sessionStorage.getItem("blob_key");
  if (key == null) {
    throw new Error("Blob key was not found");
  }

  const blob = AES.encrypt(JSON.stringify(newData), key).toString();

  const response = await fetch(
    "https://wallet-backend.wallet.test/api/store_blob",
    {
      method: "POST",
      body: JSON.stringify({ blob: blob }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await response.json());
  }
};

export const getData = async (): Promise<WalletData> => {
  const response = await fetch(
    "https://wallet-backend.wallet.test/api/get_blob",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `/api/get_blob got an error status code: ${response.status}`,
    );
  }

  const contents = await response.json();
  if (!("blob" in contents) || contents.blob == null) {
    throw new Error("Blob not found");
  }

  const key = sessionStorage.getItem("blob_key");
  if (key == null) {
    throw new Error("Key not found");
  }

  const decrypted = AES.decrypt(contents.blob, key).toString(enc.Utf8);

  return JSON.parse(decrypted);
};

export async function getCredentialById(
  id: string,
): Promise<Credential | undefined> {
  return (await getData()).credentials.find((c) => c.id === id);
}

export async function addCredential(credential: Credential): Promise<void> {
  walletData.credentials.push(credential);
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  walletData.transactions.push(transaction);
}
