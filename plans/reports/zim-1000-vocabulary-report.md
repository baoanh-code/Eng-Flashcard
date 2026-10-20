# ZIM 1000 vocabulary extraction and validation report

Generated: 2026-10-20T12:26:54.113Z

Primary source: https://zim.vn/1000-tu-vung-tieng-anh-theo-chu-de

CEFR references:
- Oxford 3000/5000 word lists: https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000
- CEFR-J Vocabulary Profile 1.5: https://github.com/openlanguageprofiles/olp-en-cefrj

## Source coverage

- Raw source rows: **1046**
- Advertised source count: **1000**
- Coverage against advertised count: **104.6%**
- Source topics: **50**
- Normalized production topics: **20**
- Coverage conclusion: all 50 vocabulary headings on the downloaded page were paired with a table. The page currently contains 46 more rows than its advertised rounded count; no entries were fabricated or removed to force exactly 1,000.

| Source topic | Rows | Extraction status |
| --- | ---: | --- |
| Từ vựng về gia đình | 36 | OK |
| Từ vựng về quần áo | 30 | OK |
| Từ vựng về môi trường | 25 | OK |
| Từ vựng về tính cách | 37 | OK |
| Từ vựng về cảm xúc | 19 | OK |
| Từ vựng về mối quan hệ | 24 | OK |
| Từ vựng về tình yêu | 20 | OK |
| Từ vựng về đồ ăn | 20 | OK |
| Từ vựng về đồ uống | 20 | OK |
| Từ vựng về trái cây | 20 | OK |
| Từ vựng về rau củ quả | 20 | OK |
| Từ vựng về tên các loại hải sản | 20 | OK |
| Từ vựng về tên các món ăn Việt Nam | 20 | OK |
| Từ vựng về nấu ăn | 20 | OK |
| Từ vựng về sở thích | 20 | OK |
| Từ vựng về âm nhạc | 20 | OK |
| Từ vựng về shopping | 20 | OK |
| Từ vựng về du lịch | 20 | OK |
| Từ vựng về chụp ảnh | 20 | OK |
| Từ vựng về giải trí | 20 | OK |
| Từ vựng về các thể loại phim | 20 | OK |
| Từ vựng về các thể loại sách | 20 | OK |
| Từ vựng về làm đẹp | 20 | OK |
| Từ vựng về các môn thể thao | 20 | OK |
| Từ vựng về bóng đá | 20 | OK |
| Từ vựng về nhà cửa | 20 | OK |
| Từ vựng về nhà bếp | 20 | OK |
| Từ vựng về Tết | 20 | OK |
| Từ vựng về đời sống | 20 | OK |
| Từ vựng về con vật | 20 | OK |
| Từ vựng về hoa | 20 | OK |
| Từ vựng về Giáng sinh | 20 | OK |
| Từ vựng về màu sắc | 19 | OK |
| Từ vựng về phương tiện giao thông | 20 | OK |
| Từ vựng về biển báo giao thông | 20 | OK |
| Từ vựng về các nghề nghiệp | 20 | OK |
| Từ vựng về sức khỏe | 20 | OK |
| Từ vựng về các loại bệnh | 20 | OK |
| Từ vựng về giáo dục | 20 | OK |
| Từ vựng về các môn học | 20 | OK |
| Từ vựng về kỹ năng | 19 | OK |
| Từ vựng về các lễ hội ở Việt Nam | 17 | OK |
| Từ vựng về Tết trung thu | 20 | OK |
| Từ vựng về trò chơi dân gian | 20 | OK |
| Từ vựng về văn hóa | 20 | OK |
| Từ vựng về nghệ thuật | 20 | OK |
| Từ vựng về kinh doanh | 20 | OK |
| Từ vựng về thành phố | 20 | OK |
| Từ vựng về tên các nước | 20 | OK |
| Từ vựng về đời sống công sở | 20 | OK |

## Cleaning

- Clean rows after same-topic consolidation: **1016**
- Unique normalized terms across all topics: **962**
- Exact duplicate rows: **0**
- Terms appearing more than once: **78**
- Duplicate occurrences beyond the first: **84**
- Suspicious punctuation/spacing or singular/plural groups: **3**
- Malformed rows: **0**
- Skipped rows: **0**

Cross-topic duplicates remain in the clean master. Same normalized term + normalized topic rows are consolidated with source rows and source topics retained for traceability.

## Field quality

- Missing IPA rows: **0**
- Missing definition rows: **0**
- Missing PartOfSpeech after reference lookup: **363**
- Suspicious normalized IPA rows: **0**
- Ambiguous or unmatched CEFR rows: **482**

