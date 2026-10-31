import { describe, expect, it } from "vitest";

import { isTmdbKey, normalizeTmdbKey } from "@/lib/tmdb-key";

/**
 * La page TMDB met le jeton d'accès en lecture (v4) en avant et la clé courte
 * (v3) plus bas : la majorité des saisies est donc un JWT, que les addons et
 * l'API Nuvio ne savent pas lire. `normalizeTmdbKey` doit en extraire la clé
 * v3 sans jamais bloquer une saisie qu'il ne comprend pas.
 */

const V3 = "a1b2c3d4e5f60718293a4b5c6d7e8f90";

/** Jeton v4 factice : en-tête et signature vides, `aud` = clé v3. */
function v4Token(aud: string): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value), "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ aud, sub: "user", iss: "tmdb" })}.sig`;
}

describe("normalizeTmdbKey", () => {
  it("garde une clé v3 telle quelle", () => {
    expect(normalizeTmdbKey(V3)).toBe(V3);
  });

  it("met la clé v3 en minuscules et retire les espaces autour", () => {
    expect(normalizeTmdbKey(`  ${V3.toUpperCase()}  `)).toBe(V3);
  });

  it("extrait la clé v3 du champ aud d'un jeton v4", () => {
    expect(normalizeTmdbKey(v4Token(V3))).toBe(V3);
  });

  it("rend une chaîne vide quand rien n'est saisi", () => {
    expect(normalizeTmdbKey("")).toBe("");
    expect(normalizeTmdbKey(undefined)).toBe("");
    expect(normalizeTmdbKey("   ")).toBe("");
  });

  it("laisse passer une saisie incomprise, sans la tronquer", () => {
    expect(normalizeTmdbKey("pas-une-cle")).toBe("pas-une-cle");
    expect(normalizeTmdbKey("abc.def")).toBe("abc.def");
  });

  it("ignore un jeton dont le aud n'est pas une clé v3", () => {
    const token = v4Token("autre-chose");
    expect(normalizeTmdbKey(token)).toBe(token);
  });
});

describe("isTmdbKey", () => {
  it("reconnaît les deux formes acceptées", () => {
    expect(isTmdbKey(V3)).toBe(true);
    expect(isTmdbKey(v4Token(V3))).toBe(true);
  });

  it("refuse une saisie sans clé v3", () => {
    expect(isTmdbKey("")).toBe(false);
    expect(isTmdbKey("short")).toBe(false);
    expect(isTmdbKey(v4Token("nope"))).toBe(false);
  });
});
