import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { Vendor } from "../entities/Vendor";
import { AppError } from "../utils/AppError";

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock?: number;
  condition?: string;
  category?: string;
  brand?: string;
  image_url?: string;
  images?: string[];
}

// ─────────────────────────────────────────────────────────────────────────
// CREATE PRODUCT
// Creates a new product for the given vendor.
// ─────────────────────────────────────────────────────────────────────────
export const createProduct = async (
  vendorId: string,
  payload: CreateProductPayload
): Promise<Product> => {
  const repo = AppDataSource.getRepository(Product);

  // Generate a URL-friendly slug from the product name + random suffix
  const baseSlug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const product = repo.create({
    name: payload.name,
    slug,
    description: payload.description,
    price: payload.price,
    currency: payload.currency || "AED",
    stock: payload.stock ?? 0,
    condition: payload.condition as any,
    category: payload.category,
    brand: payload.brand,
    image_url: payload.image_url,
    images: payload.images,
  });

  // Assign vendor relation separately to bypass DeepPartial issues
  product.vendor = { id: vendorId } as Vendor;

  return repo.save(product);
};

// ─────────────────────────────────────────────────────────────────────────
// GET PRODUCTS BY VENDOR
// Returns all active products for the given vendor.
// ─────────────────────────────────────────────────────────────────────────
export const getProductsByVendor = async (
  vendorId: string
): Promise<Product[]> => {
  return AppDataSource.getRepository(Product).find({
    where: { vendor: { id: vendorId } },
    order: { created_at: "DESC" },
  });
};

// ─────────────────────────────────────────────────────────────────────────
// UPDATE PRODUCT
// Updates an existing product. Includes vendor ownership security check.
// ─────────────────────────────────────────────────────────────────────────
export const updateProduct = async (
  vendorId: string,
  productId: string,
  payload: Partial<CreateProductPayload>
): Promise<Product> => {
  const repo = AppDataSource.getRepository(Product);

  const product = await repo.findOne({
    where: { id: productId, vendor: { id: vendorId } },
  });

  if (!product) {
    throw new AppError("Product not found or does not belong to your store.", 404);
  }

  // Apply updates from payload
  if (payload.name !== undefined) product.name = payload.name;
  if (payload.description !== undefined) product.description = payload.description as any;
  if (payload.price !== undefined) product.price = payload.price;
  if (payload.currency !== undefined) product.currency = payload.currency;
  if (payload.stock !== undefined) product.stock = payload.stock;
  if (payload.condition !== undefined) product.condition = payload.condition as any;
  if (payload.category !== undefined) product.category = payload.category as any;
  if (payload.brand !== undefined) product.brand = payload.brand as any;
  if (payload.image_url !== undefined) product.image_url = payload.image_url as any;
  if (payload.images !== undefined) product.images = payload.images as any;

  return repo.save(product);
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE PRODUCT (SOFT DELETE)
// Marks the product with deleted_at instead of permanently removing it,
// preserving order history integrity.
// ─────────────────────────────────────────────────────────────────────────
export const deleteProduct = async (
  vendorId: string,
  productId: string
): Promise<void> => {
  const repo = AppDataSource.getRepository(Product);

  const product = await repo.findOne({
    where: { id: productId, vendor: { id: vendorId } },
  });

  if (!product) {
    throw new AppError("Product not found or does not belong to your store.", 404);
  }

  await repo.softRemove(product);
};
