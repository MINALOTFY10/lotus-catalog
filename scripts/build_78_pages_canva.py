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

print("=== REBUILDING CATALOG: 65 CANVA PAGES + 13 CASHIER PAGES (78 TOTAL) ===")

# 1. Load Canva extracted pages
with open(CANVA_EXTRACTED_PATH, 'r', encoding='utf-8') as f:
    canva_pages = json.load(f)

# 2. Load products seed
with open(SEED_PATH, 'r', encoding='utf-8') as f:
    products_seed = json.load(f)

products_by_code = {p['cashier_code']: p for p in products_seed if p.get('cashier_code')}
products_by_id = {p['id']: p for p in products_seed if p.get('id')}

# 3. Identify the 116 Cashier-Only products from Excel
wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
ws = wb['Reconciliation']

has_canva_card_codes = set()
no_canva_card_codes = []

for idx, r in enumerate(list(ws.iter_rows(values_only=True))[1:454], 1):
    code = int(r[0])
    c_name = r[5]
    status = str(r[8] or '')
    if c_name or 'مطابق' in status:
        has_canva_card_codes.add(code)
    else:
        no_canva_card_codes.append(code)

print(f"Identified {len(has_canva_card_codes)} products with Canva cards, and {len(no_canva_card_codes)} cashier-only products.")
assert len(no_canva_card_codes) == 116, f"Expected 116 non-Canva products, got {len(no_canva_card_codes)}"

# Dictionary for cleaning the garbled OCR titles
garbled_corrections = {
    "ة ح و ل ت ر ا د ن سا ا يً و د ي ع و ن ص م": "لوحة رملية يدوية Wahba Art",
    "ة ل س ل س س س ا بر ق ي ت ع ا يً و د ي ع و ن ص م": "سلسلة تراثية برونزية يدوية",
    "بلاتتير م ي قد ت يك م ا ر كي يًا و د ي ع و ن ص م /": "طبق تقديم سيراميك تراثي يدوي",
    "ز ان ي ج م ر ت و ي د ية ي ن ت ي ف ص كرا د ك ان ي ه م ا ن ير م ك ر ل اي ي ب مستط يدويًا مصنوع": "كوليه تراثي فيروزي يدوي",
    "لى ع ة د لا ق ر ح ب ال م ج ن ي وز ر ي ف زاٍه ـ ب ز مي ت ي": "قلادة بحرية بحجر فيروزي زاهٍ",
    "د ي ت ي ك ا ف ئ, اف د ن م يًا و د ي ع و ن ص م": "قلادة عقيق تراثية يدوية",
    "د ي ت ي ك ا ف ي ع بي ط ن م ا يً و د ي ع نو ص م": "قلادة أحجار طبيعية يدوية",
    "مصنوع ر وا س رز خ ل ا ب ع ص ر م ق ي ق ر ا ويً د ي وع ن ص م": "سوار خرز رقيق يدوي",
    "ال صينية بيكتوريال مصري \" \"": "صينية نحاس مصري بيكتوريال",
    "فان صينية فضي منقوش ي ر ائ د \"": "صينية فضية منقوشة",
    "ل ا نتي سي س ي ك ي م ا ير ك ن وو بر ا- ت تراكو جلوسسي": "فازة سيراميك تراكوتا جلوسي",
    "ي ون م ر ا ه": "مجسم هرمي خشبي مرصع",
    "بـ ز تمي ي س وك ب ت \" ا وهر ج م ن دي و وو ويًا د ي ع": "صندوق مجوهرات خشبي يدوي",
    "ي ك ي ت لات": "حامل شموع خشبي لاتيكي",
    "تورسو أزرق فاسي سيراميك \" \"": "فازة سيراميك تورسو أزرق",
}

def clean_canva_title(raw_title: str) -> str:
    if not raw_title:
        return ""
    t = raw_title.strip()
    if t in garbled_corrections:
        return garbled_corrections[t]
    t = re.sub(r'^[,\-&.\s]+', '', t).strip()
    if (t.startswith('"') and t.endswith('"')) or (t.startswith("'") and t.endswith("'")):
        t = t[1:-1].strip()
    return t

all_new_products = list(products_seed)
all_products_by_id = {p['id']: p for p in all_new_products if p.get('id')}

final_pages = []

