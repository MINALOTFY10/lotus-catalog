import sys, io, os, json, re, openpyxl

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 1. Load Excel
wb = openpyxl.load_workbook('Lotus_Cashier_vs_Canva_Catalog.xlsx', data_only=True)
ws_match = wb['المطابقة']
ws_canva = wb['كتالوج Canva']

# Build card to matches mapping from المطابقة
card_to_matches = {}
for r in range(2, ws_match.max_row + 1):
    c_code = ws_match.cell(r, 1).value
    c_name = ws_match.cell(r, 2).value
    c_price = ws_match.cell(r, 5).value
    canva_name = ws_match.cell(r, 7).value
    canva_price = ws_match.cell(r, 8).value
    status = ws_match.cell(r, 11).value
    card_ids = ws_match.cell(r, 12).value
    notes = ws_match.cell(r, 14).value
    orig_text = ws_match.cell(r, 15).value

    if card_ids:
        for c in str(card_ids).split(','):
            c_str = c.strip()
            if c_str not in card_to_matches:
                card_to_matches[c_str] = []
            card_to_matches[c_str].append({
                'row': r,
                'code': c_code,
                'cashier_name': c_name,
                'cashier_price': c_price,
                'canva_name': canva_name,
                'canva_price': canva_price,
                'status': status,
                'notes': notes,
                'orig_text': orig_text
            })

# 2. Number formatting utilities
ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
ENGLISH_DIGITS = "0123456789"
to_ar = str.maketrans(ENGLISH_DIGITS, ARABIC_DIGITS)
to_en = str.maketrans(ARABIC_DIGITS, ENGLISH_DIGITS)

def format_price_in_text(old_text, new_price):
    if not old_text or not str(old_text).strip():
        return f"{new_price} ج.مصري"
    
    new_price_str = str(int(new_price)) if float(new_price).is_integer() else str(new_price)
    lines = old_text.split('\n')
    new_lines = []
    for line in lines:
        match_ar = re.search(r'([٠-٩]+(?:\.[٠-٩]+)?)\s*(ج\.مصري|ج\.م|ج)', line)
        match_en = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(ج\.مصري|ج\.م|ج)', line)
        
        if match_ar:
            ar_new = new_price_str.translate(to_ar)
            new_line = line[:match_ar.start(1)] + ar_new + line[match_ar.end(1):]
            new_lines.append(new_line)
        elif match_en:
            new_line = line[:match_en.start(1)] + new_price_str + line[match_en.end(1):]
            new_lines.append(new_line)
        else:
            clean = line.strip()
            if re.match(r'^[٠-٩]+$', clean):
                new_lines.append(new_price_str.translate(to_ar) + " ج.مصري")
            elif re.match(r'^[0-9]+$', clean):
                new_lines.append(new_price_str + " ج.مصري")
            else:
                new_lines.append(line)
    return '\n'.join(new_lines)

# 3. Load JSON files
with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    live = json.load(f)

with open('data/canva_catalog_extracted.json', 'r', encoding='utf-8') as f:
    canva_extracted = json.load(f)

with open('data/products_seed.json', 'r', encoding='utf-8') as f:
    products_seed = json.load(f)

# Build seed dictionary by product id
seed_by_id = {p['id']: p for p in products_seed}

audit_log = []
product_price_updates = {} # prod_id -> new_price

for page in live['pages']:
    mag_p = page['pageNumber']
    orig_p = mag_p if mag_p <= 40 else mag_p + 1

    for slot in page['slots']:
        s_num = slot['slot']
        prod = slot.get('product') or {}
        prod_id = prod.get('id')
        prod_title = slot.get('title_override') or prod.get('name_ar') or ''
        old_text = slot.get('price_text') or ''
        old_override = slot.get('price_override')

        # Determine card ID
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

        matches = card_to_matches.get(card_id, [])
        valid_prices = [m['cashier_price'] for m in matches if m['cashier_price'] is not None]

        if not valid_prices:
            # FLAGGED: No Cashier Price available
            notes = matches[0]['notes'] if matches else 'Not in Excel'
            status = matches[0]['status'] if matches else 'غير موجود'
            audit_log.append({
                'page': mag_p,
                'slot': s_num,
                'card_id': card_id,
                'title': prod_title,
                'status': 'FLAGGED_NO_PRICE',
                'old_price': old_override,
                'new_price': old_override,
                'old_text': old_text,
                'new_text': old_text,
                'notes': notes,
                'match_status': status
            })
            continue

        # Handle specific multi-price cards
        if card_id == 'P01-2':
            # Clover honey 650g (385) & 1.5kg (620)
            new_text = '٦٥٠ جرام | 385 ج.مصري \n 1.5 كيلو | 620 ج.مصري'
            new_price = 385
        elif card_id == 'P02-2':
            new_text = '٥٠٠ مل | 400 ج.مصري \n ٧٥٠ مل | 575 ج.مصري \n 1 لتر | 750 ج.مصري'
            new_price = 400
        elif card_id == 'P24-1':
            new_text = 'المقاس والسعر\n٨٨٠ ج.مصري | سم  ٢٠*٢٠\n١١٥٠ ج.مصري | ٢٥ سم*٣٥'
            new_price = 880
        elif card_id == 'P25-7':
            new_text = '١٥٢٠ ج.مصري | ١٥ سم قطر'
            new_price = 1520
        elif card_id == 'P40-1':
            new_text = '٢٢٠ ج.مصري | صغير\n٣٠٠ ج.مصري | كبير'
            new_price = 220
        elif card_id == 'P05-3':
            new_text = 'المقاس والسعر\n٨٨٠ ج.مصري | ٨٠ سم'
            new_price = 880
        elif card_id == 'P07-7':
            new_text = '٨٨٠ ج.مصري | كبير'
            new_price = 880
        else:
            new_price = valid_prices[0]
            new_text = format_price_in_text(old_text, new_price)

        if not new_text or new_text.strip() == '':
            new_text = f"{new_price} ج.مصري"

        # Apply updates to slot
        slot['price_override'] = new_price
        slot['price_text'] = new_text
        if 'product' in slot and slot['product']:
            slot['product']['sale_price'] = new_price

        if prod_id:
            product_price_updates[prod_id] = new_price

        audit_log.append({
            'page': mag_p,
            'slot': s_num,
            'card_id': card_id,
            'title': prod_title,
            'status': 'UPDATED',
            'old_price': old_override,
            'new_price': new_price,
            'old_text': old_text,
            'new_text': new_text,
            'notes': matches[0]['notes'] if matches else '',
            'match_status': matches[0]['status'] if matches else 'مطابق'
        })

