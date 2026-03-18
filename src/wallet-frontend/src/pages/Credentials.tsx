import Credential from "../components/Credential/Credential";
import { walletData } from "@/data/mock-data";
import styles from "../components/CredentialsPage/Credentials.module.css";
import { Plus } from "lucide-react";

function Credentials() {
  return (
    <div className={styles.grid}>
      {walletData.credentials.map((credential) => (
        <Credential key={credential.id} credential={credential} />
      ))}
      <button className={styles.addCard}>
        <Plus size={48} />
      </button>
    </div>
  );
}

export default Credentials;
