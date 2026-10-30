import fitz, os, sys, json, re, unicodedata, io
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"d:\Open Projects\lotus catolog"
PDF_PATH = os.path.join(ROOT_DIR, "Arabic lotus Pricelist.pdf")
if not os.path.exists(PDF_PATH):
    PDF_PATH = os.path.join(ROOT_DIR, "canva_catalog_official.pdf")

IMG_OUT_DIR = os.path.join(ROOT_DIR, "public", "magazine", "canva_products")
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(IMG_OUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

SCALE = 2.5
arabic_to_western = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')

def reverse_arabic_digits(text: str) -> str:
    def repl(m):
        return m.group(0)[::-1]
    return re.sub(r'[٠-٩]{2,}', repl, text)

def parse_price(price_str: str) -> int:
    if not price_str:
        return 250
    ar_digits = re.findall(r'[٠-٩]+', price_str)
    if ar_digits:
        for g in ar_digits:
            if len(g) >= 2:
                try:
                    return int(g.translate(arabic_to_western)[::-1])
                except:
                    pass
            elif len(g) == 1:
                try:
                    return int(g.translate(arabic_to_western)) * 100
                except:
                    pass
    en_digits = re.findall(r'\d+', price_str)
    if en_digits:
        for g in en_digits:
            if len(g) >= 2:
                try:
                    return int(g)
                except:
                    pass
    return 250

def clean_arabic_text(text: str) -> str:
    if not text:
        return ""
    norm = unicodedata.normalize('NFKC', text)
    norm = re.sub(r'^[,\-.\s\u2022]+', '', norm)
    norm = reverse_arabic_digits(norm)
    return norm.strip()

category_map = {
    "عسل": "عسل نحل ومنتجات طبيعية",
    "الغذائية": "منتجات غذائية طبيعية",
    "الكليـم": "سجاد وكليم يدوي",
    "الوسائد": "مفروشات ووسائد",
    "الحلفا": "خوص وحلفا طبيعي",
    "الملابس": "ملابس وقفاطين يدوية",
    "حقائب اليد": "حقائب يد مطرزة",
    "الاكسسورات": "إكسسوارات وحلي يدوية",
    "الزجاج": "زجاج معشق يدوي",
    "اللوحات": "لوحات وفنون يدوية",
    "السيراميك": "خزف وسيراميك يدوي",
    "الصابون": "صابون طبيعي وعناية",
    "النحاس": "نحاسيات ومعادن تراثية",
    "الملح": "منتجات ملح سيوة",
    "الإكسسوارات": "حلي ومجوهرات تراثية",
    "ميداليات": "ميداليات وتمائم تراثية",
    "المجسمات": "تحف وتماثيل فرعونية",
    "الشموع": "شموع معطرة وديكور",
    "الديكور": "ديكور منزلي تراثي",
    "الاخشاب": "منتجات خشبية وأرابيسك",
    "الصدف": "صدف مصري يدوي",
    "الحقائب الخشبية": "حقائب خشبية مطعمة"
}

def get_category(sec_title: str) -> str:
    for k, v in category_map.items():
        if k in sec_title:
            return v
    return "منتجات تراثية يدوية"

COLS_3X3 = [(405, 560), (265, 410), (125, 270)] # Col 1 (Right), Col 2 (Mid), Col 3 (Left)
ROWS_3X3 = [(140, 365), (365, 585), (585, 810)] # Row 1, Row 2, Row 3

COLS_2X3 = [(340, 560), (125, 345)]
ROWS_2X3 = [(140, 365), (365, 585), (585, 810)]

COLS_2X2 = [(340, 560), (125, 345)]
ROWS_2X2 = [(140, 470), (470, 810)]

SLOTS_P48 = [
    (340, 140, 560, 450), # slot 1: top right
    (125, 140, 345, 450), # slot 2: top left
    (125, 450, 560, 810), # slot 3: hero bottom
]

SLOTS_P1 = [
    (125, 140, 345, 410), # slot 1: Clover honey (left top)
    (340, 360, 560, 600), # slot 2: Comb honey (right mid)
    (125, 360, 345, 600), # slot 3: Nuts honey (left mid)
    (340, 590, 560, 830), # slot 4: Halfa bags (right bot)
]

SLOTS_P2 = [
    (125, 140, 345, 500), # slot 1: Olive oil
    (340, 360, 560, 620), # slot 2: Dates
]

CARDS_P3 = [
    (405, 130, 565, 365), (265, 130, 410, 365), (120, 130, 265, 365),
    (405, 365, 565, 585), (265, 365, 410, 585), (120, 365, 265, 585),
    (340, 585, 565, 820), (120, 585, 345, 820)
]

CARDS_7SLOTS = [
    (405, 130, 565, 365), (265, 130, 410, 365), (120, 130, 265, 365),
    (405, 365, 565, 585), (265, 365, 410, 585), (120, 365, 265, 585),
    (265, 585, 410, 820)
]

def is_header_or_ornament(info):
    w, h = info['width'], info['height']
    bbox = info['bbox']
    # Full card background frames (834x1190 etc.)
    if (w in [834, 835, 1127, 1128, 2004, 2006] and h in [1189, 1190, 1192, 2124]):
        return True
    # Header logo / seal
    if bbox[1] < 125 and bbox[3] < 130 and 190 < bbox[0] < 480:
        return True
    # Left margin background leaf ornament
    if bbox[2] < 70:
        return True
    return False

def get_page_candidates(page):
    infos = page.get_image_info(xrefs=True)
    cands = []
    for info in infos:
        if is_header_or_ornament(info):
            continue
        bbox = info['bbox']
        w, h = info['width'], info['height']
        cands.append({
            'xref': info['xref'],
            'bbox': bbox,
            'center': ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2),
            'width': w,
            'height': h,
        })
    return cands