# Build Pages 1 to 65 from Canva
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
    
    # Showcase templates for pages 1 to 5
    if p_num == 1:
        page_obj["template"] = "honey-showcase"
        p1_products = [products_by_code[c] for c in [1, 2, 3, 4] if c in products_by_code]
        for s_idx, prod in enumerate(p1_products, 1):
            page_obj["slots"].append({
                "slot": s_idx,
                "title_override": prod["name_ar"],
                "price_override": prod["sale_price"],
                "image_override": prod["primary_image_url"],
                "product": prod
            })
        final_pages.append(page_obj)
        continue
        
    if p_num == 2:
        page_obj["template"] = "baskets-showcase"
        final_pages.append(page_obj)
        continue
        
    if p_num == 3:
        page_obj["template"] = "olive-dates-1"
        final_pages.append(page_obj)
        continue
        
    if p_num == 4:
        page_obj["template"] = "olive-dates-2"
        final_pages.append(page_obj)
        continue
        
    if p_num == 5:
        page_obj["template"] = "olive-showcase"
        final_pages.append(page_obj)
        continue
        
    # Pages 6 to 65: Grid 3x3
    page_obj["template"] = "grid3x3"
    
    for s_idx in range(1, 10):
        s_data = next((s for s in c_page['slots'] if s['slot'] == s_idx), None)
        if not s_data:
            continue
            
        img_rel = s_data.get('imageUrl', f"/magazine/extracted/p{p_num}_s{s_idx}.webp")
        img_full = os.path.join(ROOT_DIR, "public", img_rel.lstrip('/'))
        
        # Check if slot is blank space in Canva
        is_blank = False
        if os.path.exists(img_full):
            try:
                arr = np.array(Image.open(img_full).convert('RGB'))
                if arr.std() < 5.0:
                    is_blank = True
            except:
                pass
                
        raw_title = s_data.get('title', '')
        if raw_title.startswith('منتج لوتس'):
            is_blank = True
            
        if is_blank:
            page_obj["slots"].append({
                "slot": s_idx,
                "title_override": "",
                "price_override": None,
                "image_override": img_rel,
                "product": None
            })
            continue
            
        cleaned_title = clean_canva_title(raw_title)
        price = s_data.get('price')
        if not price or price <= 0:
            price = 250
            
        prod_id = f"canva-p{p_num}-s{s_idx}"
        prod_slug = f"prod-canva-p{p_num}-s{s_idx}-{re.sub(r'[\s/\\?#%&+=]+', '-', cleaned_title)[:25]}".strip('-')
        
        prod_obj = all_products_by_id.get(prod_id)
        if not prod_obj:
            prod_obj = {
                "id": prod_id,
                "cashier_code": 1000 + p_num * 10 + s_idx,
                "slug": prod_slug,
                "name_ar": cleaned_title,
                "name_en": None,
                "description_ar": f"منتج تراثي أصيل من كتالوج لوتس - {sec_title}، تصميم وحرفية مصرية متميزة.",
                "description_en": None,
                "category": sec_title,
                "sale_price": price,
                "in_stock": True,
                "primary_image_url": img_rel,
                "images": {"sm": img_rel, "md": img_rel, "lg": img_rel}
            }
            all_new_products.append(prod_obj)
            all_products_by_id[prod_id] = prod_obj
        else:
            prod_obj["name_ar"] = cleaned_title
            prod_obj["sale_price"] = price
            prod_obj["primary_image_url"] = img_rel
            prod_obj["images"] = {"sm": img_rel, "md": img_rel, "lg": img_rel}
            
        page_obj["slots"].append({
            "slot": s_idx,
            "title_override": cleaned_title,
            "price_override": price,
            "image_override": img_rel,
            "product": prod_obj
        })
        
    final_pages.append(page_obj)

print(f"Compiled 65 Canva pages.")

# 4. Append the 116 Cashier-Only products (Pages 66 to 78)
SLOTS_PER_PAGE = 9
curr_p_num = 66

cashier_prods_to_append = [products_by_code[c] for c in no_canva_card_codes if c in products_by_code]
print(f"Appending {len(cashier_prods_to_append)} cashier-only products starting at page {curr_p_num}...")

for i in range(0, len(cashier_prods_to_append), SLOTS_PER_PAGE):
    chunk = cashier_prods_to_append[i:i + SLOTS_PER_PAGE]
    page_slots = []
    for s_idx, prod in enumerate(chunk, 1):
        code = prod['cashier_code']
        img_url = prod.get('primary_image_url')
        if not img_url or 'lotus_logo' in img_url:
            candidate = f"/uploads/products/prod_{code}_640w.webp"
            if os.path.exists(os.path.join(ROOT_DIR, "public", candidate.lstrip('/'))):
                img_url = candidate
            else:
                img_url = "/brand/lotus_logo.png"
                
        prod['primary_image_url'] = img_url
        prod['images'] = {"sm": img_url, "md": img_url, "lg": img_url}
        
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

print(f"Total Magazine Pages: {len(final_pages)} (Expected: 78)")
assert len(final_pages) == 78, f"Expected 78 pages, got {len(final_pages)}"

# 5. Save live_issue.json
live_issue_data = {
    "issueSlug": "lotus-pricelist",
    "title_ar": "مجلة لوتس",
    "version": 2,
    "publishedAt": "2026-10-29T17:15:00.000Z",
    "totalPages": len(final_pages),
    "pages": final_pages
}

with open(LIVE_ISSUE_PATH, 'w', encoding='utf-8') as f:
    json.dump(live_issue_data, f, ensure_ascii=False, indent=2)

# 6. Save products_seed.json
with open(SEED_PATH, 'w', encoding='utf-8') as f:
    json.dump(all_new_products, f, ensure_ascii=False, indent=2)

print("SUCCESS: Both live_issue.json and products_seed.json have been updated to 78 pages!")
