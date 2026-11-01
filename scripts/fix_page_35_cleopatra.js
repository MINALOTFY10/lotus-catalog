const fs = require('fs');

// 1. Update live_issue.json
const livePath = 'data/live_issue.json';
const liveData = JSON.parse(fs.readFileSync(livePath, 'utf8'));

const p35 = liveData.pages.find(p => p.id === 'page-35');
if (!p35) {
  console.error('page-35 not found');
  process.exit(1);
}

const slot7Product = {
  id: 'prod-canva-p35-s7',
  slug: 'prod-canva-p35-s7-ميدالية-رموز-فرعونية',
  name_ar: 'ميدالية رموز فرعونية',
  name_en: null,
  description_ar: 'ميدالية مفاتيح مزينة بمجموعة من الرموز المصرية القديمة، تشمل الأهرامات ونفرتيتي وكليوباترا وباستت.',
  description_en: null,
  category: 'ميداليات وتمائم تراثية',
  sale_price: 270,
  in_stock: true,
  primary_image_url: '/magazine/canva_products/p35_s7.webp',
  images: {
    sm: '/magazine/canva_products/p35_s7.webp',
    md: '/magazine/canva_products/p35_s7.webp',
    lg: '/magazine/canva_products/p35_s7.webp'
  },
  cashier_code: 458
};

const slot8Product = {
  id: 'prod-canva-p35-s8',
  slug: 'prod-canva-p35-s8-ميدالية-الملكة-كليوباترا',
  name_ar: 'ميدالية الملكة كليوباترا',
  name_en: null,
  description_ar: 'ميدالية مفاتيح من النحاس بتصميم مستوحى من الملكة كليوباترا، مع تفاصيل بطابع مصري قديم.',
  description_en: null,
  category: 'ميداليات وتمائم تراثية',
  sale_price: 270,
  in_stock: true,
  primary_image_url: '/magazine/canva_products/p35_s8.webp',
  images: {
    sm: '/magazine/canva_products/p35_s8.webp',
    md: '/magazine/canva_products/p35_s8.webp',
    lg: '/magazine/canva_products/p35_s8.webp'
  },
  cashier_code: 596
};

// Slot 7: Symbols keychain (1 col)
p35.slots[6] = {
  slot: 7,
  product: slot7Product,
  title_override: 'ميدالية رموز فرعونية',
  description_override: 'ميدالية مفاتيح مزينة بمجموعة من الرموز المصرية القديمة، تشمل الأهرامات ونفرتيتي وكليوباترا وباستت.',
  price_override: 270,
  image_override: '/magazine/canva_products/p35_s7.webp',
  price_text: 'السعر\n٢٧٠ ج.مصري',
  col_span: 1,
  row_span: 1
};

// Slot 8: Cleopatra keychain (2 cols)
p35.slots[7] = {
  slot: 8,
  product: slot8Product,
  title_override: 'ميدالية الملكة كليوباترا',
  description_override: 'ميدالية مفاتيح من النحاس بتصميم مستوحى من الملكة كليوباترا، مع تفاصيل بطابع مصري قديم.',
  price_override: 270,
  image_override: '/magazine/canva_products/p35_s8.webp',
  price_text: 'السعر\n٢٧٠ ج.مصري',
  col_span: 2,
  row_span: 1
};

fs.writeFileSync(livePath, JSON.stringify(liveData, null, 2), 'utf8');
console.log('live_issue.json updated with 8 slots on page 35');

// 2. Update products_seed.json
const seedPath = 'data/products_seed.json';
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const s7Idx = seedData.findIndex(p => p.id === 'prod-canva-p35-s7');
if (s7Idx !== -1) {
  seedData[s7Idx] = slot7Product;
} else {
  seedData.push(slot7Product);
}

const s8Idx = seedData.findIndex(p => p.id === 'prod-canva-p35-s8');
if (s8Idx !== -1) {
  seedData[s8Idx] = slot8Product;
} else {
  seedData.splice(s7Idx + 1, 0, slot8Product);
}

fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2), 'utf8');
console.log('products_seed.json updated');
