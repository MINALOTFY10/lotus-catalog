export interface ProductData {
  id: string;
  cashier_code?: number | null;
  slug: string;
  name_ar: string;
  name_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  sale_price?: number | null;
  category?: string | null;
  primary_image_url?: string | null;
  in_stock?: boolean;
}

export interface PageSlotData {
  slot: number;
  product?: ProductData | null;
  title_override?: string | null;
  description_override?: string | null;
  price_override?: number | null;
  image_override?: string | null;
  price_text?: string | null;
}

export interface MagazinePageData {
  id?: string;
  position: number;
  pageNumber: number;
  template:
    | 'showcase-honey'
    | 'showcase-food'
    | 'grid3x3'
    | 'grid2x3'
    | 'grid2x2'
    | 'grid-custom'
    | 'hero-split'
    | 'cover'
    | 'single'
    | 'info';
  section_title?: string | null;
  sectionTitle?: string;
  slots: PageSlotData[];
}

export interface IssueSnapshot {
  issueSlug: string;
  title_ar: string;
  version: number;
  publishedAt: string;
  totalPages: number;
  pages: MagazinePageData[];
  theme?: Record<string, string>;
}

