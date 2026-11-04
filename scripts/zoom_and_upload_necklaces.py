import os, sys, io
from PIL import Image
import requests
from dotenv import dotenv_values

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 1. Config & Target list
env = dotenv_values('.env.local')
supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL', '').rstrip('/')
service_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')
bucket = env.get('SUPABASE_STORAGE_BUCKET', 'magazine')

if not supabase_url or not service_key:
    print("Error: Supabase credentials missing in .env.local")
    sys.exit(1)

TARGET_SLOTS = [
    'p28_s7',
    'p28_s8',
    'p30_s2',
    'p30_s4',
    'p30_s7',
    'p31_s5',
    'p31_s8',
    'p33_s8'
]

LOCAL_CANVA_DIR = os.path.join('public', 'magazine', 'canva_products')
os.makedirs(LOCAL_CANVA_DIR, exist_ok=True)

# 2. Process each target: download original from Supabase, crop zoom to necklace, save as WebP, upload
for key in TARGET_SLOTS:
    url = f"{supabase_url}/storage/v1/object/public/{bucket}/canva_products/{key}.webp"
    print(f"\nProcessing {key} from {url}...")
    res = requests.get(url)
    if res.status_code != 200:
        print(f"  FAILED to download {key}: HTTP {res.status_code}")
        continue

    img = Image.open(io.BytesIO(res.content))
    w, h = img.size
    print(f"  Original size: {w}x{h}")

    # Zoom in to necklace:
    # Model's necklace is centered at cx = w * 0.5, cy = h * 0.68
    # Crop size = 58% of width (approx 1.72x zoom)
    crop_size = int(w * 0.58)
    cx = int(w * 0.5)
    cy = int(h * 0.68)
    x0 = max(0, cx - crop_size // 2)
    y0 = max(0, cy - crop_size // 2)
    if y0 + crop_size > h:
        y0 = h - crop_size
    x1 = x0 + crop_size
    y1 = y0 + crop_size

    cropped = img.crop((x0, y0, x1, y1))

    # Resize to standard crisp dimensions (at least 350x350)
    target_dim = max(350, crop_size)
    cropped_final = cropped.resize((target_dim, target_dim), Image.Resampling.LANCZOS)

    local_path = os.path.join(LOCAL_CANVA_DIR, f"{key}.webp")
    cropped_final.save(local_path, format="WEBP", quality=95)
    print(f"  Cropped and saved to {local_path} ({cropped_final.size})")

    # 3. Upload to Supabase Storage with x-upsert
    dest_path = f"canva_products/{key}.webp"
    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{dest_path}"
    with open(local_path, 'rb') as f:
        file_bytes = f.read()

    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'image/webp',
        'x-upsert': 'true',
    }
    up_res = requests.post(upload_url, headers=headers, data=file_bytes)
    if up_res.status_code in [200, 201]:
        print(f"  Uploaded to Supabase: {dest_path} (Status {up_res.status_code})")
    else:
        print(f"  Upload error for {dest_path}: {up_res.status_code} - {up_res.text}")

print("\nDone processing all necklace images!")
