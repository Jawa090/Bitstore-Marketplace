import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";

// ── Repository references ───────────────────────────────────────────
const categoryRepo = () => AppDataSource.getRepository(Category);

// ─────────────────────────────────────────────────────────────────────
// GET ALL CATEGORIES (Hierarchical)
// ─────────────────────────────────────────────────────────────────────
export const getCategories = async () => {
  const categories = await categoryRepo()
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.children", "children")
    .where("category.is_active = :isActive", { isActive: true })
    .andWhere("category.parent_id IS NULL") // Only root categories
    .orderBy("category.display_order", "ASC")
    .addOrderBy("children.display_order", "ASC")
    .getMany();

  return categories;
};

// ─────────────────────────────────────────────────────────────────────
// GET CATEGORY BY ID
// ─────────────────────────────────────────────────────────────────────
export const getCategoryById = async (id: string) => {
  const category = await categoryRepo()
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.parent", "parent")
    .leftJoinAndSelect("category.children", "children")
    .where("category.id = :id", { id })
    .andWhere("category.is_active = :isActive", { isActive: true })
    .getOne();

  return category;
};

// ─────────────────────────────────────────────────────────────────────
// GET CATEGORY BY SLUG
// ─────────────────────────────────────────────────────────────────────
export const getCategoryBySlug = async (slug: string) => {
  const category = await categoryRepo()
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.parent", "parent")
    .leftJoinAndSelect("category.children", "children")
    .where("category.slug = :slug", { slug })
    .andWhere("category.is_active = :isActive", { isActive: true })
    .getOne();

  return category;
};