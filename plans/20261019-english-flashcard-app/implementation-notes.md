# Implementation notes

Date: 2026-10-19

## Release-candidate summary

- Implemented the static React/Vite application from the approved `PRODUCT.md`, `DESIGN.md`, and Decision Brief.
- The neutral working name remains **A2 Vocabulary**.
- No backend, account, database, photography, permanent sidebar, daily-goal, streak, notification, activity-feed, or avatar surface was introduced.

## Material implementation decisions

- Browser vocabulary discovery uses lazy raw Vite glob imports and a per-level promise cache. The Node validator invokes the same pure catalog builder.
- Progress is versioned under `fl-eng.progress`; reducers own semantic transitions and only the storage adapter accesses `localStorage`.
- Mobile study-mode navigation was changed from a horizontal strip to a two-by-two grid after the 390px visual capture showed the fourth label only partially visible. Desktop remains a compact four-column switcher.
- Matching rounds rebalance 14 records to 7/7 rather than 6/6/2, keeping 5–8 pairs per round whenever the remaining set permits it.
- Runtime data errors retain valid records; release builds still fail on validation errors.

## Verification evidence

- Data: 24 UTF-8 sample entries, 3 topics, 1 level; CSV, headerless TSV, stable IDs, malformed headers, collision diagnostics, and a synthetic 5,000-record catalog are covered.
- Unit/component suite: 14 files and 33 tests passed before the final release run.
- Browser suite: 21 checks passed across desktop Chromium and Chromium mobile emulation (with one intentionally inapplicable desktop mobile-menu check skipped). They cover first visit, direct topic route, flashcard persistence/review, multiple choice, writing, matching via keyboard, search, UTF-8 export, 320px overflow, mobile-menu focus, reset confirmation, and representative axe scans.
- Visual captures: `test-results/visual/home-desktop.png` and `test-results/visual/flashcards-mobile-final.png` were inspected against the approved hierarchy and responsive rules.
- Production build: Vite emitted lazy vocabulary chunks and a 107.96 kB gzip application chunk in the final release run.
- The final axe sweep initially exposed a WCAG 2.5.3 label/content-name mismatch on the flashcard button. Removing the incomplete custom label let the semantic button name include all visible card text; the full desktop/mobile axe sweep then passed with no serious or critical findings.
- Production preview returned the SPA shell for Home, topic, matching, review, vocabulary query, progress, and client-404 direct URLs.
- Integrity scans found direct `localStorage` access only in `src/services/progressStorage.js`, no vocabulary arrays in UI code, no manual topic totals, and none of the excluded account/gamification terms in `src/`.

## Environment limits

- No real or remote iOS/Android device was available. Chromium desktop, iPhone-sized Chromium emulation, explicit 320px viewport checks, keyboard navigation, and screenshots were used instead.
- Lighthouse is not installed in the repository, so no score is claimed. Bundle output, the 5,000-record catalog test, cached parsing boundary, browser responsiveness, and axe checks provide the available local performance/accessibility evidence.
- The workspace is not a Git repository, so no commit or revision can be recorded.
- No Vercel project was created and no deployment was performed; this remains outside the authorized build scope.
