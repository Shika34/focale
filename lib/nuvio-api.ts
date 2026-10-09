/**
 * Client API Nuvio Direct (Supabase)
 * Les appels authentifiés partent directement du navigateur de l'utilisateur
 * vers https://api.nuvio.tv, avec le jeton de session Nuvio : aucune donnée de
 * compte ne transite par le site.
 *
 * Deux exceptions, assumées et documentées à l'écran :
 * - les clés de métadonnées passent par la route serveur `/api/aiometadata`
 *   pour créer la configuration AIO Metadata (voir app/api/aiometadata/route.ts) ;
 * - les clés de débrideur (TorBox et/ou AllDebrid) sont intégrées aux URLs de
 *   manifest Torrentio et Comet, car c'est le format imposé par ces addons.
 */

import {
  buildLumioUrl,
  buildStreamFusionUrl,
  buildTorrentioUrl,
  buildCometUrl,
  buildLoostreamUrl,
  buildFrenchioUrl,
  buildUwuFrUrl,
  buildVfTrailerUrl,
  debridEntries,
  debridNames,
} from "./manifest-urls";

const SUPABASE_BASE = "https://api.nuvio.tv";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgxNTIxMzQ2LCJleHAiOjE5MzkyMDEzNDZ9.tmQaj682pwzehpqlgCDMnySOqiUvpgRbrE43T4VJpDI";

interface NuvioProfile {
  profile_index: number;
  name: string;
  avatar_color_hex?: string;
  avatar_url?: string | null;
  uses_primary_addons?: boolean;
  uses_primary_plugins?: boolean;
}

interface ApiKeysConfig {
  torboxApiKey?: string;
  alldebridApiKey?: string;
  tmdbApiKey?: string;
  tvdbApiKey?: string;
  mdblistApiKey?: string;
}

interface NuvioAddonInstall {
  name: string;
  url: string;
  note?: string;
}

function anonHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
  };
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 || attempt >= maxRetries) return res;
    const retryAfterSec = Number(res.headers.get("Retry-After"));
    const delayMs =
      Number.isFinite(retryAfterSec) && retryAfterSec > 0
        ? retryAfterSec * 1000
        : Math.round(500 * Math.pow(2, attempt) + Math.random() * 250);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

async function rpc(path: string, token: string, body: Record<string, unknown>) {
  const res = await fetchWithRetry(`${SUPABASE_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Nuvio ${path} a échoué: HTTP ${res.status} ${txt.slice(0, 200)}`);
  }
  if (res.status === 204) return null;
  const text = await res.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Identifiants des fournisseurs stockés par Nuvio hors des blobs de réglages
 * (`provider` + `credential_json.api_key`, via les RPC `sync_*_provider_credentials`).
 * Les identifiants de débrideur sont préfixés `debrid:`.
 */
const PROVIDER_CREDENTIAL_IDS = {
  tmdb: "tmdb",
  mdblist: "mdblist",
  torbox: "debrid:torbox",
} as const;

/**
 * Identifiant d'installation attendu par les RPC de synchronisation des
 * identifiants : `sync_*_provider_credentials` refusent un appel sans
 * `p_origin_client_id` (PostgREST répond alors « fonction introuvable »).
 * Le serveur n'impose qu'un identifiant stable de 16 à 96 caractères
 * alphanumériques, tirets et underscores autorisés.
 */
const ORIGIN_CLIENT_ID = "focale-configurator-web";

/**
 * Plateformes de synchronisation des réglages (`SyncPlatform.kt` de chaque
 * client) : chacune lit et écrit sa propre ligne de `profile_settings_blobs`.
 * Le téléviseur utilise la constante `SETTINGS_SYNC_PLATFORM = "tv"` de son
 * `ProfileSettingsSyncService`, l'application mobile `MOBILE_SYNC_PLATFORM` et
 * l'application desktop `DESKTOP_SYNC_PLATFORM`.
 */
const SETTINGS_PLATFORMS = ["tv", "mobile", "desktop"] as const;

