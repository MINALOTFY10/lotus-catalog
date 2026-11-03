/**
 * Centralized SEO Utilities and Structured Data (JSON-LD) Generators
 * for Lotus Catalog & The Rural and Environmental Industries Support Fund (صندوق دعم الصناعات الريفية والبيئية)
 */

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL.trim() !== '') {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`;
  }
  if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim() !== '') {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return 'https://lotus-catalog.vercel.app';
}

export const SEO_KEYWORDS = [
  'كتالوج لوتس',
  'كاتلوج لوتس',
  'صندوق دعم الصناعات',
  'صندوق دعم الصناعات الريفية والبيئية',
  'كتالوج صندوق دعم الصناعات',
  'كاتلوج صندوق دعم الصناعات',
  'صندوق دعم الصناعات الريفية والبيئية والإنعاش الريفي',
  'مجلة لوتس',
  'مجلة لوتس التفاعلية',
  'مجله لوتس',
  'لوتس للمنتجات اليدوية',
  'قائمة أسعار منتجات لوتس',
  'كتالوج المنتجات اليدوية والتراثية',
  'عسل نحل صندوق دعم الصناعات',
  'عسل نحل طبيعي لوتس',
  'فخار وخزف يدوي مصري',
  'خشب سرسوع يدوي',
  'حلي وإكسسوارات تراثية',
  'سجاد وكليم يدوي',
  'منتجات خان الخليلي التراثية',
  'وزارة التضامن الاجتماعي',
  'معرض ديارنا للحرف اليدوية',
  'Lotus Catalog',
  'Lotus Magazine Egypt',
  'REIS Fund',
  'Rural and Environmental Industries Support Fund',
];

export const SEO_SITE_NAME = 'كتالوج ومجلة لوتس | صندوق دعم الصناعات الريفية والبيئية';

export const SEO_DEFAULT_DESCRIPTION =
  'الكتالوج الرقمي الرسمي لمجلة لوتس الصادرة عن صندوق دعم الصناعات الريفية والبيئية (وزارة التضامن الاجتماعي). استعرض وتصفح قائمة الأسعار الرسمية والمنتجات التراثية واليدوية المصرية وعسل النحل والفخار والخزف وخشب السرسوع بتجربة تفاعلية ثلاثية الأبعاد.';

/**
 * Generate Schema.org Organization structured data
 */
export function generateOrganizationSchema(baseUrl: string = getBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    '@id': `${baseUrl}/#organization`,
    name: 'صندوق دعم الصناعات الريفية والبيئية',
    alternateName: [
      'صندوق دعم الصناعات',
      'صندوق دعم الصناعات الريفية والبيئية والإنعاش الريفي',
      'صندوق دعم الصناعات - وزارة التضامن الاجتماعي',
      'REIS Fund',
      'Rural and Environmental Industries Support Fund',
    ],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/brand/fund_seal.png`,
      caption: 'شعار صندوق دعم الصناعات الريفية والبيئية',
    },
    parentOrganization: {
      '@type': 'GovernmentOrganization',
      name: 'وزارة التضامن الاجتماعي',
      alternateName: 'Ministry of Social Solidarity',
      url: 'https://www.moss.gov.eg',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '19 شارع المراغي - العجوزة (الدور الثالث)',
      addressLocality: 'الجيزة',
      addressRegion: 'Giza',
      addressCountry: 'EG',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'Reis.Fund@moss.gov.eg',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: [
      'https://www.facebook.com/reisfund',
      'https://www.instagram.com/reisfund',
      'https://www.linkedin.com/company/reis-fund/posts/',
    ],
  };
}

/**
 * Generate Schema.org WebSite structured data with SearchAction
 */
export function generateWebSiteSchema(baseUrl: string = getBaseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'كتالوج لوتس',
    alternateName: [
      'كاتلوج لوتس',
      'كتالوج صندوق دعم الصناعات',
      'كاتلوج صندوق دعم الصناعات',
      'مجلة لوتس',
      'Lotus Catalog',
      'Lotus Magazine',
    ],
    url: baseUrl,
    description: SEO_DEFAULT_DESCRIPTION,
    inLanguage: 'ar-EG',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Schema.org BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string = getBaseUrl()
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}
