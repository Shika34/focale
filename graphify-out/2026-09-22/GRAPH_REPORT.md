# Graph Report - site-nuvio  (2026-09-22)

## Corpus Check
- 36 files · ~354,113 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 234 nodes · 351 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1630bc1e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- nuvio-api.ts
- NuvioConfiguratorModal.tsx
- TypeScript Configuration
- layout.tsx
- debrid-key-test.ts
- AGENTS.md — Focale
- collections/page.tsx
- devDependencies
- Deployment & Operational Documentation
- API Route Handlers
- vitest.config.mts
- Next.js Security Configuration
- Code Linting Configuration
- PostCSS Configuration

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `2. Project Status` - 15 edges
3. `lucide-react` - 10 edges
4. `NuvioConfiguratorModal()` - 8 edges
5. `debridEntries()` - 8 edges
6. `buildFrenchioUrl()` - 7 edges
7. `buildUwuFrUrl()` - 7 edges
8. `scripts` - 7 edges
9. `react` - 7 edges
10. `AGENTS.md — Focale` - 7 edges

## Surprising Connections (you probably didn't know these)
- `2. Project Status` --references--> `CollectionBrowser()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/CollectionBrowser.tsx
- `2. Project Status` --references--> `Navbar()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/Navbar.tsx
- `2. Project Status` --references--> `DirectKeyLink()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `2. Project Status` --references--> `AioMetadataField()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `3. Next Steps` --references--> `readUser()`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/debrid-key-test.ts

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (32): NuvioApi, dependencies, lucide-react, next, react, react-dom, @vercel/analytics, name (+24 more)

### Community 1 - "nuvio-api.ts"
Cohesion: 0.12
Nodes (26): Fait (22/09/2026), base64ManifestUrl(), base64Utf8Config(), buildCometUrl(), buildFrenchioUrl(), buildLoostreamUrl(), buildLumioUrl(), buildProvidedManifestUrl() (+18 more)

### Community 2 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.08
Nodes (32): LUMIO_POINTS, NUVIO_POINTS, SECTIONS, SHOTS, AlldebridPromoBanner(), PLANS, HeroSection(), AddonToggleProps (+24 more)

### Community 3 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "layout.tsx"
Cohesion: 0.14
Nodes (14): app_globals, display, metadata, sans, viewport, metadata, Footer(), NAV_LINKS (+6 more)

### Community 5 - "debrid-key-test.ts"
Cohesion: 0.15
Nodes (14): AlldebridKeyTest(), 1. TorBox Referral Data, 3. Next Steps, 4. End of Session Instructions (AI), Context Handoff — Focale (ex NUVIO Collection), Objectif, Plan — Addons français complémentaires, Reste à faire (+6 more)

### Community 6 - "AGENTS.md — Focale"
Cohesion: 0.22
Nodes (8): AGENTS.md — Focale, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, Tests (vitest), This is NOT the Next.js you know, Workflow & Startup

### Community 7 - "collections/page.tsx"
Cohesion: 0.29
Nodes (8): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, lib_collections_summary, CollectionSummaryItem, getCollectionsSummary(), next

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

## Knowledge Gaps
- **107 isolated node(s):** `SaveRequest`, `metadata`, `sans`, `display`, `viewport` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `NuvioConfiguratorModal.tsx` to `package.json`, `layout.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `react` connect `NuvioConfiguratorModal.tsx` to `package.json`, `layout.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `2. Project Status` (e.g. with `CollectionBrowser()` and `HeroSection()`) actually correct?**
  _`2. Project Status` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SaveRequest`, `metadata`, `sans` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `nuvio-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._