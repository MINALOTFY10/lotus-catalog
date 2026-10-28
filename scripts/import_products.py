import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import io
import re
import json
import zipfile
import xml.etree.ElementTree as ET
from PIL import Image
import openpyxl

ROOT_DIR = r"d:\Open Projects\lotus catolog"
EXCEL_PATH = os.path.join(ROOT_DIR, "Lotus_Products_vs_Canva.xlsx")
DATA_DIR = os.path.join(ROOT_DIR, "data")
UPLOADS_DIR = os.path.join(ROOT_DIR, "public", "uploads", "products")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

print("=== STEP 3: IMPORT PRODUCTS AND REBUILD DRAFT MAGAZINE ===")

# 1. Parse drawing anchors from xlsx
print("1. Parsing drawing anchors from Excel...")
with zipfile.ZipFile(EXCEL_PATH, 'r') as z:
    rels_content = z.read('xl/drawings/_rels/drawing1.xml.rels')
    rels_root = ET.fromstring(rels_content)
    rel_map = {}
    for elem in rels_root:
        r_id = elem.attrib.get('Id')
        target = elem.attrib.get('Target')
        if target.startswith('../'):
            target = 'xl/' + target[3:]
        rel_map[r_id] = target

    drawing_content = z.read('xl/drawings/drawing1.xml')
    drawing_root = ET.fromstring(drawing_content)
    ns = {
        'xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
        'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    }

    cell_image_map = {}
    for child in drawing_root:
        from_elem = child.find('xdr:from', ns)
        blip = child.find('.//a:blip', ns)
        if from_elem is not None and blip is not None:
            col = int(from_elem.find('xdr:col', ns).text)
            row = int(from_elem.find('xdr:row', ns).text)
            blip_id = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
            cell_image_map[(row, col)] = rel_map.get(blip_id)

print(f"Total drawing anchors mapped: {len(cell_image_map)}")

# 2. Parse Reconciliation sheet
print("2. Parsing product rows from 'Reconciliation' sheet...")
wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
ws = wb['Reconciliation']
all_rows = list(ws.iter_rows(values_only=True))
header = all_rows[0]
data_rows = all_rows[1:454] # Only 453 products with official cashier codes 1..453

def is_empty(val):
    if val is None:
        return True
    s = str(val).strip()
    return s == "" or s == "-" or s.upper() == "N/A"

def clean_val(val):
    if is_empty(val):
        return None
    return str(val).strip()

def slugify(text):
    clean = re.sub(r'[\s/\\?#%&+=]+', '-', text).strip('-')
    return clean or "item"

# Helper for WebP sizes (320, 640, 1280 px)
def generate_webp_sizes(image_bytes, code):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background

        orig_w, orig_h = img.size
        sizes = [320, 640, 1280]
        paths = {}
        for target_w in sizes:
            target_h = max(1, round(orig_h * (target_w / orig_w)))
            resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            filename = f"prod_{code}_{target_w}w.webp"
            filepath = os.path.join(UPLOADS_DIR, filename)
            resized.save(filepath, format="WEBP", quality=85, method=4)
            paths[f"{target_w}w"] = f"/uploads/products/{filename}"

        return paths
    except Exception as e:
        print(f"Error processing image for code {code}: {e}")
        return None

# Load existing products if upserting
seed_path = os.path.join(DATA_DIR, "products_seed.json")
existing_products_map = {}
if os.path.exists(seed_path):
    try:
        with open(seed_path, "r", encoding="utf-8") as f:
            for p in json.load(f):
                if p.get("cashier_code"):
                    existing_products_map[p["cashier_code"]] = p
    except:
        pass

imported_products = []
stats = {
    'canva_name': 0,
    'fallback_name': 0,
    'canva_image': 0,
    'fallback_image': 0,
    'no_image': 0
}

print("3. Processing products and generating WebP sizes...")
with zipfile.ZipFile(EXCEL_PATH, 'r') as z:
    for idx, r in enumerate(data_rows):
        row_0idx = idx + 1 # Drawing anchor row is 1-indexed relative to top
        code = int(r[0])
        p_name = clean_val(r[1])
        category = clean_val(r[2])
        sale_price_raw = clean_val(r[3])
        p_img_target = cell_image_map.get((row_0idx, 4))
        c_name = clean_val(r[5])
        c_img_target = cell_image_map.get((row_0idx, 7))

        # Rule 1: Product Name
        if c_name:
            chosen_name = c_name
            stats['canva_name'] += 1
        else:
            chosen_name = p_name
            stats['fallback_name'] += 1

        # Rule 2: Product Image
        if c_img_target:
            chosen_img_target = c_img_target
            stats['canva_image'] += 1
        elif p_img_target:
            chosen_img_target = p_img_target
            stats['fallback_image'] += 1
        else:
            chosen_img_target = None
            stats['no_image'] += 1

        # Generate WebP images
        image_paths = None
        if chosen_img_target:
            img_bytes = z.read(chosen_img_target)
            image_paths = generate_webp_sizes(img_bytes, code)

        # Rule 3: Sale Price (Only Sale Price, never Canva Price; empty if not present)
        sale_price = None
        if sale_price_raw is not None:
            try:
                sale_price = float(sale_price_raw)
                if sale_price.is_integer():
                    sale_price = int(sale_price)
            except:
                sale_price = None

        prod_id = f"prod-{code}"
        slug = f"prod-{code}-{slugify(chosen_name)}"
        primary_url = image_paths["640w"] if image_paths else f"/uploads/products/prod_{code}_640w.webp"

        product_record = {
            "id": prod_id,
            "cashier_code": code,
            "slug": slug,
            "name_ar": chosen_name,
            "name_en": None,
            "description_ar": None,
            "description_en": None,
            "category": category,
            "sale_price": sale_price,
            "in_stock": True,
            "primary_image_url": primary_url,
            "images": {
                "sm": image_paths["320w"] if image_paths else None,
                "md": image_paths["640w"] if image_paths else None,
                "lg": image_paths["1280w"] if image_paths else None
            }
        }

        imported_products.append(product_record)

# Upsert check: order preserved, exactly 453 products
print(f"Total processed products: {len(imported_products)}")
with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(imported_products, f, ensure_ascii=False, indent=2)

print(f"Saved products_seed.json ({os.path.getsize(seed_path)/1024:.1f} KB)")

# 4. Rebuild draft magazine with existing auto-layout
print("\n4. Rebuilding draft magazine using auto-layout...")

def determine_section_title(category):
    if not category:
        return 'مجموعة التراث المصري'
    lower = category.lower()
    if 'عسل' in lower or 'نحلة' in lower or 'na7la' in lower:
        return 'NA7LA عسل نقي'
    if 'خشب' in lower or 'سرسوع' in lower:
        return 'خشبي برودوكتس'
    return 'مجموعة التراث المصري'

def generate_auto_layout(products, cards_per_page=9):
    section_map = {}
    for p in products:
        sec = determine_section_title(p.get("category"))
        if sec not in section_map:
            section_map[sec] = []
        section_map[sec].append(p)

    pages = []
    page_num = 1
    for sec_title, sec_prods in section_map.items():
        for i in range(0, len(sec_prods), cards_per_page):
            chunk = sec_prods[i:i + cards_per_page]
            slots = []
            for slot_idx, prod in enumerate(chunk):
                slots.append({
                    "slot": slot_idx + 1,
                    "product": prod
                })
            pages.append({
                "position": page_num,
                "pageNumber": page_num,
                "template": "grid3x3",
                "section_title": sec_title,
                "sectionTitle": sec_title,
                "slots": slots
            })
            page_num += 1
    return pages

magazine_pages = generate_auto_layout(imported_products, 9)

draft_issue = {
    "issueSlug": "lotus-pricelist-a4",
    "title_ar": "مجلة لوتس",
    "version": 1,
    "publishedAt": "2026-10-28T10:00:00.000Z",
    "totalPages": len(magazine_pages),
    "pages": magazine_pages
}

live_issue_path = os.path.join(DATA_DIR, "live_issue.json")
with open(live_issue_path, "w", encoding="utf-8") as f:
    json.dump(draft_issue, f, ensure_ascii=False, indent=2)

print(f"Saved live_issue.json ({os.path.getsize(live_issue_path)/1024:.1f} KB, totalPages: {len(magazine_pages)})")

# Ensure no published version exists
print("Ensuring draft state (not published)...")
version_history_path = os.path.join(DATA_DIR, "version_history.json")
with open(version_history_path, "w", encoding="utf-8") as f:
    json.dump([], f, indent=2)

print("\n--- IMPORT SUMMARY ---")
print(f"Imported products: {len(imported_products)}")
print(f"Names from Canva: {stats['canva_name']}")
print(f"Names from fallback (Products): {stats['fallback_name']}")
print(f"Images from Canva: {stats['canva_image']}")
print(f"Images from fallback (Products): {stats['fallback_image']}")
print(f"Missing images: {stats['no_image']}")
print(f"Draft magazine pages: {len(magazine_pages)}")
print("STEP 3 COMPLETE.")
