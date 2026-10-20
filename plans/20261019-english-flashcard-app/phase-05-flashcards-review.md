# Phase 5 — Flashcards and review

## Overview

Implement the primary learning mode and reuse it for difficult-word review. This phase establishes the study-page frame, keyboard contract, session ordering, immediate progress persistence, accessible card flip, optional-field degradation, and completion summary used as the interaction quality bar for later modes.

## Files

- Create study frame: `src/pages/StudyPage.jsx`, `src/features/study/StudyLayout.jsx`, `ModeSwitcher.jsx`, `SessionProgress.jsx`, `SessionSummary.jsx`, `useStudyKeyboard.js`.
- Create flashcards: `src/features/flashcards/createFlashcardSession.js`, `flashcardReducer.js`, `FlashcardMode.jsx`, `Flashcard.jsx`, `FlashcardControls.jsx`, `StudyOrderControl.jsx`.
- Create review: `src/pages/ReviewPage.jsx`, `src/features/review/ReviewFlashcards.jsx`, `ReviewEmptyState.jsx`.
- Add focused unit, component, and E2E tests.

## Tasks

- [ ] **P5.1 Build the shared study route frame.** Validate `levelId`, `topicId`, and `mode`; render breadcrumb/topic, labelled mode navigation, compact progress, central workspace, and contextual secondary information below/adjacent only at ≥1024px. Unknown/empty inputs get explicit recovery.
- [ ] **P5.2 Implement session creation.** Snapshot original topic records, apply original/random order using injected shuffle, keep order stable through rerenders, initialize position/flip/classification counts, and update last session on entry/navigation without storing vocabulary objects.
- [ ] **P5.3 Implement the flashcard state machine.** Flip, previous, next, mark learned, mark review, and complete transitions are pure/reducer-driven. Moving between cards resets to front. Previous disables at first; Next advances and completes from the last card. Classification updates the current card but never auto-advances, so feedback and navigation remain under learner control.
- [ ] **P5.4 Render the text-first flashcard.** Front: term, optional IPA/part of speech, flip hint. Back: definition, optional example, optional example translation. Omit absent blocks and separators completely; allow card height to grow without content clipping.
- [ ] **P5.5 Implement accessible controls and shortcuts.** Click/Enter/Space on the flip surface flips; Left/Right navigates; buttons provide equivalent actions. Central guard suppresses shortcuts in editable/interactive contexts and for modified/default-prevented keys. Focus remains predictable when content changes.
- [ ] **P5.6 Persist classification.** Learned and Needs Review dispatch centralized actions immediately, remain visibly selected on the current card, and render text + icon + semantic color. Reclassifying the current card replaces its earlier session classification rather than double-counting it. Session counters represent the final classification of cards touched in this session; overall progress remains catalog/storage-derived.
- [ ] **P5.7 Complete summary/order behavior.** Original/Random control persists preference for future sessions, restarting a session snapshots a fresh order, and completion reports learned, review, total studied with restart/topic/next-mode actions.
- [ ] **P5.8 Reuse for Review.** Build the review route from canonical records referenced by review IDs. Marking Learned removes from review atomically; when none remain, transition to the empty review state rather than a broken card.
- [ ] **P5.9 Implement motion contract.** Use 240ms stateful flip on capable users and immediate/crossfade content replacement for reduced motion. No flip animation may hide content from screen readers or block classification.

## Acceptance criteria

- Flashcard renders every optional-field combination without empty labels, reserved image area, or layout breakage.
- Mouse/touch and keyboard can flip, navigate, classify, change order, and finish a session; typing contexts never trigger global shortcuts.
- Learned/review persist immediately, remain mutually exclusive, and survive reload.
- Progress shows textual position plus a labelled bar; summary counts only studied/classified session actions accurately.
- Review contains only current valid review IDs; Learned removes an item and final removal yields the empty state.
- Main card receives most screen width, respects defined dimensions, grows for long content/200% zoom, and becomes single-column on mobile.
- State feedback never relies on color alone and reduced-motion behavior preserves clarity.

## Verification

- Unit tests cover reducer boundaries, flip reset, original/random snapshots with seeded RNG, classification/session counts, and last-card completion.
- Component tests cover all optional combinations, keyboard guard matrix, focus behavior, progress ARIA, reduced motion, and review-to-learn.
- Playwright covers topic → flashcards → learn/review → reload → review → learn, at desktop and 320px mobile.
- Axe scan front, back, summary, and empty review states; manual screen-reader/live-region spot check.

## Risks

- A clickable whole card can create nested interactive controls. Keep audio/favorite controls out of the flip button; all classification/navigation controls remain siblings.
- Explicit Next adds one action after classification but prevents surprise and gives learners time to read status feedback; keep its position stable for fast repetition.

