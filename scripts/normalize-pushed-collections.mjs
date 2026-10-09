#!/usr/bin/env node
/**
 * Normalise public/nuvio-collections-mitch.json, le fichier de collections que le
 * configurateur pousse tel quel dans le profil Nuvio.
 *
 * Deux défauts corrigés, tous les deux constatés dans le fichier livré :
 *
 * 1. Filtres à null. Les apps Nuvio normalisent un `null` en `0` (`Number(null) === 0`)
 *    avant d'envoyer la requête TMDB. Un `voteAverageLte` à null devient donc
 *    `vote_average.lte=0`, et TMDB renvoie alors zéro résultat : les rangées
 *    « Discover » s'affichent vides sur les clients web. Une clé absente donne
 *    `Number(undefined) === NaN`, donc `null` après normalisation, et le paramètre
 *    n'est pas envoyé. On supprime les clés à null au lieu de les garder.
 *
 * 2. Identifiants de source dupliqués. Plusieurs sources d'un même dossier
 *    partagent le même `id` (8 identifiants pour 51 sources dans « Netflix »), ce
 *    qui rend les sources indiscernables côté éditeur. Les doublons reçoivent un
 *    identifiant unique, au même format que les identifiants existants.
 *
 * Usage :
 *   node scripts/normalize-pushed-collections.mjs --check   # rapport, aucune écriture
 *   node scripts/normalize-pushed-collections.mjs --write   # écrit le fichier
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "public", "nuvio-collections-mitch.json");
const ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function freshId(taken) {
  for (;;) {
    let id = "src-";
    for (let i = 0; i < 8; i += 1) {
      id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
    }
    if (!taken.has(id)) return id;
  }
}

function stripNullKeys(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) return { value: filters, dropped: 0 };
  let dropped = 0;
  const kept = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === null) {
      dropped += 1;
      continue;
    }
    kept[key] = value;
  }
  return { value: kept, dropped };
}

const stats = { filtersDropped: 0, filtersTouched: 0, idsRegenerated: 0, idsMissing: 0, foldersScanned: 0 };

function normalizeFolder(folder) {
  const sources = Array.isArray(folder.sources) ? folder.sources : null;
  if (!sources) return;
  stats.foldersScanned += 1;
  const taken = new Set();
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    if ("filters" in source) {
      const { value, dropped } = stripNullKeys(source.filters);
      if (dropped > 0) {
        source.filters = value;
        stats.filtersDropped += dropped;
        stats.filtersTouched += 1;
      }
    }

    const current = typeof source.id === "string" ? source.id.trim() : "";
    if (!current) {
      const id = freshId(taken);
      source.id = id;
      taken.add(id);
      stats.idsMissing += 1;
      continue;
    }
    if (taken.has(current)) {
      const id = freshId(taken);
      source.id = id;
      taken.add(id);
      stats.idsRegenerated += 1;
      continue;
    }
    taken.add(current);
  }
}

const raw = readFileSync(TARGET, "utf8");
const collections = JSON.parse(raw);
if (!Array.isArray(collections)) throw new Error("le fichier racine doit être une liste de collections");

for (const collection of collections) {
  for (const folder of collection?.folders ?? []) normalizeFolder(folder);
}

console.log("dossiers analysés :", stats.foldersScanned);
console.log("clés de filtre à null supprimées :", stats.filtersDropped, "sur", stats.filtersTouched, "sources");
console.log("identifiants dupliqués régénérés :", stats.idsRegenerated);
console.log("identifiants manquants attribués :", stats.idsMissing);

if (process.argv.includes("--write")) {
  writeFileSync(TARGET, `${JSON.stringify(collections, null, 2)}\n`);
  console.log("écrit :", TARGET);
} else {
  console.log("mode vérification : aucun fichier écrit (ajouter --write)");
}
