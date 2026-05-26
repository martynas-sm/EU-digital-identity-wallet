import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Link2, Trash2 } from "lucide-react";
import { getData, addPseudonym, deletePseudonym, type WalletData } from "@/data/wallet_data";
import styles from "../components/CredentialsPage/Credentials.module.css"; // Reuse styling where possible

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

  if (loading) return <p>{t("common.loading")}</p>;
  if (error) return <p>{t("common.error_message", { message: error.message })}</p>;

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>{t("pseudonyms.title")}</h1>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder={t("pseudonyms.paste_placeholder")}
          style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
          required
        />
        <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#0070f3", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          <Plus size={18} /> {t("pseudonyms.add_button")}
        </button>
      </form>

      <div className={styles.grid}>
        {walletData?.pseudonyms?.map((p) => (
          <div key={p.id} className={styles.cardOuter} style={{ position: "relative" }}>
            <div
              className={styles.cardInner}
              onClick={() => window.location.href = p.url}
              style={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
            >
              <div className={styles.cardTitle} style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                <Link2 size={24} />
                <h4 style={{ margin: 0 }}>{p.domain}</h4>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}
              aria-label={t("pseudonyms.delete_aria")}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
