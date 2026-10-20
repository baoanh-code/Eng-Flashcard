# Phase 8 — Vocabulary, progress, export, and reset

## Overview

Complete the supporting learning tools: full vocabulary browsing, URL-addressable filters, progress overview, export, and confirmation-protected reset. This phase closes the product loop around the four study modes without turning Home into a dashboard.

## Files

- Create vocabulary: `src/pages/VocabularyPage.jsx`, `src/features/vocabulary/VocabularyFilters.jsx`, `VocabularyList.jsx`, `VocabularyRow.jsx`, `filterVocabulary.js`.
- Create progress: `src/pages/ProgressPage.jsx`, `src/features/progress/ProgressSummary.jsx`, `TopicProgressList.jsx`.
- Create export: `src/services/vocabularyExport.js`, `src/services/downloadFile.js`, `src/features/vocabulary/ExportMenu.jsx`.
- Create reset: `src/features/progress/ResetTopicDialog.jsx`, `ResetAllDialog.jsx`.
- Complete Topic vocabulary list and reset action.
- Add unit, component, E2E, accessibility, and download tests.

## Tasks

- [ ] **P8.1 Implement normalized search/filter selectors.** Search cached normalized term and definition text; filter by level, topic, and All/Learned/Needs Review/Not Studied using mutually exclusive progress semantics. Keep `level`, `topic`, `status`, and `q` in `URLSearchParams` with safe fallbacks for invalid values.
- [ ] **P8.2 Build Vocabulary page/list.** Render term, definition, topic, status text/icon, and optional expandable example details. Use semantic list/table structure that reflows on mobile, paginate or render incrementally only if profiling shows thousands of rows need it, and show a useful empty-filter state.
- [ ] **P8.3 Complete Topic vocabulary list.** Reuse vocabulary row/filter primitives rather than duplicating data formatting. Keep it secondary to study-mode entry.
- [ ] **P8.4 Build Progress page.** Show total, learned, review, not studied, completion percentage, and per-topic textual/linear progress from selectors. Avoid decorative hero metrics and charts that duplicate labels.
- [ ] **P8.5 Implement export serialization.** CSV emits UTF-8 BOM plus correctly escaped `Term,Definition,Example,Topic`; TSV emits UTF-8 BOM plus `Term<TAB>Definition`, normalizing tabs/newlines safely. Use current canonical topic records/order and deterministic filenames; never export progress state or internal IDs.
- [ ] **P8.6 Implement download adapter.** Create/revoke object URLs reliably, use correct MIME/type/extension, and expose explicit CSV/TSV controls with accessible names. Test serialization separately from browser download.
- [ ] **P8.7 Wire topic reset.** Native confirmation dialog names the topic and impact; confirm dispatches scoped reset, cancel/Escape makes no change, and focus returns to the trigger.
- [ ] **P8.8 Wire all-progress reset.** Place it on Progress as a clearly secondary/destructive action. Dialog describes device-local scope; confirm resets status/last session/settings to defaults. One click can never clear progress.
- [ ] **P8.9 Close empty/error states.** Verify empty search, no review, no vocabulary, malformed partial file, invalid filter, missing optionals, reset-to-zero, complete topic, and export with missing examples.

## Acceptance criteria

- Search matches English terms and Vietnamese definitions case-insensitively with whitespace normalization; filters combine predictably and are shareable/back-button friendly through the URL.
- Status filters exactly partition valid records into learned, review, and not studied.
- Progress totals and every per-topic percentage reconcile with canonical records/current IDs.
- CSV/TSV downloads are valid UTF-8, correctly escaped, sourced from the current topic, and contain no stored progress/internal IDs.
- Reset dialogs require explicit confirmation, preserve state on cancel, and limit mutation to stated scope.
- Thousands of entries remain responsive based on profiling; optimization is evidence-driven and preserves semantic/accessibility behavior.
- All supporting pages remain text-first, responsive, keyboard accessible, and visually subordinate to the learning task.

## Verification

- Unit tests cover combined filters, query parsing/serialization, status partition, percentage math, CSV quoting/newlines/commas/quotes, TSV tabs/newlines, BOM, and deterministic filenames.
- Component tests cover URL updates/history, expand/collapse, empty results, progress states, dialog focus/cancel/confirm, and export controls.
- Playwright covers search/filter/back navigation, export download contents, topic reset scope, all reset, and persisted zero state.
- Profile representative 5,000-record search/list updates; confirm no source reparsing and acceptable interaction response.
- Axe scan Vocabulary, empty results, Progress, and open confirmation dialogs.

## Risks

- Rendering thousands of expanded rows can be expensive. Start semantic and simple; add pagination/windowing only after measurements, and preserve search result counts plus keyboard navigation.
- CSV formula injection matters when opening exported terms in spreadsheets. Prefix dangerous leading `=`, `+`, `-`, or `@` cells with an apostrophe during export and test this explicitly.

