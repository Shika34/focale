"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { TorboxPromoBanner } from "@/components/TorboxPromoBanner";
import { AlldebridPromoBanner } from "@/components/AlldebridPromoBanner";
import { NuvioConfiguratorModal } from "@/components/NuvioConfiguratorModal";
import { PROVIDER_GUIDES, type ProviderGuide } from "@/lib/provider-guides";

const NUVIO_TUTORIAL: ProviderGuide = {
  question: "Avez-vous déjà un compte Nuvio ?",
  steps: [
    {
      title: "Installer Nuvio",
      detail:
        "Installez l'application Nuvio sur votre téléviseur, votre box, votre smartphone ou votre navigateur.",
    },
    {
      title: "Choisir vos identifiants",
      detail:
        "L'assistant crée le compte pour vous : il suffit d'indiquer l'email et le mot de passe que vous voulez utiliser sur Nuvio.",
    },
    {
      title: "Se connecter sur l'appareil",
      detail:
        "Ouvrez Nuvio, connectez-vous avec ces identifiants, puis sélectionnez le profil créé par l'assistant.",
    },
  ],
  signupUrl: "https://nuvio.tv",
  signupLabel: "Ouvrir Nuvio",
  keyUrl: "https://nuvio.tv",
  keyLabel: "Voir Nuvio",
  note: "Aucune inscription préalable n'est nécessaire : si le compte n'existe pas encore, il est créé au moment de l'envoi.",
};

const TRAKT_TUTORIAL: ProviderGuide = {
  question: "Avez-vous déjà un compte Trakt ?",
  steps: [
    {
      title: "Créer un compte Trakt",
      detail:
        "Ouvrez trakt.tv et choisissez « Join Trakt » : l'inscription est gratuite (email, Google, Apple ou X). Trakt est un carnet de suivi — il n'héberge aucun film ni aucune série — et son usage dans Nuvio ne demande aucune clé API, contrairement à TMDB, TheTVDB ou MDBList.",
    },
    {
      title: "Ouvrir l'intégration Trakt",
      detail:
        "Dans Nuvio, ouvrez Réglages → Intégrations → Trakt, puis lancez la connexion. Nuvio affiche un code ou une page d'autorisation Trakt.",
    },
    {
      title: "Autoriser Nuvio",
      detail:
        "Connectez-vous à Trakt si besoin, puis validez l'autorisation : Nuvio apparaît dans vos applications connectées et le statut affiche votre pseudo Trakt.",
    },
    {
      title: "Choisir la source de progression",
      detail:
        "Si vous gardez « Nuvio Sync » comme source de progression, Nuvio reste maître de votre avancement et continue d'envoyer en arrière-plan ce que vous regardez vers Trakt : les deux fonctionnent ensemble.",
    },
    {
      title: "Surveiller vos applications connectées",
      detail:
        "Ouvrez Trakt → votre avatar → Settings → Apps → Connected Apps (lien ci-dessous) : Trakt y liste les applications tierces autorisées et vous prévient lorsque la limite du compte gratuit est atteinte. Si la place est prise, retirez une application inutilisée avant de rebrancher Nuvio.",
    },
    {
      title: "Ce que Trakt ne fait pas",
      detail: "Trois choses à garder en tête :",
      bullets: [
        "Trakt ne fournit ni catalogue ni fichier : vos collections francophones restent alimentées par TMDB et par les listes Trakt publiques déjà incluses dans le pack.",
        "Trakt ne remplace pas votre profil Nuvio : il suit ce que vous regardez, il ne configure rien.",
        "Déconnecter Nuvio côté Trakt oblige à une nouvelle autorisation, qui compte comme une nouvelle connexion.",
      ],
    },
  ],
  signupUrl: "https://app.trakt.tv/",
  signupLabel: "Créer mon compte Trakt",
  keyUrl: "https://app.trakt.tv/settings/apps/connected",
  keyLabel: "Ouvrir mes applications connectées",
  note: "Facultatif, et hors assistant : l'assistant ne vous demandera jamais rien pour Trakt, parce que Nuvio l'intègre nativement. Depuis août 2026, Trakt réserve la création d'une application API à ses membres VIP (environ 5 $ par mois) — inutile d'y passer : c'est Nuvio qui porte l'intégration, pas ce site.",
};

