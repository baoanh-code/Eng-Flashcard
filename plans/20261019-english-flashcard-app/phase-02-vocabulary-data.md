# Phase 2 — Vocabulary import and catalog

## Overview

Build the only path from source CSV/TSV to application vocabulary. This phase proves UTF-8 parsing, canonical normalization, deterministic identity, diagnostics, computed topic metadata, lazy per-level discovery, and the future drop-file workflow before any study component consumes data.

## Files

- Create source/config: `src/data/vocabulary/a2/*.csv`, `src/data/vocabulary/a2/*.tsv`, `src/data/topics/a2.js`.
- Create pure import modules: `src/data/import/headerAliases.js`, `parseSource.js`, `normalizeText.js`, `generateVocabularyId.js`, `normalizeRow.js`, `validateRecords.js`, `buildCatalog.js`, `diagnostics.js`.
- Create browser adapter: `src/data/catalog/sourceLoaders.js`, `loadLevelCatalog.js`, `catalogContext.jsx`, `useCatalog.js`.
- Create Node adapter: `scripts/validate-vocabulary.mjs`.
- Create tests/fixtures: `src/data/import/*.test.js`, `tests/fixtures/vocabulary/*`.
- Create durable contributor documentation: `docs/vocabulary-data.md`.

## Tasks

- [ ] **P2.1 Define the source and metadata conventions.** Add small realistic A2 fixtures with at least four unique definitions per representative topic and one headerless TSV. Configure stable `topicId`, display name, Vietnamese-friendly description, icon key, level, filename/source aliases, and optional topic-name aliases; never configure counts.
- [ ] **P2.2 Implement parser selection.** Choose delimiter from extension, strip UTF-8 BOM, ignore empty lines, parse CSV/TSV with Papa Parse, detect recognized TSV headers, and emit structured parse/malformed-row diagnostics with source path and 1-based source row.
- [ ] **P2.3 Normalize headers and values.** Match documented aliases case-insensitively after trimming/separator normalization. Normalize strings to NFC, trim boundaries, collapse accidental repeated horizontal whitespace, normalize line endings, and convert empty optionals to `null` without modifying meaningful Vietnamese punctuation/diacritics.
- [ ] **P2.4 Resolve level/topic context.** Derive level from the level-first directory and reject conflicting declared levels. Resolve topic via configured source mapping/alias, recognized row Topic, then filename fallback. Produce canonical `topicId` and display `topic`; fail only when no nonempty topic can be resolved.
- [ ] **P2.5 Generate stable IDs and detect duplicates.** Implement `${level}-${topicId}-${termSlug}` using normalized stable inputs, never index/random/definition. Detect normalized duplicate term within the same topic and all global ID collisions, including collisions caused by punctuation/diacritic slug reduction.
- [ ] **P2.6 Build the canonical catalog.** Return immutable records and diagnostics plus `byId`, `byLevel`, `byTopic`, computed topic summaries, and cached normalized term/definition search keys. Ensure optional fields are present as `null`, not omitted unpredictably.
- [ ] **P2.7 Add lazy Vite discovery and caching.** Use raw `import.meta.glob` loaders for both CSV and TSV, filter paths for the requested level, import each level once, and cache success/failure. Provider exposes loading, ready, partial-with-diagnostics, empty, and fatal-error states without reparsing on rerender.
- [ ] **P2.8 Add release validation.** Node script recursively reads the same source tree and calls the same pure pipeline; errors print stable codes/file/row/message and exit nonzero. Complete `npm run validate:data` and make `npm run build` run it first.
- [ ] **P2.9 Document adding data.** Explain directory/filename rules, accepted headers/aliases, headerless TSV, richer optional fields, topic metadata, stable-ID rename implications, validation command, UTF-8 expectation, error codes, and that a rebuild/deploy is required.

## Acceptance criteria

- Canonical output exactly includes `id`, `level`, `topicId`, `topic`, `term`, `definition`, `example`, `exampleTranslation`, `ipa`, and `partOfSpeech`.
- CSV quoted commas/newlines and Vietnamese characters survive; CRLF/LF and optional BOM work; headerless two-column TSV imports its first row as data.
- A file containing only term/definition becomes valid through path/config/filename context; optional fields are `null`.
- IDs stay identical when definitions/examples/display topic names change but stable level/topicId/term do not.
- Missing term/definition, malformed rows, unresolved topic, invalid level, duplicate topic term, and ID collision produce the defined diagnostics. Invalid rows do not destroy unrelated valid records.
- Topic counts are computed from canonical records. No UI or metadata file contains hand-maintained totals.
- Adding another valid CSV/TSV under a known/new level requires no study-component change or import-manifest edit.

## Verification

- Run focused Vitest suites for every accepted format, normalization rule, diagnostic code, stable-ID invariant, topic resolution precedence, and catalog index.
- Run `npm run validate:data` against valid fixtures, then against isolated invalid fixtures expecting nonzero status and precise diagnostics.
- Build and load A2 twice in a provider test; assert source loaders/parser run once and the cached catalog is reused.
- Generate a synthetic 5,000-record source set in memory and verify correct counts/search indexes/unique IDs without adding it to the production bundle.

## Risks

- Papa Parse row numbers may differ with headers/blank lines. Normalize locations in one adapter and lock behavior with fixtures.
- Topic display renames can alter fallback IDs. Stable topic configuration is mandatory for production sources that may be renamed.

