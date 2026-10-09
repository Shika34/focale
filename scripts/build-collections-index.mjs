#!/usr/bin/env node
/**
 * Reconstruit lib/collections-summary.json, l'index léger que lit la page
 * « collections », à partir de public/nuvio-collections-fr.json, le fichier
 * réellement poussé dans le profil Nuvio.
 *
 * L'index est une donnée dérivée : sans ce script, les deux fichiers se
 * modifient à la main et les compteurs de sources divergent en silence (constaté
 * le 09/10/2026 : quinze dossiers de « Services de streaming » annonçaient 3 à 4
 * sources de trop, soit 57 sources fantômes à l'écran). Le test
 * tests/collections-index.test.ts refuse désormais tout écart.
 *
 * Usage : pnpm run build:index
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "public", "nuvio-collections-fr.json");
const TARGET = join(ROOT, "lib", "collections-summary.json");

/** Nombre de titres de sources conservés pour l'aperçu d'un dossier. */
const PREVIEW_COUNT = 3;

const collections = JSON.parse(readFileSync(SOURCE, "utf8"));

const summary = collections.map((collection) => {
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
});

writeFileSync(TARGET, `${JSON.stringify(summary, null, 2)}\n`);

const folders = summary.reduce((total, collection) => total + collection.foldersCount, 0);
const sources = summary.reduce((total, collection) => total + collection.sourcesCount, 0);
console.log(`${summary.length} collections, ${folders} dossiers, ${sources} sources → lib/collections-summary.json`);
