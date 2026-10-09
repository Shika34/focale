import { afterEach, describe, expect, it, vi } from "vitest";

import { NuvioApi } from "@/lib/nuvio-api";

/**
 * Choix du profil Nuvio de destination (étape 4 du configurateur).
 *
 * Nuvio accepte six profils au maximum : `sync_push_profiles` comme
 * `sync_push_collections` refusent tout identifiant hors de `1..6`
 * (« Invalid profile id », P0001). L'assistant ne doit donc jamais viser un
 * septième emplacement, et un refus serveur doit ressortir en français, pas
 * sous forme de JSON PostgREST.
 */

type RpcCall = { path: string; body: Record<string, unknown> };

function stubSupabase(profiles: unknown[], options: { collectionsFails?: boolean } = {}) {
  const calls: RpcCall[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, init: RequestInit = {}) => {
      const path = String(url).split("/rest/v1/rpc/")[1] ?? String(url);
      const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
      calls.push({ path, body });
      if (path === "sync_pull_profiles") {
        return new Response(JSON.stringify(profiles), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (options.collectionsFails && path === "sync_push_collections") {
        return new Response(
          JSON.stringify({ code: "P0001", message: "Invalid profile id", details: null, hint: null }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(null, { status: 204 });
    }),
  );
  return calls;
}

function profilesUpTo(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `uuid-${i + 1}`,
    profile_index: i + 1,
    name: `Profil ${i + 1}`,
    avatar_color_hex: "#6366F1",
  }));
}

describe("NuvioApi.createProfile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("déclare six emplacements de profils et crée le premier libre", async () => {
    const calls = stubSupabase(profilesUpTo(4));
    const created = await NuvioApi.createProfile("jeton", "FOCALE");

    expect(created.profile_index).toBe(5);
    const push = calls.find((call) => call.path === "sync_push_profiles");
    expect(push?.body.p_client_max_profiles).toBe(6);
    expect((push?.body.p_profiles as unknown[]).length).toBe(5);
  });

  it("refuse un septième profil plutôt que de viser un emplacement inexistant", async () => {
    const calls = stubSupabase(profilesUpTo(6));

    await expect(NuvioApi.createProfile("jeton", "FOCALE")).rejects.toThrow(/6 profils/i);
    expect(calls.some((call) => call.path === "sync_push_profiles")).toBe(false);
  });
});

describe("NuvioApi.pushCollections", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("explique en français un identifiant de profil hors bornes", async () => {
    const calls = stubSupabase([], { collectionsFails: true });

    await expect(NuvioApi.pushCollections("jeton", 7, [])).rejects.toThrow(
      /profil Nuvio/i,
    );
    expect(calls.length).toBe(0);
  });

  it("transmet l'appel quand l'identifiant est valide", async () => {
    const calls = stubSupabase([]);
    await NuvioApi.pushCollections("jeton", 2, [{ id: "collection-1" }]);

    expect(calls).toEqual([
      { path: "sync_push_collections", body: { p_profile_id: 2, p_collections_json: [{ id: "collection-1" }] } },
    ]);
  });
});
