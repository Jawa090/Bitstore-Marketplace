import { Request, Response, NextFunction } from "express";
import * as brandService from "../services/brand.service";

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/brands
// ─────────────────────────────────────────────────────────────────────
export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await brandService.getBrands();

    res.json({
      success: true,
      data: { brands },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/brands/:id
// ─────────────────────────────────────────────────────────────────────
export const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID",
      });
    }
    const brand = await brandService.getBrandById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.json({
      success: true,
      data: { brand },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/brands/slug/:slug
// ─────────────────────────────────────────────────────────────────────
export const getBrandBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid brand slug",
      });
    }
    const brand = await brandService.getBrandBySlug(slug);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.json({
      success: true,
      data: { brand },
    });
  } catch (error) {
    next(error);
  }
};