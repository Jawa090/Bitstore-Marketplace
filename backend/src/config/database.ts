import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Load .env before anything else
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",

  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "bitstores",

  // ⚠️ NEVER set to true in production — use migrations instead
  synchronize: false,

  // Show SQL queries in dev for debugging
  logging: process.env.NODE_ENV === "development",

  // Entity & migration discovery paths
  entities: [__dirname + "/../entities/**/*.{ts,js}"],
  migrations: [__dirname + "/../migrations/**/*.{ts,js}"],
  subscribers: [__dirname + "/../subscribers/**/*.{ts,js}"],
});
