# Plan — Addons français complémentaires

Statut : en cours (chantier du 22/09/2026)
Périmètre : `lib/manifest-urls.ts`, étape 3 de `components/NuvioConfiguratorModal.tsx`, `lib/provider-guides.ts`, `components/TutorialGuide.tsx`

## Objectif

Installer, à partir des seules clés déjà saisies à l'étape 2 (TMDB, débrideur),
les addons francophones de la communauté StremioFR, sans manipulation
supplémentaire pour l'utilisateur.

## Fait (22/09/2026)

- [x] `buildLoostreamUrl`, `buildFrenchioUrl`, `buildUwuFrUrl` dans `lib/manifest-urls.ts`, activés par défaut sauf UwU-FR (animés)
- [x] Champ « lien à coller » + tutoriel n° 10 pour StreamFusion (configuration côté serveur)
- [x] Case désactivée avec la raison en français quand une prérequise manque (clé TMDB ou débrideur)
- [x] Récapitulatif de l'étape 4 et écran de succès énumérant les addons réellement retenus
- [x] Manifests et endpoint `/stream/movie/tt0111161.json` vérifiés en direct avec des clés bidon
- [x] Tests vitest de `lib/manifest-urls.ts` (clés, ordre des fournisseurs, prérequis, accents des pseudos)
- [x] Tests vitest de la fusion des blobs de réglages dans `lib/nuvio-api.ts`

## Chantier du 04/10/2026

Demande : rendre le profil Nuvio créé utilisable tel quel en français (sous-titres
forcés, VF), intégrer les addons FR utiles de StremioFR, corriger l'onglet
« En vedette » figé sur un nom périmé, trancher Trakt, et nommer le profil FOCALE
par défaut.

- [x] `NuvioApi.applyFrenchDefaults` (remplace `setTmdbLanguageFrench`) : sous-titres français en mode forcé + piste audio française, avec le nom de clé propre à chaque client, fusion dans le blob existant et relecture de confirmation
- [x] VF Trailer ajouté au pack (`buildVfTrailerUrl`, activé par défaut, clé TMDB requise), case dans l'étape 3, récapitulatif et écran de succès ajustés
- [x] Noms de rôle génériques pour les huit dossiers « En vedette » (plus aucun nom propre) + `lib/spotlight-art.ts` qui versionne les visuels à l'envoi
- [x] Nom de profil par défaut passé à « FOCALE »
- [x] Trakt : vérifié non automatisable (OAuth exclu des identifiants fournisseurs) ; renvoi vers le tutoriel depuis l'écran de succès
- [x] Tests : `spotlight-art`, `spotlight-collection`, `nuvio-addons-pack`, `nuvio-api-settings` réécrit (53 tests)
- [ ] Confirmer les réglages français contre `api.nuvio.tv` avec un compte réel, puis à l'écran (Réglages → Lecture, film sans VF)
- [ ] Voir une bande-annonce VF dans Nuvio sur une fiche de film récent
- [ ] Recontrôler la rotation des visuels « En vedette » au prochain cycle de quatorze jours
- [ ] Trancher l'ajout des addons FR à configuration serveur (WAStream, WACustom, Kast, Ciné Cloud, SubSense, Int. Debrid Search) : demanderait une route serveur dédiée, comme AIO Metadata

## Reste à faire (chantier du 22/09/2026)

- [ ] **Flèche de test n° 1 :** avec une vraie clé TMDB et un vrai débrideur, vérifier que les sources Frenchio et UwU-FR apparaissent dans Nuvio sur un film récent. Si un addon change le schéma de sa page `/configure`, ajuster la fonction `build*Url` correspondante (`lib/manifest-urls.ts`).
- [ ] **Pseudo Loostream :** le pseudo installé est le nom du profil Nuvio et n'est pas revendiqué auprès du service (`POST /api/pseudo/claim`). À surveiller ; si Loostream refuse un pseudo non revendiqué, soit revendiquer depuis `lib/debrid-key-test.ts`, soit demander le pseudo à l'utilisateur à l'étape 3.
- [ ] **Clé AllDebrid valide avec abonnement :** branche jamais observée en vrai (testée sur la réponse exacte de la doc). Message attendu : « Clé AllDebrid valide (compte ...). Abonnement actif jusqu'au ... ». Si AllDebrid change `/v4/user`, ajuster `readUser()` de `lib/debrid-key-test.ts`.
- [ ] **Déploiement Vercel :** déployer, puis rejouer l'assistant en production avec un compte Nuvio réel (aucune variable d'environnement ; pas d'export statique, `/api/aiometadata` est dynamique).
- [ ] **Responsive réel :** confirmer sur iPhone (Safari iOS) et Android physiques les deux overlays `max-h-[92vh]` (l'émulation ne reproduit ni la barre d'adresse dynamique ni la zone sûre).
- [ ] **Trakt :** trancher le nombre d'applications tierces autorisées sur un compte gratuit (1 selon la FAQ, 2 relevé sur `app.trakt.tv`) et corriger la phrase de `TRAKT_TUTORIAL`.
- [ ] **Outillage :** repasser à `typescript@^7` et retirer le pin `typescript@^6.0.3` dès que `typescript-eslint` supporte TS 7 (typescript-eslint#10940).
