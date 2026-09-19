# Focale

Guide en français et assistant de configuration pour [Nuvio](https://nuvio.tv) :
18 collections francophones (756 dossiers) et les addons Stremio essentiels
(AIO Metadata, Lumio, Torrentio, Comet) installés dans un profil Nuvio en
quatre étapes, sans ligne de commande.

## Stack

- Next.js 16 (App Router, sans `/src`), TypeScript strict, Tailwind CSS
- pnpm, Node 24+

## Commandes

```bash
pnpm dev     # développement
pnpm build   # build de production
pnpm start   # serveur de production
pnpm lint    # ESLint 9 (flat config)
```

## Routes

| Route | Rôle |
| --- | --- |
| `/` | Accueil : assistant de configuration, aperçu, présentation de Nuvio et de Lumio |
| `/collections` | Catalogue des 18 collections, parcourable dossier par dossier |
| `/tutoriel` | Six tutoriels : compte Nuvio, TorBox, TMDB, TheTVDB, MDBList, Lumio |
| `/api/aiometadata` | Route serveur : crée la configuration AIO Metadata avec les clés de l'utilisateur |

## Déploiement (Vercel)

Aucune variable d'environnement n'est requise. Les clés saisies dans l'assistant
ne sont jamais stockées côté serveur : elles ne font que transiter par la route
`/api/aiometadata`, puis sont écrites dans le profil Nuvio de l'utilisateur. La
route API étant dynamique, le site ne doit pas être déployé en export statique.

Les en-têtes de sécurité (CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`) sont définis dans `next.config.mjs`.

## Notes d'exploitation

- `CONTEXT_HANDOFF.md` : état du projet et tâches en cours ; à lire en début de session.
- `CLAUDE.md` : conventions de code (UI en français, vouvoiement).
