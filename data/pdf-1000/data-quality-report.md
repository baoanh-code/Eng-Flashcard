# Production vocabulary data-quality audit

Audit date: 2026-10-21  
Canonical source: `1000-tu-vung-tieng-anh-theo-chu-de-thong-dung.pdf`

## Scope and outcome

- 1,046 canonical PDF rows scanned across 50 topics.
- 1,023 production entries validated after 23 same-topic duplicate occurrences were consolidated.
- 38 confirmed spelling, spacing, or OCR term errors corrected.
- 12 IPA cells corrected where the extracted form was visibly truncated.
- 9 Vietnamese definition cells corrected (six consolidated production entries).
- 909 low-value generated example pairs replaced; 114 existing contextual example pairs preserved.
- 0 malformed rows, 0 skipped rows, 0 missing IPA values, and 0 banned example templates remain.

The audit used the uploaded PDF as the canonical corpus. Cambridge Dictionary was used as a spelling and pronunciation cross-check for clear cases such as `fish`, `desertification`, and `firefighter`; no dictionary example sentence was copied.

## Confirmed term corrections

| PDF row(s) | Before | After |
| --- | --- | --- |
| 76 | desertifcation | desertification |
| 90 | greenhouseefect | greenhouse effect |
| 92, 172 | Afection / afection | Affection / affection |
| 102 | Confdence | Confidence |
| 146 | Terrifc | Terrific |
| 189 | fdelity | fidelity |
| 204 | bufet | buffet |
| 212 | cofee | coffee |
| 281, 648 | fsh | fish |
| 296 | Braisedfsh | Braised fish |
| 306 | Friedfsh | Fried fish |
| 340 | fshing | fishing |
| 387 | fttingroom | fitting room |
| 459, 476 | sciencefction | science fiction |
| 472 | fction | fiction |
| 473 | non-fction | non-fiction |
| 482 | historicalfction | historical fiction |
| 527 | ftness | fitness |
| 549 | ofside | offside |
| 597 | frecrackers | firecrackers |
| 607 | fve-fruittray | five-fruit tray |
| 637 | girafe | giraffe |
| 658 | dafodil | daffodil |
| 742 | Trafclight | Traffic light |
| 756 | Policeofcer | Police officer |
| 757 | Firefghter | Firefighter |
| 876 | BufaloFightingFestival | Buffalo Fighting Festival |
| 877 | ReunifcationDay | Reunification Day |
| 886 | DoSonBufaloFighting Festival | Do Son Buffalo Fighting Festival |
| 906 | Mooncakeflling | Mooncake filling |
| 909 | BlindMan'sBluf | Blind man's bluff |
| 917 | Cockfghting | Cockfighting |
| 970 | Proft | Profit |
| 991 | Trafc | Traffic |
| 1041 | Ofce | Office |

## IPA corrections

| PDF row(s) | Term | Before | After |
| --- | --- | --- | --- |
| 70 | catastrophe | `/kəˈtæstrəf/` | `/kəˈtæstrəfi/` |
| 212 | coffee | `/ˈkɒf/` | `/ˈkɒfi/` |
| 333, 412, 951 | photography | `/fəˈtɑːɡrəf/` | `/fəˈtɑːɡrəfi/` |
| 480 | biography | `/baɪˈɑːɡrəf/` | `/baɪˈɑːɡrəfi/` |
| 481 | autobiography | `/ˌɔːtoʊbaɪˈɑːɡrəf/` | `/ˌɔːtoʊbaɪˈɑːɡrəfi/` |
| 522 | defeat | `/dɪˈfːt/` | `/dɪˈfiːt/` |
| 788, 791 | fever | `/ˈfːvər/` | `/ˈfiːvər/` |
| 834 | geography | `/dʒiˈɑːɡrəf/` | `/dʒiˈɑːɡrəfi/` |
| 849 | philosophy | `/fɪˈlɒsəf/` | `/fɪˈlɒsəfi/` |

## Vietnamese meaning corrections

| PDF row(s) | Term | Before | After |
| --- | --- | --- | --- |
| 417, 424, 430 | exposure | chụp sáng / sự tiếp xúc ánh sáng / ánh sáng tiếp xúc | độ phơi sáng |
| 691 | snowflake | Tuyết rơi | bông tuyết |
| 916 | kite flying | Lao diều | thả diều |
| 921 | five stones | Ném gạch | trò chơi chuyền |
| 934 | artifacts | Đồ cổ | hiện vật |
| 977, 984 | partnership | Đối tác | quan hệ đối tác |

## Duplicate audit

- 90 normalized terms occur in more than one source row, representing 102 duplicate occurrences.
- 23 same-topic duplicate occurrences are consolidated without reducing source coverage.
- 79 cross-topic occurrences are retained because topic context is meaningful.
- 10 exact source rows were found inside the duplicate set.
- Near-duplicate groups retained for manual review: `children` / `children's`, `festival` / `festivals`, and `sale` / `sales`.

## Items requiring manual review

These were not auto-corrected because the source or regional usage admits more than one defensible interpretation:

- `fruit punch` — the Vietnamese meaning currently implies alcohol, while the drink may be alcoholic or non-alcoholic.
- `aperture` — the merged source meaning contains both the correct photography term and a less precise explanation.
- Folk-game translations such as `shuttlecock`, `hopscotch`, `marbles`, `bamboo stilts`, `mancala`, `congkak`, `stick and hoop`, and `cat's cradle` need a subject-matter review for Vietnamese game-name equivalence.
- Proper-name romanization and IPA for Vietnamese festivals (for example Giong, Cau Ngu, and Nguyen Tieu) should be reviewed under a single transliteration policy.
- Cross-topic duplicates are intentionally retained; any future merge should be decided per meaning and learning context, not by spelling alone.

## Preventive validation

`npm run validate:data` now rejects banned definition-template examples, control/replacement characters, empty or whitespace-damaged English terms, punctuation-only boundaries, and known OCR fragments such as `fsh`, `fction`, `ofcer`, and `desertifcation`.
