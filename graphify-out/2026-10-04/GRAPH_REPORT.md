# Graph Report - site-nuvio  (2026-09-22)

## Corpus Check
- 37 files · ~355,566 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 239 nodes · 363 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1630bc1e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- nuvio-api.ts
- TutorialGuide.tsx
- TypeScript Configuration
- layout.tsx
- NuvioConfiguratorModal.tsx
- AGENTS.md — Focale
- 2. Project Status
- devDependencies
- Deployment & Operational Documentation
- API Route Handlers
- vitest.config.mts
- Next.js Security Configuration
- Code Linting Configuration
- PostCSS Configuration
- nuvio-api-settings.test.ts

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `2. Project Status` - 16 edges
3. `lucide-react` - 10 edges
4. `NuvioConfiguratorModal()` - 9 edges
5. `debridEntries()` - 8 edges
6. `buildFrenchioUrl()` - 7 edges
7. `buildUwuFrUrl()` - 7 edges
8. `scripts` - 7 edges
9. `react` - 7 edges
10. `AGENTS.md — Focale` - 7 edges

## Surprising Connections (you probably didn't know these)
- `2. Project Status` --references--> `Navbar()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/Navbar.tsx
- `2. Project Status` --references--> `DirectKeyLink()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `2. Project Status` --references--> `AioMetadataField()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `2. Project Status` --references--> `TutorialGuide()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/TutorialGuide.tsx
- `3. Next Steps` --references--> `readUser()`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/debrid-key-test.ts

## Import Cycles
- None detected.

## Communities (17 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (28): dependencies, lucide-react, next, react, react-dom, @vercel/analytics, name, private (+20 more)

### Community 1 - "nuvio-api.ts"
Cohesion: 0.10
Nodes (28): Fait (22/09/2026), Objectif, Plan — Addons français complémentaires, base64ManifestUrl(), base64Utf8Config(), buildCometUrl(), buildFrenchioUrl(), buildLoostreamUrl() (+20 more)

### Community 2 - "TutorialGuide.tsx"
Cohesion: 0.16
Nodes (14): LUMIO_POINTS, NUVIO_POINTS, SECTIONS, SHOTS, AlldebridPromoBanner(), PLANS, BONUS, TorboxPromoBanner() (+6 more)

### Community 3 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "layout.tsx"
Cohesion: 0.11
Nodes (18): app_globals, display, metadata, sans, viewport, metadata, Footer(), NAV_LINKS (+10 more)

### Community 5 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.13
Nodes (15): AddonToggleProps, AioMetadataFieldProps, AlldebridKeyTest(), GuideFieldProps, NuvioConfiguratorModalProps, ViewState, WizardStep, Reste à faire (+7 more)

### Community 6 - "AGENTS.md — Focale"
Cohesion: 0.22
Nodes (8): AGENTS.md — Focale, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, Tests (vitest), This is NOT the Next.js you know, Workflow & Startup

### Community 7 - "2. Project Status"
Cohesion: 0.13
Nodes (20): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, HeroSection(), AioMetadataField(), DirectKeyLink(), formatFrenchList() (+12 more)

### Community 8 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+3 more)

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
Cohesion: 0.18
Nodes (5): NuvioApi, vitest, FakeAuth, FakeState, OTHER_FEATURE

## Knowledge Gaps
- **108 isolated node(s):** `SaveRequest`, `metadata`, `sans`, `display`, `viewport` (+103 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 144 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `TutorialGuide.tsx` to `package.json`, `layout.tsx`, `NuvioConfiguratorModal.tsx`, `2. Project Status`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `vitest` connect `nuvio-api-settings.test.ts` to `package.json`, `nuvio-api.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `2. Project Status` (e.g. with `CollectionBrowser()` and `HeroSection()`) actually correct?**
  _`2. Project Status` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SaveRequest`, `metadata`, `sans` to the rest of the system?**
  _108 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `nuvio-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1036036036036036 - nodes in this community are weakly interconnected._