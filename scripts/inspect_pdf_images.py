import fitz

doc = fitz.open('Arabic lotus Pricelist.pdf')
# Let's inspect pages 0 to 8
for pno in range(9):
    page = doc[pno]
    images = page.get_images()
    print(f"--- PDF Page {pno+1} (Website Page {pno+27}) ---")
    for i, img_info in enumerate(images):
        xref = img_info[0]
        base = doc.extract_image(xref)
        w, h, ext = base['width'], base['height'], base['ext']
        if w > 100 and h > 100:
            print(f"  Img {i} xref={xref}: {w}x{h} ({ext})")
