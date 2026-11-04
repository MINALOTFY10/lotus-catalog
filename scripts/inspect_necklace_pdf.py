import fitz

doc = fitz.open('Arabic lotus Pricelist.pdf')
for p_idx in [27, 29, 30, 32]:
    page = doc[p_idx]
    print(f"=== Page {p_idx+1} ===")
    for img_info in page.get_images():
        xref = img_info[0]
        base = doc.extract_image(xref)
        w, h = base['width'], base['height']
        if w >= 200:
            rects = page.get_image_rects(xref)
            print(f"  xref {xref}: {w}x{h} ext={base['ext']} rects={rects}")
