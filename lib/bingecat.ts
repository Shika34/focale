/**
 * Rangées personnelles apportées par l'addon Bingecat.
 *
 * Bingecat (bingecat.com) sert à Nuvio des catalogues calculés sur l'historique
 * du compte : recommandations, « parce que vous avez regardé », nouveautés,
 * listes. Son manifest est propre à chaque utilisateur, et son identifiant
 * d'addon aussi (`com.aicat.<uuid>`) : aucune rangée ne peut donc être écrite
 * en dur dans le fichier de collections du site. La fenêtre d'installation lit
 * le manifest fourni par l'utilisateur, en tire les catalogues utiles et les
 * ajoute au dossier « Pour vous » juste avant l'envoi.
 *
 * Trakt, lui, ne peut pas remplir ces rangées : le Trakt de Nuvio vit dans son
 * backend, et l'instance publique d'AIO Metadata n'expose aucune connexion
 * Trakt. C'est Bingecat qui apporte le personnalisé.
 */

/** Dossier « Pour vous » de la collection « Découvrir ». */
const FOR_YOU_FOLDER_ID = "folder-25429024";

/** Collection « Découvrir », où le dossier est inséré à l'installation. */
const DISCOVER_COLLECTION_ID = "collection-UGED6TEZ";

/**
 * Dossier « Pour vous », absent du fichier du site : ses rangées n'existent que
 * pour un compte Bingecat. Il est ajouté à l'envoi quand le manifest est fourni.
 */
const FOR_YOU_FOLDER = {
  id: FOR_YOU_FOLDER_ID,
  title: "Pour vous",
  hideTitle: true,
  tileShape: "LANDSCAPE",
  coverEmoji: "",
  focusGifUrl:
    "https://raw.githubusercontent.com/Kaptain-Collection-Art/art-fr/main/discover/for-you/echo/hover.gif",
  heroVideoUrl: "",
  titleLogoUrl:
    "https://raw.githubusercontent.com/ImKaptain/nuvio-assets/main/TitleLogos/FOR_YOU_TitleLogo.png",
  coverImageUrl:
    "https://raw.githubusercontent.com/Kaptain-Collection-Art/art-fr/main/discover/for-you/echo/cover.png",
  catalogSources: [],
  focusGifEnabled: true,
  heroBackdropUrl: "",
} as const;

/** Nombre de paires film + série reprises du manifest. */
const MAX_PAIRS = 4;

/** Préfixe des identifiants posés par ce module, pour rester idempotent. */
const ROW_ID_PREFIX = "src-BC";

export interface BingecatCatalog {
  id: string;
  type?: string;
  name?: string;
  isSearch?: boolean;
}

export interface BingecatManifest {
  id?: string;
  catalogs?: BingecatCatalog[];
}

export interface BingecatRow {
  id: string;
  name: string;
  type: string;
  genre: string;
  title: string;
  sortBy: null;
  tmdbId: null;
  addonId: string;
  filters: Record<string, never>;
  sortHow: null;
  provider: "addon";
  catalogId: string;
  mediaType: string;
  traktListId: null;
  tmdbSourceType: null;
}

interface FolderLike {
  id: string;
  sources: { id: string }[];
  [key: string]: unknown;
}

interface CollectionLike {
  id: string;
  folders: FolderLike[];
}

/** URL de manifest exploitable, ou chaîne vide si le champ est vide. */
export function normaliseBingecatManifestUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const withoutSlash = withScheme.replace(/\/+$/, "");
  return withoutSlash.endsWith("/manifest.json")
    ? withoutSlash
    : `${withoutSlash}/manifest.json`;
}

/** Identifiant stable, dérivé du catalogue, au format `src-XXXXXXXX`. */
function rowId(catalogId: string, type: string): string {
  let hash = 5381;
  for (const char of `${catalogId}|${type}`) {
    hash = ((hash << 5) + hash + char.charCodeAt(0)) >>> 0;
  }
  const suffix = hash.toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return `${ROW_ID_PREFIX}${suffix}`;
}

/**
 * Rangées du manifest : les catalogues de recherche sont écartés, les paires
 * film + série d'un même intitulé sont conservées dans l'ordre du manifest.
 */
export function bingecatRows(manifest: BingecatManifest, maxPairs: number = MAX_PAIRS): BingecatRow[] {
  const addonId = manifest.id?.trim();
  const catalogs = manifest.catalogs ?? [];
  if (!addonId) return [];

  const pairs = new Map<string, Partial<Record<"movie" | "series", BingecatCatalog>>>();
  for (const catalog of catalogs) {
    if (!catalog?.id || catalog.isSearch) continue;
    if (catalog.type !== "movie" && catalog.type !== "series") continue;
    const name = catalog.name?.trim() || "Bingecat";
    const pair = pairs.get(name) ?? {};
    pair[catalog.type] = catalog;
    pairs.set(name, pair);
  }

  const rows: BingecatRow[] = [];
  for (const [name, pair] of pairs) {
    if (rows.length >= maxPairs * 2) break;
    for (const type of ["movie", "series"] as const) {
      const catalog = pair[type];
      if (!catalog) continue;
      const label = `${name} · Bingecat`;
      rows.push({
        id: rowId(catalog.id, type),
        name: label,
        type,
        genre: label,
        title: label,
        sortBy: null,
        tmdbId: null,
        addonId,
        filters: {},
        sortHow: null,
        provider: "addon",
        catalogId: catalog.id,
        mediaType: type === "series" ? "TV" : "MOVIE",
        traktListId: null,
        tmdbSourceType: null,
      });
    }
  }

  return rows;
}

/**
 * Copie des collections où le dossier « Pour vous » reçoit ces rangées. Les
 * rangées Bingecat déjà présentes sont retirées d'abord, pour qu'une seconde
 * installation ne les empile pas.
 */
export function attachBingecatRows<T extends CollectionLike>(
  collections: readonly T[],
  rows: readonly BingecatRow[],
): T[] {
  if (rows.length === 0) return collections as T[];

  return collections.map((collection) => {
    if (collection.id !== DISCOVER_COLLECTION_ID) return collection;

    const existing = collection.folders.find((folder) => folder.id === FOR_YOU_FOLDER_ID);
    if (!existing) {
      const created = { ...FOR_YOU_FOLDER, sources: [...rows] } as FolderLike;
      return { ...collection, folders: [created, ...collection.folders] } as T;
    }

    const folders = collection.folders.map((folder) => {
      if (folder.id !== FOR_YOU_FOLDER_ID) return folder;
      const kept = folder.sources.filter((source) => !String(source.id).startsWith(ROW_ID_PREFIX));
      return { ...folder, sources: [...kept, ...rows] };
    });
    return { ...collection, folders } as T;
  });
}
