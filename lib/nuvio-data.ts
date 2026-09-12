import collectionsSummary from "./collections-summary.json";
import { RECOMMENDED_ADDONS } from "./addons-data";
import { NuvioCollection, NuvioAddon } from "@/types/nuvio";

export interface CollectionSummaryItem {
  id: string;
  title: string;
  viewMode: string;
  pinToTop: boolean;
  backdropImageUrl: string | null;
  foldersCount: number;
  sourcesCount: number;
  folders: {
    id: string;
    title: string;
    sourcesCount: number;
    sourcesPreview: string[];
  }[];
}

export function getCollectionsSummary(): CollectionSummaryItem[] {
  return collectionsSummary as CollectionSummaryItem[];
}

export function getStats() {
  const collections = getCollectionsSummary();
  const totalCollections = collections.length;
  const totalFolders = collections.reduce((sum, c) => sum + c.foldersCount, 0);
  const totalSources = collections.reduce((sum, c) => sum + c.sourcesCount, 0);

  return {
    totalCollections,
    totalFolders,
    totalSources,
    totalAddons: RECOMMENDED_ADDONS.length,
    catalogsAioCount: 107,
    language: "Français (fr-FR)",
    version: "2.16.5",
  };
}

export function searchFolders(query: string, collectionId?: string) {
  const q = query.trim().toLowerCase();
  const collections = getCollectionsSummary();

  const filtered = collections
    .filter((c) => !collectionId || c.id === collectionId)
    .map((c) => {
      const matchingFolders = c.folders.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.sourcesPreview.some((s) => s.toLowerCase().includes(q))
      );
      return {
        ...c,
        matchingFolders,
      };
    })
    .filter((c) => c.matchingFolders.length > 0);

  return filtered;
}

export function getRecommendedAddons(): NuvioAddon[] {
  return RECOMMENDED_ADDONS;
}
