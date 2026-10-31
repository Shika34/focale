import { afterEach, describe, expect, it, vi } from "vitest";

import { preflightManifests } from "@/lib/manifest-preflight";

/**
 * Contrôle des manifests avant écriture dans le profil : un addon muet est
 * écarté et signalé, un addon sain passe. Le contrôle ne doit jamais lever,
 * même quand le réseau tombe.
 */

const addons = [
  { name: "Torrentio", url: "https://torrentio.strem.fun/x/manifest.json" },
  { name: "Comet", url: "https://comet.elfhosted.com/y/manifest.json" },
];

function manifestResponse(id: string, status = 200): Response {
  return new Response(JSON.stringify({ id, version: "1.0.0", name: id }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("preflightManifests", () => {
  it("garde les addons qui répondent par un manifest", async () => {
    const fetchImpl = vi.fn(async () => manifestResponse("community.torrentio")) as unknown as typeof fetch;
    const { ready, failed } = await preflightManifests(addons, { fetchImpl });

    expect(failed).toEqual([]);
    expect(ready.map((addon) => addon.name)).toEqual(["Torrentio", "Comet"]);
  });

  it("écarte un addon en erreur HTTP et garde son nom", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) =>
      String(url).includes("torrentio") ? manifestResponse("x", 503) : manifestResponse("community.comet"),
    ) as unknown as typeof fetch;

    const { ready, failed } = await preflightManifests(addons, { fetchImpl });

    expect(failed).toEqual([{ name: "Torrentio", reason: "réponse HTTP 503" }]);
    expect(ready.map((addon) => addon.name)).toEqual(["Comet"]);
  });

  it("écarte une réponse qui n'est pas un manifest", async () => {
    const fetchImpl = vi.fn(async () => new Response("<html>maintenance</html>", { status: 200 })) as unknown as typeof fetch;

    const { ready, failed } = await preflightManifests(addons, { fetchImpl });

    expect(ready).toEqual([]);
    expect(failed).toHaveLength(2);
    expect(failed[0].reason).toBe("réponse illisible");
  });

  it("écarte un manifest sans identifiant", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ name: "vide" }), { status: 200 })) as unknown as typeof fetch;

    const { failed } = await preflightManifests(addons, { fetchImpl });

    expect(failed[0].reason).toBe("réponse qui n'est pas un manifest");
  });

  it("installe quand même un addon qui ne répond pas dans le délai", async () => {
    // Échec réseau ou délai dépassé : le CORS du navigateur peut en être la
    // cause alors que Nuvio atteint le manifest. On ne l'écarte pas.
    const fetchImpl = vi.fn(async () => {
      const error = new Error("The operation was aborted due to timeout");
      error.name = "TimeoutError";
      throw error;
    }) as unknown as typeof fetch;

    const { ready, failed } = await preflightManifests(addons, { fetchImpl });

    expect(failed).toEqual([]);
    expect(ready.map((addon) => addon.name)).toEqual(["Torrentio", "Comet"]);
  });

  it("écarte un lien vide sans appeler le réseau", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const { failed } = await preflightManifests([{ name: "Lumio", url: " " }], { fetchImpl });

    expect(failed).toEqual([{ name: "Lumio", reason: "lien vide" }]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
