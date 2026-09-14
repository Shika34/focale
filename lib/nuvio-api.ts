/**
 * Client API Nuvio Direct (Supabase)
 * Toutes les requêtes sont effectuées directement depuis le navigateur de l'utilisateur
 * vers https://api.nuvio.tv. Aucune donnée sensible n'est envoyée à un tiers.
 */

import { buildLumioUrl, buildTorrentioUrl, buildCometUrl } from "./manifest-urls";

const SUPABASE_BASE = "https://api.nuvio.tv";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgxNTIxMzQ2LCJleHAiOjE5MzkyMDEzNDZ9.tmQaj682pwzehpqlgCDMnySOqiUvpgRbrE43T4VJpDI";

export interface NuvioProfile {
  profile_index: number;
  name: string;
  avatar_color_hex?: string;
  avatar_url?: string | null;
  uses_primary_addons?: boolean;
  uses_primary_plugins?: boolean;
}

export interface ApiKeysConfig {
  torboxApiKey?: string;
  tmdbApiKey?: string;
  tvdbApiKey?: string;
  mdblistApiKey?: string;
}

export interface NuvioAddonInstall {
  name: string;
  url: string;
  note?: string;
}

/** Intégrations publiques, sans clé ni compte utilisateur. */
export const KEYLESS_INTEGRATIONS = {
  tmdb: {
    name: "The Movie Database (TMDB)",
    url: "https://94c8cb9f702d-tmdb-addon.baby-beamup.club/manifest.json",
    note: "Métadonnées & affiches FR via l'instance officielle (aucune clé TMDB)",
  },
  lumio: {
    name: "Lumio",
    url: "https://mylumio.tv/manifest.json",
    note: "Flux francophones — profil public Lumio, zéro clé API",
  },
  bingecat: {
    name: "Bingecat",
    url: "https://bingecat.strem.fun/manifest.json",
    note: "Catalogues & recommandations IA — instance publique, sans inscription",
  },
} as const;

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
          throw signupErr;
        }
      }
      throw err;
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
    const usedIndices = new Set(existing.map((p) => p.profile_index));
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
    return rpc("/rest/v1/rpc/sync_push_collections", token, {
      p_profile_id: profileId,
      p_collections_json: Array.isArray(collections) ? collections : [],
    });
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
   * Torrentio et Comet sont générés à partir de la clé TorBox (formats d'URL
   * stables). AIO Metadata, AIOStreams et Lumio ont une configuration stockée
   * côté service : leur URL de manifest est fournie par l'utilisateur.
   */
  buildAddonsList(
    keys: ApiKeysConfig,
    manifests: { aioMetadataUrl?: string; lumioManifestUrl?: string } = {},
  ): NuvioAddonInstall[] {
    const torboxKey = keys.torboxApiKey?.trim();
    const aioMetadataUrl = manifests.aioMetadataUrl?.trim();
    const lumioUrl = buildLumioUrl(manifests.lumioManifestUrl);

    const addons: NuvioAddonInstall[] = [
      { name: "Cinemeta", url: "https://v3-cinemeta.strem.io/manifest.json", note: "Métadonnées officielles" },
      { name: "OpenSubtitles v3", url: "https://opensubtitles-v3.strem.io/manifest.json", note: "Sous-titres français officiels" },
      {
        name: "AIO Metadata",
        url: aioMetadataUrl || "https://aiometadata.elfhosted.com/manifest.json",
        note: aioMetadataUrl
          ? "Ta configuration AIO Metadata (clés + catalogues FR)"
          : "Instance publique AIO Metadata, sans tes clés ni tes catalogues",
      },
    ];

    if (lumioUrl) {
      addons.push({ name: "Lumio", url: lumioUrl, note: "Profil Lumio (débrideur TorBox, préférences FR)" });
    }

    addons.push(
      {
        name: "Torrentio",
        url: torboxKey ? buildTorrentioUrl(torboxKey) : "https://torrentio.strem.fun/manifest.json",
        note: torboxKey ? "Scraper principal avec débrideur TorBox" : "Scraper sans débrideur",
      },
      {
        name: "Comet",
        url: torboxKey ? buildCometUrl(torboxKey) : "https://comet.elfhosted.com/manifest.json",
        note: torboxKey ? "Scraper rapide avec débrideur TorBox" : "Scraper sans débrideur",
      },
    );

    return addons;
  },
};
