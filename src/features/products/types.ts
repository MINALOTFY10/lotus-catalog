export interface PublicProduct {
  id: string;
  cashier_code: number | null;
  slug: string;
  name_ar: string;
  description_ar?: string;
  category?: string;
  sale_price: number;
  original_qty?: number;
  stock_status?: string;
  in_stock: boolean;
  primary_image_url: string;
  magazinePageNumber?: number;
  magazineSlot?: number;
  sectionTitle?: string;
}

export interface ProductJsonLd {
  '@context': string;
  '@type': string;
  name: string;
  image: string;
  description?: string;
  sku?: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}
