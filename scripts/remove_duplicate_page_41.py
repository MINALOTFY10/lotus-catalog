import json

# 1. Update canva_catalog_extracted.json
with open('data/canva_catalog_extracted.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

# Find and remove page 41
filtered_pages = []
for p in pages:
    if p.get('pageNumber') == 41:
        print(f"Removing duplicate Page {p.get('pageNumber')}")
        continue
    filtered_pages.append(p)

# Re-number positions and pageNumbers
for idx, p in enumerate(filtered_pages):
    new_num = idx + 1
    p['position'] = new_num
    p['pageNumber'] = new_num

with open('data/canva_catalog_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_pages, f, ensure_ascii=False, indent=2)

print(f"canva_catalog_extracted.json updated: new total = {len(filtered_pages)} pages")

# 2. Update live_issue.json
with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    issue = json.load(f)

filtered_issue_pages = []
for p in issue['pages']:
    if p.get('pageNumber') == 41:
        continue
    filtered_issue_pages.append(p)

for idx, p in enumerate(filtered_issue_pages):
    new_num = idx + 1
    p['position'] = new_num
    p['pageNumber'] = new_num

issue['pages'] = filtered_issue_pages

with open('data/live_issue.json', 'w', encoding='utf-8') as f:
    json.dump(issue, f, ensure_ascii=False, indent=2)

print(f"live_issue.json updated: new total = {len(filtered_issue_pages)} pages")

# 3. Update products_seed.json
with open('data/products_seed.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Remove any products that have slug containing prod-canva-p41-
filtered_products = [p for p in products if not p.get('slug', '').startswith('prod-canva-p41-')]
with open('data/products_seed.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_products, f, ensure_ascii=False, indent=2)

print(f"products_seed.json updated: from {len(products)} to {len(filtered_products)} products")
