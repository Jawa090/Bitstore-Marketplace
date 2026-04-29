import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVendorEntities1777380016388 implements MigrationInterface {
    name = 'AddVendorEntities1777380016388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trade_licenses_status_enum" AS ENUM('pending', 'approved', 'rejected', 'expired')`);
        await queryRunner.query(`CREATE TABLE "trade_licenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "license_number" character varying(100) NOT NULL, "expiry_date" date NOT NULL, "document_url" text, "status" "public"."trade_licenses_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_id" uuid, CONSTRAINT "PK_dac1455aee4fc1b811209edc70e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vendors_status_enum" AS ENUM('pending', 'approved', 'suspended', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "vendors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "store_name" character varying(255) NOT NULL, "store_description" text, "logo_url" text, "emirate" character varying(50) NOT NULL, "address" text, "contact_email" character varying(255), "contact_phone" character varying(20), "commission_rate" numeric(5,2) NOT NULL DEFAULT '10', "is_bitstores" boolean NOT NULL DEFAULT false, "status" "public"."vendors_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid, CONSTRAINT "REL_65b4134d1ddc73872e6abee2c1" UNIQUE ("user_id"), CONSTRAINT "PK_9c956c9797edfae5c6ddacc4e6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vendor_payouts_status_enum" AS ENUM('pending', 'paid')`);
        await queryRunner.query(`CREATE TABLE "vendor_payouts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "remittance_id" uuid, "amount" numeric(12,2) NOT NULL, "notes" text, "status" "public"."vendor_payouts_status_enum" NOT NULL DEFAULT 'pending', "paid_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_id" uuid, CONSTRAINT "PK_e74c8ca05043a7ae7cf20b4f59e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trade_licenses" ADD CONSTRAINT "FK_d8eac68319b247dd471e62d3923" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD CONSTRAINT "FK_65b4134d1ddc73872e6abee2c17" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_payouts" ADD CONSTRAINT "FK_7848ea6f2544c6edc74b625a0ce" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_payouts" DROP CONSTRAINT "FK_7848ea6f2544c6edc74b625a0ce"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP CONSTRAINT "FK_65b4134d1ddc73872e6abee2c17"`);
        await queryRunner.query(`ALTER TABLE "trade_licenses" DROP CONSTRAINT "FK_d8eac68319b247dd471e62d3923"`);
        await queryRunner.query(`DROP TABLE "vendor_payouts"`);
        await queryRunner.query(`DROP TYPE "public"."vendor_payouts_status_enum"`);
        await queryRunner.query(`DROP TABLE "vendors"`);
        await queryRunner.query(`DROP TYPE "public"."vendors_status_enum"`);
        await queryRunner.query(`DROP TABLE "trade_licenses"`);
        await queryRunner.query(`DROP TYPE "public"."trade_licenses_status_enum"`);
    }

}
