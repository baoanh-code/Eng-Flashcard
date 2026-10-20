# Phase 7 — Matching

## Overview

Implement the remaining study mode as an explicit, testable state machine. The matching board must stay understandable without drag-and-drop, support keyboard/touch equally, scale down to narrow screens, and cleanly separate delayed visual feedback from game logic.

## Files

- Create `src/features/matching/createMatchingRounds.js`, `matchingReducer.js`, `MatchingMode.jsx`, `MatchingBoard.jsx`, `MatchCard.jsx`, `MatchingSummary.jsx`.
- Create `src/features/matching/useMismatchFeedback.js` only if a timer hook is needed.
- Add focused unit, component, fake-timer, and E2E tests.

## Tasks

- [ ] **P7.1 Create rounds.** Snapshot remaining topic records, use a default six-pair round, keep 5–8 pairs when enough remain, reduce to the honest remainder for small/final rounds, and independently shuffle term/definition sides through injected RNG. Pair identity uses vocabulary ID, never displayed text or index.
- [ ] **P7.2 Implement state transitions.** Track selected term ID, selected definition ID, matched IDs, temporarily incorrect pair, mistakes, round number, total completed, and a round-start timestamp. Allow selection replacement on the same side; evaluate only after one selection from each side.
- [ ] **P7.3 Handle correct/incorrect feedback.** Correct pairs announce success and leave/remove the active set in a stable way. Incorrect pairs remain visibly identified with text/icon/color, block only conflicting pair changes during the short feedback window, then clear for retry. Timer cleanup prevents state updates after route change/unmount.
- [ ] **P7.4 Render an accessible board.** Use native buttons in labelled term and definition groups, `aria-pressed` for selection, clear visible column headings/instructions, logical DOM/tab order, and a polite result message. Do not require drag, hover, or spatial adjacency to understand a pair.
- [ ] **P7.5 Complete progress and rounds.** Derive a visible `mm:ss` elapsed time from the round-start timestamp with a cleaned-up one-second display interval. Show pairs remaining, mistakes, elapsed time, and round/overall progress, but keep the timer outside live regions so it is not announced every second. Round completion freezes the elapsed value and offers explicit Next Round; final completion shows summary/restart/topic/mode actions.
- [ ] **P7.6 Adapt responsive layout.** Desktop uses balanced two-column groups inside the central workspace. Mobile preserves two semantically labelled compact columns when readable; if long content makes that fail, stack groups while retaining selected-pair context and no horizontal scrolling.
- [ ] **P7.7 Apply reduced motion.** Mismatch delay may shorten to immediate/minimal feedback while keeping the incorrect state perceivable through content, not animation.

## Acceptance criteria

- Every round contains unique record IDs, independent term/definition order, no index-based identity, and no duplicate active pair.
- Correct selections match only the same canonical ID; incorrect selections count one mistake and become retryable.
- Round sizes follow the 5–8 guidance when possible and handle topics with fewer records without filler/duplicates.
- All actions work by keyboard, touch, and pointer; selected/correct/incorrect/matched states are non-color-only and announced concisely.
- Mismatch and elapsed-display timers are deterministic under tests, cleaned on unmount, and do not block route navigation.
- Mobile/zoom/long-definition layouts remain readable without horizontal scrolling.

## Verification

- Reducer/unit tests cover round partitioning, seeded shuffles, same-side replacement, correct/incorrect evaluation, mistake counts, final small round, restart, and completion.
- Fake-timer component tests prove mismatch clearing and unmount cleanup.
- Keyboard integration test completes a round without pointer input.
- Playwright completes a multi-round session at desktop and mobile widths and checks no overflow.
- Axe scan default, selected, mismatch, round-complete, and final-summary states.

## Risks

- Two columns at 320px can become cramped with long translations. Use content-driven layout fallback and validate representative worst-case strings rather than forcing a desktop topology.

