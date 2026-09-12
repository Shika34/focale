# Context Handoff — NUVIO Collection

## 1. TorBox Referral Data
- **Referral link:** `https://torbox.app/subscription?referral=49a51e6d-dcf6-47ad-a98d-147f11c4268f`
- **Referral code:** `49a51e6d-dcf6-47ad-a98d-147f11c4268f`
- **Promo code:** `SIGMA30` (-30% crypto, bonus +84d card & crypto)

## 2. Project Status
- **Build:** OK (`pnpm build`).
- **Lint:** `pnpm lint` échoue car le script actuel lance `next lint`, non disponible avec Next.js 16 (`Invalid project directory provided ...\lint`).
- **Concept:** Static catalogue UI inspired by Kaptain Collection (https://imkaptain.github.io/Kaptain-Collection/).
- **Validated:** Nuvio API auto-auth, `nuvio-collections-shika34.json` injection, `aiometadata-config-shika34.json` injection, TorBox integration, provisioning (TMDB, Lumio, BingeCat).
- **Configurator:** remanié en assistant pas-à-pas « Set Up & Send to Nuvio » : compte Nuvio, clés TMDB/TVDB/MDBList pour AIO Metadata, manifest Lumio personnalisé collé depuis `https://mylumio.tv/configure`, puis envoi vers Nuvio.
- **Accueil:** les textes « en 1 Clic » ont été retirés et la section/carte « Catalogue des Collections » a été supprimée de la page d'accueil.
- **Graphify:** `graphify update .` exécuté après modifications (`graph.json`, `graph.html`, `GRAPH_REPORT.md` mis à jour).

## 3. Next Steps
- **Deployment:** Déployer sur Vercel et tester l'assistant pas-à-pas en production avec un compte Nuvio réel.
- **Lint:** remplacer le script `next lint` par une commande compatible Next.js 16 si une vérification lint est souhaitée.

## 4. End of Session Instructions (AI)
After modifying code and validating the build:
1. Update project status and completed tasks.
2. Define the next steps.