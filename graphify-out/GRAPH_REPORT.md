# Graph Report - site-nuvio  (2026-09-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 194 nodes · 272 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.95)
- Token cost: 725 input · 3,174 output

## Graph Freshness
- Built from commit: `5b42494d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Project Dependencies
- Debrid Service Integration
- Configuration UI Components
- TypeScript Compiler Config
- Site Layout & Navigation
- Tutorial & Guide Pages
- Homepage Components
- Collection Browser UI
- Development Dependencies
- Project Documentation
- Deployment Operations Guide
- API Route Handlers
- AI Context Handoff
- Next.js Security Config
- ESLint Configuration
- PostCSS Configuration

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `lucide-react` - 10 edges
3. `2. Project Status` - 9 edges
4. `NuvioConfiguratorModal()` - 7 edges
5. `react` - 7 edges
6. `Focale` - 6 edges
7. `SITE` - 6 edges
8. `CLAUDE.md — NUVIO Collection` - 6 edges
9. `debridEntries()` - 5 edges
10. `getStats()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `2. Project Status` --references--> `GuideStep`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/provider-guides.ts
- `2. Project Status` --references--> `debridEntries()`  [INFERRED]
  CONTEXT_HANDOFF.md → lib/manifest-urls.ts
- `2. Project Status` --references--> `AioMetadataField()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `2. Project Status` --references--> `DirectKeyLink()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/NuvioConfiguratorModal.tsx
- `2. Project Status` --references--> `Navbar()`  [INFERRED]
  CONTEXT_HANDOFF.md → components/Navbar.tsx

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 0 - "Project Dependencies"
Cohesion: 0.07
Nodes (26): dependencies, lucide-react, next, react, react-dom, @vercel/analytics, name, private (+18 more)

### Community 1 - "Debrid Service Integration"
Cohesion: 0.12
Nodes (17): base64ManifestUrl(), buildCometUrl(), buildTorrentioUrl(), debridEntries(), DebridEntry, DEBRIDERS, DebridKeys, ApiKeysConfig (+9 more)

### Community 2 - "Configuration UI Components"
Cohesion: 0.13
Nodes (14): AioMetadataField(), AioMetadataFieldProps, DirectKeyLink(), formatFrenchList(), GuideFieldProps, NuvioConfiguratorModal(), NuvioConfiguratorModalProps, ViewState (+6 more)

### Community 3 - "TypeScript Compiler Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "Site Layout & Navigation"
Cohesion: 0.15
Nodes (13): app_globals, display, metadata, sans, viewport, Footer(), NAV_LINKS, Navbar() (+5 more)

### Community 5 - "Tutorial & Guide Pages"
Cohesion: 0.19
Nodes (10): metadata, BONUS, TorboxPromoBanner(), NUVIO_TUTORIAL, TRAKT_TUTORIAL, TutorialGuide(), TUTORIALS, PROVIDER_GUIDES (+2 more)

### Community 6 - "Homepage Components"
Cohesion: 0.22
Nodes (9): LUMIO_POINTS, NUVIO_POINTS, SECTIONS, SHOTS, AlldebridPromoBanner(), PLANS, HeroSection(), getStats() (+1 more)

### Community 7 - "Collection Browser UI"
Cohesion: 0.29
Nodes (8): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, lib_collections_summary, CollectionSummaryItem, getCollectionsSummary(), next

### Community 8 - "Development Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 9 - "Project Documentation"
Cohesion: 0.25
Nodes (7): CLAUDE.md — NUVIO Collection, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, This is NOT the Next.js you know, Workflow & Startup

### Community 10 - "Deployment Operations Guide"
Cohesion: 0.29
Nodes (6): Commandes, Déploiement (Vercel), Focale, Notes d'exploitation, Routes, Stack

### Community 11 - "API Route Handlers"
Cohesion: 0.40
Nodes (5): POST(), readKey(), SaveRequest, public_aiometadata_config_mitch, ref_next_server

### Community 12 - "AI Context Handoff"
Cohesion: 0.40
Nodes (4): 1. TorBox Referral Data, 3. Next Steps, 4. End of Session Instructions (AI), Context Handoff — NUVIO Collection

### Community 13 - "Next.js Security Config"
Cohesion: 0.40
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

### Community 14 - "ESLint Configuration"
Cohesion: 0.50
Nodes (3): ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

## Knowledge Gaps
- **97 isolated node(s):** `DebridEntry`, `DebridKeys`, `ApiKeysConfig`, `NuvioAddonInstall`, `NuvioProfile` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 122 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Homepage Components` to `Project Dependencies`, `Configuration UI Components`, `Site Layout & Navigation`, `Tutorial & Guide Pages`, `Collection Browser UI`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `react` connect `Tutorial & Guide Pages` to `Project Dependencies`, `Configuration UI Components`, `Site Layout & Navigation`, `Homepage Components`, `Collection Browser UI`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Development Dependencies` to `Project Dependencies`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `2. Project Status` (e.g. with `Navbar()` and `AioMetadataField()`) actually correct?**
  _`2. Project Status` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `DebridEntry`, `DebridKeys`, `ApiKeysConfig` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Debrid Service Integration` be split into smaller, more focused modules?**
  _Cohesion score 0.11857707509881422 - nodes in this community are weakly interconnected._