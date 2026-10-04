/**
 * Génération des URLs de manifests personnalisés.
 *
 * Seuls les addons dont le format d'URL est stable et public sont générés ici :
 * - Lumio : l'URL de manifest est celle du profil de l'utilisateur sur mylumio.tv ;
 * - Torrentio : les clés de débrideur passent en paramètres de requête ;
 * - Comet : la configuration JSON est encodée en base64 dans le chemin
 *   (format produit par la page /configure de Comet, btoa(JSON.stringify(settings))) ;
 * - Loostream, Frenchio, UwU-FR et VF Trailer : même principe, la configuration
 *   complète est encodée dans le chemin (base64 pour les trois premiers,
 *   base64url pour VF Trailer, formats relevés sur leur page /configure) ;
 * - StreamFusion : configuration stockée côté serveur (compte + mot de passe),
 *   l'URL de manifest est fournie par l'utilisateur, comme Lumio.
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
const LOOSTREAM_BASE = "https://loostream.nipva.com";
const FRENCHIO_BASE = "https://frenchio.elfhosted.com";
const UWU_FR_BASE = "https://uwu.creepso.com";
/** Hôte inscrit dans la configuration UwU-FR (l'addon le réutilise pour ses liens). */
const UWU_FR_HOST = "uwu.creepso.com";
/** Bandes-annonces VF (Allociné, YouTube, TMDB) : configuration base64url dans le chemin. */
const VF_TRAILER_BASE = "https://vf-trailer-off.vercel.app";


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

