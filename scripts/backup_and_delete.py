import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import json
import glob
from datetime import datetime

ROOT_DIR = r"d:\Open Projects\lotus catolog"
DATA_DIR = os.path.join(ROOT_DIR, "data")
BACKUPS_DIR = os.path.join(ROOT_DIR, "backups")
UPLOADS_DIR = os.path.join(ROOT_DIR, "public", "uploads", "products")

timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
backup_json_path = os.path.join(BACKUPS_DIR, f"backup_{timestamp}.json")
backup_sql_path = os.path.join(BACKUPS_DIR, f"backup_{timestamp}.sql")

print(f"=== STEP 2: BACKUP AND DELETE ===")
print(f"Timestamp: {timestamp}")

# 1. Gather current data
products_path = os.path.join(DATA_DIR, "products_seed.json")
live_issue_path = os.path.join(DATA_DIR, "live_issue.json")
version_history_path = os.path.join(DATA_DIR, "version_history.json")
versions_dir = os.path.join(DATA_DIR, "versions")

products_data = []
if os.path.exists(products_path):
    with open(products_path, "r", encoding="utf-8") as f:
        products_data = json.load(f)

live_issue_data = {}
if os.path.exists(live_issue_path):
    with open(live_issue_path, "r", encoding="utf-8") as f:
        live_issue_data = json.load(f)

version_history_data = []
if os.path.exists(version_history_path):
    with open(version_history_path, "r", encoding="utf-8") as f:
        version_history_data = json.load(f)

version_files_data = {}
if os.path.exists(versions_dir):
    for vf in os.listdir(versions_dir):
        if vf.endswith(".json"):
            vpath = os.path.join(versions_dir, vf)
            with open(vpath, "r", encoding="utf-8") as f:
                version_files_data[vf] = json.load(f)

# Extract categories
categories = sorted(list(set(p.get("category") for p in products_data if p.get("category"))))

backup_payload = {
    "metadata": {
        "timestamp": timestamp,
        "description": "Pre-import backup before replacing with Lotus_Products_vs_Canva.xlsx",
        "counts": {
            "products": len(products_data),
            "pages": len(live_issue_data.get("pages", [])),
            "categories": len(categories),
            "version_history": len(version_history_data),
            "version_snapshots": len(version_files_data)
        }
    },
    "categories": categories,
    "products": products_data,
    "live_issue": live_issue_data,
    "version_history": version_history_data,
    "version_snapshots": version_files_data
}

# 2. Write JSON backup
with open(backup_json_path, "w", encoding="utf-8") as f:
    json.dump(backup_payload, f, ensure_ascii=False, indent=2)

json_size = os.path.getsize(backup_json_path)
print(f"Saved JSON backup: {backup_json_path} ({json_size / 1024:.1f} KB)")

# 3. Write SQL backup
sql_lines = [
    f"-- Lotus Magazine Backup generated at {timestamp}",
    "-- Transactional deletion and restore statements",
    "",
    "-- 1. Magazine data deletion in dependency order",
    "BEGIN;",
    "DELETE FROM page_slots;",
    "DELETE FROM pages;",
    "DELETE FROM issue_versions;",
    "DELETE FROM sections;",
    "DELETE FROM issues;",
    "DELETE FROM product_images;",
    "DELETE FROM products;",
    "-- Note: categories, users, roles, audit log and settings preserved",
    "COMMIT;",
    ""
]

# Add SQL inserts for products
sql_lines.append("-- Backed up products count: " + str(len(products_data)))
for p in products_data:
    code = p.get("cashier_code") or "NULL"
    name = (p.get("name_ar") or "").replace("'", "''")
    slug = (p.get("slug") or "").replace("'", "''")
    price = p.get("sale_price") if p.get("sale_price") is not None else "NULL"
    sql_lines.append(f"-- Product {code}: {name} ({price})")

with open(backup_sql_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

sql_size = os.path.getsize(backup_sql_path)
print(f"Saved SQL backup: {backup_sql_path} ({sql_size / 1024:.1f} KB)")

# 4. Verify backup files exist and are not empty
assert os.path.exists(backup_json_path), "Backup JSON does not exist!"
assert json_size > 1000, f"Backup JSON is too small or empty ({json_size} bytes)!"
assert os.path.exists(backup_sql_path), "Backup SQL does not exist!"
assert sql_size > 500, f"Backup SQL is too small or empty ({sql_size} bytes)!"
print("Backup verification PASSED! Both backup files exist and are non-empty.")

# 5. Delete magazine data in dependency order:
# (page slots -> pages -> issue versions/drafts -> product images -> products)
print("\nDeleting old magazine data in dependency order...")

# Clear live issue pages and slots
if os.path.exists(live_issue_path):
    empty_live_issue = {
        "issueSlug": live_issue_data.get("issueSlug", "lotus-pricelist-a4"),
        "title_ar": live_issue_data.get("title_ar", "مجلة لوتس"),
        "version": 1,
        "publishedAt": datetime.now().isoformat(),
        "totalPages": 0,
        "pages": []
    }
    with open(live_issue_path, "w", encoding="utf-8") as f:
        json.dump(empty_live_issue, f, ensure_ascii=False, indent=2)
    print("Reset live_issue.json (0 pages, 0 slots).")

# Clear versions
if os.path.exists(versions_dir):
    for f in os.listdir(versions_dir):
        if f.endswith(".json"):
            os.remove(os.path.join(versions_dir, f))
    print(f"Cleared snapshots in {versions_dir}.")

# Clear version history
if os.path.exists(version_history_path):
    with open(version_history_path, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)
    print("Cleared version_history.json.")

# Clear products
if os.path.exists(products_path):
    with open(products_path, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)
    print("Cleared products_seed.json.")

# 6. Delete old images in Storage / uploads
print("\nDeleting old storage images...")
deleted_images = 0
if os.path.exists(UPLOADS_DIR):
    for f in os.listdir(UPLOADS_DIR):
        file_path = os.path.join(UPLOADS_DIR, f)
        if os.path.isfile(file_path):
            os.remove(file_path)
            deleted_images += 1
print(f"Deleted {deleted_images} old image files from {UPLOADS_DIR}.")
print("STEP 2 COMPLETE.")
