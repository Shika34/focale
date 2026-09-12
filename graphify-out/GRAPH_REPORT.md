# Graph Report - Site NUVIO  (2026-09-12)

## Corpus Check
- 32 files · ~608,019 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 154 nodes · 202 edges · 14 communities (11 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `31485c07`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- nuvio-data.ts
- NuvioConfiguratorModal.tsx
- site-nuvio
- next
- nuvio-api.ts
- devDependencies
- layout.tsx
- postcss.config.mjs
- CLAUDE.md — NUVIO Collection
- Context Handoff — NUVIO Collection
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `lucide-react` - 11 edges
3. `react` - 9 edges
4. `next` - 6 edges
5. `CLAUDE.md — NUVIO Collection` - 6 edges
6. `NuvioConfiguratorModal()` - 5 edges
7. `getCollectionsSummary()` - 5 edges
8. `scripts` - 5 edges
9. `Context Handoff — NUVIO Collection` - 5 edges
10. `getStats()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `CollectionsPage()` --calls--> `getCollectionsSummary()`  [EXTRACTED]
  app/collections/page.tsx → lib/nuvio-data.ts
- `CollectionBrowserProps` --references--> `CollectionSummaryItem`  [EXTRACTED]
  components/CollectionBrowser.tsx → lib/nuvio-data.ts
- `HeroSection()` --calls--> `getStats()`  [EXTRACTED]
  components/HeroSection.tsx → lib/nuvio-data.ts

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.08
Nodes (22): dependencies, lucide-react, next, react, react-dom, name, private, scripts (+14 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 2 - "nuvio-data.ts"
Cohesion: 0.17
Nodes (14): CollectionsPage(), metadata, CollectionBrowser(), CollectionBrowserProps, RECOMMENDED_ADDONS, CollectionSummaryItem, getCollectionsSummary(), searchFolders() (+6 more)

### Community 3 - "NuvioConfiguratorModal.tsx"
Cohesion: 0.22
Nodes (10): HeroSection(), ApiKeyFieldProps, NuvioConfiguratorModal(), NuvioConfiguratorModalProps, ViewState, WizardStep, TorboxPromoBanner(), getStats() (+2 more)

### Community 4 - "site-nuvio"
Cohesion: 0.15
Nodes (13): Site NUVIO, lucide-react, react, react-dom, @types/node, @types/react, site-nuvio, @types/react-dom (+5 more)

### Community 5 - "next"
Cohesion: 0.15
Nodes (7): metadata, metadata, metadata, AddonsList(), AioMetadataViewer(), TutorialGuide(), next

### Community 6 - "nuvio-api.ts"
Cohesion: 0.24
Nodes (8): ApiKeysConfig, authHeaders(), fetchWithRetry(), KEYLESS_INTEGRATIONS, NuvioAddonInstall, NuvioApi, NuvioProfile, rpc()

### Community 7 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript

### Community 8 - "layout.tsx"
Cohesion: 0.33
Nodes (4): metadata, viewport, Footer(), Navbar()

### Community 10 - "CLAUDE.md — NUVIO Collection"
Cohesion: 0.29
Nodes (6): CLAUDE.md — NUVIO Collection, Coding Principles (Karpathy Style), Development Directives, Graphify Tool, Stack & Commands, Workflow & Startup

### Community 11 - "Context Handoff — NUVIO Collection"
Cohesion: 0.33
Nodes (5): 1. TorBox Referral Data, 2. Project Status, 3. Next Steps, 4. End of Session Instructions (AI), Context Handoff — NUVIO Collection

## Knowledge Gaps
- **72 isolated node(s):** `metadata`, `metadata`, `metadata`, `viewport`, `metadata` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 97 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `NuvioConfiguratorModal.tsx` to `layout.tsx`, `package.json`, `nuvio-data.ts`, `next`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `next` connect `next` to `layout.tsx`, `package.json`, `nuvio-data.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `react` connect `NuvioConfiguratorModal.tsx` to `package.json`, `nuvio-data.ts`, `next`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._