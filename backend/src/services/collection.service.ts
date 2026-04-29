import { AppDataSource } from "../config/database";
import { Collection } from "../entities/Collection";

const collectionRepo = () => AppDataSource.getRepository(Collection);

// ─────────────────────────────────────────────────────────────────────
// GET ALL COLLECTIONS
// ─────────────────────────────────────────────────────────────────────
export const getCollections = async (): Promise<Collection[]> => {
  return await collectionRepo()
    .createQueryBuilder("collection")
    .where("collection.is_active = :isActive", { isActive: true })
    .orderBy("collection.display_order", "ASC")
    .addOrderBy("collection.name", "ASC")
    .getMany();
};

// ─────────────────────────────────────────────────────────────────────
// GET COLLECTION BY SLUG WITH PAGINATED PRODUCTS
// ─────────────────────────────────────────────────────────────────────
export const getCollectionBySlug = async (slug: string, page: number = 1, limit: number = 20) => {
  const collection = await collectionRepo()
    .createQueryBuilder("collection")
    .leftJoinAndSelect("collection.products", "product")
    .leftJoinAndSelect("product.vendor", "vendor")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.brand", "brand")
    .leftJoinAndSelect("product.images", "images")
    .where("collection.slug = :slug", { slug })
    .andWhere("collection.is_active = :isActive", { isActive: true })
    .andWhere("product.is_active = :productActive", { productActive: true })
    .getOne();

  if (!collection) {
    return null;
  }

  // Manual pagination of products
  const offset = (page - 1) * limit;
  const totalProducts = collection.products.length;
  const paginatedProducts = collection.products.slice(offset, offset + limit);

  return {
    collection: {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      banner_url: collection.banner_url,
      display_order: collection.display_order,
      created_at: collection.created_at,
      updated_at: collection.updated_at,
    },
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total: totalProducts,
      pages: Math.ceil(totalProducts / limit),
    },
  };
};
