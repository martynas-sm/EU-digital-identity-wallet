import { walletData } from "@/data/mock-data";
import styles from "../components/TransactionsPage/Transactions.module.css";

function Transactions() {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Transactions</h1>

      {walletData.transactions.length === 0 ? (
        <p className={styles.empty}>No transactions yet.</p>
      ) : (
        <div className={styles.list}>
          <div className={styles.headerRow}>
            <span className={styles.headerCell}>Requester</span>
            <span className={styles.headerCell}>Credential</span>
            <span className={styles.headerCell}>Date</span>
            <span className={styles.headerCell}>Status</span>
          </div>

          {walletData.transactions.map((txn) => (
            <div key={txn.id} className={styles.row}>
              <span className={styles.requesterName}>{txn.requester}</span>

              <div className={styles.credential}>
                <span className={styles.credentialTitle}>
                  {txn.credentialTitle}
                </span>
                <div className={styles.attributes}>
                  {txn.sharedAttributes.map((attr) => (
                    <span key={attr} className={styles.attributeTag}>
                      {attr}
                    </span>
                  ))}
                </div>
              </div>

              <span className={styles.timestamp}>
                {formatDate(txn.timestamp)}
              </span>

              <span
                className={`${styles.statusBadge} ${
                  txn.status === "shared"
                    ? styles.statusShared
                    : styles.statusDeclined
                }`}
              >
                {txn.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Transactions;
