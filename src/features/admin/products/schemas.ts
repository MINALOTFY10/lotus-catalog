import { z } from 'zod';

export const productUpdateSchema = z.object({
  name_ar: z.string().trim().min(1, 'اسم المنتج مطلوب'),
  sale_price: z.number().positive('سعر البيع يجب أن يكون أكبر من صفر'),
  description_ar: z.string().optional(),
  category: z.string().optional(),
  primary_image_url: z.string().optional(),
  stock_status: z.string().optional(),
  in_stock: z.boolean().optional(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
