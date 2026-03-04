import { Link } from "react-router-dom";
import type { Credential } from "@/data/mock-credentials";

type CredentialCardProps = {
  credential: Credential;
  isDetailView?: boolean;
};

export default function CredentialCard({
  credential,
  isDetailView = false,
}: CredentialCardProps) {
  const isValid = credential.status === "valid";

  const card = (
    <div
      className={`
        relative rounded-2xl p-6 text-white shadow-lg transition-all
        ${isDetailView ? "w-full max-w-md" : "w-full hover:scale-[1.02] hover:shadow-xl cursor-pointer"}
        ${
          isValid
            ? "bg-gradient-to-br from-[#0573F0] to-[#03449E] border-t border-white/20"
            : "bg-[#7B8794]"
        }
      `}
    >
      {!isValid && (
        <div className="flex justify-end mb-2">
          <span className="rounded-full bg-[#CBD2D9] px-2 py-0.5 text-xs font-medium text-black">
            {credential.status === "expired" ? "Expired" : "Revoked"}
          </span>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-xl font-bold leading-tight">
          {isDetailView
            ? credential.title
            : credential.title.length > 24
              ? credential.title.slice(0, 24) + "…"
              : credential.title}
        </h3>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs opacity-70">Issuer</p>
          <p className="text-sm font-semibold">{credential.issuer.name}</p>
        </div>
      </div>
    </div>
  );

  if (isDetailView) {
    return card;
  }

  return (
    <Link to={`/credentials/${encodeURIComponent(credential.id)}`}>{card}</Link>
  );
}
