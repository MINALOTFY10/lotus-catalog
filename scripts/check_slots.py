import json

with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for page in data.get('pages', []):
    p_num = page.get('pageNumber')
    if p_num in [27, 28, 29, 30, 31, 32, 33, 34, 35]:
        for slot in page.get('slots', []):
            prod = slot.get('product') or {}
            slot_num = slot.get('slot')
            title = slot.get('title_override') or prod.get('title') or ''
            img = prod.get('image_url') or prod.get('imageUrl') or ''
            if any(term in title for term in ['عقد', 'عيون موسى', 'كارنيليان', 'حجر الشمس', 'لؤلؤ', 'فيروز']):
                print(f"P{p_num} S{slot_num}: {title} | {img}")
