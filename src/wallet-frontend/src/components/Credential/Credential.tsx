import styles from "./credential.module.css";
import type { Credential } from "@/data/mock-credentials";

type CredentialProps = {
  credential: Credential;
};

function CredentialTest({ credential }: CredentialProps) {
  const card = (
    <div className={styles.cardOuter}>
      <div className={styles.cardInner}>
        <div className={styles.cardTitle}>
          <h4>{credential.title}</h4>
        </div>
        <div className={styles.cardContent}>
          <span className={styles.label}>Issuer</span>
          <span className={styles.value}>{credential.issuer.name}</span>
        </div>
      </div>
    </div>
  );
  return card;
}

export default CredentialTest;
