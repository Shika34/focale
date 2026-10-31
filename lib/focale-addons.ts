/**
 * Catalogue des addons du pack Focale que la fenêtre de mise à jour peut
 * installer après coup. Chaque entrée est reconnue sur l'hôte de son manifest,
 * donc un addon déjà installé reste reconnu même si la clé de débrideur a
 * changé dans son URL.
 *
 * Lumio et StreamFusion font exception : leur manifest vient du compte de
 * l'utilisateur, l'hôte varie d'un utilisateur à l'autre. Ils sont donc
 * reconnus sur le nom déposé par l'assistant, et leur lien est demandé au
 * moment de la case cochée.
 *
 * AIO Metadata reste hors du catalogue : sa configuration est fabriquée par
 * l'assistant, avec les clés de métadonnées et les catalogues français.
 */

import { PROVIDER_GUIDES } from "@/lib/provider-guides";

/** Clés dont un addon ne peut pas se passer pour être généré. */
export interface AddonKeyNeeds {
  debrid: boolean;
  tmdb: boolean;
  /** Le manifest vient de l'utilisateur (compte Lumio, compte StreamFusion). */
  manifestUrl?: boolean;
}

export interface FocaleAddon {
  /** Identifiant interne, aussi utilisé par les tests et les cases à cocher. */
  id: string;
  name: string;
  /**
   * Hôte du manifest : c'est lui qui dit si l'addon est déjà installé. Absent
   * pour les addons dont l'hôte dépend du compte de l'utilisateur.
   */
  host?: string;
  description: string;
  needs: AddonKeyNeeds;
  /** Libellé du champ de lien, pour les addons à manifest fourni. */
  manifestLabel?: string;
  /** Où trouver ce lien, en une phrase. */
  manifestHint?: string;
  /** Page du compte où copier le lien de manifest. */
  manifestLink?: { url: string; label: string };
}

/** Addon déjà installé dans un profil, tel que Nuvio le renvoie. */
export interface InstalledAddon {
  name: string;
  url: string;
}

export const FOCALE_ADDONS: readonly FocaleAddon[] = [
  {
    id: "cinemeta",
    name: "Cinemeta",
    host: "v3-cinemeta.strem.io",
    description: "Affiches, titres et fiches des films et séries.",
    needs: { debrid: false, tmdb: false },
  },
  {
    id: "opensubtitles",
    name: "OpenSubtitles v3",
    host: "opensubtitles-v3.strem.io",
    description: "Ajoute une piste de sous-titres français à n'importe quel fichier.",
    needs: { debrid: false, tmdb: false },
  },
  {
    id: "subsense",
    name: "SubSense",
    host: "subsense.nepiraw.com",
    description:
      "Sous-titres français d'abord, anglais en secours, dix par langue : la liste reste courte au lieu des centaines de pistes d'OpenSubtitles.",
    needs: { debrid: false, tmdb: false },
  },
  {
    id: "torrentio",
    name: "Torrentio",
    host: "torrentio.strem.fun",
    description: "Le scraper principal, réglé sur votre débrideur.",
    needs: { debrid: true, tmdb: false },
  },
  {
    id: "comet",
    name: "Comet",
    host: "comet.elfhosted.com",
    description: "Second scraper, plus rapide sur certains titres.",
    needs: { debrid: true, tmdb: false },
  },
  {
    id: "loostream",
    name: "Loostream",
    host: "loostream.nipva.com",
    description: "Sources francophones directes en VF et VOSTFR, sans débrideur.",
    needs: { debrid: false, tmdb: true },
  },
  {
    id: "vf-trailer",
    name: "VF Trailer",
    host: "vf-trailer-off.vercel.app",
    description: "Bandes-annonces officielles en français, depuis vos fiches.",
    needs: { debrid: false, tmdb: true },
  },
  {
    id: "frenchio",
    name: "Frenchio",
    host: "frenchio.elfhosted.com",
    description: "Trackers francophones, avec votre débrideur.",
    needs: { debrid: true, tmdb: true },
  },
  {
    id: "uwu-fr",
    name: "UwU-FR",
    host: "uwu.creepso.com",
    description: "Animés en VF et VOSTFR.",
    needs: { debrid: true, tmdb: true },
  },
  {
    id: "bingecat",
    name: "Bingecat",
    description:
      "Recommandations personnelles : « Pour vous » se remplit à partir de votre historique Bingecat.",
    needs: { debrid: false, tmdb: false, manifestUrl: true },
    manifestLabel: "Lien de manifest Bingecat",
    manifestHint:
      "Sur bingecat.com, connectez-vous, configurez votre addon puis copiez son lien de manifest (…/stremio/<identifiant>/manifest.json).",
    manifestLink: { url: "https://bingecat.com/", label: "Ouvrir Bingecat" },
  },
  {
    id: "lumio",
    name: "Lumio",
    description: "Vos sources réglées chez Lumio, avec ses préférences francophones.",
    needs: { debrid: false, tmdb: false, manifestUrl: true },
    manifestLabel: "Lien de manifest Lumio",
    manifestHint:
      "Sur Lumio, ouvrez la configuration de votre profil et copiez le lien de manifest.",
    manifestLink: { url: PROVIDER_GUIDES.lumio.keyUrl, label: PROVIDER_GUIDES.lumio.keyLabel },
  },
  {
    id: "streamfusion",
    name: "StreamFusion",
    description: "Votre configuration StreamFusion, telle que vous l'avez réglée.",
    needs: { debrid: false, tmdb: false, manifestUrl: true },
    manifestLabel: "Lien de manifest StreamFusion",
    manifestHint: "Sur StreamFusion, copiez le lien de manifest de votre configuration.",
    manifestLink: {
      url: PROVIDER_GUIDES.streamfusion.keyUrl,
      label: PROVIDER_GUIDES.streamfusion.keyLabel,
    },
  },
];

