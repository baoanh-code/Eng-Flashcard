import csv
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

import pdfplumber


SOURCE_TOPICS = [
    ("Từ vựng về gia đình", "Family"),
    ("Từ vựng về quần áo", "Clothes"),
    ("Từ vựng về môi trường", "Environment"),
    ("Từ vựng về tính cách", "Personality"),
    ("Từ vựng về cảm xúc", "Emotions"),
    ("Từ vựng về mối quan hệ", "Relationships"),
    ("Từ vựng về tình yêu", "Love"),
    ("Từ vựng về đồ ăn", "Food"),
    ("Từ vựng về đồ uống", "Drinks"),
    ("Từ vựng về trái cây", "Fruit"),
    ("Từ vựng về rau củ quả", "Vegetables"),
    ("Từ vựng về tên các loại hải sản", "Seafood"),
    ("Từ vựng về tên các món ăn Việt Nam", "Vietnamese Dishes"),
    ("Từ vựng về nấu ăn", "Cooking"),
    ("Từ vựng về sở thích", "Hobbies"),
    ("Từ vựng về âm nhạc", "Music"),
    ("Từ vựng về shopping", "Shopping"),
    ("Từ vựng về du lịch", "Travel"),
    ("Từ vựng về chụp ảnh", "Photography"),
    ("Từ vựng về giải trí", "Entertainment"),
    ("Từ vựng về các thể loại phim", "Film Genres"),
    ("Từ vựng về các thể loại sách", "Book Genres"),
    ("Từ vựng về làm đẹp", "Beauty"),
    ("Từ vựng về các môn thể thao", "Sports"),
    ("Từ vựng về bóng đá", "Football"),
    ("Từ vựng về nhà cửa", "Home"),
    ("Từ vựng về nhà bếp", "Kitchen"),
    ("Từ vựng về Tết", "Tet"),
    ("Từ vựng về đời sống", "Daily Life"),
    ("Từ vựng về con vật", "Animals"),
    ("Từ vựng về hoa", "Flowers"),
    ("Từ vựng về Giáng sinh", "Christmas"),
    ("Từ vựng về màu sắc", "Colors"),
    ("Từ vựng về phương tiện giao thông", "Transport"),
    ("Từ vựng về biển báo giao thông", "Traffic Signs"),
    ("Từ vựng về các nghề nghiệp", "Jobs"),
    ("Từ vựng về sức khỏe", "Health"),
    ("Từ vựng về các loại bệnh", "Illnesses"),
    ("Từ vựng về giáo dục", "Education"),
    ("Từ vựng về các môn học", "School Subjects"),
    ("Từ vựng về kỹ năng", "Skills"),
    ("Từ vựng về các lễ hội ở Việt Nam", "Vietnamese Festivals"),
    ("Từ vựng về Tết trung thu", "Mid-Autumn Festival"),
    ("Từ vựng về trò chơi dân gian", "Folk Games"),
    ("Từ vựng về văn hóa", "Culture"),
    ("Từ vựng về nghệ thuật", "Art"),
    ("Từ vựng về kinh doanh", "Business"),
    ("Từ vựng về thành phố", "City"),
    ("Từ vựng về tên các nước", "Countries"),
    ("Từ vựng về đời sống công sở", "Office Life"),
]

TERM_OVERRIDES = {
    191: "enamored", 202: "cuisine", 339: "hiking", 388: "receipt",
    389: "sale", 424: "exposure", 428: "aperture", 430: "exposure",
    444: "performance", 468: "thriller", 486: "thriller", 505: "charming",
    510: "charming", 525: "athlete", 627: "mindfulness", 804: "Fatigue",
    879: "Lantern Festival", 984: "Partnership", 1045: "Deadline",
}

DEFINITION_OVERRIDES = {
    55: "Quần sặc lô", 191: "mê muội, si mê", 202: "ẩm thực",
    388: "biên lai", 389: "giảm giá", 417: "chụp sáng",
    424: "sự tiếp xúc ánh sáng", 428: "giới hạn (trong ống kính)",
    430: "ánh sáng tiếp xúc", 444: "sự biểu diễn", 468: "ly kỳ",
    486: "căng thẳng, hồi hộp", 505: "duyên dáng, lịch thiệp",
    510: "quyến rũ, dễ thương", 525: "vận động viên", 627: "tỉnh thức",
    804: "Mệt mỏi", 810: "Tê liệt", 838: "Âm nhạc",
    879: "Lễ hội đèn lồng", 984: "Đối tác", 1045: "Hạn chót",
}


def compact(value):
    normalized = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", normalized.lower())


def compact_unicode(value):
    return re.sub(r"\s+", "", unicodedata.normalize("NFC", str(value or "")).lower())


def clean_ipa(value):
    return re.sub(r"\s+", "", str(value or "").replace("\x00", "f"))


def main():
    if len(sys.argv) != 4:
        raise SystemExit("usage: extract-pdf-vocabulary.py PDF HELPER_RAW_CSV OUTPUT_JSON")

    pdf_path, helper_path, output_path = map(Path, sys.argv[1:])
    with helper_path.open(encoding="utf-8-sig", newline="") as source:
        helpers = list(csv.DictReader(source))

    rows = []
    topic_index = -1
    with pdfplumber.open(pdf_path) as document:
        for page_number, page in enumerate(document.pages, start=1):
            for table in page.extract_tables():
                if not table:
                    continue
                header = len(table[0]) >= 3 and "Từ" in str(table[0][0]) and "Nghĩa" in str(table[0][2])
                if header:
                    topic_index += 1
                    table = table[1:]
                if topic_index < 0:
                    continue
                for cells in table:
                    if not cells or len(cells) < 3:
                        continue
                    source_row = len(rows) + 1
                    helper = helpers[source_row - 1]
                    raw_pdf_term = str(cells[0] or "").replace("\n", " ").replace("\x00", "f")
                    term = helper["RawTerm"] if compact(raw_pdf_term) == compact(helper["RawTerm"]) else TERM_OVERRIDES.get(source_row, raw_pdf_term)
                    raw_pdf_definition = str(cells[2] or "").replace("\n", " ")
                    definition = helper["RawDefinition"] if compact_unicode(raw_pdf_definition) == compact_unicode(helper["RawDefinition"]) else DEFINITION_OVERRIDES.get(source_row)
                    source_topic, topic = SOURCE_TOPICS[topic_index]
                    rows.append({
                        "sourceRow": source_row,
                        "page": page_number,
                        "sourceTopic": source_topic,
                        "topic": topic,
                        "term": term.strip(),
                        "ipa": clean_ipa(cells[1]),
                        "definition": (definition or "").strip(),
                    })

    if len(helpers) != len(rows):
        raise ValueError(f"PDF/helper row mismatch: {len(rows)} vs {len(helpers)}")
    if topic_index + 1 != len(SOURCE_TOPICS):
        raise ValueError(f"Expected 50 topics, found {topic_index + 1}")

    malformed = [row for row in rows if not row["term"] or not row["definition"]]
    unresolved = [row for row in rows if not row["definition"]]
    if malformed or unresolved:
        raise ValueError(f"Malformed PDF rows: {len(malformed)}")

    topic_counts = Counter(row["topic"] for row in rows)
    payload = {
        "source": str(pdf_path),
        "pageCount": 58,
        "rawRowCount": len(rows),
        "topicCount": len(topic_counts),
        "topicCounts": dict(topic_counts),
        "rows": rows,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"rawRows": len(rows), "topics": len(topic_counts), "malformed": len(malformed)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