/** Section du blob de réglages qui porte la langue des métadonnées TMDB. */
const TMDB_SETTINGS_FEATURE = "tmdb_settings";
const TMDB_LANGUAGE_KEY = "tmdb_language";

/** Section du blob de réglages qui porte les préférences de lecture (audio, sous-titres). */
const PLAYER_SETTINGS_FEATURE = "player_settings";

/**
 * Section du blob de réglages qui porte les notes externes MDBList. La clé
 * d'activation est `mdblist_enabled` sur les trois plateformes (« Enable
 * MDBList Ratings » dans l'Account Manager, `nuvio.tv/account?tab=settings`)
 * et vaut `false` au départ côté client (`MDBListSettingsDataStore.kt` de
 * NuvioTV, `MDBListSettingsStorage` de mobile et desktop).
 */
const MDBLIST_SETTINGS_FEATURE = "mdblist_settings";
const MDBLIST_ENABLED_KEY = "mdblist_enabled";

/** Langue poussée par défaut : métadonnées TMDB, sous-titres et piste audio. */
const FRENCH_LANGUAGE = "fr";

/**
 * Nom réel de la clé « sous-titres préférés » dans chaque client : NuvioTV
 * utilise `subtitle_preferred_language` (`PlayerSettingsDataStore.kt`), les
 * applications mobile et desktop `preferred_subtitle_language`
 * (`PlayerSettingsStorage` de NuvioMobile et NuvioDesktop).
 */
const SUBTITLE_LANGUAGE_KEYS: Record<(typeof SETTINGS_PLATFORMS)[number], string> = {
  tv: "subtitle_preferred_language",
  mobile: "preferred_subtitle_language",
  desktop: "preferred_subtitle_language",
};

/**
 * Valeur d'un réglage dans le blob : les clients Nuvio encodent chaque
 * préférence en `{ "type": "string" | "boolean" | "int" | "float" | "string_set",
 * "value": … }` (`SyncPreferenceJson.kt`, `encodePreferenceValue`).
 */
interface SyncPreference {
  type: string;
  value: unknown;
}

/**
 * Réglages de lecture poussés par défaut : sous-titres français (mode forcé) et
 * piste audio française d'abord. La clé des sous-titres dépend du client, toutes
 * les autres sont communes aux trois plateformes.
 */
function frenchPlaybackPreferences(
  platform: (typeof SETTINGS_PLATFORMS)[number],
): Record<string, SyncPreference> {
  return {
    [SUBTITLE_LANGUAGE_KEYS[platform]]: { type: "string", value: FRENCH_LANGUAGE },
    subtitle_use_forced_subtitles: { type: "boolean", value: true },
    preferred_audio_language: { type: "string", value: FRENCH_LANGUAGE },
  };
}

/** Valeur d'un réglage du blob, ou `null` quand il est absent. */
function readPreference(blob: unknown, feature: string, key: string): unknown {
  if (!blob || typeof blob !== "object") return null;
  const features = (blob as { features?: Record<string, Record<string, SyncPreference>> }).features;
  return features?.[feature]?.[key]?.value ?? null;
}

/**
 * Réglages poussés par défaut dans le profil, par section du blob de réglages :
 * langue des métadonnées TMDB, préférences de lecture françaises, et notes
 * MDBList activées (la seule case que les clients laissent éteinte à la
 * création d'un profil). Les cases par fournisseur de notes (`mdblist_show_*`
 * sur la TV, `mdblist_use_*` sur mobile et desktop) sont déjà à `true` par
 * défaut : les écrire écraserait un choix explicite de l'utilisateur.
 */
function defaultPreferenceSections(
  platform: (typeof SETTINGS_PLATFORMS)[number],
): Record<string, Record<string, SyncPreference>> {
  return {
    [TMDB_SETTINGS_FEATURE]: {
      [TMDB_LANGUAGE_KEY]: { type: "string", value: FRENCH_LANGUAGE },
    },
    [PLAYER_SETTINGS_FEATURE]: frenchPlaybackPreferences(platform),
    [MDBLIST_SETTINGS_FEATURE]: {
      [MDBLIST_ENABLED_KEY]: { type: "boolean", value: true },
    },
  };
}

