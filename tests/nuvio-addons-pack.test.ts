import { describe, expect, it } from "vitest";

import { NuvioApi } from "@/lib/nuvio-api";

/**
 * Composition du pack d'addons poussé dans Nuvio : les addons générés à partir
 * des clés de l'étape 2 n'apparaissent que lorsque leur prérequis est là, et
 * l'utilisateur peut les décocher.
 */

const NO_KEYS = {
  torboxApiKey: "",
  alldebridApiKey: "",
  tmdbApiKey: "",
  tvdbApiKey: "",
  mdblistApiKey: "",
};

function names(keys: Parameters<typeof NuvioApi.buildAddonsList>[0], manifests = {}) {
  return NuvioApi.buildAddonsList(keys, manifests).map((addon) => addon.name);
}

describe("NuvioApi.buildAddonsList", () => {
  it("garde toujours les addons essentiels du pack", () => {
    expect(names(NO_KEYS)).toEqual(["Cinemeta", "OpenSubtitles v3", "AIO Metadata", "Torrentio", "Comet"]);
  });

  it("ajoute Loostream et VF Trailer quand la clé TMDB est fournie", () => {
    const addons = names({ ...NO_KEYS, tmdbApiKey: "TMDB-KEY" });

    expect(addons).toContain("Loostream");
    expect(addons).toContain("VF Trailer");
  });

  it("n'ajoute aucun addon à clé TMDB sans cette clé", () => {
    const addons = names(NO_KEYS);

    expect(addons).not.toContain("Loostream");
    expect(addons).not.toContain("VF Trailer");
    expect(addons).not.toContain("Frenchio");
    expect(addons).not.toContain("UwU-FR");
  });

  it("n'ajoute Frenchio qu'avec un débrideur et la clé TMDB", () => {
    expect(names({ ...NO_KEYS, tmdbApiKey: "K", torboxApiKey: "T" })).toContain("Frenchio");
    expect(names({ ...NO_KEYS, tmdbApiKey: "K" })).not.toContain("Frenchio");
    expect(names({ ...NO_KEYS, torboxApiKey: "T" })).not.toContain("Frenchio");
  });

  it("retire UwU-FR et VF Trailer quand ils sont décochés", () => {
    const keys = { ...NO_KEYS, tmdbApiKey: "K", torboxApiKey: "T" };
    const addons = names(keys, { uwuFr: true, vfTrailer: false });

    expect(addons).toContain("UwU-FR");
    expect(addons).not.toContain("VF Trailer");
  });

  it("reprend le nom du profil comme pseudo des addons qui en demandent un", () => {
    const [vfTrailer] = NuvioApi.buildAddonsList(
      { ...NO_KEYS, tmdbApiKey: "K" },
      { profileName: "FOCALE" },
    ).filter((addon) => addon.name === "VF Trailer");

    const encoded = vfTrailer.url.split("/").at(-2) ?? "";
    const config = JSON.parse(
      Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as { pseudo: string; tmdbKey: string };

    expect(config).toEqual({ pseudo: "FOCALE", tmdbKey: "K" });
  });
});
