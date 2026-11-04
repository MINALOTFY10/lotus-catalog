import json

with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for p in d['pages']:
    for s in p.get('slots', []):
        override = s.get('title_override') or ''
        if any(term in override for term in ['عيون موسى', 'كارنيليان', 'حجر الشمس', 'شربيل', 'فيروز طبيعى']):
            print(f"Page {p.get('pageNumber')}, Slot {s.get('slot')}: title='{override}' img='{s.get('image_override')}'")
