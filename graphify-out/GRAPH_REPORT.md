# Graph Report - site-nuvio  (2026-10-05)

## Corpus Check
- 41 files · ~359,330 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 271 nodes · 424 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `631dc78b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- nuvio-api.ts
- TutorialGuide.tsx
- TypeScript Configuration
- Plan — Addons français complémentaires
- AGENTS.md — Focale
- NuvioConfiguratorModal.tsx
- devDependencies
- Deployment & Operational Documentation
- API Route Handlers
- vitest.config.mts
- Next.js Security Configuration
- Code Linting Configuration
- PostCSS Configuration
- nuvio-api-settings.test.ts
- collections/page.tsx

## God Nodes (most connected - your core abstractions)
1. `2. Project Status` - 19 edges
2. `compilerOptions` - 16 edges
3. `NuvioConfiguratorModal()` - 11 edges
4. `lucide-react` - 10 edges
5. `debridEntries()` - 8 edges
6. `vitest` - 8 edges
7. `buildFrenchioUrl()` - 7 edges
8. `buildUwuFrUrl()` - 7 edges
9. `buildVfTrailerUrl()` - 7 edges
10. `scripts` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Reste à faire (chantier du 22/09/2026)` --references--> `readUser()`  [INFERRED]
  docs/plans/2026-09-22-addons-francais.md → lib/debrid-key-test.ts
- `Chantier du 04/10/2026` --references--> `buildVfTrailerUrl()`  [INFERRED]
  docs/plans/2026-09-22-addons-francais.md → lib/manifest-urls.ts
- `2. Project Status` --references--> `GuideStep`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/provider-guides.ts
- `2. Project Status` --references--> `CollectionBrowser()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/CollectionBrowser.tsx
- `2. Project Status` --references--> `HeroSection()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/HeroSection.tsx

## Import Cycles
- None detected.

## Communities (17 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (27): dependencies, lucide-react, next, react, react-dom, @vercel/analytics, name, private (+19 more)

### Community 1 - "nuvio-api.ts"
Cohesion: 0.10
Nodes (33): Fait (22/09/2026), base64ManifestUrl(), base64UrlUtf8Config(), base64Utf8Config(), buildCometUrl(), buildFrenchioUrl(), buildLoostreamUrl(), buildLumioUrl() (+25 more)

### Community 2 - "TutorialGuide.tsx"
Cohesion: 0.07
Nodes (36): app_globals, display, metadata, sans, viewport, LUMIO_POINTS, metadata, NUVIO_POINTS (+28 more)

### Community 3 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "Plan — Addons français complémentaires"
Cohesion: 0.40
Nodes (4): Chantier du 04/10/2026, Objectif, Plan — Addons français complémentaires, Reste à faire (chantier du 22/09/2026)

### Community 6 - "AGENTS.md — Focale"
Cohesion: 0.22
Nodes (8): AGENTS.md — Focale, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, Tests (vitest), This is NOT the Next.js you know, Workflow & Startup

### Community 7 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.09
Nodes (27): AddonToggleProps, AioMetadataField(), AioMetadataFieldProps, AlldebridKeyTest(), DirectKeyLink(), formatFrenchList(), NuvioConfiguratorModal(), NuvioConfiguratorModalProps (+19 more)

### Community 8 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+3 more)

### Community 10 - "Deployment & Operational Documentation"
Cohesion: 0.29
Nodes (6): Commandes, Déploiement (Vercel), Focale, Notes d'exploitation, Routes, Stack

### Community 11 - "API Route Handlers"
Cohesion: 0.40
Nodes (5): POST(), readKey(), SaveRequest, public_aiometadata_config_mitch, ref_next_server

### Community 13 - "Next.js Security Configuration"
Cohesion: 0.40
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

### Community 14 - "Code Linting Configuration"
Cohesion: 0.50
Nodes (3): ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 16 - "nuvio-api-settings.test.ts"
Cohesion: 0.08
Nodes (17): NuvioApi, ref_node_fs, ref_node_path, vitest, NO_KEYS, FakeAuth, FakeState, languageOf() (+9 more)

### Community 17 - "collections/page.tsx"
Cohesion: 0.27
Nodes (9): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, HeroSection(), lib_collections_summary, CollectionSummaryItem, getCollectionsSummary() (+1 more)

## Knowledge Gaps
- **118 isolated node(s):** `SaveRequest`, `metadata`, `sans`, `display`, `viewport` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 157 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `nuvio-api-settings.test.ts` to `package.json`, `nuvio-api.ts`, `NuvioConfiguratorModal.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `TutorialGuide.tsx` to `package.json`, `collections/page.tsx`, `NuvioConfiguratorModal.tsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `2. Project Status` connect `NuvioConfiguratorModal.tsx` to `collections/page.tsx`, `TutorialGuide.tsx`, `nuvio-api.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `2. Project Status` (e.g. with `CollectionBrowser()` and `HeroSection()`) actually correct?**
  _`2. Project Status` has 18 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SaveRequest`, `metadata`, `sans` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `nuvio-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._