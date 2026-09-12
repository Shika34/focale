"use client";

import { useState } from "react";
import { Zap, Copy, Check, ExternalLink, Gift, ShieldAlert, Sparkles } from "lucide-react";

export function TorboxPromoBanner() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const referralCode = "49a51e6d-dcf6-47ad-a98d-147f11c4268f";
  const referralLink = "https://torbox.app/subscription?referral=49a51e6d-dcf6-47ad-a98d-147f11c4268f";
  const couponCode = "SIGMA30";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="glass-panel bg-gradient-to-br from-[#121726] via-[#101422] to-[#181a30] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-glow relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Offre Spéciale Nuvio FR : Jusqu&apos;à +84 Jours Offerts</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Débrideur Recommandé : TorBox</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              Recommandé Nuvio
            </span>
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            Débloquez la lecture instantanée 4K HDR sans buffering et sans torrent local sur Nuvio.
          </p>
        </div>

        <a
          href={referralLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 shadow-glow transition-all shrink-0"
        >
          <span>S&apos;inscrire sur Torbox</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Codes and Promo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Coupon Card */}
        <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-surface-border flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Coupon de Réduction (-30%)
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-xl font-black text-white">{couponCode}</span>
              <button
                onClick={() => handleCopy(couponCode, "coupon")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover border border-surface-border text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedCode === "coupon" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Offre <strong className="text-white">-30% de réduction immédiate</strong> sur l&apos;abonnement.
          </p>
        </div>

        {/* Referral Code Card */}
        <div className="p-4 rounded-2xl bg-surface-elevated/80 border border-surface-border flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Code de Parrainage (+84 Jours)
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[200px]">
                {referralCode}
              </span>
              <button
                onClick={() => handleCopy(referralCode, "referral")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover border border-surface-border text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedCode === "referral" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Active le bonus de jours supplémentaires gratuits selon la formule choisie.
          </p>
        </div>
      </div>

      {/* Bonus Table */}
      <div className="p-4 rounded-2xl bg-[#0b0e14]/70 border border-surface-border/50 mb-6">
        <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Bonus de jours offerts selon l&apos;abonnement :</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2 rounded-xl bg-surface/50 border border-surface-border/40">
            <span className="text-slate-400 block">1 Mois</span>
            <strong className="text-emerald-400 font-bold">+7 Jours offerts</strong>
          </div>
          <div className="p-2 rounded-xl bg-surface/50 border border-surface-border/40">
            <span className="text-slate-400 block">3 Mois</span>
            <strong className="text-emerald-400 font-bold">+21 Jours offerts</strong>
          </div>
          <div className="p-2 rounded-xl bg-surface/50 border border-surface-border/40">
            <span className="text-slate-400 block">6 Mois</span>
            <strong className="text-emerald-400 font-bold">+42 Jours offerts</strong>
          </div>
          <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/40 shadow-glow">
            <span className="text-indigo-300 block font-semibold">12 Mois (Idéal)</span>
            <strong className="text-emerald-300 font-bold">+84 Jours offerts</strong>
          </div>
        </div>
        <div className="mt-3 text-[12px] text-slate-400 text-center">
          Soit environ <strong className="text-white">15 mois d&apos;accès</strong> pour seulement ~$25.20 (~$1.67/mois avec le plan Essential).
        </div>
      </div>

      {/* Important conditions note */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5 mb-6">
        <div className="font-bold flex items-center gap-2 text-amber-300">
          <ShieldAlert className="w-4 h-4" />
          <span>À savoir avant de vous abonner :</span>
        </div>
        <p>
          • Le coupon <strong>{couponCode}</strong> (-30%) fonctionne <strong>uniquement pour les paiements en cryptomonnaies</strong>.
        </p>
        <p>
          • Les paiements par <strong>carte bancaire</strong> bénéficient quant à eux pleinement du bonus de parrainage allant jusqu&apos;à <strong>+84 jours offerts</strong> !
        </p>
        <p>
          • Valable pour les nouveaux comptes. Les jours bonus s&apos;affichent sur votre tableau de bord dès la validation.
        </p>
      </div>

      {/* Steps instructions */}
      <div className="space-y-2 text-xs text-slate-300">
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          Procédure d&apos;inscription rapide :
        </span>
        <ol className="list-decimal list-inside space-y-1 text-slate-400">
          <li>Créez votre compte et connectez-vous sur Torbox.</li>
          <li>
            Ouvrez la{" "}
            <a
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline font-semibold hover:text-emerald-300"
            >
              page d&apos;abonnement avec le lien de parrainage
            </a>{" "}
            (ou collez le code <code className="text-white bg-surface px-1 py-0.5 rounded">{referralCode}</code> tout en bas de la page).
          </li>
          <li>Sélectionnez la formule 12 mois.</li>
          <li>Entrez le coupon <code className="text-white bg-surface px-1 py-0.5 rounded">{couponCode}</code> dans la case prévue (si paiement crypto).</li>
          <li>
            Une fois abonné, récupérez votre clé API sur{" "}
            <a
              href="https://torbox.app/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline font-semibold hover:text-cyan-300"
            >
              https://torbox.app/settings
            </a>{" "}
            pour la coller dans notre configurateur automatique !
          </li>
        </ol>
      </div>
    </div>
  );
}
