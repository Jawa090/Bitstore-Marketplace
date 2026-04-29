import { Response, NextFunction } from "express";
import { sendCreated, sendSuccess } from "../utils/response";
import { AuthRequest } from "../types/auth.types";
import { AppError } from "../utils/AppError";
import * as VendorProductService from "../services/vendor-product.service";

// ─────────────────────────────────────────────────────────────────────────
// POST /api/vendor/products
// Create a new product for the authenticated vendor.
// ─────────────────────────────────────────────────────────────────────────
export const createProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, price, currency, stock, condition, category, brand, image_url, images } = req.body;

    if (!name) throw new AppError("name is required.", 400);
    if (price === undefined || price === null) throw new AppError("price is required.", 400);

    const product = await VendorProductService.createProduct(req.vendor!.id, {
      name,
      description,
      price,
      currency,
      stock,
      condition,
      category,
      brand,
      image_url,
      images,
    });

    sendCreated(res, "Product created successfully.", { product });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/vendor/products
// List all products belonging to the authenticated vendor.
// ─────────────────────────────────────────────────────────────────────────
export const listProductsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await VendorProductService.getProductsByVendor(req.vendor!.id);
    sendSuccess(res, "Products retrieved successfully.", { products });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/vendor/products/:id
// Update an existing product for the authenticated vendor.
// ─────────────────────────────────────────────────────────────────────────
export const updateProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.id as string;
    if (!productId) throw new AppError("Product ID is required.", 400);

    const product = await VendorProductService.updateProduct(
      req.vendor!.id,
      productId,
      req.body
    );

    sendSuccess(res, "Product updated successfully.", { product });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/vendor/products/:id
// Soft-delete a product (preserves order history).
// ─────────────────────────────────────────────────────────────────────────
export const deleteProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.id as string;
    if (!productId) throw new AppError("Product ID is required.", 400);

    await VendorProductService.deleteProduct(req.vendor!.id, productId);

    sendSuccess(res, "Product deleted successfully.", {});
  } catch (error) {
    next(error);
  }
};
