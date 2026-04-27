import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service";

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/categories
// ─────────────────────────────────────────────────────────────────────
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getCategories();

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/categories/:id
// ─────────────────────────────────────────────────────────────────────
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }
    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/categories/slug/:slug
// ─────────────────────────────────────────────────────────────────────
export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid category slug",
      });
    }
    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};