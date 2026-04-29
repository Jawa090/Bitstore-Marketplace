import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCollectionsTable1777377341789 implements MigrationInterface {
    name = 'CreateCollectionsTable1777377341789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create collections table
        await queryRunner.query(`
            CREATE TABLE "collections" (
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

        // Create index on slug for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_collections_slug" ON "collections" ("slug")
        `);

        // Create index on is_active for filtering
        await queryRunner.query(`
            CREATE INDEX "IDX_collections_is_active" ON "collections" ("is_active")
        `);

        // Create collection_products junction table
        await queryRunner.query(`
            CREATE TABLE "collection_products" (
                "collectionsId" uuid NOT NULL,
                "productsId" uuid NOT NULL,
                CONSTRAINT "PK_collection_products" PRIMARY KEY ("collectionsId", "productsId")
            )
        `);

        // Create indexes for junction table
        await queryRunner.query(`
            CREATE INDEX "IDX_collection_products_collectionsId" ON "collection_products" ("collectionsId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_collection_products_productsId" ON "collection_products" ("productsId")
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "collection_products" 
            ADD CONSTRAINT "FK_collection_products_collections" 
            FOREIGN KEY ("collectionsId") 
            REFERENCES "collections"("id") 
            ON DELETE CASCADE 
            ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "collection_products" 
            ADD CONSTRAINT "FK_collection_products_products" 
            FOREIGN KEY ("productsId") 
            REFERENCES "products"("id") 
            ON DELETE CASCADE 
            ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "collection_products" 
            DROP CONSTRAINT "FK_collection_products_products"
        `);

        await queryRunner.query(`
            ALTER TABLE "collection_products" 
            DROP CONSTRAINT "FK_collection_products_collections"
        `);

        // Drop indexes
        await queryRunner.query(`
            DROP INDEX "IDX_collection_products_productsId"
        `);

        await queryRunner.query(`
            DROP INDEX "IDX_collection_products_collectionsId"
        `);

        // Drop junction table
        await queryRunner.query(`
            DROP TABLE "collection_products"
        `);

        // Drop indexes on collections
        await queryRunner.query(`
            DROP INDEX "IDX_collections_is_active"
        `);

        await queryRunner.query(`
            DROP INDEX "IDX_collections_slug"
        `);

        // Drop collections table
        await queryRunner.query(`
            DROP TABLE "collections"
        `);
    }
}
