import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { seedSampleData } from "./seed-data";

async function runSeed() {
  try {
    console.log("🔌 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    await seedSampleData();
    
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();