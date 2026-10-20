Mode: local
Status: active

# A2 Vocabulary application implementation plan

## Outcome

Build the complete, production-ready, anonymous A2 vocabulary application defined by [PRODUCT.md](../../PRODUCT.md), [DESIGN.md](../../DESIGN.md), and the approved [Decision Brief](../reports/brainstorm-2026-10-19-english-flashcards.md). The application will be a static React/Vite SPA with topic-based vocabulary, four complete study modes, review and browsing tools, versioned local progress, responsive WCAG 2.2 AA-oriented UI, and Vercel-compatible routing.

## Repository baseline

- The repository contains product and design documentation only; there is no application, package manifest, test suite, Git metadata, or `AGENTS.md`.
- All paths in this plan are explicitly new unless they reference the three source documents above.
- Use the neutral working name **A2 Vocabulary**. Naming/brand work is outside this plan.

## Scope

### In

- React + Vite JavaScript application, React Router, Tailwind CSS, Papa Parse, and a small outlined icon library.
- Level-aware data discovery, CSV/TSV parsing, validation, normalization, diagnostics, deterministic IDs, catalog indexes, sample A2 fixtures, and a documented content workflow.
- Home, Topics, Topic, Study, Review, Vocabulary/Search, Progress, and Not Found/error surfaces.
- Flashcards, Multiple Choice, Writing, and Matching flows with session completion states.
- Centralized versioned `localStorage`, progress selectors/actions, confirmation-protected resets, and Continue Learning.
- CSV/TSV topic export.
- Unit, component/integration, accessibility, end-to-end, data-validation, responsive, performance, and production-build verification.
- Vercel SPA deployment configuration and direct-route verification.

### Out

- Accounts, authentication, roles, cloud sync, backend/API/database, admin/CMS, notifications, avatars, streaks, daily goals, activity feeds, social features, AI tutoring, audio generation, spaced repetition, leaderboards, and browser-based vocabulary authoring.
- Required or generated vocabulary imagery, stock photography, permanent desktop sidebars, and account-dependent gamification.
- Final production vocabulary authoring. Small fixtures establish and verify the system; real datasets can be dropped in later.
- Final public product name/logo and actual production deployment. Deployment configuration is included; publishing remains a separately authorized action.

## Fixed technical decisions

### Runtime and dependencies

- Scaffold the current Vite React JavaScript template in the repository root. Record the Node engine required by the installed Vite release (current official baseline: Node `20.19+` or `22.12+`) and commit the npm lockfile.
- Runtime packages: `react`, `react-dom`, `react-router`, `papaparse`, and `lucide-react` (or the current lightweight outlined equivalent if the scaffold already supplies one).
- Styling: current `tailwindcss` plus `@tailwindcss/vite`, with runtime CSS variables mirroring `DESIGN.md`. No CSS-in-JS or animation library.
- State: React context + reducer and focused hooks. No Redux/Zustand/MobX.
- Test/tooling packages: Vitest, jsdom, Testing Library, user-event, Playwright, `@axe-core/playwright`, and the scaffold’s ESLint tooling.
- Use React Router declarative mode with `BrowserRouter`; all data is local and the application does not need framework/server loaders.

### Application boundaries

```text
src/
├── app/                 # boot, providers, router, route helpers
├── components/          # reusable presentational/accessibility primitives
├── pages/               # route composition only
├── features/
│   ├── flashcards/
│   ├── quiz/
│   ├── writing/
│   ├── matching/
│   ├── progress/
│   ├── review/
│   ├── vocabulary/
│   └── topics/
├── data/
│   ├── vocabulary/      # source CSV/TSV, level-first
│   ├── topics/          # stable presentation metadata
│   ├── import/          # pure parser/normalizer/validator/catalog builder
│   └── catalog/         # Vite discovery adapter and cached level loader
├── hooks/               # cross-feature UI hooks only
├── services/            # local storage and download adapters
├── utils/               # general pure helpers
└── styles/              # Tailwind entry, tokens, global rules
scripts/                 # Node data validation adapter
tests/                   # test setup, fixtures, e2e
```

- Pages obtain canonical records through the catalog provider/hooks and progress through progress hooks. Pages never parse source files or call `localStorage`.
- Mode engines are pure functions/state transitions. Feature components render them and dispatch progress actions.
- Browser-specific adapters (Vite discovery, storage, file download) wrap pure domain logic so the latter can be unit tested in Node/jsdom.
- Build one catalog per requested level, cache it for the session, and precompute `Map` indexes and normalized search text. Do not parse or linearly regroup thousands of records during every render.

### Canonical vocabulary model

Every successfully imported record has the same fully populated shape:

