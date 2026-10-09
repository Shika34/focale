import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Non-régression : les dossiers « En vedette » de la collection poussée dans
 * Nuvio portent des intitulés génériques. La liste TMDB de Kaptain tourne
 * toutes les deux semaines (visuels et contenu remplacés sur place) ; y écrire
 * un nom d'acteur ou de réalisateur fige un intitulé périmé à l'écran.
 */

interface Source {
  name?: string;
  title?: string;
}

const COLLECTIONS = JSON.parse(
  readFileSync(join(__dirname, "..", "public", "nuvio-collections-fr.json"), "utf8"),
) as { id: string; folders: { title: string; sources: Source[] }[] }[];

function spotlightFolders() {
  const collection = COLLECTIONS.find((entry) => entry.id === "collection-SPOTLIGHTS");
  if (!collection) throw new Error("collection-SPOTLIGHTS absente du fichier poussé");
  return collection.folders;
}

describe("collection En vedette", () => {
  it("porte huit dossiers", () => {
    expect(spotlightFolders()).toHaveLength(8);
  });

  it("n'inscrit aucun nom propre dans les intitulés", () => {
    const names = spotlightFolders().flatMap((folder) => [
      folder.title,
      ...folder.sources.map((source) => `${source.name} ${source.title}`),
    ]);

    const properNames = [
      "Pedro",
      "Pascal",
      "Villeneuve",
      "A24",
      "Denzel",
      "Washington",
      "Alien",
      "Nolan",
      "Hathaway",
    ];

    for (const name of names) {
      for (const proper of properNames) {
        expect(name).not.toContain(proper);
      }
    }
  });

  it("pointe toujours les listes TMDB permanentes de Kaptain", () => {
    const listIds = spotlightFolders().map(
      (folder) => (folder.sources[0] as unknown as { tmdbId: number }).tmdbId,
    );

    expect(listIds).toEqual([8687275, 8687276, 8687277, 8687278, 8687279, 8687280, 8687281, 8687282]);
  });
});
