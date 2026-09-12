"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, ArrowRight, Film, Tv, Radio, Database, BookOpen, Download } from "lucide-react";
import { getStats } from "@/lib/nuvio-data";
import { NuvioConfiguratorModal } from "@/components/NuvioConfiguratorModal";

export function HeroSection() {
  const stats = getStats();
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <>
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Glow highlight orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Assistant de configuration Nuvio</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Votre Nuvio parfait{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              en quelques étapes
            </span>
          </h1>

          {/* Hero Tagline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Suivez un assistant guidé pour installer vos <strong className="text-white">18 collections francophones (756 dossiers)</strong>{" "}
            et configurer les <strong className="text-white">addons indispensables</strong>{" "}
            avec vos propres clés API et votre manifest Lumio.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:to-purple-500 shadow-glow hover:shadow-glow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              <Sparkles className="w-5 h-5" />
              <span>Configurer mon Nuvio</span>
            </button>

            <Link
              href="/tutoriel"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-slate-200 glass-panel hover:bg-surface-hover hover:text-white border border-surface-border transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Voir le Tutoriel & Débrideur</span>
              <ArrowRight className="w-4 h-4 text-slate-400 ml-1" />
            </Link>
          </div>

          <div className="mt-4">
            <a
              href="/nuvio-collections-mitch.json"
              download="nuvio-collections-fr.json"
              className="text-xs text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ou télécharger le fichier JSON brut (5 Mo)</span>
            </a>
          </div>

          {/* Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2">
                <Film className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stats.totalCollections}</div>
              <div className="text-xs font-medium text-slate-400 mt-1">Grandes Collections</div>
            </div>

            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2">
                <Tv className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stats.totalFolders}</div>
              <div className="text-xs font-medium text-slate-400 mt-1">Dossiers Inclus d&apos;office</div>
            </div>

            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2">
                <Radio className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">10 Addons</div>
              <div className="text-xs font-medium text-slate-400 mt-1">Configurés & Installés</div>
            </div>

            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="flex justify-center mb-2">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">TorBox</div>
              <div className="text-xs font-medium text-slate-400 mt-1">+84 Jours Bonus Offerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <NuvioConfiguratorModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </>
  );
}