```js
{
  id: string,                    // derived, stable, globally unique
  level: string,                 // stable lowercase CEFR ID, e.g. "a2"
  topicId: string,               // stable slug/config ID, e.g. "food-and-drinks"
  topic: string,                 // display name, e.g. "Food & Drinks"
  term: string,                  // required source value
  definition: string,            // required source value
  example: string | null,
  exampleTranslation: string | null,
  ipa: string | null,
  partOfSpeech: string | null
}
```

- Only `term` and `definition` are fundamentally required in a source row. `level`, `topicId`, and `topic` are required in canonical output but may be derived from directory, stable topic configuration, row topic, and filename.
- Optional fields normalize empty/whitespace-only values to `null` and render no empty placeholder block.
- Source-location information (`file`, `row`) belongs to diagnostics, not the canonical model.

### Data discovery and validation contract

- Sources live under `src/data/vocabulary/<levelId>/**/*.{csv,tsv}`. The initial sample files live under `a2/`.
- Browser adapter: lazy Vite `import.meta.glob` raw loaders, filtered by level. Loading a level imports its source chunks once, then caches the built catalog.
- Validation adapter: `scripts/validate-vocabulary.mjs` walks the same directory with Node filesystem APIs and invokes the same pure import pipeline. `npm run validate:data` exits nonzero on errors and prints file/row/code/message diagnostics; warnings remain visible but do not fail the command.
- Papa Parse handles quoting, embedded commas, CRLF/LF, delimiter parsing, and UTF-8 strings. CSV header keys are normalized case-insensitively with documented aliases for term, definition, example, topic, example translation, IPA, and part of speech.
- TSV auto-detects a recognized header row; otherwise column 1 is term and column 2 is definition. Empty lines are ignored. Unexpected extra columns or unknown headers produce warnings without discarding valid required data.
- Resolution order: level from directory (a conflicting rich-data level column is an error); topic metadata explicitly mapped to the source/alias; recognized row Topic; then a humanized filename fallback. Stable configured `topicId` wins over display-name changes.
- Normalize Unicode to NFC for stored display strings, trim boundaries, collapse accidental internal whitespace where safe, and normalize line endings. Preserve valid Vietnamese characters and punctuation.
- ID algorithm: normalized `level` + stable `topicId` + slug of normalized term, e.g. `a2-education-early-childhood-education`. Term definition/example edits do not change IDs. Duplicate normalized terms within a topic and any resulting ID collision are errors; never append array indexes or random suffixes.
- Error codes cover parse failure, malformed row, missing term, missing definition, unresolved/empty topic, invalid level, duplicate topic term, and duplicate ID. Invalid required rows are excluded from runtime data while valid rows survive; a validation command blocks release until errors are corrected.
- Catalog exposes immutable records plus `byId`, `byLevel`, `byTopic`, topics with computed `totalWords`, and pre-normalized search entries. Presentation metadata supplies `name`, `description`, and `icon`, never counts.

### Progress storage contract

- Key: `fl-eng.progress`.
- Version 1 payload:

```js
{
  version: 1,
  learnedIds: string[],
  reviewIds: string[],
  lastSession: null | {
    levelId: string,
    topicId: string,
    mode: "flashcards" | "multiple-choice" | "writing" | "matching",
    updatedAt: string
  },
  settings: {
    studyOrder: "original" | "random"
  }
}
```

- `learnedIds` and `reviewIds` are deduplicated, mutually exclusive, and persisted as arrays only at the adapter boundary; selectors use Sets/Maps in memory.
- `loadProgress` catches unavailable/corrupt JSON, validates shape/version, migrates known old versions, sanitizes IDs/enum values, and falls back to defaults without throwing.
- Reconcile selectors ignore orphan IDs not present in the current catalog; storage does not need destructive cleanup merely because a dataset changed.
- `markLearned(id)` removes `id` from review in the same reducer transition; `markReview(id)` removes it from learned. Reset-topic removes only IDs in that topic; reset-all replaces progress with defaults after confirmation.
- Storage writes occur in one service/subscription boundary. UI components only dispatch semantic actions.

### Routes

| Route | Surface | Invalid-state behavior |
|---|---|---|
| `/` | Lightweight Home for default/current A2 | Catalog error state retains navigation and recovery |
| `/levels/:levelId/topics` | Searchable Topics | Unknown level → friendly Not Found |
| `/levels/:levelId/topics/:topicId` | Topic dashboard + vocabulary list | Unknown topic/level → friendly Not Found |
| `/levels/:levelId/topics/:topicId/study/:mode` | One of four study workspaces | Invalid mode/topic → Not Found; empty topic → empty state |
| `/levels/:levelId/review` | Review-only flashcards | Empty review → explanatory empty state with Topics link |
| `/vocabulary` | Search/filter browser; `level`, `topic`, `status`, `q` in query string | Invalid filters fall back safely and remain editable |
| `/levels/:levelId/progress` | Overall and per-topic progress | Unknown level → Not Found |
| `*` | Not Found | Links to Home and A2 Topics |

