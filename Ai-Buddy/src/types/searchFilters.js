import { z } from 'zod';

export const SearchFiltersSchema = z.object({
  keywords: z.array(z.string()).optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  brand: z.string().optional(),
  sortBy: z.enum(['relevance', 'priceLow', 'priceHigh', 'newest']).default('relevance'),
  limit: z.number().default(5),
});

export { ShoppingFiltersSchema } from './shoppingFilters.js';




