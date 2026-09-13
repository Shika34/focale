/**
 * Génération des URLs de manifests personnalisés.
 *
 * Seuls les addons dont le format d'URL est stable et public sont générés ici :
 * - Lumio : l'URL de manifest est celle du profil de l'utilisateur sur mylumio.tv ;
 * - Torrentio : la clé TorBox passe en paramètre de requête ;
 * - Comet : la configuration JSON est encodée en base64 dans le chemin
 *   (format produit par la page /configure de Comet, btoa(JSON.stringify(settings))).
 *
 * AIO Metadata et AIOStreams stockent leur configuration côté serveur
 * (UUID + mot de passe) : leur manifest est fourni par l'utilisateur.
 */

const TORRENTIO_BASE = "https://torrentio.strem.fun";
const COMET_BASE = "https://comet.elfhosted.com";

/** Encode une config JSON en base64 puis l'insère dans le chemin du manifest. */
function base64ManifestUrl(
  baseUrl: string,
  config: Record<string, unknown>,
): string {
  return `${baseUrl}/${btoa(JSON.stringify(config))}/manifest.json`;
}

/** Manifest Lumio : URL du profil Lumio fournie par l'utilisateur. */
export function buildLumioUrl(customUrl?: string): string {
  const trimmed = customUrl?.trim();
  return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

/** Manifest Torrentio avec débrideur TorBox et filtre de langue. */
export function buildTorrentioUrl(torboxApiKey: string): string {
  return `${TORRENTIO_BASE}/sort=qualityfilter|language=french,english|torbox=${torboxApiKey}/manifest.json`;
}

/**
 * Manifest Comet avec débrideur TorBox.
 * Le schéma reproduit exactement celui du formulaire /configure de Comet.
 */
export function buildCometUrl(torboxApiKey: string): string {
  return base64ManifestUrl(COMET_BASE, {
    maxResultsPerResolution: 0,
    maxSize: 0,
    cachedOnly: false,
    sortCachedUncachedTogether: false,
    removeTrash: true,
    resultFormat: ["all"],
    debridServices: [{ service: "torbox", apiKey: torboxApiKey }],
    enableTorrent: false,
    deduplicateStreams: false,
    scrapeDebridAccountTorrents: false,
    debridStreamProxyPassword: "",
    languages: { required: [], allowed: [], exclude: [], preferred: ["fr"] },
    resolutions: {},
    options: {
      remove_ranks_under: 0,
      allow_english_in_languages: false,
      remove_unknown_languages: false,
    },
  });
}
