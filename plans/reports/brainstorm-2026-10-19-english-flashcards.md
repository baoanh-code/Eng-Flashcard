---
title: Public A2 English flashcard learning experience
date: 2026-10-19
status: decided
---

# Public A2 English flashcard learning experience

## Intent / Problem

Create a production-ready public vocabulary-learning site for Vietnamese English learners. The initial release teaches practical CEFR A2 vocabulary by topic through flashcards, multiple choice, writing, and matching. A learner must be able to arrive, choose a topic and mode, study immediately, and retain progress on the same device without an account.

ForumFlash is the primary product and UX reference for the direct topic-to-study flow, concise topic presentation, large flashcards, and four-mode practice model. The implementation, branding, assets, copy, and visual identity must be original.

## Desired Outcome

- A complete responsive A2 learning surface built with React, Vite, React Router, Tailwind CSS, and JavaScript unless implementation evidence later justifies TypeScript.
- Static CSV/TSV vocabulary is imported into one canonical model, validated, and grouped by CEFR level and topic without vocabulary being embedded in components.
- Learners can complete all four study modes, review difficult words, browse/search vocabulary, inspect progress, export topic data, and reset progress deliberately.
- Learned/review state and the most recent study context survive refresh and browser restarts through versioned local storage.
- The architecture can add A1, B1, B2, and C1 without rewriting routes, data types, storage, or study logic.
- The shipped interface is fast, calm, Vietnamese-first, keyboard accessible, mobile friendly, and reasonably conforms to WCAG 2.2 AA.

## Constraints

- Public and anonymous: no authentication, accounts, avatars, roles, backend, API server, or database.
- Vercel-compatible static deployment; lightweight dependencies only.
- Do not copy ForumFlash source, branding, logo, exact styling, proprietary assets, copyrighted UI assets, or copy.
- Preserve UTF-8 Vietnamese text and CSV quoting correctly.
- Use vocabulary IDs—not array positions or full vocabulary objects—for progress.
- Centralize persistence and migration logic; components must not call `localStorage` directly.
- Derive all word/topic/progress counts from imported vocabulary plus stored IDs.
- Optional values such as example, example translation, IPA, and part of speech must disappear cleanly when absent.
- Avoid horizontal scrolling; controls need comfortable mobile touch targets.
- Accessibility includes contrast, semantic structure, visible focus, accessible names/labels, keyboard operation, non-color-only feedback, and reduced motion.

## Non-goals

- Accounts, cloud sync, authentication, admin tooling, user management, notifications, streaks, daily goals, activity feeds, social features, or account-dependent gamification.
- A backend, database, CMS, Firebase, Supabase, Express, Spring Boot, or heavyweight global state library.
- Stock/generated topic photography or required vocabulary imagery. Future images may be optional and must not reserve space when absent.
- Audio generation, spaced-repetition scheduling, AI tutoring, leaderboards, or content authoring inside the browser in the first release.
- A persistent desktop topic sidebar or a home-page productivity dashboard.
- Pixel-for-pixel reproduction of either visual probe.

## Domain Context

### Users and product posture

The primary users are Vietnamese students and independent learners at beginner to lower-intermediate level. They want practical everyday vocabulary in a simple, quick, low-pressure experience. Navigation and task instructions should be understandable with limited English; vocabulary terms remain English while guidance and definitions are primarily Vietnamese.

The default register is a task-focused product. The brand personality is clear, calm, and encouraging: academic but approachable, professional but not formal, and never childish.

### Information architecture

- **Header:** original logo/name, Home, Topics, Review, Vocabulary/Search, Progress. No account-shaped UI.
- **Home:** short introduction, A2 overview, actual topic/term totals, compact overall local progress, conditional Continue Learning, topic entry points, and quick access to the four modes. If a last topic exists, quick modes can resume it; otherwise they lead through topic selection.
- **Topics:** searchable responsive topic collection with actual word counts, learned counts, percentages, and overall A2 progress.
- **Topic:** name, description, word count, learned/review/progress summary, four modes, conditional difficult-word review, restart confirmation, and vocabulary list.
- **Study:** breadcrumb/topic name, compact mode switcher, dominant central workspace, progress, primary controls, and only contextual secondary information. No permanently reserved large sidebars.
- **Review:** flashcard study over review IDs, with Learned moving an ID atomically from review to learned.
- **Vocabulary:** term/definition search plus topic and status filters; expandable examples are optional.
- **Progress:** totals and per-topic progress derived from data and stored IDs.
- **Not found/error:** friendly recovery routes for invalid levels/topics and unavailable data.

### Visual and interaction direction

The confirmed direction combines Probe A's visual system with Probe B's study focus:

