export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductStatus = 'draft' | 'published' | 'hidden';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          name_en: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ar?: string;
          name_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          cashier_code: number;
          slug: string;
          name_ar: string;
          name_en: string | null;
          description_ar: string | null;
          description_en: string | null;
          category_id: string | null;
          supplier: string | null;
          sale_price: number;
          cost_price: number | null;
          variants: Json;
          in_stock: boolean;
          show_stock_badge: boolean;
          status: ProductStatus;
          primary_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cashier_code: number;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          category_id?: string | null;
          supplier?: string | null;
          sale_price: number;
          cost_price?: number | null;
          variants?: Json;
          in_stock?: boolean;
          show_stock_badge?: boolean;
          status?: ProductStatus;
          primary_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cashier_code?: number;
          slug?: string;
          name_ar?: string;
          name_en?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          category_id?: string | null;
          supplier?: string | null;
          sale_price?: number;
          cost_price?: number | null;
          variants?: Json;
          in_stock?: boolean;
          show_stock_badge?: boolean;
          status?: ProductStatus;
          primary_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          width: number | null;
          height: number | null;
          blur_data_url: string | null;
          sort_order: number;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          width?: number | null;
          height?: number | null;
          blur_data_url?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          width?: number | null;
          height?: number | null;
          blur_data_url?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
      };
      issues: {
        Row: {
          id: string;
          slug: string;
          title_ar: string;
          theme: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug?: string;
          title_ar?: string;
          theme?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_ar?: string;
          theme?: Json;
          created_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          issue_id: string;
          title_ar: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          issue_id: string;
          title_ar: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          issue_id?: string;
          title_ar?: string;
          sort_order?: number;
        };
      };
      pages: {
        Row: {
          id: string;
          issue_id: string;
          section_id: string | null;
          position: number;
          template: 'cover' | 'grid3x3' | 'grid2x2' | 'single' | 'info';
        };
        Insert: {
          id?: string;
          issue_id: string;
          section_id?: string | null;
          position: number;
          template: 'cover' | 'grid3x3' | 'grid2x2' | 'single' | 'info';
        };
        Update: {
          id?: string;
          issue_id?: string;
          section_id?: string | null;
          position?: number;
          template?: 'cover' | 'grid3x3' | 'grid2x2' | 'single' | 'info';
        };
      };
      page_slots: {
        Row: {
          id: string;
          page_id: string;
          slot: number;
          product_id: string | null;
          title_override: string | null;
          description_override: string | null;
          price_override: number | null;
          image_override: string | null;
        };
        Insert: {
          id?: string;
          page_id: string;
          slot: number;
          product_id?: string | null;
          title_override?: string | null;
          description_override?: string | null;
          price_override?: number | null;
          image_override?: string | null;
        };
        Update: {
          id?: string;
          page_id?: string;
          slot?: number;
          product_id?: string | null;
          title_override?: string | null;
          description_override?: string | null;
          price_override?: number | null;
          image_override?: string | null;
        };
      };
      issue_versions: {
        Row: {
          id: string;
          issue_id: string;
          version: number;
          payload: Json;
          is_live: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          version: number;
          payload: Json;
          is_live?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string;
          version?: number;
          payload?: Json;
          is_live?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