# 4. Sync canva_catalog_extracted.json
for page in canva_extracted:
    mag_p = page.get('pageNumber')
    orig_p = mag_p if mag_p <= 40 else mag_p + 1
    for slot in page.get('slots', []):
        s_num = slot['slot']
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

        # Find matching item in audit_log
        audit_item = next((a for a in audit_log if a['page'] == mag_p and a['slot'] == s_num), None)
        if audit_item and audit_item['status'] == 'UPDATED':
            slot['price_override'] = audit_item['new_price']
            slot['price_text'] = audit_item['new_text']
            if 'product' in slot and slot['product']:
                slot['product']['sale_price'] = audit_item['new_price']

# 5. Sync products_seed.json
seed_updated = 0
for p in products_seed:
    pid = p.get('id')
    if pid in product_price_updates:
        p['sale_price'] = product_price_updates[pid]
        seed_updated += 1

# 6. Save JSON files
with open('data/live_issue.json', 'w', encoding='utf-8') as f:
    json.dump(live, f, ensure_ascii=False, indent=2)

with open('data/canva_catalog_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(canva_extracted, f, ensure_ascii=False, indent=2)

with open('data/products_seed.json', 'w', encoding='utf-8') as f:
    json.dump(products_seed, f, ensure_ascii=False, indent=2)

print(f"Successfully saved data files!")
print(f"Live issue slots updated: {sum(1 for a in audit_log if a['status'] == 'UPDATED')}")
print(f"Flagged slots without cashier price: {sum(1 for a in audit_log if a['status'] == 'FLAGGED_NO_PRICE')}")
print(f"Products seed updated: {seed_updated}")

# 7. Generate markdown audit report
os.makedirs("scratch", exist_ok=True)
with open('scratch/price_update_report.md', 'w', encoding='utf-8') as rep:
    rep.write("# تقرير تحديث أسعار الكتالوج وفق شيت الكاشير (Lotus Cashier vs Canva Catalog)\n\n")
    rep.write(f"- **إجمالي منتجات الكتالوج:** {len(audit_log)}\n")
    rep.write(f"- **تم تحديث أسعارها بنجاح بسعر الكاشير (Source of Truth):** {sum(1 for a in audit_log if a['status'] == 'UPDATED')}\n")
    rep.write(f"- **منتجات معلقة للمراجعة لعدم وجود سعر في شيت الكاشير:** {sum(1 for a in audit_log if a['status'] == 'FLAGGED_NO_PRICE')}\n\n")
    
    rep.write("## 1. المنتجات المعلقة للمراجعة (Flagged Products - No Cashier Price)\n\n")
    rep.write("| الصفحة | الكارت | اسم المنتج | السعر الحالي | الحالة في شيت المطابقة | ملاحظات |\n")
    rep.write("|---|---|---|---|---|---|\n")
    for a in audit_log:
        if a['status'] == 'FLAGGED_NO_PRICE':
            rep.write(f"| ص {a['page']} س {a['slot']} | {a['card_id']} | {a['title']} | {a['old_price']} ج.م | {a['match_status']} | {a['notes']} |\n")

    rep.write("\n## 2. جدول جميع المنتجات المحدثة (Updated Products Summary)\n\n")
    rep.write("| الصفحة والسلوت | الكارت | اسم المنتج | السعر القديم | سعر الكاشير الجديد | نص السعر المعروض |\n")
    rep.write("|---|---|---|---|---|---|\n")
    for a in audit_log:
        if a['status'] == 'UPDATED':
            display_text = a['new_text'].replace('\n', ' / ')
            rep.write(f"| ص {a['page']} س {a['slot']} | {a['card_id']} | {a['title']} | {a['old_price']} | **{a['new_price']} ج.م** | `{display_text}` |\n")

print("Generated audit report at scratch/price_update_report.md")