/**
 * Addons du pack que la mise à jour ne sait pas fabriquer : leur manifest
 * dépend d'une configuration créée par l'assistant. Affichés pour mémoire.
 */
export const ASSISTANT_ONLY_ADDONS: readonly { name: string; reason: string }[] = [
  {
    name: "AIO Metadata",
    reason:
      "sa configuration est créée par l'assistant, avec vos clés de métadonnées et vos catalogues français.",
  },
];

/** Hôte d'une URL de manifest, en minuscules ; chaîne vide si l'URL est illisible. */
export function addonHost(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Vrai quand le profil contient déjà cet addon. La comparaison se fait sur
 * l'hôte du manifest, ou sur le nom quand l'hôte dépend du compte de
 * l'utilisateur (Lumio, StreamFusion).
 */
export function isAddonInstalled(
  addon: FocaleAddon,
  installed: readonly InstalledAddon[],
): boolean {
  if (addon.host) {
    return installed.some((row) => addonHost(row.url) === addon.host);
  }
  const name = addon.name.trim().toLowerCase();
  return installed.some((row) => row.name.trim().toLowerCase() === name);
}

/** Addons du pack déjà en place, puis ceux qui manquent, dans l'ordre du catalogue. */
export function splitFocaleAddons(installed: readonly InstalledAddon[]): {
  installed: FocaleAddon[];
  missing: FocaleAddon[];
} {
  const present: FocaleAddon[] = [];
  const missing: FocaleAddon[] = [];

  for (const addon of FOCALE_ADDONS) {
    if (isAddonInstalled(addon, installed)) present.push(addon);
    else missing.push(addon);
  }

  return { installed: present, missing };
}

/**
 * Clés à demander pour une sélection d'addons : `debrid` et `tmdb` valent vrai
 * une seule fois, même si plusieurs addons cochés réclament la même clé. Le
 * formulaire n'affiche donc jamais deux champs pour la même clé.
 */
export function neededKeys(ids: readonly string[]): { debrid: boolean; tmdb: boolean } {
  const needs = { debrid: false, tmdb: false };

  for (const addon of FOCALE_ADDONS) {
    if (!ids.includes(addon.id)) continue;
    if (addon.needs.debrid) needs.debrid = true;
    if (addon.needs.tmdb) needs.tmdb = true;
  }

  return needs;
}

/** Addons cochés dont le lien de manifest reste à saisir, dans l'ordre du catalogue. */
export function addonsNeedingManifestUrl(ids: readonly string[]): FocaleAddon[] {
  return FOCALE_ADDONS.filter((addon) => addon.needs.manifestUrl && ids.includes(addon.id));
}

/** Clé TMDB enregistrée dans le profil Nuvio, ou chaîne vide. */
export function storedTmdbKey(credentials: Readonly<Record<string, string>>): string {
  return credentials.tmdb?.trim() ?? "";
}

/** Nom lisible des débrideurs dont Nuvio accepte une clé de profil. */
const STORED_DEBRID_LABELS: Record<string, string> = {
  torbox: "TorBox",
  premiumize: "Premiumize",
  realdebrid: "Real-Debrid",
};

/**
 * Clé de débrideur déjà enregistrée dans le profil, avec son fournisseur.
 * AllDebrid n'y figure jamais : Nuvio ne le connaît pas, sa clé ne vit que
 * dans les manifests Torrentio, Comet et Frenchio.
 */
export function storedDebridKey(
  credentials: Readonly<Record<string, string>>,
): { provider: string; label: string; key: string } | null {
  for (const [provider, label] of Object.entries(STORED_DEBRID_LABELS)) {
    const key = credentials[`debrid:${provider}`]?.trim();
    if (key) return { provider, label, key };
  }
  return null;
}
