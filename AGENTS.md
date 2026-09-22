# AGENTS.md — Focale

## Workflow & Startup
- **At session start:** Read `CONTEXT_HANDOFF.md` (statut courant) et le plan actif dans `docs/plans/`.
- **At task completion:** After code changes and verification (`pnpm test`, `pnpm lint`, `pnpm build`), update `CONTEXT_HANDOFF.md` (completed items & next steps) and tick the plan's checkboxes.
- **Ce fichier est la source unique des instructions.** `CLAUDE.md` ne contient que `@AGENTS.md` (convention Next.js 16 : Next écrit le bloc `nextjs-agent-rules` dans `AGENTS.md` et l'importe depuis `CLAUDE.md`).

## Coding Principles (Karpathy Style)
- **Think Before Coding:** State assumptions, ask if uncertain, keep it simple.
- **Absolute Simplicity:** No speculative features, no unused abstractions, write minimal code.
- **Surgical Edits:** Touch only what's necessary. Clean up only your own mess.
- **Zero Band-Aid Rule:** Fix root causes (Auth, DB, UI, Types). Never hide errors with empty `try/catch`, fake defaults, or silent fallbacks.
- **Goal-Driven Execution:** Define verifiable success criteria before editing code.

## Stack & Commands
- **Stack:** Next.js (App Router, no `/src`), TypeScript strict (`no-any`), Tailwind CSS v4, pnpm.
- **Setup:** Alias `@/*` -> `./*`. Node v24+.
- **Commands:** `pnpm dev` | `pnpm build` | `pnpm lint` | `pnpm test` (`pnpm test:watch` en continu)

## Tests (vitest)
- **Test d'abord.** Toute fonction de `lib/` (génération d'URLs, fusion de blobs, verdicts de clés) s'écrit avec son test, et le test doit être vu rouge avant que le code existe.
- **Test de non-régression obligatoire** pour tout bug corrigé : le cas qui cassait devient un test nommé d'après le comportement attendu.
- Tests dans `tests/`, en TypeScript, import explicite `import { describe, expect, it, vi } from "vitest"` (pas de globales).
- Réseau interdit dans les tests : `fetch` est remplacé par un double (`vi.stubGlobal("fetch", …)`) qui reproduit les réponses réelles des services (Supabase, AllDebrid, addons).
- `pnpm test` doit passer avant tout commit, en plus de `pnpm lint` et `pnpm build`.

## Development Directives
- **UI Language:** All user-facing text, placeholders, tooltips, and messages MUST be in **French**.
- **Components:** Functional arrow functions. `"use client"` only when interactivity requires it.
- **Styles:** Tailwind v4 (Design tokens in `app/globals.css` under `@theme`, e.g. `--color-harmo-green`).
- **Accessibility:** WCAG, `focus-visible`, semantic HTML.
- **Routes:** Folder names must be in **English** (`dashboard/`, `aiometadata/`).
- **Git:** Branches `type/task_name_in_snake_case` (e.g. `feat/search_filter`). PR target `dev`.

## Graphify Tool
- Read `graphify-out/GRAPH_REPORT.md` or `graphify-out/wiki/index.md` before analyzing architecture.
- After code modifications, run `graphify update .`.
- `--update` / `--cluster-only` sont des commandes d'assistant (`/graphify <chemin> --update`) ; en terminal, utiliser les sous-commandes `graphify update .`, `graphify cluster-only .`, `graphify query "..."`.
- Les étapes LLM (étiquetage des communautés, extraction sémantique des docs) tournent sur Ollama en local : `OLLAMA_HOST` + `OLLAMA_MODEL` sont définis dans `~/.config/environment.d/50-graphify-ollama.conf`. Forcer explicitement si besoin : `graphify label . --backend=ollama`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