## CEFR distribution

| Level | Clean rows |
| --- | ---: |
| A1 | 170 |
| A2 | 110 |
| B1 | 123 |
| B2 | 131 |
| REVIEW | 482 |

Classification is conservative. Exact Oxford matches are preferred; CEFR-J is used when Oxford has no exact entry or to resolve a documented Oxford sense-level ambiguity. C1/C2-only, missing, or unresolved multi-level matches are retained as REVIEW rather than downgraded.

## A2 candidate output

- A2 terms: **110**
- A2 topics: **19**
- Examples: original, manually reviewed project sentences with Vietnamese translations; no ZIM examples were copied.
- Candidate loader validation: **PASS** — 110 A2 entries across 19 topics and 19 files (`node scripts/validate-vocabulary-candidate.mjs`).
- Production status: **candidate only**. Current app vocabulary was not replaced.

| Topic | A2 terms |
| --- | ---: |
| Animals | 2 |
| Clothes | 2 |
| Colors | 2 |
| Culture & Arts | 4 |
| Daily Life | 2 |
| Festivals & Celebrations | 2 |
| Food & Drinks | 10 |
| Health & Body | 4 |
| Hobbies & Entertainment | 18 |
| Home | 11 |
| Nature & Environment | 3 |
| People & Family | 4 |
| People & Relationships | 5 |
| School & Education | 9 |
| Shopping | 3 |
| Sports | 7 |
| Transport | 6 |
| Travel | 3 |
| Work & Jobs | 13 |

## Duplicate review

The exact duplicate inventory is in `master/zim-1000-duplicates.csv`, and high-confidence punctuation/spacing or singular/plural candidates are in `master/zim-1000-near-duplicates.csv`. 78 normalized terms require duplicate awareness; cross-topic entries were not silently deleted.

## Manual review queue (first 100)

