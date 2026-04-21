import app from "./app";
import { AppDataSource } from "./config/database";
import "./config/redis"; // initialises and connects the Redis singleton

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected successfully");
    // This starts the server and keeps the process alive
    const server = app.listen(PORT, () => {
      console.log(`🚀 BitStores API Server is LIVE on http://localhost:${PORT}`);
    });
    
    // Prevent process from exiting immediately
    server.on('error', (err) => console.error("Server Error:", err));
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  });
