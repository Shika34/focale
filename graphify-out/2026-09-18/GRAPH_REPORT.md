# Graph Report - site-nuvio  (2026-09-18)

## Corpus Check
- 30 files · ~347,539 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 194 nodes · 272 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b42494d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- nuvio-api.ts
- NuvioConfiguratorModal.tsx
- compilerOptions
- layout.tsx
- TutorialGuide.tsx
- app/page.tsx
- collections/page.tsx
- devDependencies
- CLAUDE.md — NUVIO Collection
- Focale
- route.ts
- Context Handoff — NUVIO Collection
- next.config.mjs
- eslint.config.mjs
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `lucide-react` - 10 edges
3. `2. Project Status` - 9 edges
4. `NuvioConfiguratorModal()` - 7 edges
5. `react` - 7 edges
6. `SITE` - 6 edges
7. `CLAUDE.md — NUVIO Collection` - 6 edges
8. `Focale` - 6 edges
9. `debridEntries()` - 5 edges
10. `getStats()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `2. Project Status` --references--> `Navbar()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/Navbar.tsx
- `2. Project Status` --references--> `DirectKeyLink()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `2. Project Status` --references--> `AioMetadataField()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `2. Project Status` --references--> `debridEntries()`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/manifest-urls.ts
- `2. Project Status` --references--> `getStats()`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/nuvio-data.ts

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (26): dependencies, lucide-react, next, react, react-dom, @vercel/analytics, name, private (+18 more)

### Community 1 - "nuvio-api.ts"
Cohesion: 0.12
Nodes (17): base64ManifestUrl(), buildCometUrl(), buildTorrentioUrl(), debridEntries(), DebridEntry, DEBRIDERS, DebridKeys, ApiKeysConfig (+9 more)

### Community 2 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.13
Nodes (14): AioMetadataField(), AioMetadataFieldProps, DirectKeyLink(), formatFrenchList(), GuideFieldProps, NuvioConfiguratorModal(), NuvioConfiguratorModalProps, ViewState (+6 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "layout.tsx"
Cohesion: 0.15
Nodes (13): app_globals, display, metadata, sans, viewport, Footer(), NAV_LINKS, Navbar() (+5 more)

### Community 5 - "TutorialGuide.tsx"
Cohesion: 0.19
Nodes (10): metadata, BONUS, TorboxPromoBanner(), NUVIO_TUTORIAL, TRAKT_TUTORIAL, TutorialGuide(), TUTORIALS, PROVIDER_GUIDES (+2 more)

### Community 6 - "app/page.tsx"
Cohesion: 0.22
Nodes (9): LUMIO_POINTS, NUVIO_POINTS, SECTIONS, SHOTS, AlldebridPromoBanner(), PLANS, HeroSection(), getStats() (+1 more)

### Community 7 - "collections/page.tsx"
Cohesion: 0.29
Nodes (8): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, lib_collections_summary, CollectionSummaryItem, getCollectionsSummary(), next

### Community 8 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 9 - "CLAUDE.md — NUVIO Collection"
Cohesion: 0.25
Nodes (7): CLAUDE.md — NUVIO Collection, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, This is NOT the Next.js you know, Workflow & Startup

### Community 10 - "Focale"
Cohesion: 0.29
Nodes (6): Commandes, Déploiement (Vercel), Focale, Notes d'exploitation, Routes, Stack

### Community 11 - "route.ts"
Cohesion: 0.40
Nodes (5): POST(), readKey(), SaveRequest, public_aiometadata_config_mitch, ref_next_server

### Community 12 - "Context Handoff — NUVIO Collection"
Cohesion: 0.40
Nodes (4): 1. TorBox Referral Data, 3. Next Steps, 4. End of Session Instructions (AI), Context Handoff — NUVIO Collection

### Community 13 - "next.config.mjs"
Cohesion: 0.40
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

### Community 14 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

## Knowledge Gaps
- **97 isolated node(s):** `SaveRequest`, `metadata`, `sans`, `display`, `viewport` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 122 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `app/page.tsx` to `package.json`, `NuvioConfiguratorModal.tsx`, `layout.tsx`, `TutorialGuide.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `react` connect `TutorialGuide.tsx` to `package.json`, `NuvioConfiguratorModal.tsx`, `layout.tsx`, `app/page.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `2. Project Status` (e.g. with `Navbar()` and `AioMetadataField()`) actually correct?**
  _`2. Project Status` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SaveRequest`, `metadata`, `sans` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `nuvio-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11857707509881422 - nodes in this community are weakly interconnected._