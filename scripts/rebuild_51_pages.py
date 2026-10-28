import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"d:\Open Projects\lotus catolog"
DATA_DIR = os.path.join(ROOT_DIR, "data")
SEED_PATH = os.path.join(DATA_DIR, "products_seed.json")
LIVE_ISSUE_PATH = os.path.join(DATA_DIR, "live_issue.json")

print("=== REBUILDING 51-PAGE CATALOG INTO 4 LOGICAL SECTIONS ===")

with open(SEED_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from products_seed.json")

# Clean '(+more cards)' pattern
pattern_more_cards = re.compile(r'\s*\(\+\d+\s+more\s+cards?\)', re.IGNORECASE)

def clean_title(title: str) -> str:
    if not title:
        return ""
    cleaned = pattern_more_cards.sub('', title).strip()
    if cleaned.startswith('"') and cleaned.endswith('"'):
        cleaned = cleaned[1:-1].strip()
    return cleaned

for p in products:
    p['name_ar'] = clean_title(p['name_ar'])

# Save cleaned products_seed.json
with open(SEED_PATH, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

# Classify into 4 authentic, logical sections
# 1. Honey (4 products) -> Page 1
sec1_honey = [p for p in products if p['cashier_code'] in [1, 2, 3, 4]]

# 2. Pottery & Ceramics (81 products -> exactly 9 full pages of 9)
sec2_pottery = [
    p for p in products 
    if p['cashier_code'] in [5, 6] or 
       any(k in (p.get('category') or '').lower() for k in ['majolica', 'runk', 'pottery', 'فخار', 'خزف', 'طاووس'])
]

# 3. Jewelry & Accessories (72 products -> exactly 8 full pages of 9)
jewelry_codes = {9, 10, 429, 430, 431}
sec3_jewelry = [
    p for p in products 
    if p not in sec1_honey and p not in sec2_pottery and (
       any(k in (p.get('category') or '').lower() for k in ['اكسسوارات', 'إكسسوارات', 'مجوهر', 'حلي', 'بيري', 'سلمي']) or
       p['cashier_code'] in jewelry_codes
    )
]

# 4. Egyptian Heritage Crafts (296 products -> 32 full pages of 9 + 1 page of 8)
sec4_heritage = [
    p for p in products 
    if p not in sec1_honey and p not in sec2_pottery and p not in sec3_jewelry
]

assert len(sec1_honey) == 4, f"Honey count mismatch: {len(sec1_honey)}"
assert len(sec2_pottery) == 81, f"Pottery count mismatch: {len(sec2_pottery)}"
assert len(sec3_jewelry) == 72, f"Jewelry count mismatch: {len(sec3_jewelry)}"
assert len(sec4_heritage) == 296, f"Heritage count mismatch: {len(sec4_heritage)}"
assert len(sec1_honey) + len(sec2_pottery) + len(sec3_jewelry) + len(sec4_heritage) == 453

print(f"Section 1 (NA7LA عسل نقي): {len(sec1_honey)} products -> 1 page")
print(f"Section 2 (مجموعة الفخار والخزف): {len(sec2_pottery)} products -> 9 pages (81 products)")
print(f"Section 3 (مجموعة المجوهرات التراثية): {len(sec3_jewelry)} products -> 8 pages (72 products)")
print(f"Section 4 (مجموعة التراث المصري): {len(sec4_heritage)} products -> 33 pages (296 products)")

pages = []

# Build Page 1: Honey Showcase (4 products)
p1_slots = []
for idx, prod in enumerate(sec1_honey, 1):
    p1_slots.append({
        "slot": idx,
        "title_override": prod['name_ar'],
        "price_override": prod['sale_price'],
        "image_override": prod['primary_image_url'],
        "product": prod
    })

pages.append({
    "position": 1,
    "pageNumber": 1,
    "template": "honey-showcase",
    "section_title": "NA7LA عسل نقي",
    "sectionTitle": "NA7LA عسل نقي",
    "slots": p1_slots
})

current_page_num = 2
CARDS_PER_PAGE = 9

def add_grid_pages(prods_list, section_title):
    global current_page_num
    for i in range(0, len(prods_list), CARDS_PER_PAGE):
        chunk = prods_list[i:i + CARDS_PER_PAGE]
        slots = []
        for slot_idx, prod in enumerate(chunk, 1):
            slots.append({
                "slot": slot_idx,
                "title_override": prod['name_ar'],
                "price_override": prod['sale_price'],
                "image_override": prod['primary_image_url'],
                "product": prod
            })
        pages.append({
            "position": current_page_num,
            "pageNumber": current_page_num,
            "template": "grid3x3",
            "section_title": section_title,
            "sectionTitle": section_title,
            "slots": slots
        })
        current_page_num += 1

# Section 2: Pages 2 to 10 (Pottery & Ceramics)
add_grid_pages(sec2_pottery, "مجموعة الفخار والخزف")

# Section 3: Pages 11 to 18 (Jewelry & Accessories)
add_grid_pages(sec3_jewelry, "مجموعة المجوهرات التراثية")

# Section 4: Pages 19 to 51 (Egyptian Heritage Crafts)
add_grid_pages(sec4_heritage, "مجموعة التراث المصري")

total_pages = len(pages)
print(f"Total pages created: {total_pages}")
assert total_pages == 51, f"Expected 51 pages, got {total_pages}"

# Verify slot counts
for p in pages:
    pos = p['position']
    slots = p['slots']
    non_empty = [s for s in slots if s.get('product') is not None]
    if pos == 1:
        assert len(non_empty) == 4, f"Page 1 has {len(non_empty)} products"
    elif pos == 51:
        assert len(non_empty) == 8, f"Page 51 has {len(non_empty)} products"
    else:
        assert len(non_empty) == 9, f"Page {pos} has {len(non_empty)} products instead of 9"

# Verify 4 sections in TOC order
distinct_sections = []
current_sec = None
for p in pages:
    sec = p['section_title']
    if sec != current_sec:
        current_sec = sec
        distinct_sections.append((sec, p['position']))

print("Distinct sections in TOC:")
for s, start in distinct_sections:
    print(f"- {s} (starts at page {start})")

assert len(distinct_sections) == 4, f"Expected 4 distinct sections, got {len(distinct_sections)}"
assert distinct_sections[0][0] == "NA7LA عسل نقي"
assert distinct_sections[1][0] == "مجموعة الفخار والخزف"
assert distinct_sections[2][0] == "مجموعة المجوهرات التراثية"
assert distinct_sections[3][0] == "مجموعة التراث المصري"

# Construct live_issue.json
live_issue = {
    "issueSlug": "lotus-pricelist-a4",
    "title_ar": "مجلة لوتس",
    "version": 3,
    "publishedAt": "2026-10-28T13:00:00.000Z",
    "totalPages": 51,
    "pages": pages
}

with open(LIVE_ISSUE_PATH, 'w', encoding='utf-8') as f:
    json.dump(live_issue, f, ensure_ascii=False, indent=2)

print(f"Saved {LIVE_ISSUE_PATH} successfully!")
print("ALL 4 SECTIONS ARE LOGICAL, COMPLETE, AND VERIFIED!")
