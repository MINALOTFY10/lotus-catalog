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

print("=== REBUILDING MAGAZINE: ZERO GAPS, EXACTLY 9 PRODUCTS PER PAGE (EXCEPT PAGES 1-5) ===")

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

# Check available Excel images
avail_imgs = set(os.listdir(IMG_DIR))
for item in excel_items:
    if f"{item['key']}.webp" not in avail_imgs:
        item['img_url'] = "/brand/lotus_logo.png"

# Cashier-only codes (116 items)
no_canva_items = []
for item in excel_items[:453]:
    if not (item['c_name'] or 'مطابق' in item['status']):
        no_canva_items.append(item)

assert len(no_canva_items) == 116, f"Expected 116, got {len(no_canva_items)}"

# Seed products setup
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

def clean_tok(s):
    return set(re.findall(r'[\u0600-\u06FFa-zA-Z0-9]+', s))

# Gather all non-blank Canva cards from pages 6..65 in order
active_canva_cards = []

for p in canva_pages[5:]: # pages 6..65
    p_num = p['pageNumber']
    for s in p['slots']:
        s_num = s['slot']
        title = s.get('title', '')
        if not title or title.startswith('منتج لوتس'):
            continue
            
        img_rel = s.get('imageUrl', '')
        img_full = os.path.join(ROOT_DIR, "public", img_rel.lstrip('/'))
        if os.path.exists(img_full):
            try:
                arr = np.array(Image.open(img_full).convert('RGB'))
                if arr.std() < 5.0:
                    continue # empty blank slot in Canva, SKIP!
            except:
                pass
                
        price = s.get('price', 250)
        s_tokens = clean_tok(title)
        
        # Match to Excel item
        best_cand = None
        c_tag = f"C{p_num:02d}-{s_num}"
        c_tag_short = f"C{p_num}-{s_num}"
        for item in excel_items:
            if c_tag in item['notes'] or c_tag_short in item['notes']:
                best_cand = item
                break
                
        if not best_cand:
            best_score = 0
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
            if best_score < 0.35:
                best_cand = None
                
        if best_cand:
            card_title = best_cand['c_name'] or best_cand['p_name'] or title
            card_price = best_cand['cp'] or best_cand['sp'] or price
            card_img = best_cand['img_url']
            code = best_cand['code']
            key = best_cand['key']
            cat = best_cand['cat']
            prod_obj = products_by_id.get(f"prod-{code}" if code else key)
        else:
            card_title = title
            card_price = price
            card_img = img_rel
            code = 1000 + p_num * 10 + s_num
            key = f"canva-p{p_num}-s{s_num}"
            cat = "مجموعة التراث المصري"
            prod_id = f"canva-p{p_num}-s{s_num}"
            prod_obj = products_by_id.get(prod_id)
            if not prod_obj:
                prod_obj = {
                    "id": prod_id,
                    "cashier_code": code,
                    "slug": f"prod-{prod_id}",
                    "name_ar": card_title,
                    "sale_price": card_price,
                    "category": cat,
                    "primary_image_url": card_img,
                    "images": {"sm": card_img, "md": card_img, "lg": card_img}
                }
                all_seed_products.append(prod_obj)
                products_by_id[prod_id] = prod_obj
            
        active_canva_cards.append({
            'title': card_title,
            'price': card_price,
            'img_url': card_img,
            'product': prod_obj,
            'canva_orig_page': p_num
        })

print(f"Collected {len(active_canva_cards)} non-blank Canva cards.")

# Cashier-only cards
cashier_cards = []
for item in no_canva_items:
    prod_obj = products_by_code.get(item['code'])
    cashier_cards.append({
        'title': item['p_name'],
        'price': item['sp'] or 250,
        'img_url': item['img_url'],
        'product': prod_obj,
        'canva_orig_page': 999
    })

print(f"Collected {len(cashier_cards)} Cashier-only cards.")

all_grid_items = active_canva_cards + cashier_cards
print(f"Total grid items to pack into 9-card pages: {len(all_grid_items)}")

final_pages = []

# Pages 1 to 5: Showcase pages
# Page 1: Honey
p1_prods = [products_by_code[c] for c in [1, 2, 3, 4] if c in products_by_code]
p1_slots = []
for s_idx, prod in enumerate(p1_prods, 1):
    p1_slots.append({
        "slot": s_idx,
        "title_override": prod["name_ar"],
        "price_override": prod["sale_price"],
        "image_override": prod["primary_image_url"],
        "product": prod
    })

final_pages.append({
    "position": 1,
    "pageNumber": 1,
    "template": "honey-showcase",
    "section_title": "NA7LA عسل نقي",
    "sectionTitle": "NA7LA عسل نقي",
    "slots": p1_slots
})

