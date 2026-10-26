import { z } from 'zod';

export const slotAssignSchema = z.object({
  pageNumber: z.number().int().min(1, 'رقم الصفحة غير صالح'),
  slot: z.number().int().min(1, 'رقم الخانة يجب أن يكون بين 1 و 9').max(9, 'رقم الخانة يجب أن يكون بين 1 و 9'),
  product_id: z.string().optional(),
  title_override: z.string().optional(),
  price_override: z.number().optional(),
  image_override: z.string().optional(),
  description_override: z.string().optional(),
});

export type SlotAssignInput = z.infer<typeof slotAssignSchema>;
