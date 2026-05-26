import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Key, Trash2 } from "lucide-react";
import { getData, addPseudonym, deletePseudonym, type WalletData } from "@/data/wallet_data";
import styles from "../components/PseudonymsPage/Pseudonyms.module.css";

export default function Pseudonyms() {
  const { t } = useTranslation();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setWalletData(await getData());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl) return;

    try {
      const urlObj = new URL(newUrl);
      const domain = urlObj.hostname;
      const id = crypto.randomUUID();

      await addPseudonym({ id, domain, url: newUrl });
      setNewUrl("");
      await fetchData();
    } catch {
      alert(t("pseudonyms.invalid_url"));
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm(t("pseudonyms.delete_confirm"))) {
      await deletePseudonym(id);
      await fetchData();
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <Key size={28} /> {t("pseudonyms.title")}
      </h1>

      {loading && <p className={styles.loading}>{t("common.loading")}</p>}
      {error && <p className={styles.error}>{t("common.error_message", { message: error.message })}</p>}

      {!loading && !error && (
        <>
          <form onSubmit={handleAdd} className={styles.form}>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={t("pseudonyms.paste_placeholder")}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.addButton}>
              <Plus size={20} /> {t("pseudonyms.add_button")}
            </button>
          </form>

          <div className={styles.list}>
            {walletData?.pseudonyms?.map((p) => (
              <div
                key={p.id}
                className={styles.card}
                onClick={() => window.location.href = p.url}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    window.location.href = p.url;
                  }
                }}
              >
                <div className={styles.cardInfo}>
                  <Key size={20} className={styles.cardIcon} />
                  <span className={styles.domainName}>{p.domain}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  className={styles.deleteButton}
                  aria-label={t("pseudonyms.delete_aria")}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
