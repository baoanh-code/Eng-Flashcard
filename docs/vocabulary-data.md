# Vocabulary data guide

Vocabulary is source data, not component code. Add UTF-8 `.csv` or `.tsv` files under:

```text
src/data/vocabulary/<level-id>/
```

For example, A2 sources live in `src/data/vocabulary/a2/`. A rebuild and deploy are required after changing source files.

## Smallest supported formats

CSV with a header:

```csv
Term,Definition,Example,Topic
hello,xin chào,Hello! How are you?,Greetings
```

Headerless TSV uses its first two columns as `Term` and `Definition`; its first row is data:

```tsv
mother	mẹ
father	cha; bố
```

## Rich format and aliases

The canonical fields are:

```js
{
  id,
  level,
  topicId,
  topic,
  term,
  definition,
  example,
  exampleTranslation,
  ipa,
  partOfSpeech
}
```

Only `term` and `definition` are required in a source row. The directory and topic configuration supply `level`, `topicId`, and the display `topic`. Empty optional values become `null`.

Headers ignore case, spaces, hyphens, and underscores. Accepted names include:

| Canonical field | Accepted headers |
| --- | --- |
| `term` | Term, Word, Phrase, English, English Term |
| `definition` | Definition, Meaning, Vietnamese, Vietnamese Definition, Translation |
| `example` | Example, Example Sentence, Sentence |
| `exampleTranslation` | Example Translation, Translated Example, Example Meaning, Vietnamese Example |
| `topic` | Topic, Category, Theme |
| `level` | Level, CEFR, CEFR Level |
| `ipa` | IPA, Pronunciation, Phonetic |
| `partOfSpeech` | Part of Speech, POS, Word Class |

Quoted commas, quoted line breaks, LF/CRLF, Vietnamese text, and an optional UTF-8 BOM are supported.

## Topic metadata and stable IDs

Add presentation metadata in `src/data/topics/<level-id>.js`. Metadata owns stable `id`, display `name`, Vietnamese description, icon key, source filename aliases, and optional name aliases. It must not contain word counts; counts are derived from valid records.

Record IDs use `<level>-<stable-topic-id>-<term-slug>`. Editing a definition, example, or topic display name does not change an ID. Renaming a source file that relies only on filename fallback can change topic identity, so production topics should have explicit metadata and keep their stable `id` unchanged.

## Validation

Run:

```sh
npm run validate:data
```

Warnings identify ignored unknown headers or extra values. Errors fail validation and exclude only the invalid row. Codes include parse failure, malformed header/row, missing term, missing definition, unresolved topic, invalid level, duplicate normalized term, duplicate generated ID, and empty source.

The production build runs the same validator automatically. Adding a valid source file requires no import manifest and no changes to study components.
