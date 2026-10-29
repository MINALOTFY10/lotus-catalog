import sys
import zipfile
import xml.etree.ElementTree as ET
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

excel_path = 'Lotus_Products_vs_Canva.xlsx'
if not os.path.exists(excel_path):
    print("File not found:", excel_path)
    sys.exit(1)

z = zipfile.ZipFile(excel_path, 'r')
rels_tree = ET.fromstring(z.read('xl/drawings/_rels/drawing1.xml.rels'))
rels = {r.attrib['Id']: r.attrib['Target'] for r in rels_tree}

draw_tree = ET.fromstring(z.read('xl/drawings/drawing1.xml'))
canva_images = {} # row (0-indexed) -> target
product_images = {} # row (0-indexed) -> target

for anchor in draw_tree:
    from_elem = anchor.find('{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}from')
    blip = anchor.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
    if from_elem is not None and blip is not None:
        col = int(from_elem.find('{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}col').text)
        row = int(from_elem.find('{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}row').text)
        embed_id = blip.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed']
        target = rels.get(embed_id)
        if col == 7: # Canva Image (Col H)
            canva_images[row] = target
        elif col == 4: # Product Photo (Col E)
            product_images[row] = target

print('Canva images count (Col 7 / H):', len(canva_images))
print('Product photo count (Col 4 / E):', len(product_images))

# Shared strings
strings = []
if 'xl/sharedStrings.xml' in z.namelist():
    ss_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
    for si in ss_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
        text = ''.join(t.text for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text)
        strings.append(text)

# Sheet2
sheet2 = ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
rows_info = []
for row in sheet2.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
    r_idx = int(row.attrib['r']) # 1-indexed row in Excel
    if r_idx == 1:
        continue # header row
    row_0idx = r_idx - 1 # 0-indexed row for drawing anchor

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

    code = cols.get('A')
    name = cols.get('B')
    category = cols.get('C')
    price = cols.get('D')
    canva_name = cols.get('F')
    canva_price = cols.get('G')
    status = cols.get('I')
    
    canva_img = canva_images.get(row_0idx)
    prod_img = product_images.get(row_0idx)

    rows_info.append({
        'excel_row': r_idx,
        'code': int(code) if code and code.isdigit() else code,
        'name': name,
        'category': category,
        'canva_name': canva_name,
        'canva_img': canva_img,
        'prod_img': prod_img,
        'status': status
    })

print('Total data rows:', len(rows_info))
with_canva = [r for r in rows_info if r['canva_img']]
print('Rows with Canva image:', len(with_canva))
print('Sample rows with Canva image:')
for r in with_canva[:5]:
    print(r)

without_canva = [r for r in rows_info if not r['canva_img']]
print('Rows WITHOUT Canva image:', len(without_canva))
print('Sample rows WITHOUT Canva image:')
for r in without_canva[:5]:
    print(r)
