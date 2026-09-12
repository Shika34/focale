# Graph Report - Site NUVIO  (2026-09-12)

## Corpus Check
- Large corpus: 32 files · ~607,322 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 137 nodes · 194 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Project Structure
- Dependencies
- Configuration
- Documentation
- Code Structure
- Build System
- Testing
- Deployment
- Contributing
- License

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `lucide-react` - 11 edges
3. `react` - 9 edges
4. `getCollectionsSummary()` - 7 edges
5. `next` - 6 edges
6. `NuvioConfiguratorModal()` - 5 edges
7. `scripts` - 5 edges
8. `getStats()` - 4 edges
9. `NuvioAddon` - 4 edges
10. `CollectionBrowser()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `CollectionsPage()` --calls--> `getCollectionsSummary()`  [EXTRACTED]
  app/collections/page.tsx → lib/nuvio-data.ts
- `HomePage()` --calls--> `getCollectionsSummary()`  [EXTRACTED]
  app/page.tsx → lib/nuvio-data.ts
- `CollectionBrowserProps` --references--> `CollectionSummaryItem`  [EXTRACTED]
  components/CollectionBrowser.tsx → lib/nuvio-data.ts
- `HeroSection()` --calls--> `getStats()`  [EXTRACTED]
  components/HeroSection.tsx → lib/nuvio-data.ts

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "Project Structure"
Cohesion: 0.08
Nodes (22): dependencies, lucide-react, next, react, react-dom, name, private, scripts (+14 more)

### Community 1 - "Dependencies"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 2 - "Configuration"
Cohesion: 0.18
Nodes (12): CollectionsPage(), metadata, HomePage(), RECOMMENDED_ADDONS, getCollectionsSummary(), searchFolders(), AioMetadataConfig, NuvioAddon (+4 more)

### Community 3 - "Documentation"
Cohesion: 0.26
Nodes (11): CollectionBrowser(), CollectionBrowserProps, HeroSection(), NuvioConfiguratorModal(), NuvioConfiguratorModalProps, ViewState, TorboxPromoBanner(), CollectionSummaryItem (+3 more)

### Community 4 - "Code Structure"
Cohesion: 0.12
Nodes (14): Site NUVIO, nextConfig, lucide-react, react, react-dom, @types/node, @types/react, site-nuvio (+6 more)

### Community 5 - "Build System"
Cohesion: 0.15
Nodes (7): metadata, metadata, metadata, AddonsList(), AioMetadataViewer(), TutorialGuide(), next

### Community 6 - "Testing"
Cohesion: 0.24
Nodes (8): ApiKeysConfig, authHeaders(), fetchWithRetry(), KEYLESS_INTEGRATIONS, NuvioAddonInstall, NuvioApi, NuvioProfile, rpc()

### Community 7 - "Deployment"
Cohesion: 0.25
Nodes (8): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript

### Community 8 - "Contributing"
Cohesion: 0.33
Nodes (4): metadata, viewport, Footer(), Navbar()

## Knowledge Gaps
- **61 isolated node(s):** `metadata`, `metadata`, `metadata`, `viewport`, `metadata` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 80 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Documentation` to `Contributing`, `Project Structure`, `Configuration`, `Build System`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `next` connect `Build System` to `Contributing`, `Project Structure`, `Configuration`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `react` connect `Documentation` to `Project Structure`, `Configuration`, `Build System`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Structure` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Code Structure` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._