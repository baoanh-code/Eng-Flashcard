# Phase 9 — Production hardening and Vercel readiness

## Overview

Run the complete release candidate through data, functional, accessibility, responsive, performance, and deployment checks. Fix only evidence-backed defects within the approved scope, reconcile documentation with the shipped system, and leave a verified static artifact ready for an explicitly authorized deployment.

## Files

- Finalize `vercel.json`, `README.md`, `docs/vocabulary-data.md`, package scripts/config.
- Add/complete Playwright projects and E2E specs under `tests/e2e/`.
- Add any test-only large-catalog generator under `tests/fixtures/` (never production data).
- Create implementation evidence in `plans/20261019-english-flashcard-app/implementation-notes.md` during `hs-build`, not during planning.
- Reconcile `DESIGN.md` only if actual token names/values differ mechanically; do not reopen the approved direction.

## Tasks

- [ ] **P9.1 Run data/repository integrity checks.** `validate:data` passes; scan confirms production vocabulary appears only in source files/fixtures, study components do not contain vocabulary arrays, counts are not hard-coded, and direct `localStorage` calls remain centralized.
- [ ] **P9.2 Complete the full automated suite.** Run lint, unit/component tests, E2E across Chromium plus the smallest practical cross-browser set, and production build. Resolve flakiness by controlling RNG/timers rather than weakening assertions.
- [ ] **P9.3 Audit complete user journeys.** First visit, returning Continue Learning, all four modes, learn/review/reload, empty review, search/filter, exports, topic reset, all reset, invalid routes, corrupt storage, and partially malformed data.
- [ ] **P9.4 Perform WCAG 2.2 AA-oriented audit.** Axe representative states, keyboard-only walkthrough, skip link, route focus, dialog trap/return, live regions, non-color feedback, label/name/role/value, 200% zoom/reflow, 320px width, text spacing override, color/token contrast, forced-colors spot check, and reduced motion.
- [ ] **P9.5 Perform responsive/device audit.** Check 320, 375, 768, 1024, 1440, landscape phone/tablet, coarse pointer, keyboard, and at least one real/remote iOS and Android browser when available. Confirm no permanent sidebars, clipped overlays, or horizontal scrolling.
- [ ] **P9.6 Perform performance audit.** Verify lazy level chunks, one-time catalog parsing, memoized selectors, no avoidable rerender loops, production asset sizes, and 5,000-record interaction. Run Lighthouse against `vite preview`; target ≥90 Performance and Accessibility on representative mobile and document justified exceptions.
- [ ] **P9.7 Finalize Vercel behavior.** Configure build output `dist` and SPA fallback rewrite, then use a production-like server or Vercel preview only if authorized. Verify `/`, a topic URL, each study-mode URL, review, vocabulary query URL, progress, static assets, and client 404 behavior on direct navigation/refresh.
- [ ] **P9.8 Reconcile documentation.** README records install/dev/test/build/preview commands, Node requirement, local-only progress limitation, architecture map, data workflow link, Vercel setup, and working-name status. Ensure documents match actual file names and installed commands.
- [ ] **P9.9 Run frontend validation/finish.** Invoke the frontend domain check and finish workflow on the exact release candidate, address in-scope findings, then rerun the smallest affected gates plus the full release gate.

## Acceptance criteria

- `npm run validate:data`, `npm run lint`, `npm run test:run`, `npm run test:e2e`, and `npm run build` pass on the release candidate.
- All 15 Decision Brief acceptance criteria have recorded evidence in implementation notes.
- Representative pages have no serious/critical axe findings; manual keyboard, focus, contrast, reflow, reduced-motion, and non-color checks pass.
- Production preview works on direct nested URLs and refresh with no asset rewrite regression.
- Several-thousand-entry catalog/search use remains responsive and does not reparse sources per navigation/render.
- UI matches `DESIGN.md`, contains none of the explicit excluded features/assets, and does not imply an account.
- README/data docs allow another developer to add a file, validate, test, build, and prepare Vercel deployment without modifying study components.

## Verification

- Execute and record the complete release command set and relevant versions.
- Capture screenshots at representative desktop/tablet/mobile states for visual comparison and overflow review.
- Record Lighthouse/axe/manual audit results and direct-route checks in `implementation-notes.md`.
- Run `rg` checks for forbidden boundaries: direct `localStorage`, hard-coded vocabulary in UI, account/streak/notification artifacts, and hard-coded topic counts.

## Risks

- Real-device or hosted Vercel preview access may require user/environment availability. Local production preview and browser projects remain required; record any unavailable external check without claiming it passed.
- Lighthouse scores vary by host. Use a consistent production preview, repeat anomalous runs, and diagnose regressions rather than chasing a single number.

## External action boundary

Creating a Vercel project, linking an account, or publishing a production deployment is not authorized by this plan. `hs-build` may prepare and locally verify configuration; outward deployment requires a separate explicit user request.
