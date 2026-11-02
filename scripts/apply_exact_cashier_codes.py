import sys, io, json, openpyxl, re, shutil

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 1. Backups
shutil.copy('data/live_issue.json', 'data/live_issue_backup_before_cashier_codes.json')
shutil.copy('data/products_seed.json', 'data/products_seed_backup_before_cashier_codes.json')
shutil.copy('data/canva_catalog_extracted.json', 'data/canva_catalog_extracted_backup_before_cashier_codes.json')
print("Backups created successfully.")

# 2. Load Excel
wb = openpyxl.load_workbook('Lotus_Cashier_vs_Canva_Catalog.xlsx', data_only=True)
ws_canva = wb['كتالوج Canva']

excel_cards_by_page = {}
for r in list(ws_canva.iter_rows(values_only=True))[1:]:
    cid = str(r[0]).strip() if r[0] else None
    if not cid:
        continue
    page = int(r[1]) if r[1] is not None else None
    name = r[2]
    linked_codes = r[7]
    status = r[8]

    if page not in excel_cards_by_page:
        excel_cards_by_page[page] = []
    
    excel_cards_by_page[page].append({
        'cid': cid,
        'page': page,
        'name': name,
        'linked_codes': linked_codes,
        'status': status
    })

def parse_code(linked_val):
    if linked_val is None:
        return None
    val_str = str(linked_val).strip()
    if not val_str or val_str.lower() == 'none':
        return None
    # If comma separated, take first code
    first_part = val_str.split(',')[0].strip()
    m = re.search(r'\d+', first_part)
    if m:
        return int(m.group(0))
    return None

# Build a lookup function for any given mag_page and slot
def get_card_for_slot(mag_p, s_num, prod_title):
    excel_p = mag_p if mag_p <= 40 else mag_p + 1
    cards_on_page = excel_cards_by_page.get(excel_p, [])

    if mag_p == 1:
        cid_guess = f"P01-{s_num + 1}"
    elif mag_p == 2:
        cid_guess = f"P02-{s_num + 1}"
    elif mag_p == 13 and s_num == 7:
        cid_guess = "P13-7"
    elif mag_p == 13 and s_num == 8:
        cid_guess = "P13-8"
    elif mag_p == 35 and s_num == 7:
        cid_guess = "P35-8"
    elif mag_p == 35 and s_num == 8:
        cid_guess = "P35-7"
    else:
        cid_guess = f"P{excel_p:02d}-{s_num}"
    
    matched = next((c for c in cards_on_page if c['cid'] == cid_guess), None)
    if not matched:
        # fallback by name match
        for c in cards_on_page:
            c_name = (c['name'] or '').strip()
            if c_name and prod_title and (prod_title == c_name or prod_title.startswith(c_name) or c_name.startswith(prod_title)):
                matched = c
                break
    return matched

# 3. Update live_issue.json
with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    live = json.load(f)

updated_count = 0
unchanged_count = 0
set_none_count = 0

prod_id_to_new_code = {}

for page in live['pages']:
    mag_p = page['pageNumber']
    for slot in page['slots']:
        s_num = slot['slot']
        prod = slot.get('product')
        if not prod:
            continue
        prod_title = (slot.get('title_override') or prod.get('name_ar') or '').strip()
        matched = get_card_for_slot(mag_p, s_num, prod_title)
        
        old_code = prod.get('cashier_code')
        new_code = parse_code(matched['linked_codes']) if matched else None
        
        prod['cashier_code'] = new_code
        if prod.get('id'):
            prod_id_to_new_code[prod['id']] = new_code

        if new_code != old_code:
            updated_count += 1
        else:
            unchanged_count += 1
        
        if new_code is None:
            set_none_count += 1

with open('data/live_issue.json', 'w', encoding='utf-8') as f:
    json.dump(live, f, ensure_ascii=False, indent=2)

print(f"live_issue.json updated: {updated_count} changed, {unchanged_count} unchanged, {set_none_count} are None.")

# 4. Update products_seed.json
with open('data/products_seed.json', 'r', encoding='utf-8') as f:
    products_seed = json.load(f)

seed_updated = 0
for p in products_seed:
    pid = p.get('id')
    if pid in prod_id_to_new_code:
        p['cashier_code'] = prod_id_to_new_code[pid]
        seed_updated += 1

with open('data/products_seed.json', 'w', encoding='utf-8') as f:
    json.dump(products_seed, f, ensure_ascii=False, indent=2)

print(f"products_seed.json updated: {seed_updated} products synced.")

# 5. Update canva_catalog_extracted.json
with open('data/canva_catalog_extracted.json', 'r', encoding='utf-8') as f:
    canva_extracted = json.load(f)

extracted_updated = 0
for page in canva_extracted:
    mag_p = page.get('pageNumber')
    for slot in page.get('slots', []):
        prod = slot.get('product')
        if not prod:
            continue
        pid = prod.get('id')
        if pid in prod_id_to_new_code:
            prod['cashier_code'] = prod_id_to_new_code[pid]
            extracted_updated += 1
        else:
            s_num = slot.get('slot')
            prod_title = (slot.get('title_override') or prod.get('name_ar') or '').strip()
            matched = get_card_for_slot(mag_p, s_num, prod_title)
            new_code = parse_code(matched['linked_codes']) if matched else None
            prod['cashier_code'] = new_code
            extracted_updated += 1

with open('data/canva_catalog_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(canva_extracted, f, ensure_ascii=False, indent=2)

print(f"canva_catalog_extracted.json updated: {extracted_updated} products synced.")
