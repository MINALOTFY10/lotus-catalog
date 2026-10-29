import json, os, sys, openpyxl, re

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"d:\Open Projects\lotus catolog"
DATA_DIR = os.path.join(ROOT_DIR, "data")
SEED_PATH = os.path.join(DATA_DIR, "products_seed.json")
LIVE_ISSUE_PATH = os.path.join(DATA_DIR, "live_issue.json")
EXCEL_PATH = os.path.join(ROOT_DIR, "Lotus_Products_vs_Canva.xlsx")
IMG_DIR = os.path.join(ROOT_DIR, "public", "uploads", "excel_images")

print("=== UPDATING PRODUCTS & MAGAZINE TO USE EXCEL CRISP IMAGES ===")

# 1. Map available Excel images
available_images = os.listdir(IMG_DIR)
excel_img_map = {}
for fname in available_images:
    if fname.endswith('.webp'):
        base = fname[:-5] # e.g. prod_1 or extra_456
        excel_img_map[base] = f"/uploads/excel_images/{fname}"

print(f"Total available crisp Excel images: {len(excel_img_map)}")

# 2. Update products_seed.json
with open(SEED_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

updated_prods = 0
for p in products:
    code = p.get('cashier_code')
    p_id = p.get('id', '')
    
    img_url = None
    if code is not None and f"prod_{code}" in excel_img_map:
        img_url = excel_img_map[f"prod_{code}"]
    elif p_id.startswith('extra_') and p_id in excel_img_map:
        img_url = excel_img_map[p_id]
        
    if img_url:
        p['primary_image_url'] = img_url
        p['images'] = {
            'sm': img_url,
            'md': img_url,
            'lg': img_url
        }
        updated_prods += 1

print(f"Updated {updated_prods} products in seed with crisp Excel images.")

with open(SEED_PATH, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

# 3. Update live_issue.json
with open(LIVE_ISSUE_PATH, 'r', encoding='utf-8') as f:
    live_issue = json.load(f)

updated_slots = 0
for page in live_issue['pages']:
    for s in page.get('slots', []):
        prod = s.get('product')
        if prod:
            code = prod.get('cashier_code')
            p_id = prod.get('id', '')
            
            img_url = None
            if code is not None and f"prod_{code}" in excel_img_map:
                img_url = excel_img_map[f"prod_{code}"]
            elif p_id.startswith('extra_') and p_id in excel_img_map:
                img_url = excel_img_map[p_id]
            elif prod.get('primary_image_url') and prod['primary_image_url'].startswith('/uploads/excel_images/'):
                img_url = prod['primary_image_url']
                
            if img_url:
                s['image_override'] = img_url
                prod['primary_image_url'] = img_url
                prod['images'] = {'sm': img_url, 'md': img_url, 'lg': img_url}
                updated_slots += 1

print(f"Updated {updated_slots} slots in live_issue.json with crisp Excel images.")

with open(LIVE_ISSUE_PATH, 'w', encoding='utf-8') as f:
    json.dump(live_issue, f, ensure_ascii=False, indent=2)

print("SUCCESS: Products and magazine slots now use authentic crisp images from Lotus_Products_vs_Canva.xlsx!")
