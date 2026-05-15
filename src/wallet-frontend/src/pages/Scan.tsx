import {
  type ClipboardEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { QrCode, Camera, ClipboardPaste, Loader2 } from "lucide-react";
import styles from "../components/ScanPage/Scan.module.css";
import { useTranslation } from "react-i18next";
import {
  createPidIssuanceMaterial,
  storePidIssuanceContext,
} from "@/lib/pidIssuance";

type ScanState = "prompt" | "scanning" | "denied" | "error" | "issuing-pid";

function isCredentialOffer(text: string): boolean {
  return text.trim().toLowerCase().startsWith("openid-credential-offer://");
}

function extractCredentialOfferUri(text: string): string | null {
  const trimmed = text.trim();
  const queryIndex = trimmed.indexOf("?");
  if (queryIndex === -1) return null;
  const params = new URLSearchParams(trimmed.slice(queryIndex + 1));
  return params.get("credential_offer_uri");
}

function Scan() {
  const [state, setState] = useState<ScanState>("prompt");
  const [error, setError] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [isDecodingImage, setIsDecodingImage] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const shouldStartRef = useRef(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const startScanner = () => {
    setError("");
    shouldStartRef.current = true;
    setState("scanning");
  };

  const safeStopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
    } catch {
      /* ignore */
    }
    try {
      scanner.clear();
    } catch {
      /* ignore */
    }
  }, []);

  const handlePidProviderOffer = useCallback(
    async (offerText: string) => {
      setState("issuing-pid");
      try {
        const offerUri = extractCredentialOfferUri(offerText);
        if (!offerUri) {
          throw new Error(t("scan.err_invalid_offer"));
        }

        const offerResp = await fetch(offerUri);
        if (!offerResp.ok) {
          throw new Error(`${t("scan.err_offer_fetch")} (${offerResp.status})`);
        }
        const offer = await offerResp.json();
        const credentialIssuer: string | undefined = offer.credential_issuer;
        const preAuthCode: string | undefined =
          offer?.grants?.[
            "urn:ietf:params:oauth:grant-type:pre-authorized_code"
          ]?.["pre-authorized_code"];

        if (!credentialIssuer || !preAuthCode) {
          throw new Error(t("scan.err_invalid_offer"));
        }

        const metaResp = await fetch(
          `${credentialIssuer.replace(/\/$/, "")}/.well-known/credential-issuer`,
        );
        if (!metaResp.ok) {
          throw new Error(
            `${t("scan.err_metadata_fetch")} (${metaResp.status})`,
          );
        }
        const metadata = await metaResp.json();
        const credentialEndpoint: string | undefined =
          metadata.credential_endpoint;
        if (!credentialEndpoint) {
          throw new Error(t("scan.err_invalid_metadata"));
        }

        const { passkey, privateJwk, minimalPubKey } =
          await createPidIssuanceMaterial();

        const issueResp = await fetch(credentialEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: preAuthCode,
            pub_key: minimalPubKey,
            passkey,
          }),
        });
        if (!issueResp.ok) {
          const data = await issueResp.json().catch(() => ({}));
          throw new Error(
            data.error || `${t("scan.err_issue_pid")} (${issueResp.status})`,
          );
        }

        const issuerHost = new URL(credentialIssuer).host;
        const providerDomain = issuerHost.replace(/^public\./, "");
        const receiveEndpoint = `${credentialIssuer.replace(/\/$/, "")}/api/receive-pid`;

        storePidIssuanceContext({
          passkey,
          privateJwk,
          providerDomain,
          receiveEndpoint,
        });

        navigate("/pid-callback");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("scan.err_issue_pid");
        setError(message);
        setState("error");
      }
    },
    [navigate, t],
  );

  const handleQrPayload = useCallback(
    async (payload: string) => {
      const trimmedPayload = payload.trim();
      if (!trimmedPayload) {
        setPasteError(t("scan.err_empty"));
        return;
      }

      setError("");
      setPasteError("");
      await safeStopScanner();

      if (isCredentialOffer(trimmedPayload)) {
        await handlePidProviderOffer(trimmedPayload);
      } else {
        navigate("/verify", { state: { scannedData: trimmedPayload } });
      }
    },
    [handlePidProviderOffer, navigate, safeStopScanner, t],
  );

  const handleQrImage = useCallback(
    async (file: File) => {
      setError("");
      setPasteError("");
      setIsDecodingImage(true);
      await safeStopScanner();

      const imageScanner = new Html5Qrcode("qr-image-reader");
      try {
        const decodedText = await imageScanner.scanFile(file, false);
        await handleQrPayload(decodedText);
      } catch {
        setPasteError(t("scan.err_no_qr_in_image"));
      } finally {
        try {
          imageScanner.clear();
        } catch {
          /* ignore */
        }
        setIsDecodingImage(false);
      }
    },
    [handleQrPayload, safeStopScanner, t],
  );

  const handleImagePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const imageFile = Array.from(event.clipboardData.items)
      .find((item) => item.kind === "file" && item.type.startsWith("image/"))
      ?.getAsFile();

    if (!imageFile) {
      setPasteError(t("scan.err_no_image"));
      return;
    }

    event.preventDefault();
    void handleQrImage(imageFile);
  };

  const handleImageDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleImageDragLeave = () => {
    setIsDragActive(false);
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    const imageFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith("image/"),
    );

    if (!imageFile) {
      setPasteError(t("scan.err_no_image"));
      return;
    }

    void handleQrImage(imageFile);
  };

  useEffect(() => {
    if (state !== "scanning" || !shouldStartRef.current) return;
    shouldStartRef.current = false;

    const init = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const wrapper = document.getElementById("qr-reader");
        const wrapperWidth = wrapper?.clientWidth ?? 250;
        const qrSize = Math.max(160, Math.min(250, wrapperWidth - 32));

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: qrSize, height: qrSize } },
          (decodedText) => {
            void handleQrPayload(decodedText);
          },
          () => {},
        );
      } catch (err) {
        await safeStopScanner();
        const message = err instanceof Error ? err.message : String(err);
        if (
          message.includes("Permission") ||
          message.includes("NotAllowedError")
        ) {
          setState("denied");
          setError(t("scan.camera_denied"));
        } else {
          setState("error");
          setError(message || "Failed to start camera.");
        }
      }
    };

    init();
  }, [handleQrPayload, safeStopScanner, state, t]);

  const stopScanner = async () => {
    await safeStopScanner();
    setState("prompt");
  };

  useEffect(() => {
    return () => {
      void safeStopScanner();
    };
  }, [safeStopScanner]);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <QrCode size={28} /> {t("scan.title")}
      </h1>

      {state === "prompt" && (
        <div className={styles.permissionSection}>
          <Camera size={48} className={styles.permissionIcon} />
          <p className={styles.permissionText}>{t("scan.description")}</p>
          <button className={styles.startButton} onClick={startScanner}>
            {t("scan.start")}
          </button>
        </div>
      )}

      {(state === "prompt" || state === "denied" || state === "error") && (
        <div
          className={`${styles.pasteSection} ${
            isDragActive ? styles.pasteSectionActive : ""
          }`}
          onPaste={handleImagePaste}
          onDragOver={handleImageDragOver}
          onDragEnter={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
          tabIndex={0}
          aria-label={t("scan.paste_label")}
          aria-busy={isDecodingImage}
        >
          <ClipboardPaste size={32} className={styles.pasteIcon} />
          <p className={styles.pasteLabel}>{t("scan.paste_label")}</p>
          <p className={styles.pasteText}>{t("scan.paste_hint")}</p>
          {pasteError && <p className={styles.error}>{pasteError}</p>}
          {isDecodingImage && (
            <p className={styles.pasteText}>{t("scan.decoding_paste")}</p>
          )}
          <div id="qr-image-reader" className={styles.hiddenImageReader} />
        </div>
      )}

      {state === "scanning" && (
        <div className={styles.scannerSection}>
          <p className={styles.description}>{t("scan.point_camera")}</p>
          <div className={styles.scannerWrapper}>
            <div id="qr-reader" />
          </div>
          <button className={styles.stopButton} onClick={stopScanner}>
            {t("scan.stop")}
          </button>
        </div>
      )}

      {state === "issuing-pid" && (
        <div className={styles.permissionSection}>
          <Loader2 size={48} className={styles.permissionIcon} />
          <p className={styles.permissionText}>{t("scan.issuing_pid")}</p>
        </div>
      )}

      {(state === "denied" || state === "error") && (
        <div className={styles.permissionSection}>
          <Camera size={48} className={styles.permissionIcon} />
          <p className={styles.error}>{error}</p>
          <button className={styles.startButton} onClick={startScanner}>
            {t("scan.try_again")}
          </button>
        </div>
      )}
    </div>
  );
}

export default Scan;