const TUTORIALS: { key: string; label: string; guide: ProviderGuide }[] = [
  { key: "nuvio", label: "Compte Nuvio", guide: NUVIO_TUTORIAL },
  { key: "torbox", label: "Débrideur TorBox", guide: PROVIDER_GUIDES.torbox },
  { key: "alldebrid", label: "Débrideur AllDebrid", guide: PROVIDER_GUIDES.alldebrid },
  { key: "tmdb", label: "Clé TMDB", guide: PROVIDER_GUIDES.tmdb },
  { key: "tvdb", label: "Clé TheTVDB", guide: PROVIDER_GUIDES.tvdb },
  { key: "mdblist", label: "Clé MDBList", guide: PROVIDER_GUIDES.mdblist },
  { key: "lumio", label: "Profil Lumio", guide: PROVIDER_GUIDES.lumio },
  { key: "trakt", label: "Suivi Trakt (facultatif)", guide: TRAKT_TUTORIAL },
];

export function TutorialGuide() {
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <header className="max-w-2xl">
        <p className="eyebrow">Tutoriels</p>
        <h1 className="display mt-4 text-4xl leading-[1.08] text-mist-100 sm:text-[52px]">
          Créer les comptes, récupérer les clés, tout brancher.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-mist-300">
          Huit tutoriels courts, dans l&apos;ordre : le compte Nuvio, les deux
          débrideurs acceptés par l&apos;assistant (TorBox et AllDebrid), puis les
          trois clés de métadonnées et le profil Lumio. L&apos;assistant pose
          chaque question au bon moment et applique ces réglages à votre place.
          Le dernier, Trakt, est facultatif : il ne concerne que le suivi de ce
          que vous regardez.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setConfigModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
          >
            Configurer mon Nuvio
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="#torbox"
            className="inline-flex items-center gap-2 rounded-lg border border-line px-5 py-3 text-sm text-mist-200 transition-colors hover:border-mist-600 hover:text-mist-100"
          >
            Commencer par TorBox
          </a>
        </div>
      </header>

      <div className="mt-16 space-y-14">
        {TUTORIALS.map(({ key, label, guide }, index) => (
          <section key={key} id={key} className="scroll-mt-24">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-gold-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="display text-2xl text-mist-100 sm:text-3xl">{label}</h2>
              <span className="rule hidden flex-1 sm:block" />
            </div>

            <ol className="mt-6 space-y-5 border-l border-line pl-6">
              {guide.steps.map((step) => (
                <li key={step.title} className="relative">
                  <span className="absolute -left-[27px] top-2 h-1.5 w-1.5 rounded-full bg-gold-400" />
                  <h3 className="text-sm font-semibold text-mist-100">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mist-400">
                    {step.detail}
                  </p>
                  {step.bullets ? (
                    <ul className="mt-2 space-y-1.5">
                      {step.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-2 text-sm leading-relaxed text-mist-400"
                        >
                          <span className="text-mist-600">—</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>

            {key === "torbox" ? (
              <div className="mt-8">
                <TorboxPromoBanner />
              </div>
            ) : null}

            {key === "alldebrid" ? (
              <div className="mt-8">
                <AlldebridPromoBanner />
              </div>
            ) : null}

            <p className="mt-6 border-l-2 border-gold-700/60 pl-4 text-sm leading-relaxed text-mist-400">
              {guide.note}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={guide.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200"
              >
                {guide.signupLabel}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              {guide.keyUrl !== guide.signupUrl ? (
                <a
                  href={guide.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-mist-400 hover:text-mist-200"
                >
                  {guide.keyLabel}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-20 border-t border-line pt-10">
        <h2 className="display text-2xl text-mist-100">
          Vous avez tout ? Laissez l&apos;assistant faire le reste.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-400">
          Compte Nuvio, clé de débrideur (TorBox ou AllDebrid), clés de
          métadonnées, lien Lumio : l&apos;assistant installe les collections
          francophones, crée votre configuration AIO Metadata et ajoute
          Torrentio et Comet avec votre débrideur.
        </p>
        <button
          onClick={() => setConfigModalOpen(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
        >
          Configurer mon Nuvio
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <NuvioConfiguratorModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}
