import { describe, expect, it } from "vitest";

import {
  addonHost,
  addonsNeedingManifestUrl,
  FOCALE_ADDONS,
  isAddonInstalled,
  neededKeys,
  splitFocaleAddons,
  storedDebridKey,
  storedTmdbKey,
} from "@/lib/focale-addons";

const installedPack = [
  { name: "Cinemeta", url: "https://v3-cinemeta.strem.io/manifest.json" },
  { name: "OpenSubtitles v3", url: "https://opensubtitles-v3.strem.io/manifest.json" },
  { name: "SubSense", url: "https://subsense.nepiraw.com/focale01-x/manifest.json" },
  { name: "AIO Metadata", url: "https://aiometadata.elfhosted.com/mon-identifiant/manifest.json" },
  { name: "Torrentio", url: "https://torrentio.strem.fun/realdebrid=UNE_AUTRE_CLE|sort=quality/manifest.json" },
  { name: "Comet", url: "https://comet.elfhosted.com/ANCIENNE_CLE/manifest.json" },
  { name: "Lumio", url: "https://lumio.exemple.test/PROFIL/manifest.json" },
  { name: "Une extension perso", url: "https://exemple.test/manifest.json" },
];

describe("addonHost", () => {
  it("extrait l'hôte d'une URL de manifest", () => {
    expect(addonHost("https://torrentio.strem.fun/a/b/manifest.json")).toBe("torrentio.strem.fun");
    expect(addonHost("https://v3-cinemeta.strem.io/manifest.json")).toBe("v3-cinemeta.strem.io");
  });

  it("ignore la casse et une URL illisible", () => {
    expect(addonHost("HTTPS://Torrentio.Strem.Fun/manifest.json")).toBe("torrentio.strem.fun");
    expect(addonHost("pas une url")).toBe("");
  });
});

describe("isAddonInstalled", () => {
  const torrentio = FOCALE_ADDONS.find((addon) => addon.id === "torrentio")!;
  const loostream = FOCALE_ADDONS.find((addon) => addon.id === "loostream")!;
  const lumio = FOCALE_ADDONS.find((addon) => addon.id === "lumio")!;

  it("reconnaît un addon installé même avec une autre clé dans l'URL", () => {
    expect(isAddonInstalled(torrentio, installedPack)).toBe(true);
  });

  it("ne confond pas deux addons qui partagent la même instance ElfHosted", () => {
    expect(isAddonInstalled(loostream, installedPack)).toBe(false);
  });

  it("reconnaît Lumio sur son nom : son hôte dépend du compte de l'utilisateur", () => {
    expect(isAddonInstalled(lumio, installedPack)).toBe(true);
    expect(isAddonInstalled(lumio, [])).toBe(false);
  });
});

describe("splitFocaleAddons", () => {
  it("sépare les addons du pack déjà en place de ceux qui manquent", () => {
    const { installed, missing } = splitFocaleAddons(installedPack);

    expect(installed.map((addon) => addon.id).sort()).toEqual(
      ["cinemeta", "comet", "lumio", "opensubtitles", "subsense", "torrentio"].sort(),
    );
    expect(missing.map((addon) => addon.id).sort()).toEqual(
      ["bingecat", "frenchio", "loostream", "streamfusion", "uwu-fr", "vf-trailer"].sort(),
    );
  });

  it("ne retient aucun addon installé sur un profil vide", () => {
    const { installed, missing } = splitFocaleAddons([]);

    expect(installed).toEqual([]);
    expect(missing.length).toBe(FOCALE_ADDONS.length);
  });

  it("ignore les addons qui ne viennent pas du pack", () => {
    const { installed, missing } = splitFocaleAddons([
      { name: "Extension perso", url: "https://exemple.test/manifest.json" },
    ]);

    expect(installed).toEqual([]);
    expect(missing.length).toBe(FOCALE_ADDONS.length);
  });
});

describe("neededKeys", () => {
  it("ne demande rien pour un addon sans clé", () => {
    expect(neededKeys(["cinemeta"])).toEqual({ debrid: false, tmdb: false });
  });

  it("rassemble les besoins de plusieurs addons cochés en une seule clé de chaque type", () => {
    expect(neededKeys(["torrentio", "loostream", "vf-trailer", "frenchio"])).toEqual({
      debrid: true,
      tmdb: true,
    });
  });

  it("distingue un besoin de débrideur d'un besoin de clé TMDB", () => {
    expect(neededKeys(["comet"])).toEqual({ debrid: true, tmdb: false });
    expect(neededKeys(["loostream"])).toEqual({ debrid: false, tmdb: true });
  });

  it("oublie les identifiants inconnus", () => {
    expect(neededKeys(["cinemeta", "addon-inconnu"])).toEqual({ debrid: false, tmdb: false });
  });
});

describe("addonsNeedingManifestUrl", () => {
  it("ne retient que les addons cochés dont le manifest vient de l'utilisateur", () => {
    expect(addonsNeedingManifestUrl(["lumio", "streamfusion", "cinemeta"]).map((addon) => addon.id)).toEqual([
      "lumio",
      "streamfusion",
    ]);
  });

  it("rend une liste vide quand aucun addon coché n'a besoin d'un lien", () => {
    expect(addonsNeedingManifestUrl(["torrentio", "loostream"])).toEqual([]);
  });

  it("donne la page du compte où copier le lien de manifest", () => {
    const [lumio, streamfusion] = addonsNeedingManifestUrl(["lumio", "streamfusion"]);

    expect(lumio.manifestLink?.url).toContain("mylumio.tv");
    expect(lumio.manifestLink?.label).toBe("Configurer mon profil Lumio");
    expect(streamfusion.manifestLink?.url).toContain("streamfusion");
    expect(streamfusion.manifestLink?.label).toBe("Ouvrir la configuration StreamFusion");
  });
});

describe("clés déjà enregistrées dans le profil", () => {
  const credentials = {
    tmdb: "cle-tmdb",
    "debrid:torbox": "cle-torbox",
    "debrid:realdebrid": "cle-real-debrid",
  };

  it("retrouve la clé TMDB du profil", () => {
    expect(storedTmdbKey(credentials)).toBe("cle-tmdb");
    expect(storedTmdbKey({})).toBe("");
  });

  it("retrouve la clé de débrideur stockée par Nuvio, avec son nom lisible", () => {
    expect(storedDebridKey(credentials)).toEqual({
      provider: "torbox",
      label: "TorBox",
      key: "cle-torbox",
    });
    expect(storedDebridKey({})).toBeNull();
  });

  it("ignore une clé vide", () => {
    expect(storedTmdbKey({ tmdb: "   " })).toBe("");
    expect(storedDebridKey({ "debrid:premiumize": "" })).toBeNull();
  });

  it("ne connaît pas AllDebrid, que Nuvio ne stocke pas", () => {
    expect(storedDebridKey({ "debrid:alldebrid": "cle-alldebrid" })).toBeNull();
  });
});
