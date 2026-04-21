import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err: Error) => {
  console.error("❌ Redis connection error:", err.message);
});

// Connect immediately so the singleton is ready before any request arrives.
redisClient.connect().catch((err: Error) => {
  console.error("❌ Redis failed to connect on startup:", err.message);
});

export default redisClient;
