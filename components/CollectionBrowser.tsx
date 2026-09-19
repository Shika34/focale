"use client";

import { useEffect, useMemo, useState } from "react";
import { CollectionSummaryItem } from "@/lib/nuvio-data";
import { NuvioConfiguratorModal } from "@/components/NuvioConfiguratorModal";
import {
  Search,
  Folder,
  Layers,
  Sparkles,
  Info,
  X,
  Download,
} from "lucide-react";

interface CollectionBrowserProps {
  collections: CollectionSummaryItem[];
}

export function CollectionBrowser({ collections }: CollectionBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [activeFolderDetail, setActiveFolderDetail] = useState<{
    collectionTitle: string;
    folder: CollectionSummaryItem["folders"][0];
  } | null>(null);

  // Filter collections and folders based on category & search
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return collections
      .filter((col) => selectedCategory === "all" || col.id === selectedCategory)
      .map((col) => {
        const matchingFolders = col.folders.filter((f) => {
          if (!q) return true;
          return (
            f.title.toLowerCase().includes(q) ||
            f.sourcesPreview.some((s) => s.toLowerCase().includes(q))
          );
        });

        return {
          ...col,
          matchingFolders,
        };
      })
      .filter((col) => col.matchingFolders.length > 0);
  }, [collections, selectedCategory, searchQuery]);

  const totalVisibleFolders = useMemo(() => {
    return filteredData.reduce((acc, col) => acc + col.matchingFolders.length, 0);
  }, [filteredData]);

  // Fermeture du détail dossier au clavier, comme n'importe quelle boîte de dialogue.
  useEffect(() => {
    if (!activeFolderDetail) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveFolderDetail(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeFolderDetail]);

  return (
    <div id="collections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="display text-3xl text-mist-100 sm:text-4xl">
            <Layers className="w-7 h-7 text-gold-400" />
            <span>Catalogue des collections Nuvio</span>
          </h2>
          <p className="text-mist-400 text-sm mt-1">
            Explorez les 18 collections et 756 dossiers francophones intégrés automatiquement dans votre profil.
          </p>
        </div>

        {/* Search Bar & Auto-config Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mist-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher parmi 756 dossiers…"
              aria-label="Rechercher un dossier"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface/80 border border-surface-border text-mist-100 text-sm placeholder-mist-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Effacer la recherche"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-mist-400 hover:text-mist-100"
              >
                Effacer
              </button>
            )}
          </div>

          <button
            onClick={() => setConfigModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-ink bg-gold-400 hover:bg-gold-300 shadow-glow shrink-0 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Installer sur mon Nuvio</span>
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar mb-6">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-gold-600 text-mist-100 shadow-glow"
              : "glass-panel text-mist-400 hover:text-mist-100 hover:bg-surface-hover"
          }`}
        >
          Toutes les catégories ({collections.length})
        </button>

        {collections.map((col) => (
          <button
            key={col.id}
            onClick={() => setSelectedCategory(col.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === col.id
                ? "bg-gold-600 text-mist-100 shadow-glow"
                : "glass-panel text-mist-400 hover:text-mist-100 hover:bg-surface-hover"
            }`}
          >
            {col.title} ({col.foldersCount})
          </button>
        ))}
      </div>

      {/* Summary Bar */}
      <div className="flex flex-col gap-2 p-4 rounded-xl glass-panel mb-8 text-xs text-mist-300 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-mist-100">{totalVisibleFolders}</span> dossiers affichés sur 756
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/nuvio-collections-mitch.json"
            download="nuvio-collections-fr.json"
            className="inline-flex items-center gap-1.5 text-gold-400 hover:text-gold-300 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger le JSON brut (5 Mo)</span>
          </a>
        </div>
      </div>

      {/* Collections & Folders Grid */}
      <div className="space-y-10">
        {filteredData.map((col) => (
          <div key={col.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border/50 pb-2">
              <div className="flex items-center gap-2.5">
                <Folder className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-bold text-mist-100">{col.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-mist-400 border border-surface-border">
                  {col.matchingFolders.length} dossiers
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {col.matchingFolders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() =>
                    setActiveFolderDetail({
                      collectionTitle: col.title,
                      folder,
                    })
                  }
                  className="glass-card w-full p-4 rounded-xl flex flex-col justify-between border border-surface-border/60 text-left"
                >
                  <span className="block">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-mist-100 text-sm line-clamp-1">
                        {folder.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/20 font-mono shrink-0">
                        {folder.sourcesCount} source
                        {folder.sourcesCount > 1 ? "s" : ""}
                      </span>
                    </span>

                    <span className="mt-2 block text-xs text-mist-400 line-clamp-2">
                      {folder.sourcesPreview.join(", ") || "Configuration standard"}
                    </span>
                  </span>

                  <span className="mt-4 pt-3 border-t border-surface-border/40 flex items-center justify-between text-[11px] text-mist-500">
                    <span className="text-gold-400 font-medium">Inclus dans le pack</span>
                    <span className="inline-flex items-center gap-1 text-mist-400">
                      <Info className="w-3.5 h-3.5" />
                      <span>Détails</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-16 glass-card rounded-2xl">
            <p className="text-mist-400">Aucun dossier ne correspond à votre recherche.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-gold-600 text-mist-100"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Folder Detail Modal */}
      {activeFolderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeFolderDetail.collectionTitle} : ${activeFolderDetail.folder.title}`}
            className="glass-panel bg-surface max-w-lg w-full rounded-2xl border border-surface-border p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
                  {activeFolderDetail.collectionTitle}
                </span>
                <h3 className="text-xl font-bold text-mist-100 mt-1">
                  {activeFolderDetail.folder.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveFolderDetail(null)}
                aria-label="Fermer le détail du dossier"
                className="p-1 rounded-lg text-mist-400 hover:text-mist-100 hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-mist-400 uppercase tracking-wider">
                Sources configurées ({activeFolderDetail.folder.sourcesCount})
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {activeFolderDetail.folder.sourcesPreview.map((src, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-surface-elevated text-sm text-mist-200 border border-surface-border/50 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>{src}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => {
                  setActiveFolderDetail(null);
                  setConfigModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-mist-100 bg-gold-600 hover:bg-gold-500 shadow-glow"
              >
                Installer la collection sur Nuvio
              </button>
              <button
                onClick={() => setActiveFolderDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mist-400 hover:text-mist-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configurator Modal */}
      <NuvioConfiguratorModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}
