---
name: "A2 Vocabulary"
description: "An editorial, text-first vocabulary learning experience for Vietnamese English learners."
colors:
  study-blue: "#0F6667"
  study-blue-hover: "#0A5658"
  study-blue-active: "#07484A"
  study-blue-soft: "#DFF4F2"
  study-blue-selected: "#C9E9E6"
  ink: "#102F3B"
  body: "#3F5660"
  muted: "#536870"
  canvas: "#F7FBFA"
  surface: "#FFFFFF"
  surface-subtle: "#EDF5F4"
  border: "#CCDCDD"
  border-strong: "#71898D"
  success: "#23613F"
  success-soft: "#E9F4ED"
  success-border: "#80AA90"
  review: "#855414"
  review-soft: "#FBF1DF"
  review-border: "#CBA767"
  error: "#A53333"
  error-soft: "#FAECEB"
  error-border: "#D58D89"
  focus: "#146985"
  highlight: "#2BC1B6"
  highlight-ink: "#08766F"
  highlight-soft: "#DDF5F1"
  accent: "#B83C4D"
  accent-soft: "#FBE8EB"
  sun: "#825400"
  sun-soft: "#FFF0C4"
  blue: "#236DA8"
  blue-soft: "#E6F1FB"
  study-card: "#0B5657"
  exercise-surface: "#F1F6F5"
typography:
  display:
    fontFamily: "ui-serif, Iowan Old Style, Palatino Linotype, Book Antiqua, Palatino, Georgia, serif"
    fontSize: "3.75rem desktop / 2.75rem mobile"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "display stack"
    fontSize: "2.75rem"
    fontWeight: 500
    lineHeight: 1.04
  section-title:
    fontFamily: "display stack"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "body stack"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "body stack"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"
  24: "96px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px, semantic progress tracks only"
containers:
  page: "1088px"
  study: "864px"
  reading: "68ch"
header:
  mobile: "60px"
  desktop: "64px"
motion:
  instant: "120ms"
  state: "180ms"
  layout: "220ms"
  easing: "cubic-bezier(0.25, 1, 0.5, 1)"
---

# Design system: The Open Vocabulary Library

## Direction

A2 Vocabulary is an editorial learning library, not a dashboard. Its visual character comes from language itself: expressive serif vocabulary, quiet sans-serif controls, numbered topic rows, compact facts, and crisp typographic rules. The interface should feel like a carefully typeset public study resource—calm enough for repetition, clear enough for beginners, and immediately usable without an account.

Direction C is the shared color language across the application. Deep teal anchors the Home masthead, flashcard canvas, overall progress summary, and footer. Turquoise marks learning momentum, coral marks primary calls to action and review attention, while yellow and clear blue provide occasional supporting surfaces. Most content remains on white or cool-neutral canvas so the color feels intentional rather than decorative. Photography, illustration, gradients, decorative metrics, gamification, and account UI remain prohibited.

## Composition

- Global container: min(100% - 32px, 1088px) on mobile and min(100% - 48px, 1088px) from 768px.
- Study container: 864px, centered.
- Reading measure: 68ch.
- Page sections separate with 48–80px, while related items use 8–24px.
- Prefer rules, alignment, and whitespace over bounded cards.
- Desktop may use an asymmetric two-column composition when one side is clearly primary.
- Tablet collapses secondary context below or alongside only when both areas remain readable.
- Mobile is recomposed as a single task column; it is never a mechanically stacked desktop grid.
- No permanent sidebars.

## Typography

Use the system-safe editorial serif stack for the Home statement, page and section headings, topic names, English vocabulary terms, large definitions, exercise prompts, and significant progress numerals.

The Home statement is 3.75rem/0.98 on desktop and 2.75rem/0.98 on mobile. Page titles are 2.75rem/1.04. Section titles are 2rem/1.15. Weight stays near 500; hierarchy comes from scale and space rather than ubiquitous bold.

The flashcard term uses clamp(3rem, 9vw, 5.5rem) with -0.04em tracking and a 0.95 line height. It may wrap and must remain readable at 200% zoom.

Use Segoe UI/system UI for body copy, navigation, controls, labels, metadata, Vietnamese guidance, and form fields. Body copy is never below 1rem. Labels are 0.875rem; nonessential metadata is 0.8125rem.

English terms receive stronger typographic presence than UI copy. Vietnamese instructions remain direct, natural, and short.

## Color

- Deep teal is the principal anchor color: primary buttons, key learning surfaces, Home masthead, progress summary, and footer.
- Turquoise may highlight learned actions, topic numbers, progress fills, and restrained CSS geometry. Coral is limited to primary Home/exercise calls to action, active mode rules, review actions, and exercise labels.
- Yellow and blue are supporting colors for alternating topic numbers, one page-heading surface, and mode icons; they never carry correctness or status.
- Secondary page headings may use one quiet tinted surface. The page structure and hierarchy must not change to accommodate color.
- Canvas is a true near-neutral with a very slight cool cast, not cream or generic blue-gray.
- Ink is used for headings and primary learning content.
- Body and muted colors retain WCAG AA contrast on canvas and surface.
- Semantic green, amber, and red always appear with explicit text and/or icons.
- Color never carries correctness or status alone.
- No gradients.

## Depth, borders, and radius

- The system is flat by default.
- Use 1px horizontal rules to create editorial structure.
- Use full borders only for controls, matching objects, dialogs, and feedback states.
- Shadows are reserved for the open mobile menu, dialogs, the Home facts bridge, and the primary study task.
- Buttons and fields use 8px radius.
- Matching objects use 4px radius.
- Large radii are not a signature motif; 16px is the maximum ordinary surface radius.
- Pills are limited to inherently pill-shaped progress tracks or compact semantic needs.

