/**
 * Contrôle avant écriture : chaque manifest du pack est appelé une fois, avec
 * un délai court.
 *
 * Un addon dont le manifest répond mal (erreur HTTP, page de maintenance,
 * JSON illisible) est écarté au lieu d'être installé : dans le profil il ne
 * produirait ni source ni rangée, et l'accueil Nuvio garderait une entrée morte
 * impossible à distinguer d'une panne passagère.
 *
 * Un échec réseau ou un dépassement de délai n'est pas une preuve : il peut
 * venir du CORS du navigateur alors que l'application Nuvio, elle, atteint le
 * manifest. Ces addons-là sont donc installés quand même, comme avant. Le
 * contrôle ne lève jamais : il rend la liste des addons à installer et celle
 * des écartés, avec la raison à afficher.
 */

export interface ManifestCandidate {
  name: string;
  url: string;
}

export interface ManifestFailure {
  name: string;
  /** Phrase prête à afficher, sans le nom de l'addon. */
  reason: string;
}

export interface PreflightResult<T extends ManifestCandidate> {
  ready: T[];
  failed: ManifestFailure[];
}

export interface PreflightOptions {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Vérifie un manifest.
 * `null` : utilisable, ou indécidable (échec réseau, délai dépassé) : dans les
 * deux cas l'addon est installé comme avant. Sinon, la raison à afficher pour
 * l'écarter.
 */
async function checkManifest(
  addon: ManifestCandidate,
  timeoutMs: number,
  fetchImpl: typeof fetch,
): Promise<string | null> {
  try {
    const response = await fetchImpl(addon.url, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!response.ok) return `réponse HTTP ${response.status}`;

    try {
      const manifest = (await response.json()) as { id?: unknown };
      if (typeof manifest?.id !== "string" || !manifest.id.trim()) {
        return "réponse qui n'est pas un manifest";
      }
    } catch {
      return "réponse illisible";
    }
    return null;
  } catch {
    // Échec réseau ou délai dépassé : le navigateur a peut-être été bloqué par
    // le CORS de l'addon alors que l'application Nuvio, elle, l'atteint. On ne
    // conclut pas, et l'addon est installé.
    return null;
  }
}

/**
 * Appelle les manifests en parallèle et sépare ceux qui répondent de ceux qui
 * ne répondent pas. L'ordre de la liste d'entrée est conservé.
 */
export async function preflightManifests<T extends ManifestCandidate>(
  addons: readonly T[],
  { timeoutMs = 6_000, fetchImpl = fetch }: PreflightOptions = {},
): Promise<PreflightResult<T>> {
  const checks = await Promise.all(
    addons.map(async (addon) => ({
      addon,
      reason: addon.url?.trim() ? await checkManifest(addon, timeoutMs, fetchImpl) : "lien vide",
    })),
  );

  const ready: T[] = [];
  const failed: ManifestFailure[] = [];
  for (const { addon, reason } of checks) {
    if (reason === null) ready.push(addon);
    else failed.push({ name: addon.name, reason });
  }

  return { ready, failed };
}
