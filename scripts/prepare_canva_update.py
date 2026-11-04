import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('data/canva_raw_extracted.json', 'r', encoding='utf-8') as f:
    canva_pages = json.load(f)

with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    live_issue = json.load(f)

# Let's inspect how items are paired for each page

def clean_text(s):
    if not s:
        return ""
    # Normalize spaces and newlines
    s = s.replace('\xa0', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def extract_pairs(canva_pnum, items):
    non_headers = [itm for itm in items if not ('قائمة اسعار' in itm['label'] or ('مجموعة' in itm['label'] and 'اليدوية' in itm['label']))]
    pairs = []
    
    if canva_pnum == 1:
        # We know:
        # item 0: desc of item 13 ("إسورة نحاس بالعقيق الأسود والخط العربي")
        # item 1: "إسورة بنقشة الضفيرة نحاس احمر" -> item 2: desc
        # item 3: "إسورة بنقشة الريشة نحاس أحمر" -> item 4: desc
        # item 5: "إسورة فرعونية بمفتاح الحياة نحاس أحمر" -> item 6: desc
        # item 7: "إسورة مجدولة نحاس احمر" -> item 8: desc
        # item 9: "إسورة شجرة الحياة نحاس احمر" -> item 10: desc
        # item 11: "إسورة نحاس فرعونية ذهبية" -> item 12: desc
        # item 13: "إسورة نحاس بالعقيق الأسود والخط العربي" -> desc is item 0!
        # item 14: "خاتم نحاس بالخط العربي" -> item 15: desc
        # item 16: "خاتم الخط العربي والفيروز" -> item 17: desc
        pairs = [
            {"slot": 1, "name": non_headers[1]["label"], "desc": non_headers[2]["label"]},
            {"slot": 2, "name": non_headers[3]["label"], "desc": non_headers[4]["label"]},
            {"slot": 3, "name": non_headers[5]["label"], "desc": non_headers[6]["label"]},
            {"slot": 4, "name": non_headers[7]["label"], "desc": non_headers[8]["label"]},
            {"slot": 5, "name": non_headers[9]["label"], "desc": non_headers[10]["label"]},
            {"slot": 6, "name": non_headers[11]["label"], "desc": non_headers[12]["label"]},
            {"slot": 7, "name": non_headers[13]["label"], "desc": non_headers[0]["label"]},
            {"slot": 8, "name": non_headers[14]["label"], "desc": non_headers[15]["label"]},
            {"slot": 9, "name": non_headers[16]["label"], "desc": non_headers[17]["label"]},
        ]
    elif canva_pnum == 4:
        # On page 4, there are 20 items because item 10,11 ("إسورة احجار هيماتيت معدنية") and 18,19 ("إسورة هيماتيت معدنية بالخرز") were both present.
        # Let's inspect the order of page 4:
        # Slot 1: non_headers[0] name, non_headers[1] desc
        # Slot 2: non_headers[2] name, non_headers[3] desc
        # Slot 3: non_headers[4] name, non_headers[5] desc
        # Slot 4: non_headers[6] name, non_headers[7] desc
        # Slot 5: non_headers[8] ("إسورة احجار هيماتيت الطبيعى"), non_headers[9] desc
        # Slot 6: non_headers[10] ("إسورة احجار هيماتيت معدنية"), non_headers[11] desc
        # Slot 7: non_headers[12] ("عقد حجر القمر بنجمه فيروز طبيعى"), non_headers[13] desc
        # Slot 8: non_headers[14] ("عقد احجار توباز أزرق"), non_headers[15] desc
        # Slot 9: non_headers[16] ("إسورة سبينل احجار أسود"), non_headers[17] desc
        pairs = [
            {"slot": 1, "name": non_headers[0]["label"], "desc": non_headers[1]["label"]},
            {"slot": 2, "name": non_headers[2]["label"], "desc": non_headers[3]["label"]},
            {"slot": 3, "name": non_headers[4]["label"], "desc": non_headers[5]["label"]},
            {"slot": 4, "name": non_headers[6]["label"], "desc": non_headers[7]["label"]},
            {"slot": 5, "name": non_headers[8]["label"], "desc": non_headers[9]["label"]},
            {"slot": 6, "name": non_headers[10]["label"], "desc": non_headers[11]["label"]},
            {"slot": 7, "name": non_headers[12]["label"], "desc": non_headers[13]["label"]},
            {"slot": 8, "name": non_headers[14]["label"], "desc": non_headers[15]["label"]},
            {"slot": 9, "name": non_headers[16]["label"], "desc": non_headers[17]["label"]},
        ]
    else:
        # For pages 2, 3, 5, 6, 7, 8, 9, all items are alternating Name, Description!
        slot = 1
        for i in range(0, len(non_headers), 2):
            if i + 1 < len(non_headers):
                name = non_headers[i]["label"]
                desc = non_headers[i+1]["label"]
                pairs.append({"slot": slot, "name": name, "desc": desc})
                slot += 1
    return pairs

all_extracted_by_page = {}
for cp in canva_pages:
    pnum = cp['page']
    pairs = extract_pairs(pnum, cp['items'])
    all_extracted_by_page[pnum] = pairs
    print(f"Page {pnum}: Extracted {len(pairs)} product pairs")

with open('data/canva_catalog_pairs.json', 'w', encoding='utf-8') as f:
    json.dump(all_extracted_by_page, f, ensure_ascii=False, indent=2)

print("Saved to data/canva_catalog_pairs.json")
