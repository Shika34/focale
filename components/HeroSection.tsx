"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { getStats } from "@/lib/nuvio-data";
import { NuvioConfiguratorModal } from "@/components/NuvioConfiguratorModal";

export function HeroSection() {
  const stats = getStats();
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const facts = [
    { label: "Collections francophones", value: String(stats.totalCollections) },
    { label: "Dossiers inclus", value: String(stats.totalFolders) },
    { label: "Clés API prises en charge", value: "4" },
    { label: "Débrideur", value: "TorBox" },
    { label: "Étapes dans l'assistant", value: "4" },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <p className="eyebrow eyebrow-lg">
              Assistant de configuration Nuvio · entièrement en français
            </p>
            <h1 className="display mt-5 text-[40px] leading-[1.06] text-mist-100 sm:text-[62px]">
              Votre cinéma en VF,
              <br />
              prêt en quatre étapes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist-300">
              L&apos;assistant vous guide pas à pas, une question à la fois :
              votre compte Nuvio, votre clé TorBox, vos clés de métadonnées,
              votre lien Lumio. Il se charge du reste et branche dans votre
              profil Nuvio vos 18 collections francophones, AIO Metadata, Lumio,
              Torrentio et Comet.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist-400">
              Vous ouvrez Nuvio et vos films et séries en VF sont là.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setConfigModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
              >
                Configurer mon Nuvio
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/tutoriel"
                className="inline-flex items-center gap-2 rounded-lg border border-line px-6 py-3.5 text-sm text-mist-200 transition-colors hover:border-mist-600 hover:text-mist-100"
              >
                Voir les tutoriels
              </Link>
            </div>

            <a
              href="/nuvio-collections-mitch.json"
              download="nuvio-collections-fr.json"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-mist-500 transition-colors hover:text-mist-300"
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger la liste des collections (JSON)
            </a>
          </div>

          <aside className="lg:pt-3">
            <div className="rounded-card border border-line bg-ink-800/70 p-6">
              <p className="eyebrow">Ce que fait l&apos;assistant</p>
              <dl className="mt-4 divide-y divide-line">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <dt className="text-sm text-mist-400">{fact.label}</dt>
                    <dd className="font-mono text-sm text-mist-100">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-xs leading-relaxed text-mist-500">
                Tout est configuré dans votre profil Nuvio via l&apos;API
                officielle : vos clés ne passent pas par un service tiers.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <NuvioConfiguratorModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </>
  );
}
