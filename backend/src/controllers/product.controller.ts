import { Request, Response, NextFunction } from "express";
import { ProductQuerySchema } from "../validators/product.validator";
import * as productService from "../services/product.service";

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/products
// ─────────────────────────────────────────────────────────────────────
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = ProductQuerySchema.parse(req.query);
    const result = await productService.getProducts(query);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/products/:id
// ─────────────────────────────────────────────────────────────────────
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/products/slug/:slug
// ─────────────────────────────────────────────────────────────────────
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid product slug",
      });
    }
    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/products/slug/:slug/related
// Get related products (same brand or category)
// ─────────────────────────────────────────────────────────────────────
export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid product slug",
      });
    }
    const limit = parseInt(req.query.limit as string) || 8;

    const products = await productService.getRelatedProducts(slug, limit);

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/products/slug/:slug/variants
// Get product variants (same model, different storage/color)
// ─────────────────────────────────────────────────────────────────────
export const getProductVariants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid product slug",
      });
    }

    const variants = await productService.getProductVariants(slug);

    res.json({
      success: true,
      data: { variants },
    });
  } catch (error) {
    next(error);
  }
};
