import json, os, sys, re, openpyxl
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"d:\Open Projects\lotus catolog"
DATA_DIR = os.path.join(ROOT_DIR, "data")
CANVA_EXTRACTED_PATH = os.path.join(DATA_DIR, "canva_catalog_extracted.json")
EXCEL_PATH = os.path.join(ROOT_DIR, "Lotus_Products_vs_Canva.xlsx")
SEED_PATH = os.path.join(DATA_DIR, "products_seed.json")
LIVE_ISSUE_PATH = os.path.join(DATA_DIR, "live_issue.json")
IMG_DIR = os.path.join(ROOT_DIR, "public", "uploads", "excel_images")

print("=== REBUILDING 78 PAGES (ENSURING ALL PAGES HAVE SLOTS) ===")

with open(CANVA_EXTRACTED_PATH, 'r', encoding='utf-8') as f:
    canva_pages = json.load(f)

wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
ws = wb['Reconciliation']
rows = list(ws.iter_rows(values_only=True))

excel_items = []
for idx, r in enumerate(rows[1:], 1):
    code = r[0]
    p_name = str(r[1] or '').strip()
    c_name = str(r[5] or '').strip()
    sp = r[3]
    cp = r[6]
    notes = str(r[9] or '').strip()
    key = f"prod_{code}" if (code is not None and str(code).isdigit()) else f"extra_{idx}"
    img_url = f"/uploads/excel_images/{key}.webp"
    
    excel_items.append({
        'idx': idx,
        'code': int(code) if (code is not None and str(code).isdigit()) else None,
        'key': key,
        'img_url': img_url,
        'p_name': p_name,
        'c_name': c_name,
        'sp': sp,
        'cp': cp,
        'notes': notes,
        'status': str(r[8] or '').strip(),
        'cat': str(r[2] or '').strip()
    })

# Check available images
avail_imgs = set(os.listdir(IMG_DIR))
for item in excel_items:
    if f"{item['key']}.webp" not in avail_imgs:
        item['img_url'] = "/brand/lotus_logo.png"

# Cashier-only codes (116 items)
has_canva_codes = set()
no_canva_codes = []
for item in excel_items[:453]:
    if item['c_name'] or 'مطابق' in item['status']:
        has_canva_codes.add(item['code'])
    else:
        no_canva_codes.append(item['code'])

def clean_tok(s):
    return set(re.findall(r'[\u0600-\u06FFa-zA-Z0-9]+', s))

slot_to_excel = {}
special_bindings = {
    (1, 1): next((item for item in excel_items if item['code'] == 1), None),
    (1, 2): next((item for item in excel_items if item['code'] == 2), None),
    (1, 3): next((item for item in excel_items if item['code'] == 3), None),
    (1, 4): next((item for item in excel_items if item['code'] == 4), None),
    (2, 1): next((item for item in excel_items if item['idx'] == 456), None), # Honey basket
    (2, 2): next((item for item in excel_items if item['idx'] == 457), None), # Palm basket
    (2, 3): next((item for item in excel_items if item['code'] == 53), None),  # Olive 1L
    (2, 4): next((item for item in excel_items if item['code'] == 54), None),  # Olive 750ml
    (3, 1): next((item for item in excel_items if item['code'] == 53), None),
    (3, 2): next((item for item in excel_items if item['idx'] == 458), None), # Dates 1KG
    (4, 1): next((item for item in excel_items if item['code'] == 54), None),
    (4, 2): next((item for item in excel_items if item['idx'] == 459), None), # Dates 500G
    (10, 7): next((item for item in excel_items if item['code'] == 445), None),
    (10, 8): next((item for item in excel_items if item['code'] == 446), None),
    (10, 9): next((item for item in excel_items if item['code'] == 447), None),
}

for (p_num, s_num), b_item in special_bindings.items():
    if b_item:
        slot_to_excel[(p_num, s_num)] = b_item

