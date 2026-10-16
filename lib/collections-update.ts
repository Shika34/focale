/**
 * Mise à jour des collections d'un profil Nuvio déjà configuré.
 *
 * L'assistant crée un profil puis y dépose les collections Focale. Ce module
 * porte la partie commune aux mises à jour : retrouver le profil visé par son
 * nom, expliquer l'échec quand il n'existe pas, et compléter le refus
 * d'identifiants. Le composant `CollectionsUpdateModal` s'en sert pour ne
 * remplacer que les collections, sans toucher aux addons ni aux réglages.
 */

import { authErrorMessage } from "@/lib/nuvio-api";

/** Fichier de collections servi par le site, écrit en bloc dans le profil. */
export const COLLECTIONS_UPDATE_SOURCE = "/nuvio-collections-fr.json";

/** Profil réduit à ce que la recherche par nom demande. */
export interface NamedProfile {
  profile_index: number;
  name: string;
}

/**
 * Marche à suivre ajoutée au refus d'identifiants : cette fenêtre ne crée pas
 * de compte, un utilisateur qui vient d'installer Nuvio doit passer par
 * l'assistant complet.
 */
export const UPDATE_SIGN_IN_HINT =
  "Cette fenêtre ne sert qu'aux profils déjà configurés : elle ne crée aucun compte. " +
  "Pour une première installation, fermez-la et lancez « Configurer mon Nuvio ».";

/**
 * Profil du compte portant ce nom, ou `null`. La comparaison ignore la casse
 * et les espaces de bord : Nuvio affiche les noms en majuscules, et personne
 * ne les recopie deux fois à l'identique.
 */
export function findProfileByName<T extends NamedProfile>(
  profiles: readonly T[],
  name: string,
): T | null {
  const wanted = name.trim().toLowerCase();
  if (!wanted) return null;
  return profiles.find((profile) => profile.name.trim().toLowerCase() === wanted) ?? null;
}

/**
 * Message d'erreur quand aucun profil du compte ne porte le nom saisi : il
 * nomme les profils existants, sinon l'utilisateur retape le même nom.
 */
export function profileNotFoundMessage(
  name: string,
  profiles: readonly NamedProfile[],
): string {
  const wanted = name.trim();
  if (profiles.length === 0) {
    return (
      `Ce compte Nuvio ne contient aucun profil, donc rien à mettre à jour avec le nom ` +
      `« ${wanted} ». Lancez « Configurer mon Nuvio » pour créer votre profil.`
    );
  }
  const names = profiles.map((profile) => profile.name).join(", ");
  return (
    `Aucun profil nommé « ${wanted} » sur ce compte Nuvio. Profils existants : ${names}. ` +
    `Corrigez le nom, ou lancez « Configurer mon Nuvio » s'il s'agit d'une première installation.`
  );
}

/**
 * Message d'échec de connexion affiché dans la fenêtre de mise à jour : les
 * erreurs réseau et les refus sont traduits par `authErrorMessage`, auquel
 * s'ajoute la marche à suivre pour un compte qui n'existe pas encore.
 */
export function signInErrorMessage(err: unknown): string {
  const message = authErrorMessage(err);
  return message.includes("refusé") ? `${message} ${UPDATE_SIGN_IN_HINT}` : message;
}
