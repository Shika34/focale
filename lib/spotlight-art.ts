/**
 * Visuels de la collection « En vedette » (les spotlights de Kaptain).
 *
 * Les listes TMDB de ces dossiers sont permanentes, mais Kaptain remplace leur
 * contenu et leurs images **sur place**, tous les quatorze jours (« Rotate
 * dynamic spotlight collection (14-day cycle) »). L'URL ne changeant jamais,
 * les clients Nuvio gardent en cache l'ancienne affiche : leur ajouter une
 * version par cycle force le rechargement du bon visuel.
 */

/** Chemin, sur raw.githubusercontent.com, des images concernées. */
const SPOTLIGHT_ART_PATH = "/art/spotlights/";

/** Collection dont les visuels tournent (identifiant de Kaptain, inchangé). */
const SPOTLIGHT_COLLECTION_ID = "collection-SPOTLIGHTS";

/** Rotation annoncée par Kaptain : un cycle de quatorze jours. */
const SPOTLIGHT_CYCLE_MS = 14 * 24 * 60 * 60 * 1000;

/** Dernière rotation relevée (2 octobre 2026) : origine des cycles. */
const SPOTLIGHT_CYCLE_ANCHOR_MS = Date.UTC(2026, 9, 2);

/** Numéro du cycle en cours, à poser en `?v=` sur les visuels. */
export function spotlightArtVersion(now: Date = new Date()): string {
  const cycles = Math.floor((now.getTime() - SPOTLIGHT_CYCLE_ANCHOR_MS) / SPOTLIGHT_CYCLE_MS);
  return String(Math.max(0, cycles));
}

/** Ajoute `?v=<version>` à une URL de visuel, en remplaçant une version déjà posée. */
function versionedArtUrl(url: string, version: string): string {
  return `${url.split("?")[0]}?v=${version}`;
}

function versionedRecord<T extends Record<string, unknown>>(record: T, version: string): T {
  const next: Record<string, unknown> = { ...record };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "string" && value.includes(SPOTLIGHT_ART_PATH)) {
      next[key] = versionedArtUrl(value, version);
    }
  }
  return next as T;
}

/**
 * Renvoie la collection « En vedette » avec ses visuels versionnés.
 * Le reste des collections est rendu tel quel ; l'entrée n'est pas modifiée.
 */
export function versionSpotlightArt<T>(collections: T, version: string): T {
  if (!Array.isArray(collections)) return collections;

  let versioned = false;
  const next = collections.map((entry) => {
    if (!entry || typeof entry !== "object") return entry;
    const collection = entry as Record<string, unknown>;
    if (collection.id !== SPOTLIGHT_COLLECTION_ID || !Array.isArray(collection.folders)) {
      return entry;
    }

    versioned = true;
    const copy = versionedRecord(collection, version);
    copy.folders = collection.folders.map((folder: unknown) =>
      folder && typeof folder === "object"
        ? versionedRecord(folder as Record<string, unknown>, version)
        : folder,
    );
    return copy;
  });

  return (versioned ? next : collections) as T;
}
