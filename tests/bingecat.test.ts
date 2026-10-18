import { describe, expect, it } from "vitest";

import {
  attachBingecatRows,
  bingecatRows,
  normaliseBingecatManifestUrl,
  type BingecatManifest,
} from "@/lib/bingecat";

const MANIFEST: BingecatManifest = {
  id: "com.aicat.2ec3e4b9-31e3-48f0-935e-8896b1d8b012",
  catalogs: [
    { id: "aicat_search_movie", type: "movie", name: "AI-Assisted Search", isSearch: true },
    { id: "aicat_list_18950", type: "movie", name: "Ajánlott" },
    { id: "aicat_list_18951", type: "series", name: "Ajánlott" },
    { id: "aicat_list_18952", type: "movie", name: "Amiért Megnézted" },
    { id: "aicat_list_18953", type: "series", name: "Amiért Megnézted" },
    { id: "aicat_streamservice_963759", type: "movie", name: "A héten felkapott filmek" },
  ],
};

describe("normaliseBingecatManifestUrl", () => {
  it("ajoute le schéma et le manifest quand ils manquent", () => {
    expect(normaliseBingecatManifestUrl("bingecat.com/stremio/abc")).toBe(
      "https://bingecat.com/stremio/abc/manifest.json",
    );
  });

  it("laisse une URL complète intacte", () => {
    expect(normaliseBingecatManifestUrl("https://bingecat.com/stremio/abc/manifest.json")).toBe(
      "https://bingecat.com/stremio/abc/manifest.json",
    );
  });

  it("retourne une chaîne vide quand le champ est vide", () => {
    expect(normaliseBingecatManifestUrl("   ")).toBe("");
  });
});

describe("bingecatRows", () => {
  it("ignore la recherche et transforme les catalogues en rangées", () => {
    const rows = bingecatRows(MANIFEST);
    expect(rows.map((row) => row.catalogId)).toEqual([
      "aicat_list_18950",
      "aicat_list_18951",
      "aicat_list_18952",
      "aicat_list_18953",
      "aicat_streamservice_963759",
    ]);
  });

  it("reprend l'identifiant de l'addon pour que Nuvio retrouve le catalogue", () => {
    const [row] = bingecatRows(MANIFEST);
    expect(row.addonId).toBe(MANIFEST.id);
    expect(row.provider).toBe("addon");
    expect(row.mediaType).toBe("MOVIE");
  });

  it("borne le nombre de paires de rangées", () => {
    expect(bingecatRows(MANIFEST, 1)).toHaveLength(2);
  });

  it("produit des identifiants stables et uniques", () => {
    const first = bingecatRows(MANIFEST);
    const second = bingecatRows(MANIFEST);
    expect(first.map((row) => row.id)).toEqual(second.map((row) => row.id));
    expect(new Set(first.map((row) => row.id)).size).toBe(first.length);
  });

  it("ne renvoie rien sans catalogue", () => {
    expect(bingecatRows({ id: "com.aicat.x" })).toEqual([]);
  });
});

describe("attachBingecatRows", () => {
  const collections = [
    {
      id: "collection-UGED6TEZ",
      folders: [
        { id: "folder-25429024", title: "Pour vous", sources: [{ id: "src-TRAKT1", title: "Films recommandés" }] },
        { id: "folder-9D1C5A0D", title: "Nouveaux films", sources: [] },
      ],
    },
  ];

  it("ajoute les rangées au dossier Pour vous", () => {
    const out = attachBingecatRows(collections, bingecatRows(MANIFEST, 1));
    const folder = out[0].folders[0];
    expect(folder.sources).toHaveLength(3);
    expect(folder.sources[0].id).toBe("src-TRAKT1");
    expect(out[0].folders[1].sources).toHaveLength(0);
  });

  it("remplace les rangées Bingecat déjà posées au lieu de les empiler", () => {
    const once = attachBingecatRows(collections, bingecatRows(MANIFEST, 1));
    const twice = attachBingecatRows(once, bingecatRows(MANIFEST, 1));
    expect(twice[0].folders[0].sources).toHaveLength(3);
  });

  it("crée le dossier Pour vous quand le pack ne le contient plus", () => {
    const without = [
      {
        id: "collection-UGED6TEZ",
        folders: [{ id: "folder-9D1C5A0D", title: "Nouveaux films", sources: [] }],
      },
    ];

    const out = attachBingecatRows(without, bingecatRows(MANIFEST, 1));

    expect(out[0].folders[0].id).toBe("folder-25429024");
    expect(out[0].folders).toHaveLength(2);
  });

  it("ne modifie pas l'entrée reçue", () => {
    attachBingecatRows(collections, bingecatRows(MANIFEST, 1));
    expect(collections[0].folders[0].sources).toHaveLength(1);
  });
});
