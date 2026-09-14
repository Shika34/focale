import collectionsSummary from "./collections-summary.json";

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

  return {
    totalCollections: collections.length,
    totalFolders: collections.reduce((sum, c) => sum + c.foldersCount, 0),
  };
}