## Navigation

- Header is 60px mobile and 64px desktop.
- Brand treatment is typographic: serif A2 plus quiet Vocabulary.
- Desktop navigation is plain text with an underline for the active route.
- Mobile uses the existing accessible menu, 44px trigger, focus transfer, Escape handling, and focus restoration.
- Breadcrumbs stay muted and compact.

## Home

- Use a single-column editorial masthead with one primary CTA.
- Follow the masthead with one compact ruled facts row: topic count, vocabulary count, level, and learned count.
- Present the complete topic library as numbered editorial rows before the learning modes.
- Learning modes are text-led ruled actions with one small functional line icon each. Do not add decorative icons or illustrations.
- The first viewport establishes purpose and one obvious start action; progress never becomes a hero widget.

## Topics and topic detail

- Topic discovery uses a numbered ruled list rather than repeated cards.
- Each row includes its sequence number, `A2 TOPIC NN` label, topic name, vocabulary count, optional learned count, and one clear link target.
- Topic detail prioritizes the topic title, concise description, progress, modes, and vocabulary preview.
- Mode choices remain text-led and use a readable 2×2 action grid on desktop, collapsing to one column on mobile; icon, title, description, and arrow must never overlap.
- The vocabulary preview uses one softly tinted section with a contiguous ruled list, not widely separated text floating across the page.
- Reset remains visually secondary.

## Study workspace

- The study area is the visual centerpiece.
- Context includes topic learned/review counts, topic label, title, description, and mode navigation before the task.
- Mode navigation is a flat four-column treatment with a small tinted icon tile, one-line explanation, and thin coral active rule; on mobile it becomes a visible 2×2 grid.
- The current task uses the majority of the viewport.
- Session progress is a 4px ruled bar paired with a textual fraction.

### Flashcards

- Flashcard front is a compact deep-teal study surface with white vocabulary, a restrained cyan corner shape, a 16px radius, and one soft shadow. The flipped side returns to a pale cool surface so the state change is obvious without animation.
- Desktop minimum height: 360px. Mobile minimum height: 328px.
- Front order: English term, IPA, part of speech.
- Back order: English context term, Vietnamese definition, example, translation.
- Learned/review controls form the semantic action group.
- Previous and Next are quiet arrow controls around the central Learned / Needs Review actions.
- Keyboard hints are secondary and hidden on narrow mobile after the visible controls make the interaction clear.

### Multiple choice

- Present the prompt as a large editorial word.
- Answers are ruled rows with letter markers, not four rounded cards.
- Correct and incorrect feedback uses text, icons, and semantic color.

### Writing

- Present one strong Vietnamese prompt.
- The answer field resembles a writing line with a persistent label.
- Check is the only primary action before feedback.

### Matching

- Cards are justified because selection requires distinct objects.
- Use white surfaces, 1px borders, 4px radius, and no shadow.
- Selected, mismatch, and matched states remain keyboard accessible and non-color dependent.

## Vocabulary library

- Treat vocabulary as a reading/reference library.
- Filters use visible labels and light underline controls.
- Export actions are secondary text controls.
- Each row pairs a prominent serif English term with its Vietnamese definition.
- Topic and status are quiet metadata.
- Examples expand beneath the row with a single editorial rule, not a nested card.

## Progress and review

- Progress uses one real overall summary and ruled topic rows.
- The percentage may be prominent because it represents actual learner state; it must remain paired with a textual description and exact counts.
- No decorative statistics, charts, goals, or streaks.
- Review uses the same canvas and controls as ordinary flashcards.
- Empty review is a concise, useful state with a route back to topics.

## Controls and states

- All controls have at least a 44×44px target.
- Primary buttons use deep teal and white; coral is reserved for the Home and exercise calls to action.
- Secondary buttons use a neutral border and surface.
- Ghost buttons remain transparent until hover or pressed state.
- Focus uses a 2px blue outline with 3px offset.
- Disabled controls retain readable text and a visible boundary.
- Correct, incorrect, learned, and review states include explicit words or icons.

## Responsive behavior

- Breakpoints: 768px and 1024px, with a narrow-phone safeguard below 384px.
- Below 768px, navigation collapses, compositions become single-column, topic progress follows the introduction, mode links become a vertical reading list, study mode tabs scroll if needed, classification actions sit above Previous/Next, and vocabulary metadata moves below the term pair.
- Matching retains two columns because the interaction requires comparison.
- From 768px, forms and contextual progress may share rows.
- From 1024px, Home and mode-selection compositions gain deliberate asymmetry.
- No horizontal document overflow at 320px.

## Motion

- Use only 120–220ms functional transitions.
- No page entrance choreography or decorative animation.
- Progress width and state color may transition.
- Under prefers-reduced-motion, transition and animation durations reduce to 0.01ms, smooth scrolling is disabled, and all functionality remains available.

## Accessibility

- Maintain WCAG 2.2 AA contrast.
- Preserve semantic headings, landmarks, labels, native buttons, native selects, native details, and route focus management.
- Never remove focus indicators.
- Keep keyboard access for flashcards, answer choices, writing, matching, menus, and dialogs.
- Keep touch targets at least 44px.
- Preserve status live regions and non-color feedback.
- Support 200% zoom and long Vietnamese or English content without clipping.

## Anti-patterns

- No dashboard grids, nested cards, hero metric widgets, gradients, glass effects, decorative chips, oversized empty panels, illustrations, or repeated decorative icons.
- No permanent sidebars, account UI, photography, streaks, daily goals, notifications, or activity feeds.
- Do not use a box when a rule and spacing communicate the grouping.
- Do not use an icon when text already communicates the action.
