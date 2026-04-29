import { Request, Response, NextFunction } from "express";
import * as collectionService from "../services/collection.service";

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/collections
// Get all active collections
// ─────────────────────────────────────────────────────────────────────
export const getCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await collectionService.getCollections();

    res.json({
      success: true,
      data: { collections },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/collections/:slug
// Get collection by slug with paginated products
// ─────────────────────────────────────────────────────────────────────
export const getCollectionBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid collection slug",
      });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await collectionService.getCollectionBySlug(slug, page, limit);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
