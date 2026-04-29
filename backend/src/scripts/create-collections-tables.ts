import { AppDataSource } from "../config/database";

async function createCollectionsTables() {
  try {
    console.log("🔧 Initializing database connection...");
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log("📦 Creating collections table...");
    
    // Create collections table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "collections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text,
        "banner_url" text,
        "display_order" integer NOT NULL DEFAULT '0',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_collections_name" UNIQUE ("name"),
        CONSTRAINT "UQ_collections_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_collections" PRIMARY KEY ("id")
      )
    `);

    console.log("📦 Creating indexes on collections...");
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_collections_name" ON "collections" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_collections_slug" ON "collections" ("slug")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_collections_is_active" ON "collections" ("is_active")
    `);

    console.log("📦 Creating collection_products junction table...");
    
    // Create collection_products junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "collection_products" (
        "collection_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        CONSTRAINT "PK_collection_products" PRIMARY KEY ("collection_id", "product_id")
      )
    `);

    console.log("📦 Creating indexes on collection_products...");
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_collection_products_collection_id" ON "collection_products" ("collection_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_collection_products_product_id" ON "collection_products" ("product_id")
    `);

    console.log("📦 Adding foreign key constraints...");
    
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_collection_products_collections'
        ) THEN
          ALTER TABLE "collection_products" 
          ADD CONSTRAINT "FK_collection_products_collections" 
          FOREIGN KEY ("collection_id") 
          REFERENCES "collections"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_collection_products_products'
        ) THEN
          ALTER TABLE "collection_products" 
          ADD CONSTRAINT "FK_collection_products_products" 
          FOREIGN KEY ("product_id") 
          REFERENCES "products"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.release();

    console.log("✅ Collections tables created successfully!");
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating collections tables:", error);
    process.exit(1);
  }
}

createCollectionsTables();