| Term | Topic | Reason |
| --- | --- | --- |
| bear | Animals | Ambiguous reference levels: A2, B2 |
| fish | Animals | Ambiguous reference levels: A1, A2 |
| shark | Animals | No exact CEFR reference match |
| bathrobe | Clothes | No exact CEFR reference match |
| bib overalls | Clothes | No exact CEFR reference match |
| blazer | Clothes | No exact CEFR reference match |
| blouse | Clothes | No exact CEFR reference match |
| crop top | Clothes | No exact CEFR reference match |
| evening dress | Clothes | No exact CEFR reference match |
| house dress | Clothes | No exact CEFR reference match |
| leggings | Clothes | No exact CEFR reference match |
| maternity dress | Clothes | No exact CEFR reference match |
| maxi | Clothes | No exact CEFR reference match |
| miniskirt | Clothes | No exact CEFR reference match |
| night gown | Clothes | No exact CEFR reference match |
| pleated skirt | Clothes | No exact CEFR reference match |
| pyjamas | Clothes | No exact CEFR reference match |
| shorts | Clothes | No exact CEFR reference match |
| slip dress | Clothes | No exact CEFR reference match |
| tank top | Clothes | No exact CEFR reference match |
| wedding gown | Clothes | No exact CEFR reference match |
| beige | Colors | No exact CEFR reference match |
| gray | Colors | No exact CEFR reference match |
| indigo | Colors | No exact CEFR reference match |
| lavender | Colors | No exact CEFR reference match |
| magenta | Colors | No exact CEFR reference match |
| maroon | Colors | No exact CEFR reference match |
| turquoise | Colors | No exact CEFR reference match |
| artifacts | Culture & Arts | No exact CEFR reference match |
| bamboo stilts | Culture & Arts | No exact CEFR reference match |
| blind man's bluff | Culture & Arts | No exact CEFR reference match |
| canvas | Culture & Arts | Outside supported range: C1 |
| cat's cradle | Culture & Arts | No exact CEFR reference match |
| ceramics | Culture & Arts | No exact CEFR reference match |
| cockfighting | Culture & Arts | No exact CEFR reference match |
| composition | Culture & Arts | Outside supported range: C1 |
| congkak | Culture & Arts | No exact CEFR reference match |
| cuisine | Culture & Arts | No exact CEFR reference match |
| cultural exchange | Culture & Arts | No exact CEFR reference match |
| cultural heritage | Culture & Arts | No exact CEFR reference match |
| cultural identity | Culture & Arts | No exact CEFR reference match |
| egg rolling | Culture & Arts | No exact CEFR reference match |
| ethnicity | Culture & Arts | No exact CEFR reference match |
| fan dancing | Culture & Arts | No exact CEFR reference match |
| festivals | Culture & Arts | No exact CEFR reference match |
| five stones | Culture & Arts | No exact CEFR reference match |
| folk games | Culture & Arts | No exact CEFR reference match |
| folklore | Culture & Arts | No exact CEFR reference match |
| heritage | Culture & Arts | Outside supported range: C1 |
| hopscotch | Culture & Arts | No exact CEFR reference match |
| jackstones | Culture & Arts | No exact CEFR reference match |
| kite flying | Culture & Arts | No exact CEFR reference match |
| mancala | Culture & Arts | No exact CEFR reference match |
| marbles | Culture & Arts | No exact CEFR reference match |
| multicultural | Culture & Arts | No exact CEFR reference match |
| palette | Culture & Arts | No exact CEFR reference match |
| pinata | Culture & Arts | No exact CEFR reference match |
| ritual | Culture & Arts | Outside supported range: C1 |
| sculptor | Culture & Arts | No exact CEFR reference match |
| shuttlecock | Culture & Arts | No exact CEFR reference match |
| sketch | Culture & Arts | Outside supported range: C1 |
| skipping rope | Culture & Arts | No exact CEFR reference match |
| stick and hoop | Culture & Arts | No exact CEFR reference match |
| symbols | Culture & Arts | No exact CEFR reference match |
| tug of war | Culture & Arts | No exact CEFR reference match |
| values | Culture & Arts | No exact CEFR reference match |
| water puppetry | Culture & Arts | No exact CEFR reference match |
| hobbies | Daily Life | No exact CEFR reference match |
| meditation | Daily Life | Outside supported range: C1 |
| mindfulness | Daily Life | No exact CEFR reference match |
| personal development | Daily Life | No exact CEFR reference match |
| productivity | Daily Life | Outside supported range: C1 |
| resilience | Daily Life | Outside supported range: C1 |
| routine | Daily Life | Ambiguous reference levels: B2, A1 |
| self-care | Daily Life | No exact CEFR reference match |
| sleep | Daily Life | Ambiguous reference levels: A2, A1 |
| socialize | Daily Life | No exact CEFR reference match |
| work-life balance | Daily Life | No exact CEFR reference match |
| ancestor worship | Festivals & Celebrations | No exact CEFR reference match |
| ancestral altar | Festivals & Celebrations | No exact CEFR reference match |
| banh tet | Festivals & Celebrations | No exact CEFR reference match |
| buffalo fighting festival | Festivals & Celebrations | No exact CEFR reference match |
| candles | Festivals & Celebrations | No exact CEFR reference match |
| carols | Festivals & Celebrations | No exact CEFR reference match |
| Cau Ngu Festival | Festivals & Celebrations | No exact CEFR reference match |
| Christmas | Festivals & Celebrations | No exact CEFR reference match |
| Christmas tree | Festivals & Celebrations | No exact CEFR reference match |
| cultural heritage | Festivals & Celebrations | No exact CEFR reference match |
| Da Lat Flower Festival | Festivals & Celebrations | No exact CEFR reference match |
| decorations | Festivals & Celebrations | No exact CEFR reference match |
| Do Son Buffalo Fighting Festival | Festivals & Celebrations | No exact CEFR reference match |
| dragon dance | Festivals & Celebrations | No exact CEFR reference match |
| eggnog | Festivals & Celebrations | No exact CEFR reference match |
| family reunion | Festivals & Celebrations | No exact CEFR reference match |
| festive atmosphere | Festivals & Celebrations | No exact CEFR reference match |
| firecrackers | Festivals & Celebrations | No exact CEFR reference match |
| five-fruit tray | Festivals & Celebrations | No exact CEFR reference match |
| full moon | Festivals & Celebrations | No exact CEFR reference match |
| gifts | Festivals & Celebrations | No exact CEFR reference match |
| gingerbread | Festivals & Celebrations | No exact CEFR reference match |

The complete queue is in `review/uncertain.csv`.

## Safe promotion procedure

1. Review `review/uncertain.csv`, duplicate conflicts, and a sample of every A2 topic's generated examples.
2. Run `node scripts/validate-vocabulary-candidate.mjs`.
3. Extend `src/data/topics/a2.js` with the approved candidate topic metadata.
4. Back up the current three sample files, then copy approved files from `data/zim-1000/vocabulary/a2/` into `src/data/vocabulary/a2/`.
5. Run `npm run validate:data`, unit tests, browser tests, and production build before release.
