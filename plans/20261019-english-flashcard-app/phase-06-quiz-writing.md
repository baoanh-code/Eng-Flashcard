# Phase 6 — Multiple choice and writing

## Overview

Add the two question-and-feedback study modes on the shared study frame. Their engines remain pure, use the same session/progress conventions, and expose answer feedback long enough for the learner to understand it before explicit navigation.

## Files

- Create quiz: `src/features/quiz/createQuestion.js`, `quizReducer.js`, `MultipleChoiceMode.jsx`, `AnswerOption.jsx`, `QuizSummary.jsx`.
- Create writing: `src/features/writing/writingReducer.js`, `WritingMode.jsx`, `WritingAnswerForm.jsx`, `WritingFeedback.jsx`, `WritingSummary.jsx`.
- Extend shared study/session components only where both modes need the change.
- Add focused tests and Playwright scenarios.

## Tasks

- [ ] **P6.1 Implement deterministic quiz question generation.** Select one correct record, unique distractor definitions from the same topic first and same level only when needed, exclude duplicate normalized definitions/the current record, randomize through injected RNG, and return 2–4 honest options when insufficient unique data exists.
- [ ] **P6.2 Implement multiple-choice transitions.** Track current question, selected option, answered/locked state, correct/incorrect totals, position, and completion. Selection shows feedback but never auto-advances; Next creates the following question and clears per-question state.
- [ ] **P6.3 Render accessible quiz controls.** Group prompt/options semantically, keep stable option buttons, label selected/wrong/correct with text + icon + color, expose the correct definition after an error, announce one concise result, and move focus to feedback/Next without trapping it.
- [ ] **P6.4 Implement strict writing comparison.** Reuse `normalizeAnswer` only; do not add edit distance, diacritic stripping, synonym acceptance, or fuzzy spelling. Preserve the raw user answer for feedback.
- [ ] **P6.5 Implement writing transitions.** Empty submissions show linked validation, submit locks the answer, correct/incorrect feedback shows the correct term and raw answer where relevant, explicit Next advances, and results track score/answered/accuracy.
- [ ] **P6.6 Render accessible writing form.** Visible label, appropriate autocomplete/autocapitalize/spellcheck behavior, Enter-to-submit only while unanswered, no global shortcut collision, and Next as a separate button after feedback.
- [ ] **P6.7 Complete shared summaries and progress.** Both modes expose question position, score, final results, restart, return-to-topic, and other-mode actions without writing vocabulary status unless the approved behavior explicitly classifies a word.

## Acceptance criteria

- Each quiz question has exactly one correct option and no duplicate displayed definitions; it prefers same-topic distractors and handles small datasets honestly.
- Correct and wrong selections remain visible until explicit Next; selection is locked after answer.
- Writing accepts capitalization/edge/repeated-whitespace differences and rejects materially misspelled/wrong terms.
- Incorrect writing feedback shows both the entered answer and correct term.
- Score, answered, incorrect, and accuracy values remain consistent through final summaries and restarts.
- Keyboard, screen-reader, touch, reduced-motion, mobile, optional example, empty-topic, and invalid-route behavior remain usable.

## Verification

- Unit tests use seeded RNG for quiz uniqueness/order/small pools and table-driven cases for writing normalization.
- Component tests cover unanswered/correct/incorrect/locked/next/summary states, empty validation, Enter handling, focus/live regions, and shortcut suppression.
- Playwright completes each mode once correctly and once incorrectly on desktop and mobile.
- Axe scan unanswered, error-feedback, and result states for both modes.

## Risks

- Repeated Vietnamese definitions can make multiple choices ambiguous. Uniqueness is based on normalized displayed definition, and the generator reduces option count rather than lying.
