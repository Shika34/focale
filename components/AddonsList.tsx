"use client";

import { useState } from "react";
import { NuvioAddon } from "@/types/nuvio";
import { RECOMMENDED_ADDONS } from "@/lib/addons-data";
import { Download, ExternalLink, Copy, Check, Sparkles, Box, ShieldCheck } from "lucide-react";

export function AddonsList() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "Tous" },
    { id: "streaming", label: "Streaming & Debrid" },
    { id: "catalogue", label: "Catalogues" },
    { id: "metadata", label: "Métadonnées" },
    { id: "sous-titres", label: "Sous-titres FR" },
    { id: "anime", label: "Anime" },
  ];

  const filteredAddons = RECOMMENDED_ADDONS.filter(
    (addon) => selectedCategory === "all" || addon.category === selectedCategory
  );

  const handleCopyManifest = (addon: NuvioAddon) => {
    navigator.clipboard.writeText(addon.manifestUrl);
    setCopiedId(addon.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold mb-4">
          <Box className="w-3.5 h-3.5 text-purple-400" />
          <span>Addons Essentiels & Recommandés</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Répertoire des Addons <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Nuvio & Stremio</span>
        </h1>
        <p className="mt-4 text-slate-300 text-base sm:text-lg">
          Sélection triée sur le volet des meilleurs addons pour profiter d&apos;une expérience francophone optimale :
          moteurs de scraping multilingues, sous-titres français et affiches de films haute qualité.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? "bg-purple-600 text-white shadow-glow-purple"
                : "glass-panel text-slate-400 hover:text-white hover:bg-surface-hover"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Addon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddons.map((addon) => (
          <div
            key={addon.id}
            className="glass-card p-6 rounded-2xl border border-surface-border flex flex-col justify-between"
          >
            <div>
              {/* Card top */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white">{addon.name}</h3>
                    {addon.isOfficial && (
                      <span title="Officiel" className="text-cyan-400">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">v{addon.version}</span>
                </div>

                <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-elevated text-purple-300 border border-purple-500/20 font-medium">
                  {addon.category}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">{addon.description}</p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {addon.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-surface-border/50 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-surface-border/60 flex items-center justify-between gap-2">
              <a
                href={addon.installUrl}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-glow"
              >
                <span>Installer</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleCopyManifest(addon)}
                className="px-3 py-2 rounded-xl text-xs font-medium glass-panel border border-surface-border hover:bg-surface-hover text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                title="Copier le lien Manifest JSON"
              >
                {copiedId === addon.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manifest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
