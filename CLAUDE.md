# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured. There is no single-test command.

## Environment

Requires `.env.local` with:
- `OPENAI_API_KEY` — used by the evaluation server action
- `OPENAI_EVAL_MODEL` — model for drill evaluation (default: `gpt-4o-mini`)

## Architecture

**Stack:** Next.js (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Zod v4, OpenAI SDK.

**Persistence:** All user state lives in browser `localStorage`. No database, no server-side session. Storage keys are prefixed `amo_` and typed via `/src/core/storage/schema.ts`. Generic helpers in `/src/core/storage/index.ts`.

**Content layer** (`/src/core/content/`):
- `drills.ts` — master list of 100+ drill definitions
- `domains.ts` — 8 training domains with metadata
- `weeks/week01.ts`…`week24.ts` — 24-week structured curriculum
- `registry.ts` — lookup index over the above

**Drill types** (5): `prompt_construction`, `prompt_debug`, `output_analysis`, `live_challenge`, `scenario_simulation`. Each drill definition includes a `successCriteria` rubric array (3–8 items, total maxPoints = 100) used by the evaluator.

**Evaluation flow** (`/src/app/actions/evaluateDrill.ts`):
1. Prompt-injection guard (`/src/lib/contracts/guards.ts`)
2. OpenAI call via `/src/lib/ai/callOpenAI.ts` (wrapper around gpt-4o-2024-08-06 by default, overridden by `OPENAI_EVAL_MODEL` for evaluation)
3. Prompt template from `/src/lib/prompts/evaluator.ts`
4. Zod parse of JSON response against `/src/lib/contracts/evaluation.ts`
5. Deterministic structural penalty applied on top of AI score
6. `mastered` decision = score ≥ 85 AND no critical misses

**Zod contracts** (`/src/lib/contracts/`): `drill.ts`, `evaluation.ts`, `revision.ts`, `guards.ts`. All external AI responses are parsed through these schemas; fallback parsing handles malformed JSON.

**Scoring formula** (operator score): `(domainAvg × 0.5) + (arenaBest × 0.35) + (labAvg × 0.15)`

**UI structure:**
- `AppShell.tsx` — persistent nav/layout; hidden during active drill sessions
- `/src/app/train/[drillId]/` — drill execution route
- Drill-type components live in `/src/components/drills/`
- Pages: `/`, `/curriculum`, `/mastery`, `/arena`, `/lab`, `/library`, `/portfolio`, `/profile`, `/settings`, `/run`

## Key Conventions

- Add new drills to `/src/core/content/drills.ts`; follow the existing typed structure, ensuring rubric `maxPoints` sums to 100.
- Server actions (in `/src/app/actions/`) are the only server-side code; all other logic is client-side.
- Use the generic `getItem<T>` / `setItem<T>` API from `/src/core/storage/index.ts` for any new localStorage access — do not read/write `localStorage` directly.
- Evaluation prompt engineering lives in `/src/lib/prompts/evaluator.ts`; revisions live in `/src/lib/prompts/revisionCoach.ts`.
