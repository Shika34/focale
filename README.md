# Focale

Focale prépare un profil [Nuvio](https://nuvio.tv) entièrement en français. Le site tient deux rôles : un guide qui explique chaque étape, et un configurateur qui s'occupe du reste. À la sortie, le profil contient 18 collections francophones, 756 dossiers à parcourir, et les addons qui rendent la VF et la VOSTFR utilisables.

Tout se passe dans le navigateur, sans ligne de commande et sans compte à créer ailleurs que chez Nuvio.

Le site tourne sur [focale-nuvio.vercel.app](https://focale-nuvio.vercel.app).

## Ce que l'assistant met en place

Il crée un profil Nuvio nommé « Focale », ou réutilise celui qui porte déjà ce nom, puis y dépose :

- les 18 collections et leurs dossiers, filtres réglés ;
- une configuration AIO Metadata construite avec vos clés TMDB, TheTVDB et MDBList ;
- un manifeste Lumio personnel, généré pour votre débrideur ;
- Torrentio et Comet, avec TorBox ou AllDebrid selon la clé saisie ;
- les addons francophones Loostream, Frenchio et UwU-FR, plus VF Trailer ;
- les réglages de lecture en français : sous-titres forcés et piste audio française.

Lumio et StreamFusion se configurent sur leur propre site. L'assistant vous demande alors un lien à coller, et les tutoriels expliquent où le trouver.

## Les quatre étapes

1. **Compte Nuvio.** Inscription ou connexion, puis recherche du profil à préparer.
2. **Clés.** TMDB, TheTVDB, MDBList, et votre clé TorBox ou AllDebrid. Chaque champ est précédé d'une question du type « avez-vous déjà un compte ? » : répondre non ouvre un guide pas à pas, et un lien direct mène à la page des clés du fournisseur. La clé AllDebrid peut être testée sur place, depuis votre navigateur, avant l'envoi.
3. **Addons.** Vous cochez ce que vous voulez en plus. Une case dont la prérequise manque se désactive et affiche la raison.
4. **Envoi.** Un récapitulatif liste ce qui part réellement, puis l'assistant écrit dans votre profil Nuvio.

## Les pages du site

L'accueil présente l'assistant, ce qu'il installe, et ce que Nuvio comme Lumio changent au visionnage. La page collections parcourt les 18 collections dossier par dossier, avec le nombre de sources de chacune. La page tutoriel réunit dix guides : compte Nuvio, débrideurs TorBox et AllDebrid, clés TMDB, TheTVDB et MDBList, profil Lumio, VF et VOSTFR, StreamFusion, suivi Trakt.

## Vos clés

Les clés saisies servent à construire des URL de manifestes et la configuration AIO Metadata. Elles ne sont écrites ni sur le disque du serveur ni dans une base de données : la route serveur qui parle à AIO Metadata ne fait que transmettre, et le test de la clé AllDebrid part de votre navigateur. Le site ne dépose aucun cookie de suivi.

## Stack

Next.js 16 avec l'App Router, TypeScript strict, Tailwind CSS 4 (les couleurs et les polices sont des variables déclarées dans un bloc de thème du CSS global), pnpm comme gestionnaire de paquets. Les tests tournent sous Vitest et couvrent la génération des URL de manifestes, la fusion des réglages Nuvio, le verdict des clés de débrideur et la collection « En vedette ».

## En local

Il faut Node 24 ou plus récent et pnpm. Une fois le dépôt cloné, pnpm install installe les dépendances et pnpm dev lance le serveur de développement ; pnpm test, pnpm lint et pnpm build passent les contrôles avant un envoi, et pnpm start sert la version compilée. Le déploiement Vercel ne réclame aucune variable d'environnement. Le site ne doit pas être exporté en statique : la route AIO Metadata est dynamique.

## Signaler un problème

Les services tiers changent parfois le schéma de leur page de configuration. Si un manifeste ne répond plus, ou si une étape ne correspond plus à ce que vous voyez, ouvrez une issue en indiquant l'étape concernée et le message affiché. Une capture d'écran aide beaucoup.

## Crédits

La disposition du catalogue s'inspire de Kaptain Collection. Les collections francophones et les addons cités appartiennent à leurs auteurs : la communauté StremioFR, ElfHosted, et les projets Torrentio, Comet, AIO Metadata, Lumio et VF Trailer.