- Restrained color strategy: clean white and very light neutral surfaces, deep ink typography, and one cobalt/blue brand accent. Semantic success/warning/error colors are reserved for state and paired with text or icons.
- Light theme scene: a Vietnamese learner studies on a phone or laptop at a desk, on a commute, or between classes under mixed ambient light, focused and low-pressure. Strong contrast and low visual noise serve those conditions.
- Primary anchor: ForumFlash for learning flow, topic-to-mode directness, and flashcard simplicity. Supporting principles from the probes are compact professional navigation, clear typography hierarchy, subtle borders/shadows, familiar controls, and a spacious central study workspace.
- The home page stays lightweight. Progress is useful context, not dashboard chrome.
- Desktop is spacious and centered; tablet collapses secondary information; mobile becomes a single-column study flow.
- Flashcard content hierarchy is term, optional IPA/part of speech, Vietnamese meaning, example, then optional example translation.
- Motion communicates card flip, selection, feedback, and state changes only; all motion has a reduced-motion alternative.

### Key states

- First visit with zero local progress.
- Returning visit with a valid last topic/mode and Continue Learning.
- Topic with no progress, partial progress, and complete progress.
- Empty review list and populated review list.
- Default, flipped, learned, needs-review, previous/next, shuffled, and session-complete flashcard states.
- Unanswered, correct, incorrect, feedback, next-question, and result states for multiple choice.
- Empty input, submitted correct/incorrect, and result states for writing.
- No selection, one selection, correct pair, incorrect pair, round complete, and next-round states for matching.
- Empty search/filter result, malformed source file, partially valid source file, invalid topic/level, corrupt local storage, and not-found route.
- Confirmation states for topic reset and all-progress reset.
- Keyboard focus, disabled, loading (if necessary), and reduced-motion states for interactive controls.

### Data/import direction

- Store sources under a level-first structure such as `src/data/vocabulary/a2/*.csv|*.tsv`, with topic presentation metadata in a small configuration module separate from counts.
- Discover source files at build time through Vite rather than maintaining a hand-written import list. A documented drop-file workflow should make a new correctly named source file available after validation and rebuild.
- Use a proven parser such as Papa Parse for quoted CSV, delimiter handling, and UTF-8 safety. Normalize case-insensitive header variants, trim surrounding/repeated whitespace where appropriate, and ignore empty lines.
- Convert every accepted row to the canonical model: `id`, `term`, `definition`, `example|null`, `topic`, `level`, `ipa|null`, `partOfSpeech|null`, plus optional `exampleTranslation|null`.
- Generate deterministic IDs from normalized level + topic slug + term slug. Treat ID collisions and duplicate normalized terms within a topic as validation errors rather than adding unstable numeric suffixes.
- For TSV without headers, use the first two columns as term and definition. Resolve missing topic from explicit topic metadata first, then a humanized filename fallback.
- Return data and structured diagnostics from the import layer. Invalid required rows are excluded without destroying valid rows; malformed files/topics receive visible development/validation reporting and a safe production empty/error state.
- Provide a dedicated data-validation command/test so missing terms/definitions, empty topics, malformed rows, duplicate IDs, and duplicate topic terms fail verification before deployment.
- Calculate `totalWords` and every progress statistic from canonical records; topic metadata supplies only presentation fields such as name, description, and icon.

### Local progress direction

- Use one namespaced, versioned document containing learned IDs, review IDs, last topic, last mode, last studied timestamp, and settings such as shuffle/order.
- Learned and review are mutually exclusive sets. Marking one status removes the ID from the other status in the same state update.
- Sanitize parsed storage, recover to defaults when corrupt, and ignore orphaned IDs safely when vocabulary changes. Keep migration functions keyed by stored version.
- Expose progress through one provider/store plus focused hooks; do not add a third-party global state library unless later evidence requires it.

### Study behavior

- Flashcard click/Space flips; Left/Right navigates; shortcuts are ignored while typing or when modifier keys/interactive controls would make them surprising. Learned/Needs Review persist immediately. Original and shuffled order are session options, and a final summary reports session classifications.
- Multiple choice presents exactly one correct definition and up to three unique distractors, preferring the same topic. For very small datasets, show fewer honest options rather than duplicate definitions. Feedback persists until Next.
- Writing comparison is case-insensitive, trims boundaries, collapses repeated whitespace, and otherwise requires the correct term; it does not use fuzzy spelling acceptance.
- Matching uses responsive rounds of 5-8 pairs, reduced when the topic has fewer entries. Correct pairs leave the active set; incorrect pairs receive brief text/icon/color feedback before retry. Track pairs remaining, mistakes, and round progress.
- Export produces correctly escaped UTF-8 CSV (`Term,Definition,Example,Topic`) or TSV (`Term<TAB>Definition`) from loaded canonical records.

## Options Considered

