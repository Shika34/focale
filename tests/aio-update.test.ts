import { describe, expect, it } from "vitest";

import {
  aioConfigUuid,
  aioLoadErrorMessage,
  mergeFrenchCatalogs,
  missingFrenchCatalogs,
} from "@/lib/aio-update";

interface Catalog {
  id: string;
  type: string;
  name: string;
  source?: string;
  enabled?: boolean;
}

function template(): Catalog[] {
  return [
    { id: "tmdb.top", type: "movie", name: "TMDB Popular", source: "tmdb" },
    { id: "flixpatrol.netflix.fr.movie", type: "movie", name: "Netflix FR", source: "flixpatrol" },
    { id: "flixpatrol.netflix.fr.series", type: "series", name: "Netflix FR", source: "flixpatrol" },
  ];
}

describe("aioConfigUuid", () => {
  it("lit l'identifiant dans l'URL de manifest de l'addon", () => {
    const uuid = "6747bc67-1f6e-4ae4-8b5f-30de89626346";
    expect(
      aioConfigUuid([
        { name: "Cinemeta", url: "https://v3-cinemeta.strem.io/manifest.json" },
        {
          name: "AIO Metadata",
          url: `https://aiometadata.elfhosted.com/stremio/${uuid}/manifest.json`,
        },
      ]),
    ).toBe(uuid);
  });

  it("retourne null quand l'addon n'est pas installé", () => {
    expect(aioConfigUuid([{ name: "Cinemeta", url: "https://v3-cinemeta.strem.io/manifest.json" }])).toBeNull();
  });

  it("ignore une URL qui ressemble à AIO Metadata sans identifiant", () => {
    expect(
      aioConfigUuid([{ name: "AIO Metadata", url: "https://aiometadata.elfhosted.com/configure" }]),
    ).toBeNull();
  });
});

describe("missingFrenchCatalogs", () => {
  it("ne retient que les catalogues FlixPatrol absents de la configuration", () => {
    const existing = [{ id: "tmdb.top", type: "movie" }, { id: "flixpatrol.netflix.fr.movie", type: "movie" }];
    const missing = missingFrenchCatalogs(existing, template());
    expect(missing.map((catalog) => catalog.id)).toEqual(["flixpatrol.netflix.fr.series"]);
  });

  it("considère l'identifiant et le type ensemble", () => {
    const existing = [
      { id: "flixpatrol.netflix.fr.movie", type: "movie" },
      { id: "flixpatrol.netflix.fr.series", type: "series" },
    ];
    expect(missingFrenchCatalogs(existing, template())).toEqual([]);
  });

  it("ignore les catalogues du modèle qui ne viennent pas de FlixPatrol", () => {
    expect(missingFrenchCatalogs([], template()).map((c) => c.id)).not.toContain("tmdb.top");
  });
});

describe("mergeFrenchCatalogs", () => {
  it("ajoute les catalogues manquants sans toucher au reste de la configuration", () => {
    const config = {
      language: "fr",
      catalogSetup: "complete",
      catalogs: [{ id: "tmdb.top", type: "movie" }],
    };

    const { config: merged, added } = mergeFrenchCatalogs(config, template());

    expect(added).toHaveLength(2);
    expect(merged.language).toBe("fr");
    expect(merged.catalogSetup).toBe("complete");
    expect((merged.catalogs ?? []).map((c) => c.id)).toEqual([
      "tmdb.top",
      "flixpatrol.netflix.fr.movie",
      "flixpatrol.netflix.fr.series",
    ]);
    expect(config.catalogs).toHaveLength(1);
  });

  it("ne modifie rien quand tout est déjà présent", () => {
    const config = {
      catalogs: [
        { id: "flixpatrol.netflix.fr.movie", type: "movie" },
        { id: "flixpatrol.netflix.fr.series", type: "series" },
      ],
    };

    const { added } = mergeFrenchCatalogs(config, template());

    expect(added).toEqual([]);
  });
});

describe("aioLoadErrorMessage", () => {
  it("traduit un mot de passe refusé", () => {
    expect(aioLoadErrorMessage(401)).toContain("Mot de passe");
  });

  it("signale une configuration introuvable", () => {
    expect(aioLoadErrorMessage(404)).toContain("introuvable");
  });

  it("reste compréhensible pour le reste", () => {
    expect(aioLoadErrorMessage(500)).toContain("AIO Metadata");
  });
});
