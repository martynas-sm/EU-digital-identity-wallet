import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { getData, updateData } from "@/data/wallet_data";
import {
  getSigningData as fetchSigningDataFromCa,
  type SigningData,
} from "@/lib/signing";

async function loadSigningData(caCode: string): Promise<SigningData> {
  const data = await getData();

  // TODO: get given name from wallet data?
  const givenName = "Test Name";
  const signingData = await fetchSigningDataFromCa(caCode, givenName);

  data.signingData = signingData;
  await updateData(data);

  return signingData;
}

function SignDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSigningData, setLoadingSigningData] = useState(false);
  const [error, setError] = useState("");
  const [signingData, setSigningData] = useState<SigningData | null>(null);
  const [caCode, setCaCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let active = true;

    const loadWalletData = async () => {
      try {
        const data = await getData();
        if (!active) return;
        setSigningData(data.signingData ?? null);
      } catch (err) {
        if (!active) return;
        setError((err as Error).message);
      }
    };

    void loadWalletData();

    return () => {
      active = false;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError(t("sign_document.err_invalid_pdf"));
    }
  };

  const handleLoadSigningData = async () => {
    if (!caCode.trim()) {
      setError("Enter a CA code first.");
      return;
    }

    setLoadingSigningData(true);
    setError("");

    try {
      const loadedSigningData = await loadSigningData(caCode.trim());
      setSigningData(loadedSigningData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingSigningData(false);
    }
  };

  const handleSign = async () => {
    if (!file) {
      setError(t("sign_document.err_no_file"));
      return;
    }

    if (!signingData) {
      setError("Signing data is missing. Load it first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file, "document.pdf");
      formData.append("private_key", signingData.privateKeyPem);
      formData.append("certificate", signingData.certPem);
      formData.append("field_name", "Username");

      const response = await fetch(
        "https://wallet-backend.wallet.test/api/sign",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "signed_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          {t("sign_document.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={loading || loadingSigningData}
          >
            {t("sign_document.choose_pdf")}
          </Button>
          {file && (
            <span className="text-sm text-muted-foreground truncate flex-1">
              {file.name}
            </span>
          )}
        </div>

        {!signingData && (
          <div className="space-y-2">
            <Alert>
              <AlertDescription>
                Signing data is missing. Enter your CA code to load it before
                signing.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Input
                value={caCode}
                onChange={(e) => setCaCode(e.target.value)}
                placeholder="CA code"
                disabled={loading || loadingSigningData}
              />
              <Button
                type="button"
                onClick={handleLoadSigningData}
                disabled={loading || loadingSigningData || !caCode.trim()}
              >
                {loadingSigningData ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  "Load"
                )}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSign}
          disabled={!file || loading || !signingData}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("sign_document.signing")}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t("sign_document.sign_download")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default SignDocument;