def match_cards_to_images(cards, cands):
    assignments = {}
    used_xrefs = set()
    
    pairs = []
    for c_idx, (cx0, cy0, cx1, cy1) in enumerate(cards):
        target_x = (cx0 + cx1) / 2
        target_y = cy0 + (cy1 - cy0) * 0.35
        for cand in cands:
            dist = (cand['center'][0] - target_x)**2 + (cand['center'][1] - target_y)**2
            pairs.append((dist, c_idx, cand))
            
    pairs.sort(key=lambda x: x[0])
    
    assigned_cards = set()
    for dist, c_idx, cand in pairs:
        if c_idx in assigned_cards:
            continue
        if cand['xref'] in used_xrefs:
            continue
        # Only assign if within reasonable proximity of the card (within 280 pt)
        if dist > 280**2:
            continue
        assigned_cards.add(c_idx)
        used_xrefs.add(cand['xref'])
        assignments[c_idx] = cand
        
    return assignments

def save_card_image(doc, page_pil, cand, card_box, out_path):
    if cand:
        try:
            base = doc.extract_image(cand['xref'])
            smask = base.get('smask', 0)
            if smask > 0:
                pix = fitz.Pixmap(doc, cand['xref'])
                if pix.colorspace and pix.colorspace.n > 3:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                mask = fitz.Pixmap(doc, smask)
                final_pix = fitz.Pixmap(pix, mask)
                im = Image.open(io.BytesIO(final_pix.tobytes("png")))
                im.save(out_path, format="WEBP", quality=95)
                return True
            else:
                im = Image.open(io.BytesIO(base['image']))
                if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                    im.save(out_path, format="WEBP", quality=95)
                else:
                    im.convert("RGB").save(out_path, format="WEBP", quality=95)
                return True
        except Exception as e:
            print(f"Error extracting XObject {cand.get('xref')}: {e}")
            
    # Fallback to high-res clean crop of ONLY the photo area
    cx0, cy0, cx1, cy1 = card_box
    photo_y1 = cy0 + (cy1 - cy0) * 0.55
    pad = 8
    crop_box = (
        int((cx0 + pad) * SCALE),
        int((cy0 + pad) * SCALE),
        int((cx1 - pad) * SCALE),
        int((photo_y1) * SCALE)
    )
    cropped = page_pil.crop(crop_box)
    cropped.save(out_path, format="WEBP", quality=95)
    return True

