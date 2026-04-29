import { AppDataSource } from "../data-source";

async function applyAuditMigration() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    // Add is_featured column to products
    await AppDataSource.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
    `);
    console.log("✅ Added is_featured column to products");

    // Create audit_logs table
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        user_id uuid,
        action character varying(100) NOT NULL,
        entity_type character varying(50) NOT NULL,
        entity_id uuid,
        details jsonb,
        ip_address character varying(45),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY (id)
      );
    `);
    console.log("✅ Created audit_logs table");

    // Add indexes
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_user_id" ON audit_logs (user_id);
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action" ON audit_logs (action);
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_entity_type" ON audit_logs (entity_type);
    `);
    console.log("✅ Added indexes to audit_logs");

    // Add foreign key
    await AppDataSource.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_audit_logs_user'
        ) THEN
          ALTER TABLE audit_logs 
          ADD CONSTRAINT "FK_audit_logs_user" 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log("✅ Added foreign key to audit_logs");

    console.log("\n🎉 Migration applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

applyAuditMigration();
