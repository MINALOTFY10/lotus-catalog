import sys, io, os, json, openpyxl
from PIL import Image
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def load_with_white_bg(img_source):
    if isinstance(img_source, bytes):
        pil_img = Image.open(io.BytesIO(img_source))
    else:
        pil_img = Image.open(img_source)
    if pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info):
        pil_img = pil_img.convert('RGBA')
        bg = Image.new('RGB', pil_img.size, (255, 255, 255))
        bg.paste(pil_img, mask=pil_img.split()[3])
        return bg
    return pil_img.convert('RGB')

wb = openpyxl.load_workbook('Lotus_Cashier_vs_Canva_Catalog.xlsx')
ws = wb['المطابقة']

canva_imgs_by_row = {}
for img in ws._images:
    row_idx = img.anchor._from.row + 1
    col_idx = img.anchor._from.col
    if col_idx == 9:
        canva_imgs_by_row[row_idx] = img

card_to_rows = {}
for r in range(2, ws.max_row + 1):
    cards = ws.cell(r, 12).value
    if cards:
        for c in str(cards).split(','):
            c_str = c.strip()
            if c_str not in card_to_rows:
                card_to_rows[c_str] = []
            card_to_rows[c_str].append(r)

with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    live = json.load(f)

diffs = []
missing_img = []

for page in live['pages']:
    mag_p = page['pageNumber']
    orig_p = mag_p if mag_p <= 40 else mag_p + 1

    for slot in page['slots']:
        s_num = slot['slot']
        prod = slot.get('product') or {}
        mag_img_rel = slot.get('image_override') or prod.get('primary_image_url') or ''
        mag_path = os.path.join('public', mag_img_rel.lstrip('/'))

        if mag_p == 1:
            card_id = f"P01-{s_num + 1}"
        elif mag_p == 2:
            card_id = f"P02-{s_num + 1}"
        elif mag_p == 13 and s_num == 7:
            card_id = "P13-7"
        elif mag_p == 35 and s_num == 7:
            card_id = "P35-8"
        else:
            card_id = f"P{orig_p:02d}-{s_num}"

        rows = card_to_rows.get(card_id, [])
        img_row = None
        for r in rows:
            if r in canva_imgs_by_row:
                img_row = r
                break
        
        if not img_row or not os.path.exists(mag_path):
            missing_img.append((mag_p, s_num, card_id, mag_path, img_row))
            continue

        try:
            excel_img = load_with_white_bg(canva_imgs_by_row[img_row]._data())
            mag_img = load_with_white_bg(mag_path)
            e_arr = np.array(excel_img.resize((32, 32))).astype(float)
            m_arr = np.array(mag_img.resize((32, 32))).astype(float)
            mad = np.mean(np.abs(e_arr - m_arr))
            diffs.append((mag_p, s_num, card_id, mad, img_row))
        except Exception as ex:
            missing_img.append((mag_p, s_num, card_id, mag_path, str(ex)))

print(f"Total compared slot images: {len(diffs)}")
print(f"Missing images: {len(missing_img)}")

mads = [d[3] for d in diffs]
print(f"Mean MAD: {np.mean(mads):.2f}, Median MAD: {np.median(mads):.2f}, Min: {np.min(mads):.2f}, Max: {np.max(mads):.2f}")
print(f"Slots with MAD < 15: {sum(1 for m in mads if m < 15)}")
print(f"Slots with MAD < 30: {sum(1 for m in mads if m < 30)}")
print(f"Slots with MAD < 45: {sum(1 for m in mads if m < 45)}")
print(f"Slots with MAD >= 45: {sum(1 for m in mads if m >= 45)}")

if sum(1 for m in mads if m >= 45) > 0:
    print("\nSlots with MAD >= 45:")
    for d in diffs:
        if d[3] >= 45:
            print(f"  Mag P{d[0]} S{d[1]} ({d[2]}): MAD = {d[3]:.2f}")