/** Manifest fourni par l'utilisateur (Lumio, StreamFusion) : URL validée telle quelle. */
export function buildProvidedManifestUrl(customUrl?: string): string {
  const trimmed = customUrl?.trim();
  return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

/** Manifest Lumio : URL du profil Lumio fournie par l'utilisateur. */
export function buildLumioUrl(customUrl?: string): string {
  return buildProvidedManifestUrl(customUrl);
}

/** Manifest StreamFusion : URL du compte StreamFusion fournie par l'utilisateur. */
export function buildStreamFusionUrl(customUrl?: string): string {
  return buildProvidedManifestUrl(customUrl);
}

/** Encode une config JSON en base64 UTF-8 (accents des pseudos compris). */
function base64Utf8Config(config: Record<string, unknown>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(config));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Même encodage en base64url, pour un segment d'URL : le résultat ne contient
 * ni « + », ni « / », ni « = » de remplissage (format de la page /configure de
 * VF Trailer).
 */
function base64UrlUtf8Config(config: Record<string, unknown>): string {
  return base64Utf8Config(config).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Manifest Loostream : configuration complète dans le chemin.
 * Reprend les valeurs par défaut de la page /configure (mode Direct, 1080p,
 * langues MULTI/VF/VOSTFR/VO, réponse dès 5 flux, tri par langue). Le pseudo
 * est obligatoire côté addon : il vient du nom du profil Nuvio.
 */
export function buildLoostreamUrl(tmdbApiKey: string | undefined, pseudo: string): string {
  const tmdbKey = tmdbApiKey?.trim();
  if (!tmdbKey) return "";
  return `${LOOSTREAM_BASE}/${base64Utf8Config({
    tmdbKey,
    proxy: "direct",
    prefQuality: "1080p",
    langOrder: ["MULTI", "VF", "VOSTFR", "VO"],
    minStreams: 5,
    sortBy: "language",
    pseudo: pseudo.trim() || "Focale",
  })}/manifest.json`;
}

/**
 * Manifest Frenchio : configuration complète dans le chemin.
 * YGG est actif sans compte ; les clés de débrideur renseignées se substituent
 * aux trackers privés (aucun n'est demandé par l'assistant).
 */
export function buildFrenchioUrl(keys: DebridKeys, tmdbApiKey: string | undefined): string {
  const tmdbKey = tmdbApiKey?.trim();
  const debrid = debridEntries(keys);
  if (!tmdbKey || debrid.length === 0) return "";
  const keyOf = (id: DebridEntry["id"]) => debrid.find((entry) => entry.id === id)?.apiKey ?? "";
  return `${FRENCHIO_BASE}/${base64Utf8Config({
    tmdb_key: tmdbKey,
    alldebrid_key: keyOf("alldebrid"),
    torbox_key: keyOf("torbox"),
    debridlink_key: "",
    realdebrid_key: "",
    trackers: [],
    abn_username: "",
    abn_password: "",
    c411_apikey: "",
    torr9_passkey: "",
    tr4ker_apikey: "",
    max_size: 0,
    sort_by: "tracker_priority",
    providers_order: ["ygg", ...debrid.map((entry) => entry.id)],
    mediaflow: null,
    qbittorrent: null,
  })}/manifest.json`;
}

/**
 * Manifest UwU-FR : configuration complète dans le chemin.
 * L'addon exige une clé TMDB et un débrideur. Les réglages reprennent le preset
 * « recommandé » de sa page /configure, avec les sous-titres français seuls.
 */
export function buildUwuFrUrl(keys: DebridKeys, tmdbApiKey: string | undefined): string {
  const tmdbKey = tmdbApiKey?.trim();
  const debrid = debridEntries(keys);
  if (!tmdbKey || debrid.length === 0) return "";
  const keyOf = (id: DebridEntry["id"]) => debrid.find((entry) => entry.id === id)?.apiKey ?? null;
  return `${UWU_FR_BASE}/${base64Utf8Config({
    profile_uid: "",
    expert_mode: false,
    active_preset: null,
    alldebrid_key: keyOf("alldebrid"),
    torbox_key: keyOf("torbox"),
    tmdb_key: tmdbKey,
    sort_priority: ["lang", "fidelity", "resolution", "seeders"],
    sort_languages: [
      "VF",
      "MULTI_VF",
      "VOSTFR",
      "DICE_MULTI_VF",
      "DICE_MULTI_SUBS",
    ],
    nekobt_key: "",
    tr4ker_key: null,
    c411_key: null,
    yggreborn_key: null,
    subsource_key: null,
    subdl_key: null,
    opensubtitles_key: null,
    betaseries_key: null,
    addon_host: UWU_FR_HOST,
    exc_4k: false,
    exc_1080p: false,
    exc_720p: false,
    exc_576p: false,
    exc_480p: false,
    exc_inconnu: false,
    exc_cam: true,
    exc_web: false,
    exc_bd: false,
    exc_3d: true,
    exc_dv: false,
    exc_dts: false,
    exc_av1: false,
    exc_hevc: false,
    limit_size_enabled: false,
    limit_size_val: "5",
    limit_res_enabled: false,
    limit_res_val: "3",
    limit_global_enabled: true,
    limit_global_val: "10",
    fallback_vo: true,
    allow_nsfw: false,
    show_uncached: false,
    prefer_vostfr: true,
    guarantee_720p: true,
    use_fidelity: true,
    strict_res: false,
    prefer_single_episodes: false,
    dedup_results: true,
    limit_seeders_enabled: false,
    limit_seeders_val: "5",
    debrid_merge: true,
    debrid_preferred: debrid[0].id,
    disable_proxy: false,
    subs_enabled: true,
    subs_languages: ["fre"],
    subs_limits: { fre: 6 },
    adjust_mode: true,
  })}/manifest.json`;
}

/**
 * Manifest VF Trailer : bandes-annonces officielles en français (Allociné,
 * YouTube, TMDB), proposées dans la fiche du film et de la série. La
 * configuration reprend les champs de sa page /configure, encodés en base64url.
 */
export function buildVfTrailerUrl(tmdbApiKey: string | undefined, pseudo: string): string {
  const tmdbKey = tmdbApiKey?.trim();
  if (!tmdbKey) return "";
  return `${VF_TRAILER_BASE}/${base64UrlUtf8Config({
    pseudo: pseudo.trim().slice(0, 40) || "Focale",
    tmdbKey,
  })}/manifest.json`;
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
