import { ProductData, MagazinePageData, PageSlotData } from '../types';

export function determineSectionTitle(category?: string | null): string {
  if (!category) return 'مجموعة التراث المصري';
  const lower = category.toLowerCase();
  if (lower.includes('عسل') || lower.includes('نحلة') || lower.includes('na7la')) {
    return 'NA7LA عسل نقي';
  }
  if (lower.includes('خشب') || lower.includes('سرسوع')) {
    return 'خشبي برودوكتس';
  }
  return 'مجموعة التراث المصري';
}

export function generateAutoLayout(
  products: ProductData[],
  cardsPerPage: number = 9
): MagazinePageData[] {
  // Group products by section
  const sectionMap = new Map<string, ProductData[]>();

  for (const product of products) {
    const section = determineSectionTitle(product.category);
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(product);
  }

  const pages: MagazinePageData[] = [];
  let pageNumber = 1;

  for (const [sectionTitle, prods] of sectionMap.entries()) {
    for (let i = 0; i < prods.length; i += cardsPerPage) {
      const chunk = prods.slice(i, i + cardsPerPage);
      const slots: PageSlotData[] = chunk.map((prod, idx) => ({
        slot: idx + 1,
        product: prod,
      }));

      pages.push({
        position: pageNumber,
        pageNumber,
        template: 'grid3x3',
        section_title: sectionTitle,
        sectionTitle,
        slots,
      });


      pageNumber++;
    }
  }

  return pages;
}
