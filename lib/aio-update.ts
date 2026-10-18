/**
 * Mise à jour d'une configuration AIO Metadata déjà créée par l'assistant.
 *
 * Les rangées « Top 10 France » des services de streaming sont servies par des
 * catalogues FlixPatrol déclarés dans la configuration AIO Metadata. Un profil
 * configuré avant leur ajout garde une configuration qui ne les expose pas : la
 * fenêtre « Mettre à jour mes collections et addons » recharge donc cette
 * configuration, y ajoute les catalogues manquants, puis la réenregistre à
 * l'identique (mêmes clés, même UUID, donc même manifest).
 *
 * Contrat vérifié de l'API (instance publique, CORS ouvert) :
 *   POST /api/config/load/<uuid>   { password }        → { config, installUrl }
 *   PUT  /api/config/update/<uuid> { config, password } → { success, configVersion }
 * Aucun catalogue n'est supprimé, aucune clé n'est demandée : celles du profil
 * sont relues puis renvoyées telles quelles.
 */

/** Instance publique utilisée par l'assistant pour créer les configurations. */
export const AIO_BASE_URL = "https://aiometadata.elfhosted.com";

/** Hôte du manifest, pour retrouver l'addon dans le profil. */
const AIO_ADDON_HOST = "aiometadata.elfhosted.com";

/** Source des catalogues nationaux, seule concernée par cette mise à jour. */
const FRENCH_SOURCE = "flixpatrol";

export interface AioCatalog {
  id: string;
  type: string;
  name?: string;
  source?: string;
  enabled?: boolean;
  showInHome?: boolean;
}

export interface AioConfig {
  catalogs?: AioCatalog[];
  [key: string]: unknown;
}

/**
 * Identifiant de la configuration AIO Metadata lue dans les addons du profil.
 * L'URL installée est `https://aiometadata.elfhosted.com/stremio/<uuid>/manifest.json`.
 */
export function aioConfigUuid(
  addons: readonly { name?: string; url: string }[],
): string | null {
  for (const addon of addons) {
    let url: URL;
    try {
      url = new URL(addon.url);
    } catch {
      continue;
    }
    if (url.hostname.toLowerCase() !== AIO_ADDON_HOST) continue;
    const match = url.pathname.match(/\/stremio\/([A-Za-z0-9-]{8,})\//);
    if (match) return match[1];
  }
  return null;
}

/** Catalogues FlixPatrol du modèle absents de la configuration, dans l'ordre du modèle. */
export function missingFrenchCatalogs(
  existing: readonly Pick<AioCatalog, "id" | "type">[],
  template: readonly AioCatalog[],
): AioCatalog[] {
  const known = new Set(existing.map((catalog) => `${catalog.id}|${catalog.type}`));
  return template.filter(
    (catalog) =>
      catalog.source === FRENCH_SOURCE && !known.has(`${catalog.id}|${catalog.type}`),
  );
}

/**
 * Copie de la configuration avec les catalogues manquants ajoutés en fin de
 * liste. La configuration reçue n'est pas modifiée : elle est relue depuis
 * l'API et renvoyée telle quelle, à l'ajout près.
 */
export function mergeFrenchCatalogs<T extends AioConfig>(
  config: T,
  template: readonly AioCatalog[],
): { config: T; added: AioCatalog[] } {
  const catalogs = Array.isArray(config.catalogs) ? config.catalogs : [];
  const added = missingFrenchCatalogs(catalogs, template);
  if (added.length === 0) return { config, added };

  return { config: { ...config, catalogs: [...catalogs, ...added] }, added };
}

/** Message affiché quand la configuration n'a pas pu être relue. */
export function aioLoadErrorMessage(status: number): string {
  if (status === 401 || status === 403) {
    return "Mot de passe refusé par AIO Metadata. Saisissez celui choisi à la création de votre configuration ; si vous protégez aussi l'addon par un second mot de passe, cette fenêtre ne le gère pas, recréez la configuration depuis « Configurer mon Nuvio ».";
  }
  if (status === 404) {
    return "Configuration AIO Metadata introuvable : elle a peut-être été supprimée. Recréez-la depuis « Configurer mon Nuvio ».";
  }
  return "AIO Metadata n'a pas répondu correctement. Réessayez dans un instant.";
}