/** Vrai quand tous les réglages par défaut sont déjà posés sur cette plateforme. */
function isDefaultConfigured(blob: unknown, platform: (typeof SETTINGS_PLATFORMS)[number]): boolean {
  return Object.entries(defaultPreferenceSections(platform)).every(([feature, entries]) =>
    Object.entries(entries).every(
      ([key, preference]) => readPreference(blob, feature, key) === preference.value,
    ),
  );
}

/**
 * Complète un blob de réglages avec les préférences demandées, sans toucher au
 * reste : les clients Nuvio vident la section qu'ils importent avant d'y
 * réécrire ce qu'elle contient (`importSettingsBlob`, `replaceFromSyncPayload`),
 * donc un blob partiel effacerait les autres réglages du profil.
 */
function withPreferences(
  blob: unknown,
  feature: string,
  entries: Record<string, SyncPreference>,
): Record<string, unknown> {
  const base = blob && typeof blob === "object" ? (blob as Record<string, unknown>) : {};
  const features = { ...(base.features as Record<string, unknown> | undefined) };
  const section = { ...(features[feature] as Record<string, unknown> | undefined) };
  Object.assign(section, entries);
  features[feature] = section;
  return { ...base, version: base.version ?? 1, features };
}

/** Extrait `settings_json` d'une réponse de `sync_pull_profile_settings_blob`. */
function settingsBlobValue(rows: unknown): unknown {
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row || typeof row !== "object") return null;
  const record = row as { settings_json?: unknown; settingsJson?: unknown };
  return record.settings_json ?? record.settingsJson ?? null;
}

/**
 * Message d'erreur d'authentification utilisable tel quel à l'écran : les
 * erreurs techniques renvoyées par Supabase (« Failed to fetch », « Invalid
 * login credentials ») sont traduites, les messages déjà rédigés sont rendus
 * inchangés.
 */
export function authErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  if (lower.includes("failed to fetch") || lower.includes("load failed") || lower.includes("network")) {
    return "Impossible de joindre Nuvio pour vérifier votre compte. Vérifiez votre connexion internet, puis réessayez.";
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Email ou mot de passe Nuvio refusé. Vérifiez votre saisie, puis réessayez.";
  }
  return raw;
}

/**
 * Nombre maximal de profils acceptés par Nuvio : `sync_push_profiles`,
 * `sync_push_collections` et les autres RPC par profil refusent tout
 * identifiant hors de `1..6` (« Invalid profile id », exception P0001).
 * Les clients officiels déclarent cette limite en poussant leurs profils
 * (`p_client_max_profiles`) ; l'oublier laisse le serveur sur son ancien
 * comportement à quatre emplacements.
 */
const MAX_PROFILES = 6;

/**
 * Refuse un profil que Nuvio rejetterait, avec un message lisible : sans cette
 * garde, l'appel partait avec un identifiant hors bornes et l'utilisateur
 * lisait le JSON brut de PostgREST (`Invalid profile id`).
 */
function assertProfileIndex(profileId: number) {
  if (!Number.isInteger(profileId) || profileId < 1 || profileId > MAX_PROFILES) {
    throw new Error(
      `Impossible de viser le profil Nuvio n°${String(profileId)} : Nuvio n'accepte que les profils 1 à ${MAX_PROFILES}. À l'étape 1, saisissez le nom d'un profil existant de votre compte, ou supprimez un profil dans l'application Nuvio, puis relancez la configuration.`,
    );
  }
}

/** Profil tel que le tire `sync_pull_profiles`, réduit à ce dont la garde a besoin. */
interface ProfileSummary {
  profile_index: number;
  name: string;
}

/**
 * Message à afficher quand le nom de profil demandé ne peut pas être créé,
 * `null` quand il le peut. Deux cas passent : le nom existe déjà sur le compte
 * (le profil est réutilisé) et il reste un emplacement libre parmi les six que
 * Nuvio accepte. L'appel se fait à l'étape 1, pour ne pas faire remplir les
 * étapes 2 à 4 avant de découvrir le refus à l'envoi.
 */
