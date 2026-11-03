import { z } from 'zod';

export const productUpdateSchema = z.object({
  name_ar: z.string().trim().min(1, 'اسم المنتج مطلوب'),
  sale_price: z.number().positive('سعر البيع يجب أن يكون أكبر من صفر'),
  description_ar: z.string().optional(),
  category: z.string().optional(),
  primary_image_url: z.string().optional(),
  stock_status: z.string().optional(),
  in_stock: z.boolean().optional(),
  cashier_code: z.number().nullable().optional(),
  price_text: z.string().nullable().optional(),
  price_tiers: z
    .array(
      z.object({
        label: z.string().trim(),
        price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
      })
    )
    .nullable()
    .optional(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