# Page 2: Baskets
final_pages.append({
    "position": 2,
    "pageNumber": 2,
    "template": "baskets-showcase",
    "section_title": "NA7LA عسل نقي",
    "sectionTitle": "NA7LA عسل نقي",
    "slots": [
        {"slot": 1, "title_override": "عسل سلة NA7LA", "price_override": 400, "image_override": "/uploads/excel_images/extra_457.webp", "product": products_by_id.get('extra_457')},
        {"slot": 2, "title_override": "سلة سعف النخيل", "price_override": 400, "image_override": "/uploads/excel_images/extra_456.webp", "product": products_by_id.get('extra_456')},
        {"slot": 3, "title_override": "زيت زيتون بكر ممتاز 1L", "price_override": 750, "image_override": "/uploads/excel_images/prod_53.webp", "product": products_by_code.get(53)},
        {"slot": 4, "title_override": "زيت زيتون بكر ممتاز 750 ML", "price_override": 575, "image_override": "/uploads/excel_images/prod_54.webp", "product": products_by_code.get(54)},
    ]
})

# Page 3: Olive 1L & Dates 1KG
final_pages.append({
    "position": 3,
    "pageNumber": 3,
    "template": "olive-dates-1",
    "section_title": "NA7LA عسل نقي",
    "sectionTitle": "NA7LA عسل نقي",
    "slots": [
        {"slot": 1, "title_override": "زيت زيتون بكر ممتاز 1L", "price_override": 750, "image_override": "/uploads/excel_images/prod_53.webp", "product": products_by_code.get(53)},
        {"slot": 2, "title_override": "تمور طبيعية حلوة طازجة 1 KG", "price_override": 400, "image_override": "/uploads/excel_images/extra_458.webp", "product": products_by_id.get('extra_458')}
    ]
})

# Page 4: Olive 750ML & Dates 500G
final_pages.append({
    "position": 4,
    "pageNumber": 4,
    "template": "olive-dates-2",
    "section_title": "NA7LA عسل نقي",
    "sectionTitle": "NA7LA عسل نقي",
    "slots": [
        {"slot": 1, "title_override": "زيت زيتون بكر ممتاز 750 ML", "price_override": 575, "image_override": "/uploads/excel_images/prod_54.webp", "product": products_by_code.get(54)},
        {"slot": 2, "title_override": "تمور طبيعية حلوة طازجة 500 G", "price_override": 280, "image_override": "/uploads/excel_images/extra_459.webp", "product": products_by_id.get('extra_459')}
    ]
})

# Page 5: Olive 500ML
final_pages.append({
    "position": 5,
    "pageNumber": 5,
    "template": "olive-showcase",
    "section_title": "NA7LA عسل نقي",
    "sectionTitle": "NA7LA عسل نقي",
    "slots": [
        {"slot": 1, "title_override": "زيت زيتون بكر ممتاز 500 ML", "price_override": 400, "image_override": "/uploads/excel_images/prod_55.webp", "product": products_by_code.get(55)}
    ]
})

# Pages 6 onwards: Dense Pack 9 Products Per Page
curr_p_num = 6
SLOTS_PER_PAGE = 9

for i in range(0, len(all_grid_items), SLOTS_PER_PAGE):
    chunk = all_grid_items[i:i + SLOTS_PER_PAGE]
    
    # Determine section title based on majority of items
    orig_pages = [item.get('canva_orig_page', 999) for item in chunk]
    avg_orig = sum(orig_pages) / len(orig_pages)
    
    if avg_orig >= 900:
        sec_title = "منتجات المعرض الإضافية"
    elif avg_orig >= 47:
        sec_title = "منتجات خشبية"
    else:
        sec_title = "مجموعة التراث المصري"
        
    page_slots = []
    for s_idx, item in enumerate(chunk, 1):
        page_slots.append({
            "slot": s_idx,
            "title_override": item['title'],
            "price_override": item['price'],
            "image_override": item['img_url'],
            "product": item['product']
        })
        
    final_pages.append({
        "position": curr_p_num,
        "pageNumber": curr_p_num,
        "template": "grid3x3",
        "section_title": sec_title,
        "sectionTitle": sec_title,
        "slots": page_slots
    })
    curr_p_num += 1

print(f"\nFinal Total Magazine Pages: {len(final_pages)}")
for p in final_pages[5:]:
    assert len(p['slots']) == 9, f"Page {p['position']} has {len(p['slots'])} slots instead of 9!"

print("CONFIRMED: Every single page from page 6 onwards has EXACTLY 9 products with ZERO empty spaces!")

# Save
live_issue_data = {
    "issueSlug": "lotus-pricelist",
    "title_ar": "مجلة لوتس",
    "version": 5,
    "publishedAt": "2026-10-29T17:35:00.000Z",
    "totalPages": len(final_pages),
    "pages": final_pages
}

with open(LIVE_ISSUE_PATH, 'w', encoding='utf-8') as f:
    json.dump(live_issue_data, f, ensure_ascii=False, indent=2)

with open(SEED_PATH, 'w', encoding='utf-8') as f:
    json.dump(all_seed_products, f, ensure_ascii=False, indent=2)

print("SUCCESS: live_issue.json and products_seed.json have been updated successfully!")
