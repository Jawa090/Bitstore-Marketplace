import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTables1777035144929 implements MigrationInterface {
    name = 'CreateOrderTables1777035144929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."return_requests_status_enum" AS ENUM('pending', 'approved', 'rejected', 'completed')`);
        await queryRunner.query(`CREATE TABLE "return_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "reason" character varying(50) NOT NULL, "comments" text, "status" "public"."return_requests_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_38714de8942bd9bc3a450a06889" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "total_amount" numeric(12,2) NOT NULL, "vat_amount" numeric(12,2) NOT NULL DEFAULT '0', "cod_fee" numeric(12,2) NOT NULL DEFAULT '0', "payment_method" character varying(20), "delivery_emirate" character varying(50) NOT NULL, "delivery_address" text NOT NULL, "delivery_landmark" text, "phone" character varying(20), "notes" text, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sub_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(12,2) NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sub_orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "sub_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "subtotal" numeric(12,2) NOT NULL, "status" "public"."sub_orders_status_enum" NOT NULL DEFAULT 'pending', "tracking_number" character varying(255), "courier" character varying(50), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_909d792a7f7b751a851223dee9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_d1c3c02e67ffbc6695e36a626de" FOREIGN KEY ("sub_order_id") REFERENCES "sub_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_orders" ADD CONSTRAINT "FK_f6fdc0f65057389bcdb58575b9a" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sub_orders" DROP CONSTRAINT "FK_f6fdc0f65057389bcdb58575b9a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_d1c3c02e67ffbc6695e36a626de"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`DROP TABLE "sub_orders"`);
        await queryRunner.query(`DROP TYPE "public"."sub_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "return_requests"`);
        await queryRunner.query(`DROP TYPE "public"."return_requests_status_enum"`);
    }

}
