import fitz, os, sys, json, re, unicodedata
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"d:\Open Projects\lotus catolog"
PDF_PATH = os.path.join(ROOT_DIR, "canva_catalog_official.pdf")
IMG_OUT_DIR = os.path.join(ROOT_DIR, "public", "magazine", "canva_products")
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(IMG_OUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
SCALE = 2.5

arabic_to_western = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')

def reverse_arabic_digits(text: str) -> str:
    def repl(m):
        return m.group(0)[::-1]
    return re.sub(r'[٠-٩]{2,}', repl, text)

def parse_price(price_str: str) -> int:
    if not price_str:
        return 250
    # Find all sequences of eastern or western digits
    # If eastern digits, they are visually reversed in PDF
    ar_digits = re.findall(r'[٠-٩]+', price_str)
    if ar_digits:
        # take the largest digit group or first
        for g in ar_digits:
            if len(g) >= 2:
                val = int(g.translate(arabic_to_western)[::-1])
                return val
            elif len(g) == 1:
                return int(g.translate(arabic_to_western)) * 100
    en_digits = re.findall(r'\d+', price_str)
    if en_digits:
        for g in en_digits:
            if len(g) >= 2:
                return int(g)
    return 250

def clean_arabic_text(text: str) -> str:
    if not text:
        return ""
    norm = unicodedata.normalize('NFKC', text)
    # Remove leading dots or dashes
    norm = re.sub(r'^[,\-.\s\u2022]+', '', norm)
    # Fix reversed digit sequences within Arabic text
    norm = reverse_arabic_digits(norm)
    return norm.strip()

print(f"Starting extraction of {len(doc)} pages from {PDF_PATH}...")

all_seed_products = []
pages_data = []

# Section category mapping
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

for page_idx in range(len(doc)):
    page_num = page_idx + 1
    page = doc[page_idx]
    
    # 1. Render page at SCALE
    mat = fitz.Matrix(SCALE, SCALE)
    pix = page.get_pixmap(matrix=mat)
    page_pil = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    
    # 2. Extract section title
    blocks = page.get_text("blocks")
    sec_title = "مجموعة التراث المصري"
    for b in blocks:
        if 75 < b[0] < 92 and b[1] > 130:
            norm = unicodedata.normalize('NFKC', b[4]).replace('\n', ' ').strip()
            if norm:
                sec_title = norm
                break
    
    category = get_category(sec_title)
    
    # 3. Determine Layout & Card Boundaries (x0, y0, x1, y1) in PDF points
    # Page dimensions: ~595 x 842 pt
    # Header: y < 140, Sidebar: x < 125
    slots = []
    
    if page_num == 1:
        # Honey showcase
        template = 'showcase-honey'
        # 4 cards on page 1
        # Card 1: Clover Honey (Left Col, Top)
        # Card 2: Honey with Comb (Right Col, Mid)
        # Card 3: Honey with Nuts (Left Col, Mid)
        # Card 4: Wicker Basket (Right Col, Bot)
        card_defs = [
            (1, (130, 155, 340, 400), (135, 160, 335, 290), "عسل نحلة عسل برسيم طبيعي", "نحلة عسل برسيم فاخر، غني بالفيتامينات والإنزيمات الطبيعية التي تدعم المناعة وتعزز الطاقة بشكل طبيعي.", "٦٥٠ جرام | 350 ج.مصري \n 1.5 كيلو | 560 ج.مصري", 350),
            (2, (340, 410, 550, 680), (345, 415, 545, 600), "عسل نحلة عسل بالشمع طبيعي ٦٥٠ جرام", "عسل نحلة بالشمع طبيعي فاخر، يحتوي على قرص عسل شمعي ذهبي غني بالعسل.", "470 ج.مصري", 470),
            (3, (130, 420, 340, 680), (135, 425, 335, 560), "عسل نحلة عسل بالمكسرات طبيعي ٦٥٠ جرام", "عسل نحلة بالمكسرات - مزيج فاخر من عسل البرسيم الطبيعي النقي والمكسرات المقرمشة، غني بالبروتينات والفيتامينات، ويمنح الجسم الطاقة والحيوية.", "650 ج.مصري", 650),
            (4, (340, 690, 550, 835), (345, 695, 545, 825), "حقيبة من الحلفا مع اختيارك من منتجات نحلة", "يمكنك اختيار حقيبة من الحلفا واختيار من منتجات نحلة المتعددة او المنتجات الاخري، تقدم للهدايا الفاخرة.", "يحدد علي حسب الاختيار", 250),
        ]
        for slot_num, card_box, photo_box, title, desc, price_txt, price_val in card_defs:
            img_filename = f"p{page_num}_s{slot_num}.webp"
            img_path = os.path.join(IMG_OUT_DIR, img_filename)
            crop_box = tuple(int(v * SCALE) for v in photo_box)
            cropped = page_pil.crop(crop_box)
            cropped.save(img_path, quality=92)
            
            prod_id = f"prod-canva-p{page_num}-s{slot_num}"
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
                "slot": slot_num,
                "product": prod_obj,
                "title_override": title,
                "description_override": desc,
                "price_override": price_val,
                "image_override": f"/magazine/canva_products/{img_filename}",
                "price_text": price_txt
            })
            
    elif page_num == 2:
        # Food showcase (olive oil and dates)
        template = 'showcase-food'
        card_defs = [
            (1, (130, 155, 340, 410), (135, 160, 335, 290), "واج زيت زيتون بكر ممتاز", "زيت زيتون بكر ممتاز من أجود الأراضي المصرية، يُستخلص بعناية من ثمار الزيتون المختارة بالعصر الأول على البارد، للحفاظ على خصائص الزيت الطبيعية ونكهته الأصيلة. نسبة الحموضة أقل من 0.8%", "٥٠٠ مل | 400 ج.مصري \n ٧٥٠ مل | 575 ج.مصري \n 1 لتر | 750 ج.مصري", 400),
            (2, (340, 420, 550, 680), (345, 425, 545, 560), "تمور نخلة رطب سكري", "تمور نخلة – تمور رطب سكري طبيعية من أجود الأراضي المصرية، تتميز بجودتها العالية وقوامها الطري ومذاقها الغني بحلاوة طبيعية مميزة، لتقدم تجربة تجمع بين أصالة المنتج المصري وجودته.", "٥٠٠ جرام | 280 ج.مصري \n 1 كيلو | 400 ج.مصري", 280),
        ]
        for slot_num, card_box, photo_box, title, desc, price_txt, price_val in card_defs:
            img_filename = f"p{page_num}_s{slot_num}.webp"
            img_path = os.path.join(IMG_OUT_DIR, img_filename)
            crop_box = tuple(int(v * SCALE) for v in photo_box)
            cropped = page_pil.crop(crop_box)
            cropped.save(img_path, quality=92)
            
            prod_id = f"prod-canva-p{page_num}-s{slot_num}"
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
                "slot": slot_num,
                "product": prod_obj,
                "title_override": title,
                "description_override": desc,
                "price_override": price_val,
                "image_override": f"/magazine/canva_products/{img_filename}",
                "price_text": price_txt
            })
            
    elif page_num in [12, 14, 21, 22, 23, 26, 43]:
        # 6-card grid (2 columns x 3 rows)
        template = 'grid2x3'
        cols = [
            (345, 550), # Right Col
            (130, 335), # Left Col
        ]
        rows = [
            (145, 360), # Row 1
            (365, 580), # Row 2
            (585, 800), # Row 3
        ]
        slot_num = 1
        for r_idx, (y0, y1) in enumerate(rows):
            for c_idx, (x0, x1) in enumerate(cols):
                photo_y1 = y0 + (y1 - y0) * 0.58
                img_filename = f"p{page_num}_s{slot_num}.webp"
                img_path = os.path.join(IMG_OUT_DIR, img_filename)
                crop_box = (int(x0 * SCALE), int(y0 * SCALE), int(x1 * SCALE), int(photo_y1 * SCALE))
                cropped = page_pil.crop(crop_box)
                cropped.save(img_path, quality=92)
                
                # Extract text within card
                card_blocks = [b for b in blocks if x0 - 15 <= b[0] <= x1 + 15 and y0 - 10 <= b[1] <= y1 + 15]
                # sort by vertical position
                card_blocks.sort(key=lambda b: (round(b[1] / 6) * 6, -b[0]))
                
                title_lines = []
                desc_lines = []
                price_val = 250
                price_txt = ""
                
                for b in card_blocks:
                    norm = clean_arabic_text(b[4])
                    if not norm:
                        continue
                    if 'السعر' in norm or 'ج.مصري' in norm or 'المقاس' in norm or 'الوزن' in norm:
                        price_txt = norm
                        price_val = parse_price(norm)
                    elif b[1] < y0 + (y1 - y0) * 0.72:
                        title_lines.append(norm)
                    else:
                        desc_lines.append(norm)
                        
                raw_title = " ".join(title_lines).replace('\n', ' ').strip()
                title = clean_arabic_text(raw_title) if raw_title else f"منتج {category} {slot_num}"
                desc = clean_arabic_text(" ".join(desc_lines).replace('\n', ' ').strip())
                
                prod_id = f"prod-canva-p{page_num}-s{slot_num}"
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
                    "slot": slot_num,
                    "product": prod_obj,
                    "title_override": title,
                    "description_override": desc,
                    "price_override": price_val,
                    "image_override": f"/magazine/canva_products/{img_filename}",
                    "price_text": price_txt
                })
                slot_num += 1

    elif page_num == 47:
        # 4-card grid (2 columns x 2 rows)
        template = 'grid2x2'
        cols = [
            (345, 550), # Right Col
            (130, 335), # Left Col
        ]
        rows = [
            (145, 465), # Row 1
            (475, 790), # Row 2
        ]
        slot_num = 1
        for r_idx, (y0, y1) in enumerate(rows):
            for c_idx, (x0, x1) in enumerate(cols):
                photo_y1 = y0 + (y1 - y0) * 0.62
                img_filename = f"p{page_num}_s{slot_num}.webp"
                img_path = os.path.join(IMG_OUT_DIR, img_filename)
                crop_box = (int(x0 * SCALE), int(y0 * SCALE), int(x1 * SCALE), int(photo_y1 * SCALE))
                cropped = page_pil.crop(crop_box)
                cropped.save(img_path, quality=92)
                
                card_blocks = [b for b in blocks if x0 - 15 <= b[0] <= x1 + 15 and y0 - 10 <= b[1] <= y1 + 15]
                card_blocks.sort(key=lambda b: (round(b[1] / 6) * 6, -b[0]))
                
                title_lines = []
                desc_lines = []
                price_val = 250
                price_txt = ""
                
                for b in card_blocks:
                    norm = clean_arabic_text(b[4])
                    if not norm:
                        continue
                    if 'السعر' in norm or 'ج.مصري' in norm or 'المقاس' in norm:
                        price_txt = norm
                        price_val = parse_price(norm)
                    elif b[1] < y0 + (y1 - y0) * 0.72:
                        title_lines.append(norm)
                    else:
                        desc_lines.append(norm)
                        
                raw_title = " ".join(title_lines).replace('\n', ' ').strip()
                title = clean_arabic_text(raw_title) if raw_title else f"منتج صدف {slot_num}"
                desc = clean_arabic_text(" ".join(desc_lines).replace('\n', ' ').strip())
                
                prod_id = f"prod-canva-p{page_num}-s{slot_num}"
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
                    "slot": slot_num,
                    "product": prod_obj,
                    "title_override": title,
                    "description_override": desc,
                    "price_override": price_val,
                    "image_override": f"/magazine/canva_products/{img_filename}",
                    "price_text": price_txt
                })
                slot_num += 1

    elif page_num == 48:
        # Page 48 Hero split (2 top cards + 1 wide hero card)
        template = 'hero-split'
        card_boxes = [
            (1, (345, 145, 550, 445), (345, 145, 550, 320)), # Top right
            (2, (130, 145, 335, 445), (130, 145, 335, 320)), # Top left
            (3, (130, 455, 550, 800), (130, 455, 550, 680)), # Hero bottom
        ]
        for slot_num, (x0, y0, x1, y1), (px0, py0, px1, py1) in card_boxes:
            img_filename = f"p{page_num}_s{slot_num}.webp"
            img_path = os.path.join(IMG_OUT_DIR, img_filename)
            crop_box = (int(px0 * SCALE), int(py0 * SCALE), int(px1 * SCALE), int(py1 * SCALE))
            cropped = page_pil.crop(crop_box)
            cropped.save(img_path, quality=92)
            
            card_blocks = [b for b in blocks if x0 - 15 <= b[0] <= x1 + 15 and y0 - 10 <= b[1] <= y1 + 15]
            card_blocks.sort(key=lambda b: (round(b[1] / 6) * 6, -b[0]))
            
            title_lines = []
            desc_lines = []
            price_val = 250
            price_txt = ""
            
            for b in card_blocks:
                norm = clean_arabic_text(b[4])
                if not norm:
                    continue
                if 'السعر' in norm or 'ج.مصري' in norm:
                    price_txt = norm
                    price_val = parse_price(norm)
                elif b[1] < y0 + (y1 - y0) * 0.72:
                    title_lines.append(norm)
                else:
                    desc_lines.append(norm)
                    
            raw_title = " ".join(title_lines).replace('\n', ' ').strip()
            title = clean_arabic_text(raw_title) if raw_title else f"حقيبة خشبية {slot_num}"
            desc = clean_arabic_text(" ".join(desc_lines).replace('\n', ' ').strip())
            
            prod_id = f"prod-canva-p{page_num}-s{slot_num}"
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
                "slot": slot_num,
                "product": prod_obj,
                "title_override": title,
                "description_override": desc,
                "price_override": price_val,
                "image_override": f"/magazine/canva_products/{img_filename}",
                "price_text": price_txt
            })

    else:
        # Standard 3-column pages (9 slots or 8/7 slots)
        template = 'grid3x3'
        cols = [
            (415, 555), # Col 1 (Right)
            (275, 410), # Col 2 (Middle)
            (130, 270), # Col 3 (Left)
        ]
        rows = [
            (145, 360), # Row 1
            (365, 580), # Row 2
            (585, 800), # Row 3
        ]
        
        slot_num = 1
        for r_idx, (y0, y1) in enumerate(rows):
            for c_idx, (x0, x1) in enumerate(cols):
                photo_y1 = y0 + (y1 - y0) * 0.58
                img_filename = f"p{page_num}_s{slot_num}.webp"
                img_path = os.path.join(IMG_OUT_DIR, img_filename)
                crop_box = (int(x0 * SCALE), int(y0 * SCALE), int(x1 * SCALE), int(photo_y1 * SCALE))
                cropped = page_pil.crop(crop_box)
                cropped.save(img_path, quality=92)
                
                card_blocks = [b for b in blocks if x0 - 15 <= b[0] <= x1 + 15 and y0 - 10 <= b[1] <= y1 + 15]
                card_blocks.sort(key=lambda b: (round(b[1] / 6) * 6, -b[0]))
                
                title_lines = []
                desc_lines = []
                price_val = 250
                price_txt = ""
                
                for b in card_blocks:
                    norm = clean_arabic_text(b[4])
                    if not norm:
                        continue
                    if 'السعر' in norm or 'ج.مصري' in norm or 'المقاس' in norm or 'الوزن' in norm or 'الحجم' in norm:
                        price_txt = norm
                        price_val = parse_price(norm)
                    elif b[1] < y0 + (y1 - y0) * 0.72:
                        title_lines.append(norm)
                    else:
                        desc_lines.append(norm)
                        
                raw_title = " ".join(title_lines).replace('\n', ' ').strip()
                title = clean_arabic_text(raw_title) if raw_title else f"{category} {slot_num}"
                desc = clean_arabic_text(" ".join(desc_lines).replace('\n', ' ').strip())
                
                # Check if this card has meaningful content or is empty on 8-slot/7-slot pages
                is_empty = False
                if not title_lines and not desc_lines and not price_txt:
                    is_empty = True
                
                if not is_empty:
                    prod_id = f"prod-canva-p{page_num}-s{slot_num}"
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
                        "slot": slot_num,
                        "product": prod_obj,
                        "title_override": title,
                        "description_override": desc,
                        "price_override": price_val,
                        "image_override": f"/magazine/canva_products/{img_filename}",
                        "price_text": price_txt
                    })
                    slot_num += 1

    pages_data.append({
        "id": f"page-{page_num}",
        "position": page_num,
        "pageNumber": page_num,
        "template": template,
        "section_title": sec_title,
        "sectionTitle": sec_title,
        "slots": slots
    })
    
    if page_num % 8 == 0 or page_num == len(doc):
        print(f"Extracted Page {page_num:02d}/{len(doc)} ({len(slots)} products)...")

# Write out products_seed.json
products_seed_path = os.path.join(DATA_DIR, "products_seed.json")
with open(products_seed_path, 'w', encoding='utf-8') as f:
    json.dump(all_seed_products, f, ensure_ascii=False, indent=2)

# Write out canva_catalog_extracted.json
extracted_path = os.path.join(DATA_DIR, "canva_catalog_extracted.json")
with open(extracted_path, 'w', encoding='utf-8') as f:
    json.dump(pages_data, f, ensure_ascii=False, indent=2)

# Write out live_issue.json
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
        "background": "#EFEFEF"
    }
}
live_issue_path = os.path.join(DATA_DIR, "live_issue.json")
with open(live_issue_path, 'w', encoding='utf-8') as f:
    json.dump(live_issue, f, ensure_ascii=False, indent=2)

print("\n================ EXTRACTION COMPLETE ================")
print(f"Total Pages: {len(pages_data)}")
print(f"Total Seed Products: {len(all_seed_products)}")
print(f"Saved: {products_seed_path}")
print(f"Saved: {live_issue_path}")
print(f"Images in: {IMG_OUT_DIR}")