for p in canva_pages:
    p_num = p['pageNumber']
    for s in p['slots']:
        s_num = s['slot']
        if (p_num, s_num) in slot_to_excel:
            continue
        title = s.get('title', '')
        if not title or title.startswith('منتج لوتس'):
            continue
        price = s.get('price')
        s_tokens = clean_tok(title)
        
        # Match by C tag in notes
        c_tag = f"C{p_num:02d}-{s_num}"
        c_tag_short = f"C{p_num}-{s_num}"
        matched = False
        for item in excel_items:
            if c_tag in item['notes'] or c_tag_short in item['notes']:
                slot_to_excel[(p_num, s_num)] = item
                matched = True
                break
        if matched:
            continue
            
        best_score = 0
        best_cand = None
        for item in excel_items:
            if not item['c_name']:
                continue
            i_tokens = clean_tok(item['c_name'])
            overlap = len(s_tokens & i_tokens)
            if overlap == 0:
                continue
            score = overlap / max(len(s_tokens), 1)
            if price and (item['cp'] == price or item['sp'] == price):
                score += 1.0
            if score > best_score:
                best_score = score
                best_cand = item
        if best_score >= 0.35:
            slot_to_excel[(p_num, s_num)] = best_cand

# Build products
all_seed_products = []
products_by_id = {}
products_by_code = {}

for item in excel_items[:453]:
    code = item['code']
    p_name = item['p_name']
    name_ar = item['c_name'] if item['c_name'] else p_name
    sp = item['sp'] if item['sp'] else (item['cp'] if item['cp'] else 250)
    img_url = item['img_url']
    prod_id = f"prod-{code}"
    slug = f"prod-{code}-{re.sub(r'[\s/\\?#%&+=]+', '-', name_ar)[:30]}".strip('-')
    
    prod_obj = {
        "id": prod_id,
        "cashier_code": code,
        "slug": slug,
        "name_ar": name_ar,
        "name_en": None,
        "description_ar": f"منتج أصيل من كتالوج لوتس - {item['cat']}، صناعة يدوية مصرية فائقة الجودة.",
        "description_en": None,
        "category": item['cat'],
        "sale_price": sp,
        "in_stock": True,
        "primary_image_url": img_url,
        "images": {"sm": img_url, "md": img_url, "lg": img_url}
    }
    all_seed_products.append(prod_obj)
    products_by_id[prod_id] = prod_obj
    products_by_code[code] = prod_obj

for item in excel_items[454:]:
    name_ar = item['c_name'] if item['c_name'] else "منتج تراثي لوتس"
    sp = item['cp'] if item['cp'] else 250
    img_url = item['img_url']
    prod_id = item['key']
    slug = f"{prod_id}-{re.sub(r'[\s/\\?#%&+=]+', '-', name_ar)[:30]}".strip('-')
    
    prod_obj = {
        "id": prod_id,
        "cashier_code": 1000 + item['idx'],
        "slug": slug,
        "name_ar": name_ar,
        "name_en": None,
        "description_ar": f"منتج تراثي أصيل من كتالوج لوتس - {name_ar}، مصنوع يدوياً بأيدي أمهر الحرفيين.",
        "description_en": None,
        "category": "مجموعة التراث المصري",
        "sale_price": sp,
        "in_stock": True,
        "primary_image_url": img_url,
        "images": {"sm": img_url, "md": img_url, "lg": img_url}
    }
    all_seed_products.append(prod_obj)
    products_by_id[prod_id] = prod_obj

final_pages = []

