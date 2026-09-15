/**
 * Génération des URLs de manifests personnalisés.
 *
 * Seuls les addons dont le format d'URL est stable et public sont générés ici :
 * - Lumio : l'URL de manifest est celle du profil de l'utilisateur sur mylumio.tv ;
 * - Torrentio : les clés de débrideur passent en paramètres de requête ;
 * - Comet : la configuration JSON est encodée en base64 dans le chemin
 *   (format produit par la page /configure de Comet, btoa(JSON.stringify(settings))).
 *
 * AIO Metadata et AIOStreams stockent leur configuration côté serveur
 * (UUID + mot de passe) : leur manifest est fourni par l'utilisateur.
 *
 * Débrideurs : TorBox et AllDebrid. Torrentio et Comet acceptent les deux clés
 * en même temps (manifest vérifié : « Torrentio AD/TB », « Comet | ElfHosted |
 * TB+AD »), les clés vides étant simplement omises.
 */

const TORRENTIO_BASE = "https://torrentio.strem.fun";
const COMET_BASE = "https://comet.elfhosted.com";

/** Clés de débrideur saisies à l'étape 2 de l'assistant. */
export interface DebridKeys {
  torboxApiKey?: string;
  alldebridApiKey?: string;
}

/** Un débrideur renseigné, sous l'identifiant attendu par Torrentio et Comet. */
interface DebridEntry {
  id: "torbox" | "alldebrid";
  apiKey: string;
}

const DEBRIDERS: { id: DebridEntry["id"]; name: string; read: (keys: DebridKeys) => string | undefined }[] = [
  { id: "torbox", name: "TorBox", read: (keys) => keys.torboxApiKey },
  { id: "alldebrid", name: "AllDebrid", read: (keys) => keys.alldebridApiKey },
];

/** Débrideurs réellement renseignés, dans l'ordre TorBox puis AllDebrid. */
export function debridEntries(keys: DebridKeys): DebridEntry[] {
  return DEBRIDERS.flatMap(({ id, read }) => {
    const apiKey = read(keys)?.trim();
    return apiKey ? [{ id, apiKey }] : [];
  });
}

/** Noms français des débrideurs retenus : « TorBox », « TorBox et AllDebrid », « ». */
export function debridNames(keys: DebridKeys): string {
  return DEBRIDERS.filter(({ read }) => read(keys)?.trim())
    .map(({ name }) => name)
    .join(" et ");
}

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

/** Manifest Torrentio avec les débrideurs renseignés et le filtre de langue. */
export function buildTorrentioUrl(keys: DebridKeys): string {
  const segments = [
    "sort=qualityfilter",
    "language=french,english",
    ...debridEntries(keys).map((entry) => `${entry.id}=${entry.apiKey}`),
  ];
  return `${TORRENTIO_BASE}/${segments.join("|")}/manifest.json`;
}

/**
 * Manifest Comet avec les débrideurs renseignés.
 * Le schéma reproduit exactement celui du formulaire /configure de Comet.
 */
export function buildCometUrl(keys: DebridKeys): string {
  return base64ManifestUrl(COMET_BASE, {
    maxResultsPerResolution: 0,
    maxSize: 0,
    cachedOnly: false,
    sortCachedUncachedTogether: false,
    removeTrash: true,
    resultFormat: ["all"],
    debridServices: debridEntries(keys).map((entry) => ({
      service: entry.id,
      apiKey: entry.apiKey,
    })),
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
