import { describe, expect, it } from "vitest";

import {
  buildCometUrl,
  buildFrenchioUrl,
  buildLoostreamUrl,
  buildLumioUrl,
  buildProvidedManifestUrl,
  buildStreamFusionUrl,
  buildTorrentioUrl,
  buildUwuFrUrl,
  debridEntries,
  debridNames,
} from "@/lib/manifest-urls";

/** Décode une config base64 UTF-8 prise dans le chemin d'un manifest. */
function decodePathConfig(url: string): Record<string, unknown> {
  const encoded = url.split("/").at(-2) ?? "";
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as Record<string, unknown>;
}

const BOTH_KEYS = { torboxApiKey: "TB-KEY", alldebridApiKey: "AD-KEY" };

describe("debridEntries", () => {
  it("ne retient que les clés renseignées, dans l'ordre TorBox puis AllDebrid", () => {
    expect(debridEntries({})).toEqual([]);
    expect(debridEntries({ torboxApiKey: " tb " })).toEqual([{ id: "torbox", apiKey: "tb" }]);
    expect(debridEntries({ alldebridApiKey: "ad", torboxApiKey: "tb" })).toEqual([
      { id: "torbox", apiKey: "tb" },
      { id: "alldebrid", apiKey: "ad" },
    ]);
  });

  it("ignore les clés vides ou faites d'espaces", () => {
    expect(debridEntries({ torboxApiKey: "   ", alldebridApiKey: "" })).toEqual([]);
  });
});

describe("debridNames", () => {
  it("joint les noms français des débrideurs retenus", () => {
    expect(debridNames(BOTH_KEYS)).toBe("TorBox et AllDebrid");
    expect(debridNames({ torboxApiKey: "tb" })).toBe("TorBox");
    expect(debridNames({ alldebridApiKey: "ad" })).toBe("AllDebrid");
    expect(debridNames({})).toBe("");
  });
});

describe("buildTorrentioUrl", () => {
  it("porte les deux débrideurs en paramètres de requête", () => {
    const url = buildTorrentioUrl(BOTH_KEYS);
    expect(url).toBe(
      "https://torrentio.strem.fun/sort=qualityfilter|language=french,english|torbox=TB-KEY|alldebrid=AD-KEY/manifest.json",
    );
  });

  it("reste valide sans débrideur (Torrentio installé sans clé)", () => {
    expect(buildTorrentioUrl({})).toBe(
      "https://torrentio.strem.fun/sort=qualityfilter|language=french,english/manifest.json",
    );
  });
});

describe("buildCometUrl", () => {
  it("encode le schéma de la page /configure avec les débrideurs renseignés", () => {
    const config = decodePathConfig(buildCometUrl(BOTH_KEYS));
    expect(config.debridServices).toEqual([
      { service: "torbox", apiKey: "TB-KEY" },
      { service: "alldebrid", apiKey: "AD-KEY" },
    ]);
    expect(config.languages).toEqual({
      required: [],
      allowed: [],
      exclude: [],
      preferred: ["fr"],
    });
  });

  it("n'annonce aucun débrideur quand aucune clé n'est saisie", () => {
    expect(decodePathConfig(buildCometUrl({})).debridServices).toEqual([]);
  });
});

describe("buildProvidedManifestUrl", () => {
  it("accepte une URL http(s) en la débarrassant des espaces", () => {
    expect(buildProvidedManifestUrl("  https://mylumio.tv/abc/manifest.json ")).toBe(
      "https://mylumio.tv/abc/manifest.json",
    );
    expect(buildProvidedManifestUrl("HTTP://exemple.fr/m.json")).toBe("HTTP://exemple.fr/m.json");
  });

  it("renvoie une chaîne vide pour une saisie absente ou non http(s)", () => {
    expect(buildProvidedManifestUrl()).toBe("");
    expect(buildProvidedManifestUrl("   ")).toBe("");
    expect(buildProvidedManifestUrl("mylumio.tv/abc")).toBe("");
    expect(buildProvidedManifestUrl("stremio://manifest")).toBe("");
  });

  it("sert Lumio et StreamFusion à l'identique", () => {
    expect(buildLumioUrl("https://mylumio.tv/1/manifest.json")).toBe(
      buildStreamFusionUrl("https://mylumio.tv/1/manifest.json"),
    );
    expect(buildLumioUrl("")).toBe("");
  });
});

describe("buildLoostreamUrl", () => {
  it("reprend les réglages par défaut de la page /configure", () => {
    const config = decodePathConfig(buildLoostreamUrl("TMDB-KEY", "Nuvio France FR"));
    expect(config).toEqual({
      tmdbKey: "TMDB-KEY",
      proxy: "direct",
      prefQuality: "1080p",
      langOrder: ["MULTI", "VF", "VOSTFR", "VO"],
      minStreams: 5,
      sortBy: "language",
      pseudo: "Nuvio France FR",
    });
  });

  it("retombe sur le pseudo « Focale » et encode les accents du pseudo", () => {
    expect(decodePathConfig(buildLoostreamUrl("K", "   ")).pseudo).toBe("Focale");
    expect(decodePathConfig(buildLoostreamUrl("K", "Cinéma Français")).pseudo).toBe(
      "Cinéma Français",
    );
  });

  it("renvoie une chaîne vide sans clé TMDB (prérequis de l'addon)", () => {
    expect(buildLoostreamUrl(undefined, "Profil")).toBe("");
    expect(buildLoostreamUrl("  ", "Profil")).toBe("");
  });
});

describe("buildFrenchioUrl", () => {
  it("place chaque clé dans son propre champ et YGG d'abord dans l'ordre des fournisseurs", () => {
    const config = decodePathConfig(buildFrenchioUrl(BOTH_KEYS, "TMDB-KEY"));
    expect(config.tmdb_key).toBe("TMDB-KEY");
    expect(config.torbox_key).toBe("TB-KEY");
    expect(config.alldebrid_key).toBe("AD-KEY");
    expect(config.providers_order).toEqual(["ygg", "torbox", "alldebrid"]);
    expect(config.trackers).toEqual([]);
  });

  it("renvoie une chaîne vide sans clé TMDB ou sans débrideur", () => {
    expect(buildFrenchioUrl(BOTH_KEYS, undefined)).toBe("");
    expect(buildFrenchioUrl({}, "TMDB-KEY")).toBe("");
  });
});

describe("buildUwuFrUrl", () => {
  it("préfère le premier débrideur saisi et ne demande que des sous-titres français", () => {
    const config = decodePathConfig(buildUwuFrUrl(BOTH_KEYS, "TMDB-KEY"));
    expect(config.debrid_preferred).toBe("torbox");
    expect(config.subs_languages).toEqual(["fre"]);
    expect(config.subs_limits).toEqual({ fre: 6 });
    expect(config.addon_host).toBe("uwu.creepso.com");
  });

  it("change de débrideur préféré quand seule la clé AllDebrid est fournie", () => {
    const config = decodePathConfig(buildUwuFrUrl({ alldebridApiKey: "AD-KEY" }, "TMDB-KEY"));
    expect(config.debrid_preferred).toBe("alldebrid");
    expect(config.torbox_key).toBeNull();
  });

  it("renvoie une chaîne vide sans clé TMDB ou sans débrideur", () => {
    expect(buildUwuFrUrl(BOTH_KEYS, "  ")).toBe("");
    expect(buildUwuFrUrl({}, "TMDB-KEY")).toBe("");
  });
});
