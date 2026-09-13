export interface NuvioSourceFilters {
  year?: string | number | null;
  withGenres?: string | null;
  withoutGenres?: string | null;
  watchRegion?: string | null;
  voteCountGte?: number | null;
  withKeywords?: string | null;
  withNetworks?: string | null;
  withOriginCountries?: string | null;
  withOriginalLanguage?: string | null;
  voteAverageGte?: number | null;
  releaseDateGte?: string | null;
  releaseDateLte?: string | null;
  [key: string]: unknown;
}

export interface NuvioSource {
  id: string;
  name: string;
  type?: string | null;
  genre?: string | null;
  title: string;
  sortBy: string;
  tmdbId?: number | null;
  addonId?: string | null;
  filters?: NuvioSourceFilters;
}

export interface NuvioFolder {
  id: string;
  title: string;
  sources: NuvioSource[];
}

export interface NuvioCollection {
  id: string;
  title: string;
  folders: NuvioFolder[];
  pinToTop?: boolean;
  viewMode?: string;
  showAllTab?: boolean;
  backdropImageUrl?: string | null;
  focusGlowEnabled?: boolean;
}

export interface AioMetadataConfig {
  version?: string;
  exportedAt?: string;
  config: {
    language?: string;
    timezone?: string;
    addonName?: string;
    ageRating?: string;
    search?: {
      enabled?: boolean;
      ai_model?: string;
      providers?: Record<string, string>;
      engineEnabled?: Record<string, boolean>;
      [key: string]: unknown;
    };
    catalogs?: unknown[];
    providers?: Record<string, unknown>;
    streaming?: Record<string, unknown>;
    [key: string]: unknown;
  };
  metadata?: unknown;
}

