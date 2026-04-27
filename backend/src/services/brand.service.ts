import { AppDataSource } from "../config/database";
import { Brand } from "../entities/Brand";

// ── Repository references ───────────────────────────────────────────
const brandRepo = () => AppDataSource.getRepository(Brand);

// ─────────────────────────────────────────────────────────────────────
// GET ALL BRANDS
// ─────────────────────────────────────────────────────────────────────
export const getBrands = async () => {
  const brands = await brandRepo()
    .createQueryBuilder("brand")
    .where("brand.is_active = :isActive", { isActive: true })
    .orderBy("brand.display_order", "ASC")
    .addOrderBy("brand.name", "ASC")
    .getMany();

  return brands;
};

// ─────────────────────────────────────────────────────────────────────
// GET BRAND BY ID
// ─────────────────────────────────────────────────────────────────────
export const getBrandById = async (id: string) => {
  const brand = await brandRepo()
    .createQueryBuilder("brand")
    .where("brand.id = :id", { id })
    .andWhere("brand.is_active = :isActive", { isActive: true })
    .getOne();

  return brand;
};

// ─────────────────────────────────────────────────────────────────────
// GET BRAND BY SLUG
// ─────────────────────────────────────────────────────────────────────
export const getBrandBySlug = async (slug: string) => {
  const brand = await brandRepo()
    .createQueryBuilder("brand")
    .where("brand.slug = :slug", { slug })
    .andWhere("brand.is_active = :isActive", { isActive: true })
    .getOne();

  return brand;
};