/**
 * Normalisation de la clé TMDB saisie à l'étape 2.
 *
 * La page TMDB met en avant le « jeton d'accès en lecture » (v4) : une chaîne
 * JWT dont le champ `aud` porte la clé courte v3 (32 caractères hexadécimaux).
 * Les addons (Loostream, Frenchio, UwU-FR, VF Trailer) et l'API Nuvio
 * attendent la clé v3 : un jeton v4 collé tel quel les laissait sans
 * catalogues, sans message d'erreur.
 *
 * On accepte donc les deux formes et on ne garde que la clé v3. Une valeur qui
 * n'est ni l'une ni l'autre est rendue telle quelle : la validation reste à la
 * charge de l'addon qui l'utilise, comme avant.
 */

const V3_KEY = /^[0-9a-f]{32}$/i;

/** Champ `aud` du jeton v4, ou `null` si la chaîne n'est pas un JWT lisible. */
function tokenAudience(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");

  try {
    const json = JSON.parse(atob(padded)) as { aud?: unknown };
    return typeof json.aud === "string" ? json.aud.trim() : null;
  } catch {
    return null;
  }
}

/** Clé API v3 de TMDB, que la saisie soit la clé courte ou le jeton v4. */
export function normalizeTmdbKey(raw: string | undefined): string {
  const clean = raw?.trim() ?? "";
  if (!clean) return "";
  if (V3_KEY.test(clean)) return clean.toLowerCase();

  const aud = tokenAudience(clean);
  return aud && V3_KEY.test(aud) ? aud.toLowerCase() : clean;
}

/** Vrai quand la saisie est une clé v3, ou un jeton v4 qui en contient une. */
export function isTmdbKey(raw: string | undefined): boolean {
  return V3_KEY.test(normalizeTmdbKey(raw));
}
