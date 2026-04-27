import { MigrationInterface, QueryRunner } from "typeorm";

export class Module2ProductManagement1776864020154 implements MigrationInterface {
    name = 'Module2ProductManagement1776864020154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Brands table
        await queryRunner.query(`CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "description" text, "logo_url" text, "website_url" text, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name"), CONSTRAINT "UQ_b2c8e5b3e3b3b3b3b3b3b3b3b3b" UNIQUE ("slug"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_96db6bbbaa6f23cad26871339b" ON "brands" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b2c8e5b3e3b3b3b3b3b3b3b3b3" ON "brands" ("slug") `);
        
        // Create Categories table
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "icon_url" text, "parent_id" uuid, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("name"), CONSTRAINT "UQ_c2a2b3b3b3b3b3b3b3b3b3b3b3b" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_420d9f679d41281f282f5bc7d0" ON "categories" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c2a2b3b3b3b3b3b3b3b3b3b3b3" ON "categories" ("slug") `);
        
        // Create Vendors table
        await queryRunner.query(`CREATE TYPE "public"."vendors_verification_status_enum" AS ENUM('pending', 'verified', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "vendors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "store_name" character varying(255) NOT NULL, "store_slug" character varying(255) NOT NULL, "logo_url" text, "banner_url" text, "description" text, "emirate" character varying(50), "is_bitstores" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "verification_status" "public"."vendors_verification_status_enum" NOT NULL DEFAULT 'pending', "commission_rate" numeric(5,2) NOT NULL DEFAULT '10', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_65b4134d1ddc73872e6abee2c17" UNIQUE ("user_id"), CONSTRAINT "UQ_b9837450c7bf6fb75faf217837d" UNIQUE ("store_slug"), CONSTRAINT "REL_65b4134d1ddc73872e6abee2c1" UNIQUE ("user_id"), CONSTRAINT "PK_9c956c9797edfae5c6ddacc4e6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_65b4134d1ddc73872e6abee2c1" ON "vendors" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b9837450c7bf6fb75faf217837" ON "vendors" ("store_slug") `);
        
        // Create Products table
        await queryRunner.query(`CREATE TYPE "public"."products_condition_enum" AS ENUM('new', 'used_like_new', 'used_good', 'used_fair', 'refurbished')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "category_id" uuid, "brand_id" uuid, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "original_price" numeric(10,2), "condition" "public"."products_condition_enum" NOT NULL, "stock_quantity" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "ram" character varying(50), "storage" character varying(50), "camera" character varying(100), "battery" character varying(50), "display_size" character varying(50), "processor" character varying(100), "os" character varying(50), "color" character varying(50), "warranty_months" integer, "meta_title" character varying(255), "meta_description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_464f927ae360106b783ed0b410" ON "products" ("slug") `);
        
        // Create Product Images table
        await queryRunner.query(`CREATE TABLE "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "image_url" text NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        
        // Add Foreign Keys
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f87318aa5a8a" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD CONSTRAINT "FK_65b4134d1ddc73872e6abee2c17" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_0e859a83f1dd6b774c20c02885d" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_0e859a83f1dd6b774c20c02885d"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP CONSTRAINT "FK_65b4134d1ddc73872e6abee2c17"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f87318aa5a8a"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_464f927ae360106b783ed0b410"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_condition_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b9837450c7bf6fb75faf217837"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65b4134d1ddc73872e6abee2c1"`);
        await queryRunner.query(`DROP TABLE "vendors"`);
        await queryRunner.query(`DROP TYPE "public"."vendors_verification_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2a2b3b3b3b3b3b3b3b3b3b3b3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_420d9f679d41281f282f5bc7d0"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2c8e5b3e3b3b3b3b3b3b3b3b3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96db6bbbaa6f23cad26871339b"`);
        await queryRunner.query(`DROP TABLE "brands"`);
    }
}