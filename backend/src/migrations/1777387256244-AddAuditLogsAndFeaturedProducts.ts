import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogsAndFeaturedProducts1777387256244 implements MigrationInterface {
    name = 'AddAuditLogsAndFeaturedProducts1777387256244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023"`);
        await queryRunner.query(`ALTER TABLE "collection_products" DROP CONSTRAINT "FK_collection_products_collections"`);
        await queryRunner.query(`ALTER TABLE "collection_products" DROP CONSTRAINT "FK_collection_products_products"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_collections_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_collections_slug"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_collections_is_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_collection_products_collection_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_collection_products_product_id"`);
        await queryRunner.query(`CREATE TABLE "user_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(100) NOT NULL, "title" character varying(255) NOT NULL, "message" text, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_569622b0fd6e6ab3661de985a2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae9b1d1f1fe780ef8e3e7d0c0f" ON "user_notifications" ("user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."return_requests_status_enum" AS ENUM('pending', 'approved', 'rejected', 'completed')`);
        await queryRunner.query(`CREATE TABLE "return_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "reason" character varying(50) NOT NULL, "comments" text, "status" "public"."return_requests_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_38714de8942bd9bc3a450a06889" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('unpaid', 'paid', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "total_amount" numeric(12,2) NOT NULL, "vat_amount" numeric(12,2) NOT NULL DEFAULT '0', "cod_fee" numeric(12,2) NOT NULL DEFAULT '0', "payment_method" character varying(20), "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'unpaid', "stripe_payment_intent_id" character varying(255), "delivery_emirate" character varying(50) NOT NULL, "delivery_address" text NOT NULL, "delivery_landmark" text, "phone" character varying(20), "notes" text, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sub_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(12,2) NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sub_orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "sub_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "subtotal" numeric(12,2) NOT NULL, "status" "public"."sub_orders_status_enum" NOT NULL DEFAULT 'pending', "tracking_number" character varying(255), "courier" character varying(50), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_909d792a7f7b751a851223dee9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2ec1c94a977b940d85a4f498aea" UNIQUE ("user_id"), CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cart_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "action" character varying(100) NOT NULL, "entity_type" character varying(50) NOT NULL, "entity_id" uuid, "details" jsonb, "ip_address" character varying(45), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON "audit_logs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_ea9ba3dfb39050f831ee3be40d" ON "audit_logs" ("entity_type") `);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "full_name"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "address_line_1"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "address_line_2"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "postal_code"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "label" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "address" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "landmark" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_featured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "emirate"`);
        await queryRunner.query(`DROP TYPE "public"."addresses_emirate_enum"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "emirate" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_16aac8a9f6f9c1dd6bcb75ec02" ON "addresses" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ed225078e8bf65b448b69105b4" ON "collections" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_99d0d14f9f23b45d2c6648c4b5" ON "collections" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_e87d3f6a1fa89a197975d3fc52" ON "collection_products" ("collection_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_862459bc848778744e0370048d" ON "collection_products" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_ae9b1d1f1fe780ef8e3e7d0c0f6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_d1c3c02e67ffbc6695e36a626de" FOREIGN KEY ("sub_order_id") REFERENCES "sub_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_orders" ADD CONSTRAINT "FK_f6fdc0f65057389bcdb58575b9a" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collection_products" ADD CONSTRAINT "FK_e87d3f6a1fa89a197975d3fc527" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "collection_products" ADD CONSTRAINT "FK_862459bc848778744e0370048de" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collection_products" DROP CONSTRAINT "FK_862459bc848778744e0370048de"`);
        await queryRunner.query(`ALTER TABLE "collection_products" DROP CONSTRAINT "FK_e87d3f6a1fa89a197975d3fc527"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_6385a745d9e12a89b859bb25623"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea"`);
        await queryRunner.query(`ALTER TABLE "sub_orders" DROP CONSTRAINT "FK_f6fdc0f65057389bcdb58575b9a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_d1c3c02e67ffbc6695e36a626de"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_ae9b1d1f1fe780ef8e3e7d0c0f6"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_862459bc848778744e0370048d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e87d3f6a1fa89a197975d3fc52"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99d0d14f9f23b45d2c6648c4b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ed225078e8bf65b448b69105b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16aac8a9f6f9c1dd6bcb75ec02"`);
        await queryRunner.query(`ALTER TABLE "addresses" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "emirate"`);
        await queryRunner.query(`CREATE TYPE "public"."addresses_emirate_enum" AS ENUM('Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah')`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "emirate" "public"."addresses_emirate_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_featured"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "landmark"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "label"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "postal_code" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "city" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "address_line_2" text`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "address_line_1" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "full_name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "type" character varying(100) NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea9ba3dfb39050f831ee3be40d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd2726fd31b35443f2245b93ba"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "sub_orders"`);
        await queryRunner.query(`DROP TYPE "public"."sub_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
        await queryRunner.query(`DROP TABLE "return_requests"`);
        await queryRunner.query(`DROP TYPE "public"."return_requests_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae9b1d1f1fe780ef8e3e7d0c0f"`);
        await queryRunner.query(`DROP TABLE "user_notifications"`);
        await queryRunner.query(`CREATE INDEX "IDX_collection_products_product_id" ON "collection_products" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_collection_products_collection_id" ON "collection_products" ("collection_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_collections_is_active" ON "collections" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_collections_slug" ON "collections" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_collections_name" ON "collections" ("name") `);
        await queryRunner.query(`ALTER TABLE "collection_products" ADD CONSTRAINT "FK_collection_products_products" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "collection_products" ADD CONSTRAINT "FK_collection_products_collections" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
