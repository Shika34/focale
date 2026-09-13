# Graph Report - site-nuvio  (2026-09-13)

## Corpus Check
- 32 files · ~614,446 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 173 nodes · 230 edges · 15 communities (10 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `287d4205`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- TutorialGuide.tsx
- aiometadata/route.ts
- site-nuvio
- HeroSection.tsx
- devDependencies
- postcss.config.mjs
- CLAUDE.md — NUVIO Collection
- Context Handoff — NUVIO Collection
- next.config.mjs
- NuvioConfiguratorModal.tsx
- collections/page.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `lucide-react` - 9 edges
3. `react` - 7 edges
4. `NuvioConfiguratorModal()` - 6 edges
5. `SITE` - 6 edges
6. `CLAUDE.md — NUVIO Collection` - 6 edges
7. `scripts` - 5 edges
8. `Context Handoff — NUVIO Collection` - 5 edges
9. `buildLumioUrl()` - 4 edges
10. `getCollectionsSummary()` - 4 edges

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

## Communities (15 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.08
Nodes (24): dependencies, lucide-react, next, react, react-dom, name, private, scripts (+16 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 2 - "TutorialGuide.tsx"
Cohesion: 0.12
Nodes (19): display, metadata, sans, viewport, metadata, Footer(), NAV_LINKS, Navbar() (+11 more)

### Community 4 - "site-nuvio"
Cohesion: 0.15
Nodes (13): Site NUVIO, lucide-react, react, react-dom, @types/node, @types/react, site-nuvio, @types/react-dom (+5 more)

### Community 5 - "HeroSection.tsx"
Cohesion: 0.38
Nodes (4): SECTIONS, HeroSection(), TorboxPromoBanner(), getStats()

### Community 7 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 10 - "CLAUDE.md — NUVIO Collection"
Cohesion: 0.25
Nodes (7): CLAUDE.md — NUVIO Collection, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, This is NOT the Next.js you know, Workflow & Startup

### Community 11 - "Context Handoff — NUVIO Collection"
Cohesion: 0.33
Nodes (5): 1. TorBox Referral Data, 2. Project Status, 3. Next Steps, 4. End of Session Instructions (AI), Context Handoff — NUVIO Collection

### Community 14 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.10
Nodes (19): AioMetadataFieldProps, GuideFieldProps, NuvioConfiguratorModal(), NuvioConfiguratorModalProps, ViewState, WizardStep, base64ManifestUrl(), buildCometUrl() (+11 more)

### Community 15 - "collections/page.tsx"
Cohesion: 0.20
Nodes (11): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, CollectionSummaryItem, getCollectionsSummary(), AioMetadataConfig, NuvioCollection (+3 more)

## Knowledge Gaps
- **84 isolated node(s):** `SaveRequest`, `metadata`, `sans`, `display`, `viewport` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 112 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `TutorialGuide.tsx` to `package.json`, `HeroSection.tsx`, `NuvioConfiguratorModal.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `react` connect `TutorialGuide.tsx` to `package.json`, `HeroSection.tsx`, `NuvioConfiguratorModal.tsx`, `collections/page.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `SaveRequest`, `metadata`, `sans` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `TutorialGuide.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._