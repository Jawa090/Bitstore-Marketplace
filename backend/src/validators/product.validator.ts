import { z } from "zod";
import { ProductCondition } from "../entities/Product";

// ── Product Query Parameters ────────────────────────────────────────
export const ProductQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  min_price: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  max_price: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  sort_by: z.enum(["price", "created_at", "name"]).optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;

// ── Create Product ──────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  slug: z.string().min(1, "Product slug is required").max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  original_price: z.number().positive().optional(),
  condition: z.nativeEnum(ProductCondition),
  stock_quantity: z.number().int().min(0).default(0),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  
  // Specifications
  ram: z.string().max(50).optional(),
  storage: z.string().max(50).optional(),
  camera: z.string().max(100).optional(),
  battery: z.string().max(50).optional(),
  display_size: z.string().max(50).optional(),
  processor: z.string().max(100).optional(),
  os: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  warranty_months: z.number().int().min(0).optional(),
  
  // SEO
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// ── Update Product ──────────────────────────────────────────────────
export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;