import sys
import json
import requests
from dotenv import dotenv_values

sys.stdout.reconfigure(encoding='utf-8')

# Load live_issue.json
with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    live = json.load(f)

p25 = next(p for p in live['pages'] if p.get('pageNumber') == 25)
s7 = next(s for s in p25['slots'] if s.get('slot') == 7)

new_price_text = "المقاس والسعر\nقطر ٣٠ سم | ٢٦٣٥ ج.مصري\nقطر ٢٥ سم | ٢٠٩٥ ج.مصري\nقطر ١٥ سم | ٢٠٩٥ ج.مصري"

new_price_tiers = [
    {"label": "قطر ٣٠ سم", "price": 2635},
    {"label": "قطر ٢٥ سم", "price": 2095},
    {"label": "قطر ١٥ سم", "price": 2095}
]

s7['price_text'] = new_price_text
s7['price_tiers'] = new_price_tiers

if s7.get('product'):
    s7['product']['price_text'] = new_price_text
    s7['product']['price_tiers'] = new_price_tiers

with open('data/live_issue.json', 'w', encoding='utf-8') as f:
    json.dump(live, f, ensure_ascii=False, indent=2)

print('Updated live_issue.json successfully!')

# Update products_seed.json
with open('data/products_seed.json', 'r', encoding='utf-8') as f:
    seeds = json.load(f)

for p in seeds:
    if p.get('id') == 'prod-canva-p25-s7':
        p['price_text'] = new_price_text
        p['price_tiers'] = new_price_tiers
        print('Updated products_seed.json for prod-canva-p25-s7')

with open('data/products_seed.json', 'w', encoding='utf-8') as f:
    json.dump(seeds, f, ensure_ascii=False, indent=2)

# Sync to Supabase Storage
env = dotenv_values('.env.local')
supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL', '').rstrip('/')
service_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '') or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
bucket = env.get('SUPABASE_STORAGE_BUCKET', 'magazine')

if supabase_url and service_key and not supabase_url.startswith('http://placeholder'):
    remote_url = f"{supabase_url}/storage/v1/object/{bucket}/data/live_issue.json"
    with open('data/live_issue.json', 'rb') as f:
        data = f.read()
    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'x-upsert': 'true',
    }
    res = requests.put(remote_url, headers=headers, data=data)
    print('Supabase sync status:', res.status_code)
