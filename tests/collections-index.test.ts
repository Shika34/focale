import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * L'index lu par la page « collections » est une projection de la source
 * réellement poussée dans le profil Nuvio. Refaire la projection ici empêche
 * qu'une modification faite des deux côtés à la main dérive en silence :
 * `pnpm run build:index` régénère le fichier.
 */
interface SourceFolder {
  id: string;
  title: string;
  sources: { title: string }[];
}

interface SourceCollection {
  id: string;
  title: string;
  viewMode: string;
  pinToTop: boolean;
  backdropImageUrl: string | null;
  folders: SourceFolder[];
}

const SOURCE = JSON.parse(
  readFileSync(join(__dirname, "..", "public", "nuvio-collections-fr.json"), "utf8"),
) as SourceCollection[];

const SUMMARY = JSON.parse(
  readFileSync(join(__dirname, "..", "lib", "collections-summary.json"), "utf8"),
) as unknown[];

/** Nombre de titres de sources conservés pour l'aperçu d'un dossier. */
const PREVIEW_COUNT = 3;

function project(collection: SourceCollection) {
  const folders = collection.folders.map((folder) => ({
    id: folder.id,
    title: folder.title,
    sourcesCount: folder.sources.length,
    sourcesPreview: folder.sources.slice(0, PREVIEW_COUNT).map((source) => source.title),
  }));

  return {
    id: collection.id,
    title: collection.title,
    viewMode: collection.viewMode,
    pinToTop: collection.pinToTop,
    backdropImageUrl: collection.backdropImageUrl ?? null,
    foldersCount: folders.length,
    sourcesCount: folders.reduce((total, folder) => total + folder.sourcesCount, 0),
    folders,
  };
}

describe("index des collections", () => {
  it("couvre les mêmes collections, dans le même ordre", () => {
    expect(SUMMARY).toHaveLength(SOURCE.length);
    expect((SUMMARY as { id: string }[]).map((entry) => entry.id)).toEqual(
      SOURCE.map((collection) => collection.id),
    );
  });

  it("totalise les mêmes dossiers", () => {
    const folders = SOURCE.reduce((total, collection) => total + collection.folders.length, 0);
    const counted = (SUMMARY as { foldersCount: number }[]).reduce(
      (total, entry) => total + entry.foldersCount,
      0,
    );
    expect(counted).toBe(folders);
  });

  it("totalise les mêmes sources", () => {
    const fromSource = SOURCE.reduce(
      (total, collection) =>
        total + collection.folders.reduce((sum, folder) => sum + folder.sources.length, 0),
      0,
    );
    const fromSummary = (SUMMARY as { sourcesCount: number }[]).reduce(
      (total, entry) => total + entry.sourcesCount,
      0,
    );
    expect(fromSummary).toBe(fromSource);
  });

  it.each(SOURCE.map((collection, index) => [collection.title, index] as const))(
    "« %s » reprend ses dossiers et ses compteurs",
    (_title, index) => {
      expect(SUMMARY[index]).toEqual(project(SOURCE[index]));
    },
  );
});
