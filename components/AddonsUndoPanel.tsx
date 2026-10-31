"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2, RotateCcw } from "lucide-react";

import { buildAddonsBackup, type AddonsSnapshot } from "@/lib/addons-backup";

/**
 * Filet de sécurité affiché après une écriture dans le profil : la liste
 * d'addons d'avant l'installation, remise en un clic ou téléchargée.
 *
 * Les deux gestes sont indépendants : la remise en état automatique peut
 * échouer (réseau, jeton expiré), le fichier reste alors la seule copie de la
 * liste d'origine. Le téléchargement est donc proposé même après un échec.
 */
export function AddonsUndoPanel({
  snapshot,
  onRestore,
}: {
  snapshot: AddonsSnapshot | null;
  /** Remet la liste d'origine dans le profil ; lève en cas d'échec. */
  onRestore: () => Promise<void>;
}) {
  const [restoring, setRestoring] = useState(false);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState("");

  if (!snapshot || snapshot.addons.length === 0) return null;

  const download = () => {
    const { fileName, content } = buildAddonsBackup(snapshot);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restore = async () => {
    setRestoring(true);
    setError("");
    try {
      await onRestore();
      setRestored(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? `La remise en état a échoué (${err.message}). Téléchargez la liste et remettez-la à la main dans Nuvio.`
          : "La remise en état a échoué. Téléchargez la liste et remettez-la à la main dans Nuvio.",
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-ink-900/80 border border-surface-border/40 text-xs text-mist-400 space-y-3 text-left">
      <div>
        <strong className="text-mist-100 block font-semibold">
          Vous changez d&apos;avis ?
        </strong>
        <span className="leading-relaxed">
          Les {snapshot.addons.length} addons que portait le profil « {snapshot.profileName} »
          avant l&apos;installation sont conservés ici. Fermez complètement
          l&apos;application Nuvio puis rouvrez-la après une remise en état.
        </span>
      </div>

      {restored ? (
        <p className="flex items-center gap-1.5 text-sage-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ancienne liste remise en place.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={restore}
            disabled={restoring}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-100 bg-surface-elevated hover:bg-surface-border/60 transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {restoring ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Remettre mes anciens addons</span>
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold text-mist-300 hover:text-mist-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger ma liste d&apos;avant</span>
          </button>
        </div>
      )}

      {error && <p className="text-red-300 leading-relaxed">{error}</p>}
    </div>
  );
}
