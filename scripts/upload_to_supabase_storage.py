import os, sys, io, json, mimetypes, shutil, requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import dotenv_values

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

env = dotenv_values('.env.local')
supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL', '').rstrip('/')
service_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')
bucket = env.get('SUPABASE_STORAGE_BUCKET', 'magazine')

if not supabase_url or not service_key:
    print("Error: Supabase URL or Service Role Key missing in .env.local")
    sys.exit(1)

print(f"Connecting to Supabase Storage: {supabase_url} (Bucket: {bucket})")

# 1. Collect all files to upload
# Map: (local_file_path, storage_destination_path)
files_to_upload = []

folders_to_upload = [
    ('public/magazine/canva_products', 'canva_products'),
    ('public/magazine/assets', 'assets'),
    ('public/magazine/brand_cards', 'brand_cards'),
    ('public/magazine/pages', 'pages'),
    ('public/brand', 'brand'),
]

for local_folder, dest_prefix in folders_to_upload:
    if not os.path.exists(local_folder):
        continue
    for root, _, files in os.walk(local_folder):
        for f in files:
            if f.endswith(('.webp', '.png', '.jpg', '.jpeg', '.svg')):
                local_path = os.path.join(root, f)
                rel_path = os.path.relpath(local_path, local_folder).replace('\\', '/')
                dest_path = f"{dest_prefix}/{rel_path}"
                files_to_upload.append((local_path, dest_path))

print(f"Total files to upload: {len(files_to_upload)}")

# 2. Upload function
def upload_file(item):
    local_path, dest_path = item
    mime_type, _ = mimetypes.guess_type(local_path)
    if not mime_type:
        mime_type = 'image/webp' if local_path.endswith('.webp') else 'application/octet-stream'

    with open(local_path, 'rb') as f:
        data = f.read()

    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': mime_type,
        'x-upsert': 'true',
    }

    url = f"{supabase_url}/storage/v1/object/{bucket}/{dest_path}"
    resp = requests.post(url, headers=headers, data=data)
    if resp.status_code in [200, 201]:
        return True, dest_path
    else:
        return False, f"{dest_path}: {resp.status_code} - {resp.text}"

# 3. Concurrent upload with 16 threads
success_count = 0
errors = []

with ThreadPoolExecutor(max_workers=16) as executor:
    futures = {executor.submit(upload_file, item): item for item in files_to_upload}
    for future in as_completed(futures):
        success, msg = future.result()
        if success:
            success_count += 1
            if success_count % 50 == 0 or success_count == len(files_to_upload):
                print(f"Uploaded {success_count}/{len(files_to_upload)} files...")
        else:
            errors.append(msg)

print(f"\nUpload finished! Success: {success_count}, Errors: {len(errors)}")
if errors:
    print("Sample errors:")
    for e in errors[:5]:
        print(" ", e)

# 4. Base public URL prefix
public_base = f"{supabase_url}/storage/v1/object/public/{bucket}"

def convert_url(url_str):
    if not url_str or not isinstance(url_str, str):
        return url_str
    if url_str.startswith('http://') or url_str.startswith('https://'):
        return url_str
    
    # /magazine/canva_products/p1_s1.webp -> {public_base}/canva_products/p1_s1.webp
    if url_str.startswith('/magazine/'):
        return f"{public_base}/{url_str.replace('/magazine/', '')}"
    # /brand/lotus_logo.png -> {public_base}/brand/lotus_logo.png
    if url_str.startswith('/brand/'):
        return f"{public_base}/{url_str.replace('/brand/', 'brand/')}"
    return url_str

# 5. Backup and update live_issue.json
shutil.copy('data/live_issue.json', 'data/live_issue_backup_before_supabase_urls.json')

with open('data/live_issue.json', 'r', encoding='utf-8') as f:
    live = json.load(f)

for page in live.get('pages', []):
    for slot in page.get('slots', []):
        if slot.get('image_override'):
            slot['image_override'] = convert_url(slot['image_override'])
        
        prod = slot.get('product')
        if prod:
            if prod.get('primary_image_url'):
                prod['primary_image_url'] = convert_url(prod['primary_image_url'])
            if prod.get('images'):
                for sz in ['sm', 'md', 'lg']:
                    if prod['images'].get(sz):
                        prod['images'][sz] = convert_url(prod['images'][sz])

with open('data/live_issue.json', 'w', encoding='utf-8') as f:
    json.dump(live, f, ensure_ascii=False, indent=2)

print("Updated data/live_issue.json with Supabase Storage URLs successfully.")

# 6. Update products_seed.json
shutil.copy('data/products_seed.json', 'data/products_seed_backup_before_supabase_urls.json')

with open('data/products_seed.json', 'r', encoding='utf-8') as f:
    seeds = json.load(f)

for p in seeds:
    if p.get('primary_image_url'):
        p['primary_image_url'] = convert_url(p['primary_image_url'])
    if p.get('images'):
        for sz in ['sm', 'md', 'lg']:
            if p['images'].get(sz):
                p['images'][sz] = convert_url(p['images'][sz])

with open('data/products_seed.json', 'w', encoding='utf-8') as f:
    json.dump(seeds, f, ensure_ascii=False, indent=2)

print("Updated data/products_seed.json with Supabase Storage URLs successfully.")

# 7. Update canva_catalog_extracted.json
shutil.copy('data/canva_catalog_extracted.json', 'data/canva_catalog_extracted_backup_before_supabase_urls.json')

with open('data/canva_catalog_extracted.json', 'r', encoding='utf-8') as f:
    extracted = json.load(f)

for page in extracted:
    for slot in page.get('slots', []):
        if slot.get('image_override'):
            slot['image_override'] = convert_url(slot['image_override'])
        prod = slot.get('product')
        if prod:
            if prod.get('primary_image_url'):
                prod['primary_image_url'] = convert_url(prod['primary_image_url'])
            if prod.get('images'):
                for sz in ['sm', 'md', 'lg']:
                    if prod['images'].get(sz):
                        prod['images'][sz] = convert_url(prod['images'][sz])

with open('data/canva_catalog_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(extracted, f, ensure_ascii=False, indent=2)

print("Updated data/canva_catalog_extracted.json with Supabase Storage URLs successfully.")
print("\nALL ASSETS MIGRATED TO SUPABASE STORAGE SUCCESSFULLY!")
