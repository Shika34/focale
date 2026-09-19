# Graph Report - site-nuvio  (2026-09-19)

## Corpus Check
- 31 files · ~349,814 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 203 nodes · 289 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8cc46ea6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Package Dependencies
- nuvio-api.ts
- NuvioConfiguratorModal.tsx
- TypeScript Configuration
- layout.tsx
- TutorialGuide.tsx
- collections/page.tsx
- Dev Dependencies & Tooling
- Project Documentation & Guidelines
- Deployment & Operations Docs
- API Routes & Handlers
- Next.js Config & Security
- ESLint Configuration
- PostCSS Configuration

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `lucide-react` - 10 edges
3. `2. Project Status` - 9 edges
4. `NuvioConfiguratorModal()` - 7 edges
5. `react` - 7 edges
6. `checkAlldebridKey()` - 6 edges
7. `SITE` - 6 edges
8. `CLAUDE.md — NUVIO Collection` - 6 edges
9. `Focale` - 6 edges
10. `debridEntries()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `2. Project Status` --references--> `GuideStep`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/provider-guides.ts
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

## Communities (14 total, 1 thin omitted)

### Community 0 - "Package Dependencies"
Cohesion: 0.07
Nodes (26): dependencies, lucide-react, next, react, react-dom, @vercel/analytics, name, private (+18 more)

### Community 1 - "nuvio-api.ts"
Cohesion: 0.12
Nodes (17): base64ManifestUrl(), buildCometUrl(), buildTorrentioUrl(), debridEntries(), DebridEntry, DEBRIDERS, DebridKeys, ApiKeysConfig (+9 more)

### Community 2 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.09
Nodes (25): Navbar(), AioMetadataField(), AioMetadataFieldProps, AlldebridKeyTest(), DirectKeyLink(), formatFrenchList(), GuideFieldProps, NuvioConfiguratorModal() (+17 more)

### Community 3 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "layout.tsx"
Cohesion: 0.11
Nodes (17): app_globals, display, metadata, sans, viewport, metadata, Footer(), NAV_LINKS (+9 more)

### Community 5 - "TutorialGuide.tsx"
Cohesion: 0.15
Nodes (15): LUMIO_POINTS, NUVIO_POINTS, SECTIONS, SHOTS, AlldebridPromoBanner(), PLANS, BONUS, TorboxPromoBanner() (+7 more)

### Community 7 - "collections/page.tsx"
Cohesion: 0.27
Nodes (9): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, HeroSection(), lib_collections_summary, CollectionSummaryItem, getCollectionsSummary() (+1 more)

### Community 8 - "Dev Dependencies & Tooling"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 9 - "Project Documentation & Guidelines"
Cohesion: 0.25
Nodes (7): CLAUDE.md — NUVIO Collection, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, This is NOT the Next.js you know, Workflow & Startup

### Community 10 - "Deployment & Operations Docs"
Cohesion: 0.29
Nodes (6): Commandes, Déploiement (Vercel), Focale, Notes d'exploitation, Routes, Stack

### Community 11 - "API Routes & Handlers"
Cohesion: 0.40
Nodes (5): POST(), readKey(), SaveRequest, public_aiometadata_config_mitch, ref_next_server

### Community 13 - "Next.js Config & Security"
Cohesion: 0.40
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

### Community 14 - "ESLint Configuration"
Cohesion: 0.50
Nodes (3): ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

## Knowledge Gaps
- **98 isolated node(s):** `SaveRequest`, `metadata`, `sans`, `display`, `viewport` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 123 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `TutorialGuide.tsx` to `Package Dependencies`, `NuvioConfiguratorModal.tsx`, `layout.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `react` connect `TutorialGuide.tsx` to `Package Dependencies`, `NuvioConfiguratorModal.tsx`, `layout.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies & Tooling` to `Package Dependencies`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `2. Project Status` (e.g. with `Navbar()` and `AioMetadataField()`) actually correct?**
  _`2. Project Status` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SaveRequest`, `metadata`, `sans` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `nuvio-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11857707509881422 - nodes in this community are weakly interconnected._