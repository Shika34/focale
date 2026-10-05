import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Non-régression de la migration Tailwind v4.
 *
 * 1. Tailwind v4 calcule la `line-height` des tailles nommées (`text-2xl`) en
 *    **ratio** (1,333) et non plus en valeur absolue (2 rem). Une taille
 *    arbitraire posée sur le même élément (`sm:text-[32px]`) hérite donc du
 *    ratio : 32 px × 1,333 = 42,7 px au lieu de 32 px, ce qui a décalé de 25 px
 *    la hauteur de la page d'accueil pendant la migration. Une taille
 *    arbitraire doit porter sa `line-height` : `sm:text-[32px]/8` ou un
 *    `leading-*` sur le même élément.
 * 2. Trois utilitaires changent de sens ou disparaissent en v4 : `outline-none`
 *    perd son contour transparent (accessibilité clavier), `rounded` n'existe
 *    plus du tout (aucun style produit), `bg-gradient-to-*` devient
 *    `bg-linear-to-*`.
 */

const SOURCE_DIRS = ["app", "components", "lib"];
const NAMED_TEXT_SIZE = /^(?:[a-z-]+:)?text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/;
const ARBITRARY_TEXT_SIZE = /^(?:[a-z-]+:)?text-\[[^\]]+\]$/;
const EXPLICIT_LINE_HEIGHT = /(?:^|:)(?:leading-|text-\[[^\]]+\]\/)/;
const REMOVED_UTILITIES = /\boutline-none\b|(?<![\w-])rounded(?![\w-])|\bbg-gradient-to-/;

const STRING_LITERAL = /"([^"\\\n]*)"|'([^'\\\n]*)'|`([^`]*)`/g;

export function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx)$/.test(path) ? [path] : [];
  });
}

/** Renvoie les tailles arbitraires qui hériteraient du ratio de line-height v4. */
export function riskyTextSizeCombos(source: string): string[] {
  const found: string[] = [];
  for (const match of source.matchAll(STRING_LITERAL)) {
    const literal = match[1] ?? match[2] ?? match[3] ?? "";
    const tokens = literal.split(/\s+/).filter(Boolean);
    if (!tokens.some((token) => NAMED_TEXT_SIZE.test(token))) continue;
    if (tokens.some((token) => EXPLICIT_LINE_HEIGHT.test(token))) continue;
    found.push(...tokens.filter((token) => ARBITRARY_TEXT_SIZE.test(token)));
  }
  return found;
}

const files = SOURCE_DIRS.map((dir) => join(__dirname, "..", dir)).flatMap(sourceFiles);

describe("migration Tailwind v4 : tailles de texte arbitraires", () => {
  it("signale une taille arbitraire posée sur une taille nommée sans line-height", () => {
    expect(riskyTextSizeCombos(`<h2 className="display text-2xl sm:text-[32px]">`)).toEqual([
      "sm:text-[32px]",
    ]);
  });

  it("ne signale rien quand la line-height est explicite", () => {
    expect(riskyTextSizeCombos(`<h2 className="text-2xl sm:text-[32px]/8">`)).toEqual([]);
    expect(riskyTextSizeCombos(`<h1 className="text-4xl leading-[1.08] sm:text-[52px]">`)).toEqual([]);
  });

  it("ne signale pas une taille arbitraire seule dans sa classe", () => {
    expect(riskyTextSizeCombos(`<span className="ml-1.5 font-mono text-[11px]">`)).toEqual([]);
  });

  it("aucun fichier du site n'hérite du ratio de line-height v4", () => {
    const offenders = files.flatMap((file) =>
      riskyTextSizeCombos(readFileSync(file, "utf8")).map((token) => `${file} → ${token}`),
    );
    expect(offenders).toEqual([]);
  });
});

describe("migration Tailwind v4 : utilitaires retirés ou redéfinis", () => {
  it("détecte les utilitaires v3 qui ne se comportent pas pareil en v4", () => {
    expect(REMOVED_UTILITIES.test(`className="rounded"`)).toBe(true);
    expect(REMOVED_UTILITIES.test(`className="focus:outline-none"`)).toBe(true);
    expect(REMOVED_UTILITIES.test(`className="bg-gradient-to-r"`)).toBe(true);
    expect(REMOVED_UTILITIES.test(`className="rounded-full"`)).toBe(false);
    expect(REMOVED_UTILITIES.test(`className="focus-visible:outline-hidden"`)).toBe(false);
  });

  it("aucun fichier du site ne les utilise", () => {
    const offenders = files.filter((file) => REMOVED_UTILITIES.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
