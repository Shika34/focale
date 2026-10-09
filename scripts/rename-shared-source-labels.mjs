#!/usr/bin/env node
/**
 * Renomme les libellés de sources partagés par des rangées aux filtres différents.
 *
 * Constat dans public/nuvio-collections-fr.json : dans 25 dossiers, toutes les rangées de
 * genre portent un seul libellé, par exemple « Films de western » sur 21 rangées de « Netflix »
 * dont les filtres couvrent Action, Animation, Comédie, Drame, Horreur, Science-fiction, etc.
 *
 * Critère retenu, volontairement restrictif pour épargner les intitulés éditoriaux : un libellé
 * est renommé quand au moins 4 rangées du même dossier le portent et que ces rangées appliquent
 * au moins 3 filtres de genre différents.
 *
 * Libellé de remplacement : le préfixe de type de média suivi du libellé TMDB de chaque genre
 * présent dans les filtres de la rangée, par exemple « Films : Action » ou
 * « Séries : Science-fiction et fantastique ». Le préfixe est nécessaire : ces dossiers
 * contiennent une rangée films et une rangée séries par genre.
 *
 * Usage :
 *   node scripts/rename-shared-source-labels.mjs --check   # liste, aucune écriture
 *   node scripts/rename-shared-source-labels.mjs --write   # écrit le fichier
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "public", "nuvio-collections-fr.json");

const GENRES_MOVIE = {
  28: "Action", 12: "Aventure", 16: "Animation", 35: "Comédie", 80: "Crime", 99: "Documentaire",
  18: "Drame", 10751: "Famille", 14: "Fantastique", 36: "Histoire", 27: "Horreur", 10402: "Musique",
  9648: "Mystère", 10749: "Romance", 878: "Science-fiction", 53: "Thriller", 10752: "Guerre", 37: "Western",
};

const GENRES_TV = {
  10759: "Action et aventure", 16: "Animation", 35: "Comédie", 80: "Crime", 99: "Documentaire",
  18: "Drame", 10751: "Famille", 10762: "Kids", 9648: "Mystère", 10763: "Actualités",
  10764: "Télé-réalité", 10765: "Science-fiction et fantastique", 10766: "Feuilleton",
  10767: "Talk-show", 10768: "Guerre et politique", 37: "Western",
};

function genreIds(value) {
  return String(value || "")
    .split(/[|,]/)
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function labelFor(mediaType, filters) {
  const table = String(mediaType || "").toUpperCase() === "TV" ? GENRES_TV : GENRES_MOVIE;
  const ids = genreIds(filters?.withGenres);
  if (!ids.length) return null;
  const names = ids.map((id) => table[id]).filter(Boolean);
  if (!names.length) return null;
  const prefix = table === GENRES_TV ? "Séries" : "Films";
  return `${prefix} : ${names.join(" + ")}`;
}

const LANGUAGES = {
  ja: "japonais", ko: "coréen", zh: "chinois", "zh-cn": "chinois", en: "anglais", fr: "français",
  es: "espagnol", hi: "hindi", th: "thaï", tr: "turc", de: "allemand", it: "italien", pt: "portugais",
  ru: "russe", ar: "arabe", sv: "suédois", da: "danois", no: "norvégien", nl: "néerlandais",
  pl: "polonais", id: "indonésien", tl: "philippin", ta: "tamoul", vi: "vietnamien", he: "hébreu",
  uk: "ukrainien", fa: "persan", cs: "tchèque", el: "grec", hu: "hongrois", ro: "roumain",
};

const KEYWORDS = {
  18330: "nature", 9902: "vie sauvage", 221355: "documentaire nature", 15060: "drame d'époque",
  192772: "drame historique", 9840: "romance", 9716: "stand-up", 9799: "comédie romantique",
  9872: "deuil", 5565: "biographie", 7312: "road trip", 156924: "mélodrame", 10614: "tragédie",
  267848: "animaux parlants", 18165: "animaux",
};

/**
 * Qualificatif ajouté seulement quand deux rangées d'un même dossier aboutissent au même
 * libellé de base. Il vient d'un filtre qui distingue réellement les deux rangées, dans
 * l'ordre : mot-clé ciblé, langue d'origine, puis intention de tri.
 */