| Option | Key assumption | Failure condition | Trade-offs |
|---|---|---|---|
| Probe A as a literal dashboard | Learners benefit from goals, recent activity, and dense summaries | Anonymous users experience clutter or account-like expectations | Polished overview, but adds unrequested features and weakens the direct learning flow |
| Probe B as a literal media-led workspace | Topic imagery improves recognition and warmth | Vocabulary lacks image data or imagery dominates the learning task | Strong focus, but creates asset cost and layout dependency |
| Confirmed hybrid | A restrained visual system plus a dominant, text-first study workspace best supports direct learning | Fails if secondary progress/navigation expands until it competes with the card | Preserves familiarity and focus while establishing an original identity |
| Runtime fetch of a manifest of static files | A manually maintained manifest is acceptable | New files are dropped in but omitted from the manifest | Simple runtime model, but violates the desired low-friction content workflow |
| Build-time source discovery and normalization | Vite can bundle raw sources and validation can run before deploy | Content must be updated without a rebuild | Best fit for static Vercel deployment, deterministic validation, and drop-file authoring |

## Decision

Build a static, anonymous, level-aware React learning product using the confirmed hybrid design direction and a build-time vocabulary import/validation layer. Use ForumFlash as the primary experience reference while preserving a clearly original cobalt visual identity, Vietnamese-first guidance, direct topic-to-mode navigation, and a text-first central study workspace.

Keep product state local and versioned, keep study engines independent of presentation, and derive every statistic from canonical vocabulary plus stored ID sets. Treat A2 as the first data slice rather than a special case in components or routes.

## Reasoning

The hybrid direction preserves the qualities the user values in ForumFlash—immediacy, clarity, compact topic presentation, and obvious practice modes—without inheriting its branding or overfitting to one dataset. Rejecting imagery and account-shaped dashboard features keeps the application fast, data-light, and honest about its anonymous local-only model.

Build-time source discovery is the smallest architecture that satisfies CSV/TSV flexibility, UTF-8 correctness, validation, stable IDs, Vercel deployment, and future CEFR expansion. A centralized versioned progress service prevents persistence rules from leaking into mode components and makes corrupted or older storage recoverable.

## Acceptance Criteria

1. A first-time visitor can reach an A2 topic and begin any of the four modes without signing in, configuring an account, or encountering account-like UI.
2. Header and page hierarchy match the confirmed information architecture; the home page remains lightweight, and the study workspace owns most of the available width without persistent large sidebars.
3. All vocabulary displayed by the UI originates from static CSV/TSV sources processed into the canonical model; no component embeds production vocabulary arrays.
4. Headered CSV and headerless two-column TSV import correctly with UTF-8 Vietnamese, whitespace normalization, optional values, topic derivation, and deterministic non-index IDs.
5. Automated validation reports missing term/definition, empty topic, malformed rows, duplicate IDs, and duplicate normalized terms within a topic; valid records remain usable when optional fields are absent.
6. Topic/level totals and learned, review, remaining, and completion statistics equal calculations from canonical data and local progress—not hard-coded metadata.
7. Flashcards, multiple choice, writing, matching, and difficult-word review implement the confirmed behavior and meaningful completion/result states.
8. Marking Learned and Needs Review persists by ID, keeps the two statuses mutually exclusive, survives reload/reopen, and safely recovers from corrupt or older local-storage payloads.
9. Search finds terms and Vietnamese definitions and filters by topic plus All/Learned/Needs Review/Not Studied status.
10. Topic and all-progress resets require confirmation and affect only their stated scope.
11. Topic export downloads valid UTF-8 CSV and TSV generated from the loaded canonical data.
12. Missing optional fields, no vocabulary, no review words, invalid routes/topics, and malformed source data produce useful states rather than an application crash.
13. Desktop, tablet, and mobile layouts avoid horizontal scrolling; mobile study is essentially single-column with readable cards and comfortable targets.
14. Keyboard users can navigate visible controls and operate all study modes; focus is visible; typing fields suppress global study shortcuts; feedback does not rely on color alone; contrast and semantics meet WCAG 2.2 AA where reasonably practical; reduced motion is honored.
15. The production build is Vercel-compatible, routes recover correctly on direct navigation, and the app remains lightweight and responsive with the intended A2 dataset and future multi-level organization.

## Open Questions / Risks

- The repository does not yet contain the promised vocabulary files. Implementation can establish representative fixtures and the full importer, but final content completeness and data quality depend on the real A2 sources being supplied.
- The final product name and logo are not defined. Use a reversible working identity during implementation or settle naming before public launch; do not imitate ForumFlash branding.
- `DESIGN.md` has not yet been seeded. The confirmed visual direction in this brief is sufficient for planning, while frontend preparation should translate it into exact tokens, typography, component states, and responsive rules before implementation.
- Browser-local progress does not sync across devices and can be lost when site data is cleared; this is an accepted consequence of the no-account/no-backend constraint and should be communicated unobtrusively where reset/export behavior is explained.
