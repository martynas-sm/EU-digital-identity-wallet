import Credential from "../components/Credential/Credential";
import { getData, type WalletData } from "@/data/wallet_data";
import styles from "../components/CredentialsPage/Credentials.module.css";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

function Credentials() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setWalletData(await getData());
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className={styles.grid}>
      {walletData?.credentials.map((credential) => (
        <Credential key={credential.id} credential={credential} />
      ))}
      <button className={styles.addCard}>
        <Plus size={48} />
      </button>
    </div>
  );
}

export default Credentials;