function qualifierFor(source) {
  const filters = source.filters ?? {};
  const sortBy = String(source.sortBy || "").toLowerCase();
  const parts = [];

  const keywordIds = genreIds(filters.withKeywords);
  const keywordNames = keywordIds.map((id) => KEYWORDS[id]).filter(Boolean);
  if (keywordNames.length) parts.push(keywordNames.join(" + "));

  const language = String(filters.withOriginalLanguage || "").toLowerCase();
  if (language && LANGUAGES[language]) parts.push(LANGUAGES[language]);

  const year = Number(filters.year);
  if (Number.isFinite(year) && year > 0) parts.push(String(Math.trunc(year)));

  const rating = Number(filters.voteAverageGte);
  if (sortBy.includes("vote_average") || (Number.isFinite(rating) && rating >= 6.5)) parts.push("mieux notés");
  else if (sortBy.includes("date")) parts.push("nouveautés");
  else if (sortBy.includes("popularity")) parts.push("populaires");

  return parts.join(", ");
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

/**
 * Correspondance libellé cité -> identifiant TMDB du genre, par type de média.
 */
const NAME_GENRES = {
  western: { MOVIE: 37, TV: 37 },
  action: { MOVIE: 28, TV: 10759 },
  aventure: { MOVIE: 12, TV: 10759 },
  animation: { MOVIE: 16, TV: 16 },
  anime: { MOVIE: 16, TV: 16 },
  comedie: { MOVIE: 35, TV: 35 },
  drame: { MOVIE: 18, TV: 18 },
  documentaire: { MOVIE: 99, TV: 99 },
  horreur: { MOVIE: 27 },
  thriller: { MOVIE: 53 },
  romance: { MOVIE: 10749 },
  romantique: { MOVIE: 10749 },
  sciencefiction: { MOVIE: 878, TV: 10765 },
  fantastique: { MOVIE: 14, TV: 10765 },
  guerre: { MOVIE: 10752, TV: 10768 },
  mystere: { MOVIE: 9648, TV: 9648 },
  crime: { MOVIE: 80, TV: 80 },
};

/** Identifiants des genres cités dans le libellé de la rangée, selon son type de média. */
function citedGenreIds(source) {
  const isTv = String(source.mediaType || "").toUpperCase() === "TV";
  const name = String(source.name || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const ids = [];
  for (const [word, byMedia] of Object.entries(NAME_GENRES)) {
    if (!name.includes(word)) continue;
    const id = byMedia[isTv ? "TV" : "MOVIE"];
    if (id) ids.push(id);
  }
  return ids;
}

/** Libellé de secours quand la rangée ne porte aucun genre : on nomme ce qu'elle filtre. */
function fallbackLabelFor(source) {
  const prefix = String(source.mediaType || "").toUpperCase() === "TV" ? "Séries" : "Films";
  const filters = source.filters ?? {};
  const sortBy = String(source.sortBy || "").toLowerCase();
  if (filters.releaseDateGte) return `${prefix} : nouveautés`;
  if (sortBy.includes("vote_average")) return `${prefix} : mieux notés`;
  if (sortBy.includes("rank")) return `${prefix} : populaires`;
  return `${prefix} : populaires`;
}

function sourceSignature(source) {
  return stableStringify({
    provider: source.provider ?? null,
    mediaType: source.mediaType ?? null,
    tmdbSourceType: source.tmdbSourceType ?? null,
    tmdbId: source.tmdbId ?? null,
    traktListId: source.traktListId ?? null,
    catalogId: source.catalogId ?? null,
    sortBy: source.sortBy ?? null,
    filters: source.filters ?? null,
  });
}

const collections = JSON.parse(readFileSync(TARGET, "utf8"));
if (!Array.isArray(collections)) throw new Error("le fichier racine doit être une liste de collections");

let folders = 0;
let renamed = 0;
let duplicatesDropped = 0;
const samples = [];
const collisions = [];

for (const collection of collections) {
  for (const folder of collection?.folders ?? []) {
    const sources = folder?.sources;
    if (!Array.isArray(sources)) continue;

    // Cible : toute rangée dont le libellé cite un genre qu'elle ne filtre pas, y compris
    // quand elle ne filtre aucun genre. Le nouveau libellé vient de ses propres filtres.
    const candidates = [];
    for (const source of sources) {
      const cited = citedGenreIds(source);
      if (!cited.length) continue;
      const own = genreIds(source.filters?.withGenres);
      if (cited.some((id) => own.includes(id))) continue;
      const base = labelFor(source.mediaType, source.filters) ?? fallbackLabelFor(source);
      if (base) candidates.push({ source, base });
    }
    const baseCount = new Map();
    for (const candidate of candidates) baseCount.set(candidate.base, (baseCount.get(candidate.base) ?? 0) + 1);

    let touched = false;
    for (const candidate of candidates) {
      const qualifier = baseCount.get(candidate.base) > 1 ? qualifierFor(candidate.source) : "";
      const label = qualifier ? `${candidate.base} (${qualifier})` : candidate.base;
      if (label === candidate.source.name) continue;
      if (samples.length < 12) {
        samples.push(`${collection.title} / ${folder.title} : « ${candidate.source.name} » -> « ${label} »`);
      }
      candidate.source.name = label;
      renamed += 1;
      touched = true;
    }
    if (touched) folders += 1;

    // Rangées strictement identiques (mêmes filtres, même média, même cible) : la seconde
    // n'apporte rien et s'affiche comme un doublon dans le dossier.
    const kept = [];
    const signatures = new Set();
    let dropped = 0;
    for (const source of sources) {
      const signature = sourceSignature(source);
      if (signatures.has(signature)) {
        dropped += 1;
        continue;
      }
      signatures.add(signature);
      kept.push(source);
    }
    if (dropped > 0) {
      folder.sources = kept;
      duplicatesDropped += dropped;
    }

    // Résolution finale : dans un dossier, aucun libellé ne doit se répéter. On ne touche que
    // les libellés qui se heurtent réellement : les autres restent tels quels.
    const mediaOf = (source) => (String(source.mediaType || "").toUpperCase() === "TV" ? "TV" : "MOVIE");
    const groups = new Map();
    for (const source of kept) {
      const base = String(source.name || source.title || source.catalogId || "Sans titre").trim();
      const bucket = groups.get(base) ?? [];
      bucket.push(source);
      groups.set(base, bucket);
    }

    const taken = new Set();
    for (const [base, rows] of groups) {
      if (rows.length === 1) {
        taken.add(base);
        if (base !== rows[0].name) renamed += 1;
        rows[0].name = base;
      }
    }

    for (const [base, rows] of groups) {
      if (rows.length === 1) continue;
      const medias = new Set(rows.map(mediaOf));
      const needsMedia = medias.size > 1;
      for (const source of rows) {
        const qualifier = qualifierFor(source);
        const prefix = needsMedia ? `${mediaOf(source) === "TV" ? "Séries" : "Films"} : ` : "";
        const stem = `${prefix}${base}`;
        let label = qualifier ? `${stem} (${qualifier})` : stem;
        let index = 2;
        while (taken.has(label)) {
          label = qualifier ? `${stem} (${qualifier} ${index})` : `${stem} ${index}`;
          index += 1;
        }
        taken.add(label);
        if (label !== source.name) renamed += 1;
        source.name = label;
      }
    }

    const seenLabels = new Map();
    for (const source of kept) {
      seenLabels.set(source.name, (seenLabels.get(source.name) ?? 0) + 1);
    }
    for (const [label, count] of seenLabels) {
      if (count > 1) {
        collisions.push(`${collection.title} / ${folder.title} : « ${label} » reste en double`);
      }
    }
  }
}

console.log("rangées renommées :", renamed, "dans", folders, "dossiers");
console.log("rangées dupliquées supprimées :", duplicatesDropped);
console.log("collisions de libellé introduites :", collisions.length);
for (const c of collisions.slice(0, 10)) console.log("   ", c);
console.log("exemples :");
for (const s of samples) console.log("   ", s);

if (process.argv.includes("--write")) {
  writeFileSync(TARGET, `${JSON.stringify(collections, null, 2)}\n`);
  console.log("écrit :", TARGET);
} else {
  console.log("mode vérification : aucun fichier écrit (ajouter --write)");
}
