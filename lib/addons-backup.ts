/**
 * Sauvegarde de la liste d'addons d'un profil, prise juste avant que
 * l'assistant n'écrive dedans.
 *
 * La remise en état se fait avec ces lignes telles quelles : nom, lien, addon
 * activé ou non et ordre d'affichage. Le fichier téléchargé est la même liste,
 * lisible par la personne et réimportable à la main dans Nuvio si la remise en
 * état automatique échoue.
 */

export interface AddonSnapshotRow {
  name: string;
  url: string;
  enabled: boolean;
  sort_order: number;
}

export interface AddonsSnapshot {
  profileName: string;
  /** Horodatage ISO du moment où la liste a été lue. */
  takenAt: string;
  addons: AddonSnapshotRow[];
}

/** Nom de fichier sans accent, sans espace et sans caractère interdit. */
function slug(value: string): string {
  const clean = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return clean || "profil";
}

/** Nom de fichier et contenu JSON de la sauvegarde, prêts à télécharger. */
export function buildAddonsBackup(snapshot: AddonsSnapshot): {
  fileName: string;
  content: string;
} {
  const day = (snapshot.takenAt || new Date().toISOString()).slice(0, 10);
  return {
    fileName: `focale-addons-${slug(snapshot.profileName)}-${day}.json`,
    content: `${JSON.stringify(
      {
        source: "Focale",
        profil: snapshot.profileName,
        releve_le: snapshot.takenAt,
        addons: snapshot.addons.map(({ name, url, enabled, sort_order }) => ({
          nom: name,
          lien: url,
          active: enabled,
          ordre: sort_order,
        })),
      },
      null,
      2,
    )}\n`,
  };
}