def run_extraction():
    doc = fitz.open(PDF_PATH)
    print(f"Starting authentic extraction of {len(doc)} pages from: {PDF_PATH}")
    
    all_seed_products = []
    pages_data = []
    
    for page_idx in range(len(doc)):
        page_num = page_idx + 1
        page = doc[page_idx]
        
        # Render high-res page for fallback
        mat = fitz.Matrix(SCALE, SCALE)
        pix = page.get_pixmap(matrix=mat)
        page_pil = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Extract section title
        blocks = page.get_text("blocks")
        sec_title = "مجموعة التراث المصري"
        for b in blocks:
            if 75 < b[0] < 95 and b[1] > 130:
                norm = unicodedata.normalize('NFKC', b[4]).replace('\n', ' ').strip()
                if norm:
                    sec_title = norm
                    break
        
        category = get_category(sec_title)
        cands = get_page_candidates(page)
        slots = []
        
        if page_num == 1:
            template = 'showcase-honey'
            cards = SLOTS_P1
            card_info = [
                ("عسل نحلة عسل برسيم طبيعي", "نحلة عسل برسيم فاخر، غني بالفيتامينات والإنزيمات الطبيعية التي تدعم المناعة وتعزز الطاقة بشكل طبيعي.", "٦٥٠ جرام | 350 ج.مصري \n 1.5 كيلو | 560 ج.مصري", 350),
                ("عسل نحلة عسل بالشمع طبيعي ٦٥٠ جرام", "عسل نحلة بالشمع طبيعي فاخر، يحتوي على قرص عسل شمعي ذهبي غني بالعسل.", "470 ج.مصري", 470),
                ("عسل نحلة عسل بالمكسرات طبيعي ٦٥٠ جرام", "عسل نحلة بالمكسرات - مزيج فاخر من عسل البرسيم الطبيعي النقي والمكسرات المقرمشة، غني بالبروتينات والفيتامينات، ويمنح الجسم الطاقة والحيوية.", "650 ج.مصري", 650),
                ("حقيبة من الحلفا مع اختيارك من منتجات نحلة", "يمكنك اختيار حقيبة من الحلفا واختيار من منتجات نحلة المتعددة او المنتجات الاخري، تقدم للهدايا الفاخرة.", "يحدد علي حسب الاختيار", 250),
            ]
            assignments = match_cards_to_images(cards, cands)
            for s_idx, (card_box, (title, desc, price_txt, price_val)) in enumerate(zip(cards, card_info), 1):
                img_filename = f"p{page_num}_s{s_idx}.webp"
                img_path = os.path.join(IMG_OUT_DIR, img_filename)
                save_card_image(doc, page_pil, assignments.get(s_idx - 1), card_box, img_path)
                
                prod_id = f"prod-canva-p{page_num}-s{s_idx}"
                slug = f"{prod_id}-{re.sub(r'[\s/\\?#%&+=]+', '-', title)[:30]}".strip('-')
                prod_obj = {
                    "id": prod_id,
                    "slug": slug,
                    "name_ar": title,
                    "name_en": None,
                    "description_ar": desc,
                    "description_en": None,
                    "category": category,
                    "sale_price": price_val,
                    "in_stock": True,
                    "primary_image_url": f"/magazine/canva_products/{img_filename}",
                    "images": {"sm": f"/magazine/canva_products/{img_filename}", "md": f"/magazine/canva_products/{img_filename}", "lg": f"/magazine/canva_products/{img_filename}"}
                }
                all_seed_products.append(prod_obj)
                slots.append({
                    "slot": s_idx,
                    "product": prod_obj,
                    "title_override": title,
                    "description_override": desc,
                    "price_override": price_val,
                    "image_override": f"/magazine/canva_products/{img_filename}",
                    "price_text": price_txt
                })
                
        elif page_num == 2:
            template = 'showcase-food'
            cards = SLOTS_P2
            card_info = [
                ("واج زيت زيتون بكر ممتاز", "زيت زيتون بكر ممتاز من أجود الأراضي المصرية، يُستخلص بعناية من ثمار الزيتون المختارة بالعصر الأول على البارد، للحفاظ على خصائص الزيت الطبيعية ونكهته الأصيلة. نسبة الحموضة أقل من 0.8%", "٥٠٠ مل | 400 ج.مصري \n ٧٥٠ مل | 575 ج.مصري \n 1 لتر | 750 ج.مصري", 400),
                ("تمور نخلة رطب سكري", "تمور نخلة – تمور رطب سكري طبيعية من أجود الأراضي المصرية، تتميز بجودتها العالية وقوامها الطري ومذاقها الغني بحلاوة طبيعية مميزة، لتقدم تجربة تجمع بين أصالة المنتج المصري وجودته.", "٥٠٠ جرام | 280 ج.مصري \n 1 كيلو | 400 ج.مصري", 280),
            ]
            assignments = match_cards_to_images(cards, cands)
            for s_idx, (card_box, (title, desc, price_txt, price_val)) in enumerate(zip(cards, card_info), 1):
                img_filename = f"p{page_num}_s{s_idx}.webp"
                img_path = os.path.join(IMG_OUT_DIR, img_filename)
                save_card_image(doc, page_pil, assignments.get(s_idx - 1), card_box, img_path)
                
                prod_id = f"prod-canva-p{page_num}-s{s_idx}"
                slug = f"{prod_id}-{re.sub(r'[\s/\\?#%&+=]+', '-', title)[:30]}".strip('-')
                prod_obj = {
                    "id": prod_id,
                    "slug": slug,
                    "name_ar": title,
                    "name_en": None,
                    "description_ar": desc,
                    "description_en": None,
                    "category": category,
                    "sale_price": price_val,
                    "in_stock": True,
                    "primary_image_url": f"/magazine/canva_products/{img_filename}",
                    "images": {"sm": f"/magazine/canva_products/{img_filename}", "md": f"/magazine/canva_products/{img_filename}", "lg": f"/magazine/canva_products/{img_filename}"}
                }
                all_seed_products.append(prod_obj)
                slots.append({
                    "slot": s_idx,
                    "product": prod_obj,
                    "title_override": title,
                    "description_override": desc,
                    "price_override": price_val,
                    "image_override": f"/magazine/canva_products/{img_filename}",
                    "price_text": price_txt
                })
                
        else:
            # Determine template and cards for pages 3-48
            if page_num == 3:
                template = 'grid-custom'
                cards = CARDS_P3
            elif page_num in [11, 13, 35]:
                template = 'grid-custom'
                cards = CARDS_7SLOTS
            elif page_num in [12, 14, 21, 22, 23, 26, 43]:
                template = 'grid2x3'
                cards = [(c0, r0, c1, r1) for r0, r1 in ROWS_2X3 for c0, c1 in COLS_2X3]
            elif page_num == 47:
                template = 'grid2x2'
                cards = [(c0, r0, c1, r1) for r0, r1 in ROWS_2X2 for c0, c1 in COLS_2X2]
            elif page_num == 48:
                template = 'hero-split'
                cards = SLOTS_P48
            else:
                template = 'grid3x3'
                cards = [(c0, r0, c1, r1) for r0, r1 in ROWS_3X3 for c0, c1 in COLS_3X3]
                
            assignments = match_cards_to_images(cards, cands)
            
            for s_idx, card_box in enumerate(cards, 1):
                x0, y0, x1, y1 = card_box
                img_filename = f"p{page_num}_s{s_idx}.webp"
                img_path = os.path.join(IMG_OUT_DIR, img_filename)
                save_card_image(doc, page_pil, assignments.get(s_idx - 1), card_box, img_path)
                
                # Extract text blocks inside the card using center coordinates
                card_blocks = [b for b in blocks if x0 <= (b[0] + b[2]) / 2 <= x1 and y0 <= (b[1] + b[3]) / 2 <= y1]
                card_blocks.sort(key=lambda b: (round(b[1] / 6) * 6, -b[0]))
                
                title_lines = []
                desc_lines = []
                price_val = 250
                price_txt = ""
                
                for b in card_blocks:
                    norm = clean_arabic_text(b[4])
                    if not norm:
                        continue
                    if any(k in norm for k in ['السعر', 'ج.مصري', 'المقاس', 'الوزن', 'الحجم', 'L.E']):
                        price_txt = norm
                        price_val = parse_price(norm)
                    elif b[1] < y0 + (y1 - y0) * 0.65:
                        title_lines.append(norm)
                    else:
                        desc_lines.append(norm)
                        
                raw_title = " ".join(title_lines).replace('\n', ' ').strip()
                title = clean_arabic_text(raw_title) if raw_title else f"منتج {category} {s_idx}"
                desc = clean_arabic_text(" ".join(desc_lines).replace('\n', ' ').strip())
                
                prod_id = f"prod-canva-p{page_num}-s{s_idx}"
                slug = f"{prod_id}-{re.sub(r'[\s/\\?#%&+=]+', '-', title)[:30]}".strip('-')
                prod_obj = {
                    "id": prod_id,
                    "slug": slug,
                    "name_ar": title,
                    "name_en": None,
                    "description_ar": desc,
                    "description_en": None,
                    "category": category,
                    "sale_price": price_val,
                    "in_stock": True,
                    "primary_image_url": f"/magazine/canva_products/{img_filename}",
                    "images": {"sm": f"/magazine/canva_products/{img_filename}", "md": f"/magazine/canva_products/{img_filename}", "lg": f"/magazine/canva_products/{img_filename}"}
                }
                all_seed_products.append(prod_obj)
                slots.append({
                    "slot": s_idx,
                    "product": prod_obj,
                    "title_override": title,
                    "description_override": desc,
                    "price_override": price_val,
                    "image_override": f"/magazine/canva_products/{img_filename}",
                    "price_text": price_txt
                })
                
        pages_data.append({
            "id": f"page-{page_num}",
            "position": page_num,
            "pageNumber": page_num,
            "template": template,
            "section_title": sec_title,
            "sectionTitle": sec_title,
            "slots": slots
        })
        
        if page_num % 10 == 0 or page_num == len(doc):
            print(f"Processed Page {page_num:02d}/{len(doc)} ({len(slots)} products)...")
            
    # Write output JSONs
    products_seed_path = os.path.join(DATA_DIR, "products_seed.json")
    with open(products_seed_path, 'w', encoding='utf-8') as f:
        json.dump(all_seed_products, f, ensure_ascii=False, indent=2)

    extracted_path = os.path.join(DATA_DIR, "canva_catalog_extracted.json")
    with open(extracted_path, 'w', encoding='utf-8') as f:
        json.dump(pages_data, f, ensure_ascii=False, indent=2)

    live_issue = {
        "issueSlug": "lotus-catalog-a4",
        "title_ar": "كتالوج لوتس - قائمة الأسعار الرسمية",
        "version": 2,
        "publishedAt": "2026-10-30T00:00:00.000Z",
        "totalPages": len(pages_data),
        "pages": pages_data,
        "theme": {
            "primary": "#443000",
            "accent": "#B68763",
            "background": "#FFFFFF"
        }
    }
    live_issue_path = os.path.join(DATA_DIR, "live_issue.json")
    with open(live_issue_path, 'w', encoding='utf-8') as f:
        json.dump(live_issue, f, ensure_ascii=False, indent=2)

    print("\n================ AUTHENTIC EXTRACTION COMPLETE ================")
    print(f"Total Pages: {len(pages_data)}")
    print(f"Total Seed Products: {len(all_seed_products)}")
    print(f"Products with raw embedded XObjects in: {IMG_OUT_DIR}")

if __name__ == '__main__':
    run_extraction()
