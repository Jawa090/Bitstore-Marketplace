import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { ProductQueryInput } from "../validators/product.validator";

// ── Repository references ───────────────────────────────────────────
const productRepo = () => AppDataSource.getRepository(Product);

// ─────────────────────────────────────────────────────────────────────
// GET PRODUCTS WITH FILTERS & PAGINATION
// ─────────────────────────────────────────────────────────────────────
export const getProducts = async (query: ProductQueryInput) => {
  const {
    page = 1,
    limit = 20,
    search,
    category_id,
    brand_id,
    condition,
    min_price,
    max_price,
    sort_by = "created_at",
    sort_order = "desc",
  } = query;

  const offset = (page - 1) * limit;

  let queryBuilder = productRepo()
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.vendor", "vendor")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.brand", "brand")
    .leftJoinAndSelect("product.images", "images")
    .where("product.is_active = :isActive", { isActive: true });

  // Search filter
  if (search) {
    queryBuilder = queryBuilder.andWhere(
      "(product.name ILIKE :search OR product.description ILIKE :search OR brand.name ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Category filter
  if (category_id) {
    queryBuilder = queryBuilder.andWhere("product.category_id = :categoryId", { categoryId: category_id });
  }

  // Brand filter
  if (brand_id) {
    queryBuilder = queryBuilder.andWhere("product.brand_id = :brandId", { brandId: brand_id });
  }

  // Condition filter
  if (condition) {
    queryBuilder = queryBuilder.andWhere("product.condition = :condition", { condition });
  }

  // Price range filter
  if (min_price !== undefined) {
    queryBuilder = queryBuilder.andWhere("product.price >= :minPrice", { minPrice: min_price });
  }
  if (max_price !== undefined) {
    queryBuilder = queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice: max_price });
  }

  // Sorting
  const sortField = sort_by === "price" ? "product.price" : 
                   sort_by === "name" ? "product.name" : "product.created_at";
  queryBuilder = queryBuilder.orderBy(sortField, sort_order.toUpperCase() as "ASC" | "DESC");

  // Get total count for pagination
  const totalCount = await queryBuilder.getCount();

  // Apply pagination
  const products = await queryBuilder
    .skip(offset)
    .take(limit)
    .getMany();

  return {
    products,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────
// GET PRODUCT BY ID
// ─────────────────────────────────────────────────────────────────────
export const getProductById = async (id: string): Promise<Product | null> => {
  return await productRepo()
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.vendor", "vendor")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.brand", "brand")
    .leftJoinAndSelect("product.images", "images")
    .where("product.id = :id", { id })
    .andWhere("product.is_active = :isActive", { isActive: true })
    .getOne();
};

// ─────────────────────────────────────────────────────────────────────
// GET PRODUCT BY SLUG
// ─────────────────────────────────────────────────────────────────────
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  return await productRepo()
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.vendor", "vendor")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.brand", "brand")
    .leftJoinAndSelect("product.images", "images")
    .where("product.slug = :slug", { slug })
    .andWhere("product.is_active = :isActive", { isActive: true })
    .getOne();
};