export function profileTargetIssue(
  profiles: readonly ProfileSummary[],
  name: string,
): string | null {
  const desired = name.trim() || "FOCALE";
  if (profiles.some((p) => p.name.trim().toLowerCase() === desired.toLowerCase())) {
    return null;
  }

  const used = new Set(
    profiles
      .map((p) => p.profile_index)
      .filter((index) => Number.isInteger(index) && index >= 1 && index <= MAX_PROFILES),
  );
  for (let index = 1; index <= MAX_PROFILES; index++) {
    if (!used.has(index)) return null;
  }

  const names = profiles.map((p) => p.name).filter(Boolean).join(", ");
  return `Votre compte Nuvio a déjà ${MAX_PROFILES} profils, le maximum accepté : « ${desired} » ne pourra pas être créé. Saisissez le nom d'un profil existant${names ? ` (${names})` : ""} pour le configurer, ou supprimez un profil dans l'application Nuvio, puis relancez la vérification.`;
}

export const NuvioApi = {
  /**
   * Connexion au compte Nuvio
   */
  async login(email: string, password: string): Promise<{ token: string; userId: string }> {
    const res = await fetchWithRetry(`${SUPABASE_BASE}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: anonHeaders(),
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.msg || body.error_description || body.message || "Identifiants invalides";
      throw new Error(msg);
    }

    const data = await res.json();
    return { token: data.access_token, userId: data.user?.id };
  },

  /**
   * Inscription d'un nouveau compte Nuvio
   */
  async signup(email: string, password: string): Promise<{ token: string; userId: string }> {
    const res = await fetchWithRetry(`${SUPABASE_BASE}/auth/v1/signup`, {
      method: "POST",
      headers: anonHeaders(),
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.msg || body.error_description || body.message || "Impossible de créer le compte";
      throw new Error(msg);
    }

    const data = await res.json();
    if (!data.access_token) {
      return this.login(email, password);
    }
    return { token: data.access_token, userId: data.user?.id };
  },

  /**
   * Authentification automatique : tente la connexion, et si le compte n'existe pas,
   * le crée automatiquement pendant l'étape d'envoi vers Nuvio.
   */
  async autoAuth(email: string, password: string): Promise<{ token: string; userId: string; isNewAccount: boolean }> {
    const cleanEmail = email.trim();
    try {
      const loginRes = await this.login(cleanEmail, password);
      return { ...loginRes, isNewAccount: false };
    } catch (err) {
      const errMsg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      // Si les identifiants ne correspondent pas à un compte existant ou utilisateur inexistant
      if (
        errMsg.includes("invalid login credentials") ||
        errMsg.includes("invalid credentials") ||
        errMsg.includes("user not found") ||
        errMsg.includes("not found")
      ) {
        try {
          const signupRes = await this.signup(cleanEmail, password);
          return { ...signupRes, isNewAccount: true };
        } catch (signupErr) {
          const sMsg = (signupErr instanceof Error ? signupErr.message : String(signupErr)).toLowerCase();
          if (sMsg.includes("already registered") || sMsg.includes("already exists")) {
            throw new Error("Ce compte Nuvio existe déjà, mais le mot de passe est erroné. Veuillez vérifier votre mot de passe.");
          }
          throw new Error(authErrorMessage(signupErr));
        }
      }
      throw new Error(authErrorMessage(err));
    }
  },

  /**
   * Récupère la liste des profils du compte Nuvio
   */
  async getProfiles(token: string): Promise<NuvioProfile[]> {
    const data = await rpc("/rest/v1/rpc/sync_pull_profiles", token, {});
    const list = (Array.isArray(data) ? data : data?.profiles || []) as Array<NuvioProfile & { id?: number }>;
    return list.map((p) => ({
      profile_index: Number(p.profile_index ?? p.id ?? 1),
      name: String(p.name || `Profil ${p.profile_index || 1}`),
      avatar_color_hex: p.avatar_color_hex || "#6366F1",
      avatar_url: p.avatar_url || null,
      uses_primary_addons: !!p.uses_primary_addons,
      uses_primary_plugins: !!p.uses_primary_plugins,
    }));
  },

  /**
   * Crée un nouveau profil avec un nom spécifique
   */
  async createProfile(token: string, name: string): Promise<NuvioProfile> {
    const existing = await this.getProfiles(token);
    const issue = profileTargetIssue(existing, name);
    if (issue) {
      throw new Error(issue);
    }

    const usedIndices = new Set(
      existing
        .map((p) => p.profile_index)
        .filter((index) => Number.isInteger(index) && index >= 1 && index <= MAX_PROFILES),
    );
    let nextIdx = 1;
    while (usedIndices.has(nextIdx)) nextIdx++;

    const newProfile: NuvioProfile = {
      profile_index: nextIdx,
      name: name.trim() || `Profil ${nextIdx}`,
      avatar_color_hex: "#6366F1",
      avatar_url: null,
      uses_primary_addons: false,
      uses_primary_plugins: false,
    };

    const updated = [...existing, newProfile];
    await rpc("/rest/v1/rpc/sync_push_profiles", token, {
      p_client_max_profiles: MAX_PROFILES,
      p_profiles: updated.map((p) => ({
        profile_index: p.profile_index,
        name: p.name,
        avatar_color_hex: p.avatar_color_hex,
        avatar_url: p.avatar_url,
        uses_primary_addons: p.uses_primary_addons,
        uses_primary_plugins: p.uses_primary_plugins,
      })),
    });

    return newProfile;
  },

  /**
   * Injecte la collection complète dans un profil Nuvio
   */
  async pushCollections(token: string, profileId: number, collections: unknown[]) {
    assertProfileIndex(profileId);
    return rpc("/rest/v1/rpc/sync_push_collections", token, {
      p_profile_id: profileId,
      p_collections_json: Array.isArray(collections) ? collections : [],
    });
  },

  /**
   * Dépose dans un profil les clés saisies à l'étape 2, au format d'identifiants
   * fournisseurs Nuvio (`provider` + `credential_json.api_key`).
   *
   * C'est la seule voie possible : les clients Nuvio excluent volontairement les
   * clés d'API des blobs de réglages qu'ils synchronisent. Nuvio Desktop en
   * dépend directement (ses sources TMDB exigent un `tmdb_api_key` propre au
   * profil), alors que les apps TV et mobile utilisent une clé TMDB intégrée à
   * l'application.
   *
   * AllDebrid n'a pas d'entrée ici : les services connectés de Nuvio ne
   * connaissent que TorBox et Premiumize. Sa clé ne sert donc que dans les
   * manifests Torrentio et Comet générés à l'étape 3.
   *
   * Les identifiants sont relus après envoi pour confirmer qu'ils sont bien
   * stockés.
   *
   * @returns Le nombre de clés envoyées, celles dont la relecture n'a pas
   *          confirmé la présence, et l'échec éventuel de la relecture.
   */
  async seedProviderCredentials(
    token: string,
    profileId: number,
    keys: ApiKeysConfig,
  ): Promise<{
    pushed: number;
    providers: string[];
    unverified: string[];
    verificationError: string;
  }> {
    assertProfileIndex(profileId);
    const entries: { provider: string; credential_json: { api_key: string } }[] = [];
    const add = (provider: string, value?: string) => {
      const clean = value?.trim();
      if (clean) entries.push({ provider, credential_json: { api_key: clean } });
    };

    add(PROVIDER_CREDENTIAL_IDS.tmdb, keys.tmdbApiKey);
    add(PROVIDER_CREDENTIAL_IDS.mdblist, keys.mdblistApiKey);
    add(PROVIDER_CREDENTIAL_IDS.torbox, keys.torboxApiKey);

    if (entries.length === 0) {
      return { pushed: 0, providers: [], unverified: [], verificationError: "" };
    }

    // L'application enregistre d'abord les fournisseurs du profil
    // (`sync_seed_provider_credentials`) puis envoie les valeurs.
    await rpc("/rest/v1/rpc/sync_seed_provider_credentials", token, {
      p_profile_id: profileId,
      p_credentials: entries,
      p_origin_client_id: ORIGIN_CLIENT_ID,
    });

    await rpc("/rest/v1/rpc/sync_push_provider_credentials", token, {
      p_profile_id: profileId,
      p_credentials: entries,
      p_origin_client_id: ORIGIN_CLIENT_ID,
    });

    const providers = entries.map((entry) => entry.provider);
    let unverified: string[] = [];
    let verificationError = "";

    try {
      const rows = await rpc("/rest/v1/rpc/sync_pull_provider_credentials", token, {
        p_profile_id: profileId,
      });
      const stored = new Set<string>();
      for (const row of Array.isArray(rows) ? rows : []) {
        const record = row as { provider?: unknown; credential_json?: { api_key?: unknown } };
        const provider = typeof record.provider === "string" ? record.provider.trim() : "";
        const value = record.credential_json?.api_key;
        if (provider && typeof value === "string" && value.trim()) stored.add(provider);
      }
      unverified = providers.filter((provider) => !stored.has(provider));
    } catch (err) {
      verificationError = err instanceof Error ? err.message : String(err);
    }

    return { pushed: entries.length, providers, unverified, verificationError };
  },

  /**
   * Règle les réglages par défaut du profil, sur les trois plateformes Nuvio :
   * téléviseur, mobile et ordinateur.
   *
   * Trois groupes de réglages sont posés, ceux que chaque client laisse en
   * anglais, en automatique ou éteints à la création d'un profil :
   * - `tmdb_settings.tmdb_language` = « fr » (« Intégrations → TMDB Enrichment →
   *   Language », en anglais par défaut) ;
   * - `player_settings` : sous-titres préférés en français, mode forcé activé
   *   (`subtitle_use_forced_subtitles`) et piste audio française d'abord (le nom
   *   de la clé des sous-titres diffère selon le client,
   *   `subtitle_preferred_language` sur TV, `preferred_subtitle_language` sur
   *   mobile et desktop) ;
   * - `mdblist_settings.mdblist_enabled` = true : « Enable MDBList Ratings »
   *   dans l'Account Manager (`nuvio.tv/account?tab=settings`), éteint par
   *   défaut côté client ; les cases par fournisseur de notes restent à leur
   *   défaut (`true`) et ne sont jamais réécrites.
   *
   * Le blob de réglages existant de chaque plateforme est relu puis complété :
   * les clients Nuvio vident la section qu'ils importent avant d'y réécrire ce
   * qu'elle contient, donc pousser un blob partiel effacerait les autres
   * réglages du profil. Les valeurs écrites sont relues pour confirmation.
   *
   * @returns Les plateformes mises à jour, celles déjà réglées, celles dont la
   *          relecture n'a rien confirmé, et les échecs par plateforme.
   */
  async applyProfileDefaults(
    token: string,
    profileId: number,
  ): Promise<{
    updated: string[];
    already: string[];
    unverified: string[];
    errors: string[];
  }> {
    assertProfileIndex(profileId);
    const pull = (platform: string) =>
      rpc("/rest/v1/rpc/sync_pull_profile_settings_blob", token, {
        p_profile_id: profileId,
        p_platform: platform,
      });

    const updated: string[] = [];
    const already: string[] = [];
    const unverified: string[] = [];
    const errors: string[] = [];

    for (const platform of SETTINGS_PLATFORMS) {
      try {
        const blob = settingsBlobValue(await pull(platform));

        if (isDefaultConfigured(blob, platform)) {
          already.push(platform);
          continue;
        }

        let next = blob;
        for (const [feature, entries] of Object.entries(defaultPreferenceSections(platform))) {
          next = withPreferences(next, feature, entries);
        }
        await rpc("/rest/v1/rpc/sync_push_profile_settings_blob", token, {
          p_profile_id: profileId,
          p_settings_json: next,
          p_platform: platform,
          p_origin_client_id: ORIGIN_CLIENT_ID,
        });

        const readBack = settingsBlobValue(await pull(platform));
        if (isDefaultConfigured(readBack, platform)) {
          updated.push(platform);
        } else {
          unverified.push(platform);
        }
      } catch (err) {
        errors.push(`${platform} (${err instanceof Error ? err.message : String(err)})`);
      }
    }

    return { updated, already, unverified, errors };
  },

  /**
   * Récupère l'ID propriétaire du compte pour l'installation d'addons
   */
  async getOwnerId(token: string): Promise<string> {
    const data = await rpc("/rest/v1/rpc/get_sync_owner", token, {});
    if (typeof data === "string") return data;
    return data?.owner || data?.id || data?.user_id || "";
  },

  /**
   * Liste les addons déjà présents sur un profil.
   */
  async getAddons(token: string, profileId: number): Promise<NuvioAddonInstall[]> {
    const res = await fetchWithRetry(
      `${SUPABASE_BASE}/rest/v1/addons?select=name,url,enabled,sort_order&profile_id=eq.${profileId}&order=sort_order`,
      { method: "GET", headers: authHeaders(token) }
    );
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    if (!Array.isArray(data)) return [];
    return data.map((row: { name?: string; url?: string }) => ({
      name: String(row.name || "Addon"),
      url: String(row.url || ""),
    })).filter((a: NuvioAddonInstall) => a.url);
  },

  /**
   * Installe / fusionne une liste d'addons sur un profil via l'API officielle
   * (remplacement atomique du profil, en conservant les addons non gérés).
   */
  async installAddons(
    token: string,
    profileId: number,
    addons: { name: string; url: string }[]
  ): Promise<number> {
    assertProfileIndex(profileId);
    const incoming = addons.filter((a) => a.url?.trim());
    const existing = await this.getAddons(token, profileId).catch(() => [] as NuvioAddonInstall[]);
    const incomingUrls = new Set(incoming.map((addon) => addon.url));
    const extras = existing.filter((addon) => !incomingUrls.has(addon.url));
    const merged = [...incoming, ...extras].map((addon, i) => ({
      name: addon.name,
      url: addon.url,
      enabled: true,
      sort_order: i,
    }));

    try {
      await rpc("/rest/v1/rpc/sync_push_addons", token, {
        p_profile_id: profileId,
        p_addons: merged,
      });
      return incoming.length;
    } catch (pushErr) {
      console.warn("sync_push_addons a échoué, repli sur insertion unitaire:", pushErr);
      const ownerId = await this.getOwnerId(token);
      let installedCount = 0;

      for (let i = 0; i < incoming.length; i++) {
        const addon = incoming[i];
        try {
          const res = await fetchWithRetry(`${SUPABASE_BASE}/rest/v1/addons`, {
            method: "POST",
            headers: {
              ...authHeaders(token),
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              profile_id: profileId,
              user_id: ownerId,
              name: addon.name,
              url: addon.url,
              enabled: true,
              sort_order: i,
            }),
          });
          if (res.ok) installedCount++;
        } catch (e) {
          console.warn(`Échec installation addon ${addon.name}:`, e);
        }
      }

      return installedCount;
    }
  },

  /**
   * Génère la liste des addons du pack France.
   *
   * Torrentio, Comet, Loostream, Frenchio, UwU-FR et VF Trailer sont générés à
   * partir des clés saisies (débrideur et TMDB), dont les formats d'URL sont
   * stables. AIO Metadata, Lumio et StreamFusion ont une configuration stockée
   * côté service : leur URL de manifest est fournie par l'utilisateur.
   */
  buildAddonsList(
    keys: ApiKeysConfig,
    manifests: {
      aioMetadataUrl?: string;
      lumioManifestUrl?: string;
      streamFusionManifestUrl?: string;
      /** Nom du profil Nuvio, repris comme pseudo par Loostream et VF Trailer. */
      profileName?: string;
      loostream?: boolean;
      frenchio?: boolean;
      uwuFr?: boolean;
      vfTrailer?: boolean;
    } = {},
  ): NuvioAddonInstall[] {
    const debridKeys = {
      torboxApiKey: keys.torboxApiKey,
      alldebridApiKey: keys.alldebridApiKey,
    };
    const debrid = debridNames(debridKeys);
    const hasDebrid = debridEntries(debridKeys).length > 0;
    const aioMetadataUrl = manifests.aioMetadataUrl?.trim();
    const lumioUrl = buildLumioUrl(manifests.lumioManifestUrl);
    const streamFusionUrl = buildStreamFusionUrl(manifests.streamFusionManifestUrl);
    const profileName = manifests.profileName ?? "";
    const loostreamUrl =
      manifests.loostream === false ? "" : buildLoostreamUrl(keys.tmdbApiKey, profileName);
    const frenchioUrl =
      manifests.frenchio === false ? "" : buildFrenchioUrl(debridKeys, keys.tmdbApiKey);
    const uwuFrUrl =
      manifests.uwuFr === true ? buildUwuFrUrl(debridKeys, keys.tmdbApiKey) : "";
    const vfTrailerUrl =
      manifests.vfTrailer === false ? "" : buildVfTrailerUrl(keys.tmdbApiKey, profileName);

    const addons: NuvioAddonInstall[] = [
      { name: "Cinemeta", url: "https://v3-cinemeta.strem.io/manifest.json", note: "Métadonnées officielles" },
      { name: "OpenSubtitles v3", url: "https://opensubtitles-v3.strem.io/manifest.json", note: "Sous-titres français officiels" },
      {
        name: "AIO Metadata",
        url: aioMetadataUrl || "https://aiometadata.elfhosted.com/manifest.json",
        note: aioMetadataUrl
          ? "Votre configuration AIO Metadata (clés + catalogues FR)"
          : "Instance publique AIO Metadata, sans vos clés ni vos catalogues",
      },
    ];

    if (lumioUrl) {
      addons.push({
        name: "Lumio",
        url: lumioUrl,
        note: debrid
          ? `Profil Lumio (débrideur ${debrid}, préférences FR)`
          : "Profil Lumio (préférences FR)",
      });
    }

    addons.push(
      {
        name: "Torrentio",
        url: hasDebrid ? buildTorrentioUrl(debridKeys) : "https://torrentio.strem.fun/manifest.json",
        note: hasDebrid ? `Scraper principal avec débrideur ${debrid}` : "Scraper sans débrideur",
      },
      {
        name: "Comet",
        url: hasDebrid ? buildCometUrl(debridKeys) : "https://comet.elfhosted.com/manifest.json",
        note: hasDebrid ? `Scraper rapide avec débrideur ${debrid}` : "Scraper sans débrideur",
      },
    );

    if (frenchioUrl) {
      addons.push({
        name: "Frenchio",
        url: frenchioUrl,
        note: `Trackers francophones avec débrideur ${debrid}`,
      });
    }

    if (loostreamUrl) {
      addons.push({
        name: "Loostream",
        url: loostreamUrl,
        note: "Sources francophones directes (VF/VOSTFR), sans débrideur",
      });
    }

    if (vfTrailerUrl) {
      addons.push({
        name: "VF Trailer",
        url: vfTrailerUrl,
        note: "Bandes-annonces officielles en français (Allociné, YouTube)",
      });
    }

    if (uwuFrUrl) {
      addons.push({
        name: "UwU-FR",
        url: uwuFrUrl,
        note: `Animés VF et VOSTFR avec débrideur ${debrid}`,
      });
    }

    if (streamFusionUrl) {
      addons.push({
        name: "StreamFusion",
        url: streamFusionUrl,
        note: debrid
          ? `Votre configuration StreamFusion (débrideur ${debrid})`
          : "Votre configuration StreamFusion",
      });
    }

    return addons;
  },
};