- Header links resolve to A2 initially while route and data helpers remain level-parameterized. A visible level selector is not required until another level exists.
- Route changes update `document.title`, move focus to the route heading when appropriate, and preserve expected focus for in-page state changes.

### Study engines

- **Flashcards:** ordered/shuffled session snapshot, independent current index and flipped state, previous/next, Space flip, Left/Right navigation, learned/review actions, immediate persistence, and session summary. Ignore global shortcuts from inputs, textareas, selects, contenteditable nodes, modified keystrokes, and already-handled events.
- **Multiple Choice:** one correct definition plus up to three unique distractor definitions, same-topic first then same-level fallback. Randomize option order; never duplicate definitions. Lock the answered question, expose selected/correct states with text + icon + color, and wait for explicit Next. Track correct, incorrect, answered, accuracy, and summary.
- **Writing:** prompt with Vietnamese definition and optional example/context; compare lowercased, trimmed answers with repeated whitespace collapsed. Do not fuzzy-match spelling. Show user answer and correct answer on failure, then explicit Next; track score and summary.
- **Matching:** round size 6 by default, constrained to 5–8 when data permits and reduced honestly for a smaller remaining set. Independently shuffle term and definition buttons; allow one selection per side; correct pairs leave the active set after announcement; incorrect state clears after a brief controlled delay. Track remaining pairs, mistakes, round progress, and completion/next round. Clear timers on unmount and make reduced motion immediate.
- **Review:** derive records solely from current-level/topic-filtered review IDs and reuse flashcard engine/components. Learned removes the ID from review atomically.

### Accessibility and responsive contract

- Semantic landmarks, one H1 per route, skip link, labelled navigation, native buttons/inputs/dialogs, visible labels, logical DOM order, and no positive `tabindex`.
- `:focus-visible` ring is 2px Focus Cobalt with 2px offset and at least 3:1 non-text contrast. All meaningful text meets 4.5:1; large text and UI boundaries meet 3:1. Verify actual token pairs, not visual intuition.
- Correct/incorrect/learned/review states combine words, icon/shape, and color. Polite live regions announce feedback and summaries without announcing timers every second.
- Keyboard operation covers navigation, dialog dismissal/focus return, flashcards, answer choices, writing, matching, and mode selection. Matching uses native button groups/`aria-pressed`; mode links use `aria-current`, not faux tabs.
- Minimum target is 44×44px. Support 320px width, landscape, 200% zoom/reflow, long terms/translations, and touch/pointer/keyboard hybrids.
- Base/mobile is single column; at 768px navigation expands and secondary blocks may share space; at 1024px study context may sit alongside the central workspace but may not create a persistent sidebar. Maximum container is 1200px and study width is 1000px.
- Implement the `DESIGN.md` motion durations and replace flip/spatial motion under `prefers-reduced-motion`.

### Test and validation strategy

- Unit tests: header aliases, CSV quoting/UTF-8, headerless TSV, normalization, stable IDs, collision/duplicate diagnostics, catalog indexes, progress calculations, storage recovery/migrations, answer normalization, shuffle invariants, quiz distractors, matching state transitions, and export escaping.
- Component/integration tests: route states, first/returning home, topic counts, all four mode feedback/completion, keyboard guards, review transitions, search/filter URL state, confirmations, empty/error states, and optional-field omission.
- E2E (Playwright): first visit → topic → each mode; learn/review → reload persistence; review-to-learn; search/filter; topic reset; direct deep routes; mobile menu and mobile study; export download; 404 recovery.
- Accessibility: automated axe scans on representative home/topic/study/search/progress states plus manual keyboard order, focus visibility/restoration, live-region, zoom/reflow, reduced-motion, and non-color-state checks.
- Data/release gates: `npm run validate:data`, `npm run lint`, unit/component tests, Playwright, and `npm run build` all pass. Preview the built SPA and test direct navigation with the Vercel rewrite semantics.
- Performance: exercise a synthetic catalog of at least 5,000 records in pure catalog/search tests, confirm catalog creation is one-time/cached, verify no repeated parsing on navigation, inspect production chunks, and run Lighthouse on production preview with a target of ≥90 Performance and Accessibility on representative mobile settings (record exceptions rather than weakening functionality).

### Deployment contract

