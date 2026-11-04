import json

with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

targets = [
    (28, 7), (28, 8),
    (30, 2), (30, 4), (30, 7),
    (31, 5), (31, 8),
    (33, 8)
]

for page in data.get('pages', []):
    p_num = page.get('pageNumber')
    for slot in page.get('slots', []):
        s_num = slot.get('slot')
        if (p_num, s_num) in targets:
            prod = slot.get('product') or {}
            title = slot.get('title_override') or prod.get('title')
            print(f"Target P{p_num} S{s_num}: title='{title}' prod_id='{prod.get('id')}' prod_keys={list(prod.keys())}")
            print(f"   image_url: {prod.get('image_url')}")
            print(f"   images: {prod.get('images')}")
