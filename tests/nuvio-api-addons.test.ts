import { afterEach, describe, expect, it, vi } from "vitest";

import { NuvioApi } from "@/lib/nuvio-api";

/**
 * Écriture des addons dans un profil : la liste d'avant doit ressortir intacte
 * (nom, lien, activé ou non, ordre) pour que l'écran de fin puisse la proposer
 * en remise en état, et `restoreAddons` doit la reposer telle quelle.
 */

type Call = { url: string; method: string; body: Record<string, unknown> };

const rows = [
  { name: "Torrentio", url: "https://ancien.torrentio/manifest.json", enabled: true, sort_order: 0 },
  { name: "Perso", url: "https://perso.example/manifest.json", enabled: false, sort_order: 1 },
];

function stubSupabase(existing: unknown[]) {
  const calls: Call[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, init: RequestInit = {}) => {
      const target = String(url);
      calls.push({
        url: target,
        method: init.method ?? "GET",
        body: init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {},
      });

      if (target.includes("/rest/v1/addons?select=")) {
        return new Response(JSON.stringify(existing), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(null, { status: 204 });
    }),
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("NuvioApi.installAddons", () => {
  it("rend la liste d'avant et garde son état", async () => {
    const calls = stubSupabase(rows);

    const result = await NuvioApi.installAddons("jeton", 1, [
      { name: "Comet", url: "https://comet.elfhosted.com/x/manifest.json" },
    ]);

    expect(result.installed).toBe(1);
    expect(result.previous).toEqual([
      { name: "Torrentio", url: "https://ancien.torrentio/manifest.json", enabled: true, sort_order: 0 },
      { name: "Perso", url: "https://perso.example/manifest.json", enabled: false, sort_order: 1 },
    ]);

    const push = calls.find((call) => call.url.includes("sync_push_addons"));
    expect(push?.body.p_addons).toEqual([
      { name: "Comet", url: "https://comet.elfhosted.com/x/manifest.json", enabled: true, sort_order: 0 },
      { name: "Torrentio", url: "https://ancien.torrentio/manifest.json", enabled: true, sort_order: 1 },
      { name: "Perso", url: "https://perso.example/manifest.json", enabled: false, sort_order: 2 },
    ]);
  });

  it("remplace un addon déjà présent au même lien au lieu de le doubler", async () => {
    const calls = stubSupabase(rows);
    const url = "https://ancien.torrentio/manifest.json";

    const result = await NuvioApi.installAddons("jeton", 1, [{ name: "Torrentio", url }]);

    const push = calls.find((call) => call.url.includes("sync_push_addons"));
    const pushed = push?.body.p_addons as { url: string }[];
    expect(pushed.filter((addon) => addon.url === url)).toHaveLength(1);
    expect(result.previous).toHaveLength(2);
  });
});

describe("NuvioApi.restoreAddons", () => {
  it("repose la liste d'avant telle quelle", async () => {
    const calls = stubSupabase([]);

    const count = await NuvioApi.restoreAddons("jeton", 1, rows);

    expect(count).toBe(2);
    const push = calls.find((call) => call.url.includes("sync_push_addons"));
    expect(push?.body).toEqual({
      p_profile_id: 1,
      p_addons: [
        { name: "Torrentio", url: "https://ancien.torrentio/manifest.json", enabled: true, sort_order: 0 },
        { name: "Perso", url: "https://perso.example/manifest.json", enabled: false, sort_order: 1 },
      ],
    });
  });
});
