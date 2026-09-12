"use client";

import { useState } from "react";
import { Download, Copy, Check, Sparkles, Database, Search, Globe, Shield, Terminal } from "lucide-react";

export function AioMetadataViewer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const res = await fetch("/aiometadata-config-mitch.json");
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold mb-4">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Configuration Optimisée AIO Metadata</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          AIO Metadata <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Édition FR</span>
        </h1>
        <p className="mt-4 text-slate-300 text-base sm:text-lg">
          Configuration complète paramétrée en français avec 107 catalogues synchronisés,
          moteur de recherche IA Gemini et scrapers de métadonnées TMDB / TVDB / MAL.
        </p>

        {/* Top actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/aiometadata-config-mitch.json"
            download="aiometadata-config-mitch.json"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-glow-cyan transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger aiometadata-config.json</span>
          </a>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-200 glass-panel hover:bg-surface-hover hover:text-white border border-surface-border transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copier la configuration JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl border border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Langue & Région</h3>
          <p className="text-sm text-slate-400 mt-2">
            Localisation fixée sur <strong className="text-white">fr-FR</strong> pour assurer que tous les résumés, titres d&apos;épisodes et genres soient prioritairement en français.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Recherche IA Gemini</h3>
          <p className="text-sm text-slate-400 mt-2">
            Intégration du modèle <strong className="text-white">gemini-2.5-flash</strong> pour la découverte contextuelle et les suggestions intelligentes de médias.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white">107 Catalogues Actifs</h3>
          <p className="text-sm text-slate-400 mt-2">
            Pré-configuration de 107 catalogues thématiques prêts à être synchronisés directement avec votre instance AIO Metadata.
          </p>
        </div>
      </div>

      {/* Configuration Details Box */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-surface-border space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border/60 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Aperçu des paramètres clés</h3>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-surface-elevated text-cyan-300 border border-cyan-500/20">
            Version 2.16.5
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border/40">
            <span className="text-xs text-slate-500 font-medium">Fournisseurs de recherche</span>
            <div className="text-white font-semibold mt-1">TMDB, TVDB, MAL, Simkl, Trakt, MDBList</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border/40">
            <span className="text-xs text-slate-500 font-medium">Recherche anime</span>
            <div className="text-white font-semibold mt-1">MyAnimeList (MAL) Movie & Series</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border/40">
            <span className="text-xs text-slate-500 font-medium">Proxy d&apos;affiches</span>
            <div className="text-emerald-400 font-semibold mt-1">Optimisé & activé</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-surface-border/40">
            <span className="text-xs text-slate-500 font-medium">Fuseau horaire & région</span>
            <div className="text-white font-semibold mt-1">Europe / Paris</div>
          </div>
        </div>

        {/* How to import guide */}
        <div className="mt-6 pt-6 border-t border-surface-border/60">
          <h4 className="text-sm font-bold text-slate-200 mb-3">Comment importer cette configuration ?</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
            <li>Téléchargez le fichier <code className="text-cyan-300 bg-surface-elevated px-1.5 py-0.5 rounded">aiometadata-config-mitch.json</code> ci-dessus.</li>
            <li>Ouvrez votre panneau d&apos;administration AIO Metadata (web ou local).</li>
            <li>Allez dans les paramètres et cliquez sur <strong className="text-white">Import Configuration</strong>.</li>
            <li>Renseignez éventuellement vos clés d&apos;API personnelles (TMDB, Trakt, Gemini) si nécessaire.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
