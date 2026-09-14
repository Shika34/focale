# Graph Report - site-nuvio  (2026-09-14)

## Corpus Check
- 29 files · ~339,753 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 180 nodes · 238 edges · 15 communities (13 shown, 1 thin omitted)
- Extraction: 95% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8d31835e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- collections/page.tsx
- route.ts
- site-nuvio
- TutorialGuide.tsx
- NuvioConfiguratorModal.tsx
- devDependencies
- postcss.config.mjs
- CLAUDE.md — NUVIO Collection
- Context Handoff — NUVIO Collection
- next.config.mjs
- Focale
- app/page.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `lucide-react` - 9 edges
3. `NuvioConfiguratorModal()` - 7 edges
4. `react` - 7 edges
5. `SITE` - 6 edges
6. `CLAUDE.md — NUVIO Collection` - 6 edges
7. `Focale` - 6 edges
8. `scripts` - 5 edges
9. `Context Handoff — NUVIO Collection` - 5 edges
10. `buildLumioUrl()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `CollectionsPage()` --calls--> `getCollectionsSummary()`  [EXTRACTED]
  app/collections/page.tsx → lib/nuvio-data.ts
- `CollectionBrowserProps` --references--> `CollectionSummaryItem`  [EXTRACTED]
  components/CollectionBrowser.tsx → lib/nuvio-data.ts
- `HeroSection()` --calls--> `getStats()`  [EXTRACTED]
  components/HeroSection.tsx → lib/nuvio-data.ts
- `GuideFieldProps` --references--> `ProviderGuide`  [EXTRACTED]
  components/NuvioConfiguratorModal.tsx → lib/provider-guides.ts
- `NuvioConfiguratorModal()` --calls--> `buildLumioUrl()`  [EXTRACTED]
  components/NuvioConfiguratorModal.tsx → lib/manifest-urls.ts

## Import Cycles
- None detected.

## Communities (15 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.08
Nodes (24): dependencies, lucide-react, next, react, react-dom, name, private, scripts (+16 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 2 - "collections/page.tsx"
Cohesion: 0.27
Nodes (9): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, HeroSection(), CollectionSummaryItem, getCollectionsSummary(), getStats() (+1 more)

### Community 3 - "route.ts"
Cohesion: 0.67
Nodes (3): POST(), readKey(), SaveRequest

### Community 4 - "site-nuvio"
Cohesion: 0.15
Nodes (13): Site NUVIO, lucide-react, react, react-dom, @types/node, @types/react, site-nuvio, @types/react-dom (+5 more)

### Community 5 - "TutorialGuide.tsx"
Cohesion: 0.12
Nodes (18): display, metadata, sans, viewport, metadata, Footer(), NAV_LINKS, Navbar() (+10 more)

### Community 6 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.09
Nodes (20): AioMetadataFieldProps, formatFrenchList(), GuideFieldProps, NuvioConfiguratorModal(), NuvioConfiguratorModalProps, ViewState, WizardStep, base64ManifestUrl() (+12 more)

### Community 7 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 10 - "CLAUDE.md — NUVIO Collection"
Cohesion: 0.25
Nodes (7): CLAUDE.md — NUVIO Collection, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, This is NOT the Next.js you know, Workflow & Startup

### Community 11 - "Context Handoff — NUVIO Collection"
Cohesion: 0.33
Nodes (5): 1. TorBox Referral Data, 2. Project Status, 3. Next Steps, 4. End of Session Instructions (AI), Context Handoff — NUVIO Collection

### Community 12 - "next.config.mjs"
Cohesion: 0.40
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

### Community 13 - "Focale"
Cohesion: 0.29
Nodes (6): Commandes, Déploiement (Vercel), Focale, Notes d'exploitation, Routes, Stack

### Community 14 - "app/page.tsx"
Cohesion: 0.29
Nodes (5): LUMIO_POINTS, NUVIO_POINTS, SECTIONS, SHOTS, TorboxPromoBanner()

## Knowledge Gaps
- **90 isolated node(s):** `SaveRequest`, `metadata`, `sans`, `display`, `viewport` (+85 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 117 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `TutorialGuide.tsx` to `package.json`, `collections/page.tsx`, `app/page.tsx`, `NuvioConfiguratorModal.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `react` connect `TutorialGuide.tsx` to `package.json`, `collections/page.tsx`, `NuvioConfiguratorModal.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `SaveRequest`, `metadata`, `sans` to the rest of the system?**
  _90 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `TutorialGuide.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._