- Vite builds to `dist`; `npm run build` runs data validation before `vite build`.
- Add `vercel.json` with a same-app SPA rewrite from unmatched paths to `/index.html` so BrowserRouter deep links load correctly. Do not add Vercel Functions or the React Router framework preset.
- Verify Home and at least one nested study URL on a production-like preview. Deployment itself is not authorized by this plan.

## Phases

| Phase | Name | Depends on | Status |
|---|---|---|---|
| 1 | [Scaffold and design foundation](./phase-01-foundation.md) | Approved docs | Done |
| 2 | [Vocabulary import and catalog](./phase-02-vocabulary-data.md) | Phase 1 | Done |
| 3 | [Progress persistence and shared domain logic](./phase-03-progress-domain.md) | Phases 1–2 | Done |
| 4 | [Application shell and discovery pages](./phase-04-shell-pages.md) | Phases 1–3 | Done |
| 5 | [Flashcards and review](./phase-05-flashcards-review.md) | Phases 2–4 | Done |
| 6 | [Multiple choice and writing](./phase-06-quiz-writing.md) | Phases 2–5 | Done |
| 7 | [Matching](./phase-07-matching.md) | Phases 2–6 | Done |
| 8 | [Vocabulary, progress, export, and reset](./phase-08-library-progress.md) | Phases 3–7 | Done |
| 9 | [Production hardening and Vercel readiness](./phase-09-hardening.md) | Phases 1–8 | Done |

## Acceptance coverage

| Decision Brief criterion | Planned evidence |
|---|---|
| 1. Immediate anonymous study | Phases 4–7 route and E2E checks |
| 2. Approved IA and dominant study workspace | Phases 1, 4, 5, 9 responsive visual checks |
| 3. No component-hardcoded vocabulary | Phase 2 boundary tests; Phase 9 repository scan |
| 4. CSV/TSV/UTF-8/stable IDs | Phase 2 unit fixtures and validation CLI |
| 5. Required diagnostics | Phase 2 error-code tests and nonzero validation exit |
| 6. Derived counts | Phases 2–4 selector/component tests |
| 7. Four modes + review | Phases 5–7 component and E2E tests |
| 8. Persistent mutually exclusive status | Phases 3 and 5 reducer/storage/reload tests |
| 9. Search and filters | Phase 8 URL/integration/E2E tests |
| 10. Confirmed scoped resets | Phase 8 dialog and persistence tests |
| 11. UTF-8 export | Phase 8 unit and download tests |
| 12. Empty/error/optional states | Phases 2, 4–9 route/component tests |
| 13. Responsive/no overflow | Phases 1, 4–9 viewport, zoom, and real-device checks |
| 14. WCAG/keyboard/reduced motion | Every UI phase plus Phase 9 axe/manual audit |
| 15. Vercel build/deep routes/performance | Phase 9 release gate and production preview |

## Assumptions

- npm is the package manager because the repository has no contrary convention; the lockfile created in Phase 1 becomes authoritative.
- Modern evergreen browsers matching the installed Vite default target are supported; no legacy-browser plugin is added without evidence.
- The user-provided production data will be UTF-8 CSV/TSV. A UTF-8 BOM is tolerated and stripped by the importer.
- A source filename remains stable when it is used as fallback topic identity. Production datasets should add explicit stable topic metadata before renaming files/display topics.
- Real A2 content can replace/extend fixtures without changing study components or canonical consumers.
- Local progress is intentionally device/browser-specific and can be lost if site storage is cleared.

## Risks and controls

- **Stable-ID drift from topic/file renames:** prefer configured stable `topicId`, test display-name changes, and document rename/migration implications.
- **Malformed production files:** release-blocking validation CLI with source/row diagnostics; runtime keeps valid records and shows safe topic/catalog errors.
- **Large data causing repeated work:** lazy per-level imports, one-time cached parsing, precomputed indexes, memoized selectors, 5,000-record tests, and production profiling.
- **Keyboard conflicts:** centralized editable-target/modifier guard and mode-specific keyboard integration tests.
- **Randomized test flakiness:** inject RNG/shuffle functions into pure engines; tests use seeded/stubbed RNG.
- **Local storage corruption/quota/privacy restrictions:** defensive parse/write adapters, in-memory continuity, nonfatal status messaging only when persistence truly fails.
- **SPA deep-link 404s:** Vercel rewrite and production-like direct-route test.
- **Exact dependency APIs changing:** install current compatible releases in Phase 1, record versions/commands in the lockfile/README, and adapt only mechanical setup—not product architecture.

## Unresolved blockers

None. The missing production vocabulary dataset and final product name are explicitly non-blocking.
