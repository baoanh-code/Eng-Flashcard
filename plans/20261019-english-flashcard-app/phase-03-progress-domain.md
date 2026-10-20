# Phase 3 — Progress persistence and shared domain logic

## Overview

Create versioned local progress and pure shared study/progress utilities before pages and modes depend on them. This phase makes state transitions, corruption recovery, mutually exclusive statuses, computed progress, answer normalization, shuffling, and browser failure behavior independently testable.

## Files

- Create storage: `src/services/progressStorage.js`, `src/services/storageMigrations.js`.
- Create feature state: `src/features/progress/progressReducer.js`, `ProgressProvider.jsx`, `useProgress.js`, `progressSelectors.js`.
- Create pure utilities: `src/utils/shuffleArray.js`, `normalizeAnswer.js`, `isEditableTarget.js`, `formatPercent.js`.
- Create domain helpers: `src/features/topics/calculateTopicProgress.js`, `src/features/progress/reconcileProgress.js`.
- Create focused unit/integration tests beside modules.

## Tasks

- [ ] **P3.1 Define defaults and version registry.** Implement the documented version-1 payload, current storage key, valid mode/order enums, and an explicit migration map so future versions do not grow conditional parsing throughout the app.
- [ ] **P3.2 Implement defensive storage adapter.** Handle missing `window`, unavailable storage, invalid JSON, wrong root type, unsupported future versions, invalid timestamps/enums, duplicates, and write/quota exceptions without crashing. Return sanitized progress plus a nonfatal persistence status for the provider.
- [ ] **P3.3 Implement reducer actions.** Add mark learned, mark review, clear status, update last session, change study order, reset topic, reset all, and hydrate. Learned/review changes are atomic and mutually exclusive; timestamps use injected/current ISO time.
- [ ] **P3.4 Centralize persistence.** Provider initializes once, keeps Sets/Maps in derived memory rather than storage, and serializes through the service after semantic state changes. Components never access `localStorage` directly.
- [ ] **P3.5 Implement selectors.** Compute level/topic totals, learned, review, not studied, completion percentage, continue-learning target, and filtered review records from current catalog IDs. Ignore orphan IDs safely and never count one ID in two statuses.
- [ ] **P3.6 Implement shared study utilities.** Fisher–Yates shuffle returns a copy and accepts injected RNG; answer normalization lowercases, trims, and collapses whitespace only; editable-target guard covers input/textarea/select/contenteditable and modified/default-prevented keyboard events.
- [ ] **P3.7 Prove persistence lifecycle.** Integration harness marks statuses, remounts provider, reloads state, reconciles catalog changes, and exercises storage parse/write failures.

## Acceptance criteria

- Status changes persist by ID and survive provider remount/page reload simulation.
- Learned and review sets remain disjoint after every reducer action and migration.
- Corrupt, unavailable, future-version, or partly invalid storage falls back/sanitizes without an application crash or data-object leakage into storage.
- Counts and percentages come only from current catalog records plus valid status IDs.
- Reset topic removes only that topic’s IDs and relevant last session; reset all restores documented defaults.
- `normalizeAnswer` accepts only case/trim/repeated-space differences and does not fuzzy-match spelling.
- There are no direct `localStorage` calls outside the storage service/tests.

## Verification

- Run reducer/property-style transition tests over status sequences and assert set disjointness.
- Run storage/migration fixtures for empty, corrupt, valid v1, unknown version, duplicated IDs, invalid settings, write failure, and catalog orphaning.
- Run selector tests across zero/partial/complete progress and multiple topics/levels.
- Run repository search for `localStorage` and confirm only the adapter/test boundary contains it.

## Risks

- React development Strict Mode can initialize effects twice. Keep initialization/persistence idempotent and test under Strict Mode.
- Browser privacy/quota behavior varies. Continue in memory and surface persistence failure unobtrusively rather than blocking study.
