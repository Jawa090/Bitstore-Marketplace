import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeToOrders1777049246492 implements MigrationInterface {
    name = 'AddStripeToOrders1777049246492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('unpaid', 'paid', 'failed')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'unpaid'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "stripe_payment_intent_id" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "stripe_payment_intent_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
    }

}
