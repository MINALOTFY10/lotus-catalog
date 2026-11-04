import sys
import json
import shutil
import os
import requests
from dotenv import dotenv_values

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"d:\Open Projects\lotus catolog"
DATA_DIR = os.path.join(ROOT_DIR, "data")

print("=== APPLYING CANVA NAMES AND DESCRIPTIONS TO WEBSITE ===")

# 1. Load pairs
pairs_path = os.path.join(DATA_DIR, "canva_catalog_pairs.json")
with open(pairs_path, "r", encoding="utf-8") as f:
    canva_pairs = json.load(f)

# 2. Back up files
live_issue_path = os.path.join(DATA_DIR, "live_issue.json")
live_issue_backup = os.path.join(DATA_DIR, "live_issue_backup_before_canva_update.json")
shutil.copy(live_issue_path, live_issue_backup)
print(f"Backed up {live_issue_path} -> {live_issue_backup}")

seed_path = os.path.join(DATA_DIR, "products_seed.json")
seed_backup = os.path.join(DATA_DIR, "products_seed_backup_before_canva_update.json")
if os.path.exists(seed_path):
    shutil.copy(seed_path, seed_backup)
    print(f"Backed up {seed_path} -> {seed_backup}")

extracted_path = os.path.join(DATA_DIR, "canva_catalog_extracted.json")
extracted_backup = os.path.join(DATA_DIR, "canva_catalog_extracted_backup_before_canva_update.json")
if os.path.exists(extracted_path):
    shutil.copy(extracted_path, extracted_backup)
    print(f"Backed up {extracted_path} -> {extracted_backup}")

# 3. Update live_issue.json
with open(live_issue_path, "r", encoding="utf-8") as f:
    live_issue = json.load(f)

updated_count = 0
updated_products_map = {} # id -> {name, desc}

for canva_pnum_str, pairs in canva_pairs.items():
    canva_pnum = int(canva_pnum_str)
    live_pnum = 26 + canva_pnum # Pages 27 to 35
    
    live_page = next((p for p in live_issue.get("pages", []) if (p.get("pageNumber") or p.get("position")) == live_pnum), None)
    if not live_page:
        print(f"Warning: Page {live_pnum} not found in live_issue.json!")
        continue

    for pair in pairs:
        slot_num = pair["slot"]
        new_name = pair["name"].strip()
        new_desc = pair["desc"].strip()

        slot = next((s for s in live_page.get("slots", []) if s.get("slot") == slot_num), None)
        if not slot:
            print(f"Warning: Slot {slot_num} on Page {live_pnum} not found!")
            continue

        slot["title_override"] = new_name
        slot["description_override"] = new_desc

        prod = slot.get("product")
        if prod:
            prod["name_ar"] = new_name
            prod["description_ar"] = new_desc
            p_id = prod.get("id")
            if p_id:
                updated_products_map[p_id] = {
                    "name_ar": new_name,
                    "description_ar": new_desc
                }

        updated_count += 1

with open(live_issue_path, "w", encoding="utf-8") as f:
    json.dump(live_issue, f, ensure_ascii=False, indent=2)

print(f"Successfully updated {updated_count} slots in live_issue.json!")

# 4. Update products_seed.json
if os.path.exists(seed_path):
    with open(seed_path, "r", encoding="utf-8") as f:
        seed_products = json.load(f)

    seed_updated = 0
    for prod in seed_products:
        p_id = prod.get("id")
        if p_id in updated_products_map:
            prod["name_ar"] = updated_products_map[p_id]["name_ar"]
            prod["description_ar"] = updated_products_map[p_id]["description_ar"]
            seed_updated += 1

    with open(seed_path, "w", encoding="utf-8") as f:
        json.dump(seed_products, f, ensure_ascii=False, indent=2)

    print(f"Successfully updated {seed_updated} products in products_seed.json!")

# 5. Update canva_catalog_extracted.json if present
if os.path.exists(extracted_path):
    with open(extracted_path, "r", encoding="utf-8") as f:
        canva_catalog = json.load(f)

    cat_updated = 0
    for page in canva_catalog:
        p_num = page.get("pageNumber") or page.get("position")
        if p_num and 27 <= p_num <= 35:
            canva_pnum = p_num - 26
            pairs = canva_pairs.get(str(canva_pnum), [])
            for pair in pairs:
                slot_num = pair["slot"]
                slot = next((s for s in page.get("slots", []) if s.get("slot") == slot_num), None)
                if slot:
                    slot["title_override"] = pair["name"]
                    slot["description_override"] = pair["desc"]
                    if slot.get("product"):
                        slot["product"]["name_ar"] = pair["name"]
                        slot["product"]["description_ar"] = pair["desc"]
                    cat_updated += 1

    with open(extracted_path, "w", encoding="utf-8") as f:
        json.dump(canva_catalog, f, ensure_ascii=False, indent=2)

    print(f"Successfully updated {cat_updated} slots in canva_catalog_extracted.json!")

# 6. Sync to Supabase Storage if configured
env = dotenv_values('.env.local')
supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL', '').rstrip('/')
service_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '') or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
bucket = env.get('SUPABASE_STORAGE_BUCKET', 'magazine')

if supabase_url and service_key and not supabase_url.startswith("http://placeholder"):
    print("Syncing updated live_issue.json to Supabase Storage...")
    try:
        remote_url = f"{supabase_url}/storage/v1/object/{bucket}/data/live_issue.json"
        with open(live_issue_path, "rb") as f:
            live_bytes = f.read()

        headers = {
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json',
            'x-upsert': 'true',
        }
        res = requests.put(remote_url, headers=headers, data=live_bytes)
        if res.status_code in [200, 201]:
            print("Successfully synced live_issue.json to Supabase Storage (PUT 200/201).")
        else:
            print(f"Supabase sync returned status {res.status_code}: {res.text}")
    except Exception as e:
        print(f"Supabase sync error: {e}")
else:
    print("Supabase credentials not fully configured; skipped remote sync.")

print("\n=== ALL UPDATES COMPLETED SUCCESSFULLY ===")
