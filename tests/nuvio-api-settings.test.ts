import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NuvioApi } from "@/lib/nuvio-api";

const PULL = "sync_pull_profile_settings_blob";
const PUSH = "sync_push_profile_settings_blob";

/** Blobs de réglages simulés, par plateforme, et journal des RPC reçues. */
interface FakeState {
  blobs: Record<string, unknown>;
  pulls: { platform: string; body: Record<string, unknown> }[];
  pushes: { platform: string; body: Record<string, unknown> }[];
  /** Plateformes dont l'envoi est accepté mais jamais enregistré (relecture muette). */
  dropWrites: string[];
  /** Plateformes dont l'envoi échoue. */
  failWrites: string[];
}

function stubSupabase(state: FakeState) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, options: RequestInit = {}) => {
      const path = String(url).split("/rest/v1/rpc/")[1] ?? String(url);
      const body = JSON.parse(String(options.body ?? "{}")) as Record<string, unknown>;
      const platform = String(body.p_platform ?? "");

      if (path === PULL) {
        state.pulls.push({ platform, body });
        return new Response(JSON.stringify([{ settings_json: state.blobs[platform] ?? null }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === PUSH) {
        state.pushes.push({ platform, body });
        if (state.failWrites.includes(platform)) {
          return new Response("permission denied for function", { status: 403 });
        }
        if (!state.dropWrites.includes(platform)) {
          state.blobs[platform] = body.p_settings_json;
        }
        return new Response(null, { status: 204 });
      }

      return new Response("unknown rpc", { status: 404 });
    }),
  );
}

function newState(overrides: Partial<FakeState> = {}): FakeState {
  return { blobs: {}, pulls: [], pushes: [], dropWrites: [], failWrites: [], ...overrides };
}

/** Valeur d'un réglage dans un blob poussé ou relu. */
function preferenceOf(blob: unknown, feature: string, key: string): unknown {
  const features = (blob as { features?: Record<string, Record<string, { value?: unknown }>> })
    ?.features;
  return features?.[feature]?.[key]?.value;
}

/** Réglage TMDB d'un blob poussé ou relu. */
function languageOf(blob: unknown): unknown {
  return preferenceOf(blob, "tmdb_settings", "tmdb_language");
}

/** Clé de sous-titres préférés, dont le nom diffère entre la TV et le mobile. */
const SUBTITLE_KEY: Record<string, string> = {
  tv: "subtitle_preferred_language",
  mobile: "preferred_subtitle_language",
  desktop: "preferred_subtitle_language",
};

const OTHER_FEATURE = {
  layout_settings: { catalog_layout: { type: "string", value: "grid" } },
};
const OTHER_PLAYER_PREFERENCE = { skip_intro_enabled: { type: "boolean", value: false } };

