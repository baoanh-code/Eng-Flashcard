# Phase 1 — Scaffold and design foundation

## Overview

Create the executable React/Vite baseline, install only the approved dependencies, translate `DESIGN.md` into reusable runtime tokens/primitives, establish routing/test conventions, and prove the shell builds before feature work begins.

## Files

- Create/update root tooling: `package.json`, `package-lock.json`, `index.html`, `vite.config.js`, `eslint.config.js`, `.gitignore`, `vercel.json` (final rewrite verified in Phase 9).
- Create boot/app structure: `src/main.jsx`, `src/app/App.jsx`, `src/app/router.jsx`, `src/app/providers.jsx`.
- Create styles: `src/styles/index.css`, `src/styles/tokens.css`.
- Create primitives: `src/components/ui/Button.jsx`, `IconButton.jsx`, `ProgressBar.jsx`, `TextField.jsx`, `StatusMessage.jsx`, `ConfirmDialog.jsx`, `EmptyState.jsx`.
- Create initial shell placeholders: `src/components/layout/AppShell.jsx`, `Header.jsx`, `MobileNav.jsx`, `SkipLink.jsx`, `PageContainer.jsx`.
- Create test setup: `vitest.config.js` or the Vite-integrated equivalent, `src/test/setup.js`, `tests/e2e/playwright.config.js` or root `playwright.config.js`.
- Create `README.md` with current runtime prerequisites and commands; do not duplicate the future vocabulary workflow until Phase 2.

## Tasks

- [ ] **P1.1 Scaffold current React/Vite JavaScript in place.** Preserve `PRODUCT.md`, `DESIGN.md`, `.hs.json`, `.agents/`, `.codex/`, and `plans/`; remove only disposable scaffold demo assets. Set the working title and document language/viewport metadata without implying an account.
- [ ] **P1.2 Install the minimal dependency set.** Add React Router declarative mode, Papa Parse, Tailwind’s Vite plugin, the approved icon package, ESLint, Vitest/jsdom/Testing Library, Playwright, and axe support. Record compatible versions in the lockfile and a supported Node engine in `package.json`.
- [ ] **P1.3 Establish scripts.** Include `dev`, `build`, `preview`, `lint`, `test`, `test:run`, `test:e2e`, and a placeholder-wired `validate:data` that Phase 2 completes. Make `build` depend on data validation once Phase 2 lands.
- [ ] **P1.4 Implement the design-token layer.** Mirror every normative `DESIGN.md` color, typography, spacing, radius, shadow, container, motion, breakpoint, and z-index value as semantic CSS variables/Tailwind theme values. Global styles set box sizing, canvas/ink, system font, focus-visible ring, reduced-motion baseline, safe wrapping, and `viewport-fit=cover`.
- [ ] **P1.5 Implement accessible UI primitives.** Cover default, hover, focus, active, disabled, error, and success behavior without feature logic. `ProgressBar` always supports a textual label/value; `ConfirmDialog` uses native `<dialog>` and restores focus; inputs require visible labels.
- [ ] **P1.6 Establish router and provider seams.** Add the final route shapes with placeholder page elements and a Not Found boundary so subsequent phases fill pages without changing the URL contract. Add page-title/focus-management hooks and a skip link.
- [ ] **P1.7 Establish test harnesses.** Add one token/primitives component test, one router smoke test, and a Playwright smoke test that loads `/` at desktop and mobile widths. Keep browser install/download work inside the build workflow’s normal dependency setup.

## Acceptance criteria

- `npm run dev`, `npm run lint`, `npm run test:run`, and `npm run build` are valid commands and pass for the scaffold.
- `/` and a nested placeholder route render through `BrowserRouter`; unknown paths reach the friendly Not Found placeholder.
- `DESIGN.md` values are represented once through semantic runtime tokens; feature components will not introduce arbitrary colors, radii, shadows, or spacing.
- All primitive controls have visible keyboard focus and at least 44×44px targets where interactive.
- The baseline has no account/avatar/notification/streak imagery or stock/generated photography.

## Verification

- Run `npm run lint`, `npm run test:run`, and `npm run build`.
- Run the Playwright smoke test at 320×720 and 1440×900; inspect for horizontal overflow and skip-link/focus behavior.
- Compare `src/styles/tokens.css` (and Tailwind theme mapping) against `DESIGN.md` token-by-token.

## Risks

- Scaffolding in a nonempty root can overwrite documents. Inventory paths first and use non-destructive creation; preserve all existing project context.
- Current package APIs may differ from examples in this plan. Adjust installation syntax to installed official versions while preserving the fixed architecture.