for p_idx, c_page in enumerate(canva_pages, 1):
    p_num = c_page['pageNumber']
    
    if p_num <= 5:
        sec_title = "NA7LA عسل نقي"
    elif p_num <= 46:
        sec_title = "مجموعة التراث المصري"
    else:
        sec_title = "منتجات خشبية"
        
    page_obj = {
        "position": p_num,
        "pageNumber": p_num,
        "section_title": sec_title,
        "sectionTitle": sec_title,
        "slots": []
    }
    
    if p_num == 1:
        page_obj["template"] = "honey-showcase"
    elif p_num == 2:
        page_obj["template"] = "baskets-showcase"
    elif p_num == 3:
        page_obj["template"] = "olive-dates-1"
    elif p_num == 4:
        page_obj["template"] = "olive-dates-2"
    elif p_num == 5:
        page_obj["template"] = "olive-showcase"
    else:
        page_obj["template"] = "grid3x3"
        
    # Populate slots for all pages
    max_slots = 4 if p_num == 1 else 9
    for s_idx in range(1, max_slots + 1):
        matched_item = slot_to_excel.get((p_num, s_idx))
        if matched_item:
            code = matched_item['code']
            prod_id = f"prod-{code}" if code else matched_item['key']
            prod_obj = products_by_id.get(prod_id)
            title = matched_item['c_name'] if matched_item['c_name'] else matched_item['p_name']
            price = matched_item['cp'] if matched_item['cp'] else (matched_item['sp'] if matched_item['sp'] else 250)
            img_url = matched_item['img_url']
        else:
            s_data = next((s for s in c_page['slots'] if s['slot'] == s_idx), None)
            title = s_data.get('title', '') if s_data else ''
            price = s_data.get('price', 250) if s_data else 250
            img_url = s_data.get('imageUrl', '') if s_data else ''
            prod_id = f"canva-p{p_num}-s{s_idx}"
            prod_obj = products_by_id.get(prod_id)
            if not prod_obj and title and not title.startswith('منتج لوتس'):
                prod_obj = {
                    "id": prod_id,
                    "cashier_code": 1000 + p_num * 10 + s_idx,
                    "slug": f"prod-{prod_id}",
                    "name_ar": title,
                    "sale_price": price,
                    "category": sec_title,
                    "primary_image_url": img_url,
                    "images": {"sm": img_url, "md": img_url, "lg": img_url}
                }
                all_seed_products.append(prod_obj)
                products_by_id[prod_id] = prod_obj

        # Check if slot is blank
        if not title or title.startswith('منتج لوتس'):
            page_obj["slots"].append({
                "slot": s_idx,
                "title_override": "",
                "price_override": None,
                "image_override": img_url,
                "product": None
            })
        else:
            page_obj["slots"].append({
                "slot": s_idx,
                "title_override": title,
                "price_override": price,
                "image_override": img_url,
                "product": prod_obj
            })
            
    final_pages.append(page_obj)

# Append Cashier-Only Pages (Pages 66 to 78)
SLOTS_PER_PAGE = 9
curr_p_num = 66
cashier_prods_to_append = [products_by_code[c] for c in no_canva_codes if c in products_by_code]

for i in range(0, len(cashier_prods_to_append), SLOTS_PER_PAGE):
    chunk = cashier_prods_to_append[i:i + SLOTS_PER_PAGE]
    page_slots = []
    for s_idx, prod in enumerate(chunk, 1):
        img_url = prod['primary_image_url']
        page_slots.append({
            "slot": s_idx,
            "title_override": prod['name_ar'],
            "price_override": prod['sale_price'],
            "image_override": img_url,
            "product": prod
        })
        
    final_pages.append({
        "position": curr_p_num,
        "pageNumber": curr_p_num,
        "template": "grid3x3",
        "section_title": "منتجات المعرض الإضافية",
        "sectionTitle": "منتجات المعرض الإضافية",
        "slots": page_slots
    })
    curr_p_num += 1

print(f"Total pages: {len(final_pages)}")

live_issue_data = {
    "issueSlug": "lotus-pricelist",
    "title_ar": "مجلة لوتس",
    "version": 4,
    "publishedAt": "2026-10-29T17:26:00.000Z",
    "totalPages": len(final_pages),
    "pages": final_pages
}

with open(LIVE_ISSUE_PATH, 'w', encoding='utf-8') as f:
    json.dump(live_issue_data, f, ensure_ascii=False, indent=2)

with open(SEED_PATH, 'w', encoding='utf-8') as f:
    json.dump(all_seed_products, f, ensure_ascii=False, indent=2)

print("SUCCESS: 78 pages built with full slots and authentic Excel images!")