describe("NuvioApi.applyFrenchDefaults", () => {
  beforeEach(() => {
    stubSupabase(newState());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("passe les trois plateformes en français et rapporte chaque mise à jour", async () => {
    const state = newState();
    stubSupabase(state);

    const result = await NuvioApi.applyFrenchDefaults("jeton", 4);

    expect(result).toEqual({
      updated: ["tv", "mobile", "desktop"],
      already: [],
      unverified: [],
      errors: [],
    });
    // Une lecture avant écriture, une relecture de confirmation par plateforme.
    expect([...new Set(state.pulls.map((call) => call.platform))]).toEqual([
      "tv",
      "mobile",
      "desktop",
    ]);
    for (const platform of ["tv", "mobile", "desktop"]) {
      expect(languageOf(state.blobs[platform])).toBe("fr");
    }
  });

  it("règle les sous-titres français forcés et la VF, avec le nom de clé de chaque client", async () => {
    const state = newState();
    stubSupabase(state);

    await NuvioApi.applyFrenchDefaults("jeton", 4);

    for (const platform of ["tv", "mobile", "desktop"]) {
      const blob = state.blobs[platform];
      expect(preferenceOf(blob, "player_settings", SUBTITLE_KEY[platform])).toBe("fr");
      expect(preferenceOf(blob, "player_settings", "subtitle_use_forced_subtitles")).toBe(true);
      expect(preferenceOf(blob, "player_settings", "preferred_audio_language")).toBe("fr");
    }
    // La TV lit `subtitle_preferred_language`, jamais le nom du mobile.
    expect(preferenceOf(state.blobs.tv, "player_settings", "preferred_subtitle_language")).toBe(
      undefined,
    );
    expect(preferenceOf(state.blobs.mobile, "player_settings", "subtitle_preferred_language")).toBe(
      undefined,
    );
  });

  it("préserve les autres réglages du blob (les clients vident la section importée)", async () => {
    const state = newState({
      blobs: {
        tv: {
          version: 1,
          features: { ...OTHER_FEATURE, player_settings: { ...OTHER_PLAYER_PREFERENCE } },
        },
      },
    });
    stubSupabase(state);

    await NuvioApi.applyFrenchDefaults("jeton", 4);

    const pushed = state.blobs.tv as { features: Record<string, Record<string, unknown>> };
    expect(pushed.features.layout_settings).toEqual(OTHER_FEATURE.layout_settings);
    expect(pushed.features.player_settings.skip_intro_enabled).toEqual(
      OTHER_PLAYER_PREFERENCE.skip_intro_enabled,
    );
    expect(languageOf(pushed)).toBe("fr");
  });

  it("n'écrit pas sur une plateforme déjà réglée en français", async () => {
    const state = newState({
      blobs: {
        tv: {
          version: 1,
          features: {
            tmdb_settings: { tmdb_language: { type: "string", value: "fr" } },
            player_settings: {
              subtitle_preferred_language: { type: "string", value: "fr" },
              subtitle_use_forced_subtitles: { type: "boolean", value: true },
              preferred_audio_language: { type: "string", value: "fr" },
            },
          },
        },
      },
    });
    stubSupabase(state);

    const result = await NuvioApi.applyFrenchDefaults("jeton", 4);

    expect(result.already).toEqual(["tv"]);
    expect(result.updated).toEqual(["mobile", "desktop"]);
    expect(state.pushes.map((call) => call.platform)).not.toContain("tv");
  });

  it("réécrit une plateforme dont les sous-titres ne sont pas encore en français", async () => {
    const state = newState({
      blobs: {
        tv: { version: 1, features: { tmdb_settings: { tmdb_language: { type: "string", value: "fr" } } } },
      },
    });
    stubSupabase(state);

    const result = await NuvioApi.applyFrenchDefaults("jeton", 4);

    expect(result.updated).toContain("tv");
    expect(preferenceOf(state.blobs.tv, "player_settings", "subtitle_preferred_language")).toBe("fr");
  });

  it("signale une écriture acceptée mais non relue (aucune confirmation serveur)", async () => {
    const state = newState({ dropWrites: ["tv", "mobile", "desktop"] });
    stubSupabase(state);

    const result = await NuvioApi.applyFrenchDefaults("jeton", 4);

    expect(result.updated).toEqual([]);
    expect(result.unverified).toEqual(["tv", "mobile", "desktop"]);
  });

  it("remonte l'échec d'une plateforme sans interrompre les suivantes", async () => {
    const state = newState({ failWrites: ["tv"] });
    stubSupabase(state);

    const result = await NuvioApi.applyFrenchDefaults("jeton", 4);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("tv (");
    expect(result.errors[0]).toContain("HTTP 403");
    expect(result.updated).toEqual(["mobile", "desktop"]);
    expect(result.already).toEqual([]);
  });

  it("envoie p_origin_client_id à l'écriture et jamais à la lecture", async () => {
    const state = newState();
    stubSupabase(state);

    await NuvioApi.applyFrenchDefaults("jeton", 4);

    for (const { body } of state.pulls) {
      expect(Object.keys(body).sort()).toEqual(["p_platform", "p_profile_id"]);
    }
    for (const { body } of state.pushes) {
      expect(body.p_profile_id).toBe(4);
      const originClientId = String(body.p_origin_client_id ?? "");
      expect(originClientId.length).toBeGreaterThanOrEqual(16);
      expect(originClientId.length).toBeLessThanOrEqual(96);
      expect(body.p_settings_json).toMatchObject({ version: 1 });
    }
  });
});
