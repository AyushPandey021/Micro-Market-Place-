
import { z } from 'zod';

const ShoppingFiltersSchema = z.object({
  keywords: z.array(z.string().min(1)).optional(),
  price_max: z.number().optional(),
});

export { ShoppingFiltersSchema };




