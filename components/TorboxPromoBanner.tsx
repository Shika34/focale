"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Gift, Info } from "lucide-react";
import { TORBOX_REFERRAL_LINK } from "@/lib/site";

const REFERRAL_CODE = "49a51e6d-dcf6-47ad-a98d-147f11c4268f";
const COUPON_CODE = "SIGMA30";

const BONUS = [
  { durée: "1 mois", bonus: "+7 jours" },
  { durée: "3 mois", bonus: "+21 jours" },
  { durée: "6 mois", bonus: "+42 jours" },
  { durée: "12 mois", bonus: "+84 jours" },
];

export function TorboxPromoBanner() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="rounded-card border border-line bg-ink-800 p-6 sm:p-8">
      <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage-500/25 bg-sage-500/10 px-3 py-1 text-xs font-medium text-sage-300">
            <Gift className="h-3.5 w-3.5" />
            <span>Jusqu&apos;à +84 jours offerts avec le parrainage</span>
          </div>
          <h3 className="display mt-3 text-2xl text-mist-100">
            Le débrideur conseillé : TorBox
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-mist-300">
            Lecture instantanée en 4K HDR, sans buffering ni torrent local. La
            clé API TorBox est indispensable pour regarder les films et les
            séries dans Nuvio.
          </p>
        </div>

        <a
          href={TORBOX_REFERRAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
        >
          <span>S&apos;inscrire sur TorBox</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-6 rounded-card border border-line bg-ink-700 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="eyebrow block">Code de parrainage (+84 jours)</span>
            <code className="mt-2 block break-all font-mono text-sm text-mist-100">
              {REFERRAL_CODE}
            </code>
          </div>
          <button
            onClick={() => copy(REFERRAL_CODE, "referral")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-ink-600 px-3.5 py-2 text-xs font-medium text-mist-200 transition-colors hover:bg-ink-500"
          >
            {copied === "referral" ? (
              <>
                <Check className="h-3.5 w-3.5 text-sage-400" />
                <span className="text-sage-300">Copié</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copier le code</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-mist-400">
          À saisir en bas de la page d&apos;abonnement, ou simplement en passant
          par le lien de parrainage ci-dessus. Valable sur les nouveaux comptes,
          quel que soit le moyen de paiement.
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <span className="eyebrow">Jours offerts selon la formule</span>
          <dl className="mt-3 divide-y divide-line">
            {BONUS.map((row) => (
              <div key={row.durée} className="flex items-baseline justify-between py-2.5">
                <dt className="text-sm text-mist-400">{row.durée}</dt>
                <dd className="font-mono text-sm text-sage-300">{row.bonus}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <span className="eyebrow">Ordre de prix (formule Essential)</span>
          <dl className="mt-3 divide-y divide-line">
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-sm text-mist-400">12 mois, carte bancaire</dt>
              <dd className="font-mono text-sm text-mist-100">~36 $</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-sm text-mist-400">soit, sur ~15 mois</dt>
              <dd className="font-mono text-sm text-mist-100">~2,40 $/mois</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-sm text-mist-400">
                12 mois, cryptomonnaies <span className="text-mist-500">(coupon -30 %)</span>
              </dt>
              <dd className="font-mono text-sm text-mist-100">~25,20 $</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="text-sm text-mist-400">soit, sur ~15 mois</dt>
              <dd className="font-mono text-sm text-mist-100">~1,67 $/mois</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-mist-500">
            Barème affiché par TorBox en mensuel : Essential 3 $/mois, Standard
            5 $/mois, Pro 10 $/mois — compté ici sur 12 mois.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-line bg-ink-700 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
          <div className="space-y-1.5 text-xs leading-relaxed text-mist-300">
            <p>
              Code promo{" "}
              <code className="rounded bg-ink-600 px-1 py-0.5 font-mono text-[11px] text-mist-200">
                {COUPON_CODE}
              </code>{" "}
              : <strong className="font-medium text-mist-100">-30 %</strong>,
              valable uniquement si vous payez en cryptomonnaies.
            </p>
            <p className="text-mist-400">
              Les jours offerts du parrainage, eux, s&apos;ajoutent quel que soit
              le moyen de paiement et apparaissent sur votre tableau de bord
              après validation.
            </p>
          </div>
        </div>
        <button
          onClick={() => copy(COUPON_CODE, "coupon")}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-line bg-ink-600 px-3.5 py-2 text-xs font-medium text-mist-200 transition-colors hover:bg-ink-500"
        >
          {copied === "coupon" ? (
            <>
              <Check className="h-3.5 w-3.5 text-sage-400" />
              <span className="text-sage-300">Copié</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copier le code promo</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-6">
        <span className="eyebrow">Après l&apos;inscription</span>
        <ol className="mt-3 space-y-1.5 text-xs leading-relaxed text-mist-400">
          <li>
            1. Ouvrez la page d&apos;abonnement via le{" "}
            <a
              href={TORBOX_REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-300 underline decoration-dotted hover:text-gold-200"
            >
              lien de parrainage
            </a>{" "}
            et choisissez la formule 12 mois (paiement carte ou crypto).
          </li>
          <li>
            2. Une fois abonné, récupérez votre clé API sur{" "}
            <a
              href="https://torbox.app/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-300 underline decoration-dotted hover:text-gold-200"
            >
              torbox.app/settings
            </a>{" "}
            et collez-la à l&apos;étape 2 du configurateur.
          </li>
        </ol>
      </div>
    </div>
  );
}
