import sys
import os
import zipfile
import xml.etree.ElementTree as ET
import json
import io
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

excel_path = 'Lotus_Products_vs_Canva.xlsx'
if not os.path.exists(excel_path):
    print("Error: Excel file not found:", excel_path)
    sys.exit(1)

out_dir = os.path.join('public', 'uploads', 'products')
os.makedirs(out_dir, exist_ok=True)

print("1. Reading Excel drawings and relationship mapping...")
z = zipfile.ZipFile(excel_path, 'r')
rels_tree = ET.fromstring(z.read('xl/drawings/_rels/drawing1.xml.rels'))
rels = {r.attrib['Id']: r.attrib['Target'] for r in rels_tree}

draw_tree = ET.fromstring(z.read('xl/drawings/drawing1.xml'))
canva_images = {} # 0-indexed row -> target image path in zip

for anchor in draw_tree:
    from_elem = anchor.find('{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}from')
    blip = anchor.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
    if from_elem is not None and blip is not None:
        col = int(from_elem.find('{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}col').text)
        row = int(from_elem.find('{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}row').text)
        embed_id = blip.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed']
        target = rels.get(embed_id)
        if col == 7: # Column H: Canva Image
            canva_images[row] = target

print(f"Found {len(canva_images)} Canva images in drawing1.xml.")

# Read shared strings
strings = []
if 'xl/sharedStrings.xml' in z.namelist():
    ss_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
    for si in ss_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
        text = ''.join(t.text for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text)
        strings.append(text)

# Read sheet2 rows
sheet2 = ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
code_to_canva_img = {} # code (int or str) -> zip target path

# Track special rows after row 455 for showcase products
showcase_count_basket = 0

for row in sheet2.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
    r_idx = int(row.attrib['r']) # 1-indexed
    if r_idx == 1:
        continue # header
    row_0idx = r_idx - 1

    cols = {}
    for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
        r = c.attrib['r']
        col_letter = ''.join([ch for ch in r if ch.isalpha()])
        t = c.attrib.get('t')
        v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
        val = v.text if v is not None else ''
        if t == 's' and val.isdigit():
            val = strings[int(val)]
        cols[col_letter] = val

    code_str = cols.get('A', '').strip()
    canva_name = cols.get('F', '').strip()
    canva_img_target = canva_images.get(row_0idx)

    if code_str.isdigit():
        code_num = int(code_str)
        if canva_img_target:
            code_to_canva_img[code_num] = canva_img_target
    else:
        # Check showcase extra items (rows 456-459)
        if canva_img_target:
            if 'عسل سلة' in canva_name:
                showcase_count_basket += 1
                if showcase_count_basket == 1:
                    code_to_canva_img[901] = canva_img_target
                elif showcase_count_basket == 2:
                    code_to_canva_img[902] = canva_img_target
            elif 'تمور' in canva_name and '1 KG' in canva_name:
                code_to_canva_img[903] = canva_img_target
            elif 'تمور' in canva_name and '500 G' in canva_name:
                code_to_canva_img[904] = canva_img_target

print(f"Mapped {len(code_to_canva_img)} product codes to Canva images.")

print("2. Extracting and converting Canva images to WebP...")
processed_codes = set()
for code, target_rel in code_to_canva_img.items():
    media_file = 'xl/media/' + os.path.basename(target_rel)
    try:
        raw_data = z.read(media_file)
        img = Image.open(io.BytesIO(raw_data))
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # Keep alpha
            pass
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        orig_w, orig_h = img.size

        # Generate 1280w, 640w, 320w
        for size_w, suffix in [(1280, '1280w'), (640, '640w'), (320, '320w')]:
            scale = min(1.0, size_w / float(orig_w))
            target_w = max(1, int(orig_w * scale))
            target_h = max(1, int(orig_h * scale))

            resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS) if scale < 1.0 else img
            out_path = os.path.join(out_dir, f"prod_{code}_{suffix}.webp")
            resized.save(out_path, 'WEBP', quality=90)

        processed_codes.add(code)
    except Exception as e:
        print(f"Error processing image for code {code} ({media_file}): {e}")

print(f"Successfully generated WebP images for {len(processed_codes)} products.")

print("3. Updating products_seed.json...")
with open('data/products_seed.json', 'r', encoding='utf-8') as f:
    seed_products = json.load(f)

fallback_logo = '/brand/lotus_logo.png'
fallback_images = {
    'sm': fallback_logo,
    'md': fallback_logo,
    'lg': fallback_logo
}

canva_count = 0
fallback_count = 0

for p in seed_products:
    code = p.get('cashier_code')
    if code in processed_codes:
        p['primary_image_url'] = f"/uploads/products/prod_{code}_640w.webp"
        p['images'] = {
            'sm': f"/uploads/products/prod_{code}_320w.webp",
            'md': f"/uploads/products/prod_{code}_640w.webp",
            'lg': f"/uploads/products/prod_{code}_1280w.webp"
        }
        canva_count += 1
    else:
        # Fallback to website logo
        p['primary_image_url'] = fallback_logo
        p['images'] = fallback_images.copy()
        fallback_count += 1

        # Delete old product image files for this code if they exist
        if code is not None:
            for suffix in ['320w', '640w', '1280w']:
                old_file = os.path.join(out_dir, f"prod_{code}_{suffix}.webp")
                if os.path.exists(old_file):
                    try:
                        os.remove(old_file)
                    except:
                        pass

with open('data/products_seed.json', 'w', encoding='utf-8') as f:
    json.dump(seed_products, f, ensure_ascii=False, indent=2)

print(f"products_seed.json updated: {canva_count} Canva images, {fallback_count} logo fallbacks.")

print("4. Updating live_issue.json...")
with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    live_issue = json.load(f)

issue_canva_count = 0
issue_fallback_count = 0

for page in live_issue.get('pages', []):
    for slot in page.get('slots', []):
        prod = slot.get('product')
        code = prod.get('cashier_code') if prod else None

        if code in processed_codes:
            url_640 = f"/uploads/products/prod_{code}_640w.webp"
            slot['image_override'] = url_640
            if prod:
                prod['primary_image_url'] = url_640
                prod['images'] = {
                    'sm': f"/uploads/products/prod_{code}_320w.webp",
                    'md': url_640,
                    'lg': f"/uploads/products/prod_{code}_1280w.webp"
                }
            issue_canva_count += 1
        else:
            slot['image_override'] = fallback_logo
            if prod:
                prod['primary_image_url'] = fallback_logo
                prod['images'] = fallback_images.copy()
            issue_fallback_count += 1

with open('data/live_issue.json', 'w', encoding='utf-8') as f:
    json.dump(live_issue, f, ensure_ascii=False, indent=2)

print(f"live_issue.json updated: {issue_canva_count} Canva images, {issue_fallback_count} logo fallbacks.")
print("ALL DONE!")
