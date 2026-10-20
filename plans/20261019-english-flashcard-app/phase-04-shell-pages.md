# Phase 4 — Application shell and discovery pages

## Overview

Replace placeholders with the navigable, responsive product shell and the Home, Topics, and Topic discovery surfaces. This phase proves the approved information architecture, derived progress, level-aware routing, and all first/returning/invalid/empty states before complex study interactions.

## Files

- Complete layout: `src/components/layout/AppShell.jsx`, `Header.jsx`, `MobileNav.jsx`, `Breadcrumbs.jsx`, `RouteAnnouncer.jsx`.
- Create pages: `src/pages/HomePage.jsx`, `TopicsPage.jsx`, `TopicPage.jsx`, `NotFoundPage.jsx`.
- Create topic/home components: `src/features/topics/TopicCard.jsx`, `TopicList.jsx`, `TopicSearch.jsx`, `TopicOverview.jsx`, `StudyModeLinks.jsx`, `TopicVocabularyPreview.jsx`.
- Create shared states: `src/components/feedback/CatalogLoading.jsx`, `CatalogError.jsx`, `NoVocabulary.jsx`.
- Complete route helpers and page metadata tests.

## Tasks

- [ ] **P4.1 Complete responsive shell/navigation.** Render working-name wordmark and Home, Topics, Review, Vocabulary, Progress links. Resolve level-scoped links to A2/current route level, expose active route with `aria-current`, and implement the under-768px accessible menu with focus entry/return and Escape dismissal. Never show account-shaped UI.
- [ ] **P4.2 Implement route accessibility.** Add skip link, semantic landmarks, one H1 per route, descriptive document titles, breadcrumb on topic/study contexts, and route-change focus/announcement behavior that does not steal focus during in-page study actions.
- [ ] **P4.3 Build lightweight Home.** Show short Vietnamese-first introduction, actual A2 topic/term totals, compact overall local progress, conditional Continue Learning only for a valid last session, topic entry points, and four mode shortcuts. Without last progress, mode shortcuts route through topic choice; do not invent goals, streaks, recent activity, or hero-metric dashboard chrome.
- [ ] **P4.4 Build Topics.** Search topic name/description, show overall A2 progress, and render responsive actionable topic cards with actual total, learned fraction, percentage, and labelled progress bar. Preserve useful empty-search recovery.
- [ ] **P4.5 Build Topic page.** Show title, description, word count, learned/review/remaining/progress, four mode links, conditional Review Difficult Words, reset-topic trigger placeholder (wired in Phase 8), and a compact vocabulary preview/list entry.
- [ ] **P4.6 Handle catalog/route states.** Loading uses content-shaped placeholders only if lazy imports are perceptible; partial data shows valid topics plus a nonblocking diagnostic summary; fatal/empty catalog and unknown level/topic show distinct friendly recovery states.
- [ ] **P4.7 Apply responsive hierarchy.** Use maximum containers and no permanent sidebars. Mobile is single column; tablet/desktop may align compact progress beside headings but never let it dominate topic or study entry.

## Acceptance criteria

- A first-time visitor reaches A2 Topics and any topic without authentication/onboarding.
- A returning visitor with valid last session sees Continue Learning; invalid/orphan last sessions do not create broken links.
- All totals/progress values match selectors and catalog records; zero, partial, and complete states are truthful.
- Header has exactly the approved product destinations and no notifications/avatar/account/streak affordances.
- Unknown routes, levels, and topics recover through a friendly Not Found page; empty/malformed catalog states keep navigation usable.
- Home remains lightweight and Topics/Topic surfaces contain no required imagery or permanent sidebars.
- At 320px through desktop, navigation and content do not overflow horizontally, targets remain at least 44px, and long titles wrap.

## Verification

- Component tests cover first/returning home, invalid Continue Learning, topic search, derived card counts, review-link conditionality, and catalog states.
- Memory-router/integration tests cover every route and page title/focus target.
- Playwright covers desktop and mobile navigation, keyboard-only menu use, Home → Topics → Topic, unknown route, and 200% zoom/reflow spot check.
- Run axe on Home, Topics, Topic, open mobile menu, and Not Found states.

## Risks

- Automatically focusing every route can conflict with browser/back behavior. Scope focus movement to genuine route changes and test pointer/keyboard history navigation.

