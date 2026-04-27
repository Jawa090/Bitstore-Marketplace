import { createClient } from "redis";

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

let redisConnected = false;

redisClient.on("connect", () => {
  console.log("🚀 Redis Connected");
  redisConnected = true;
});

redisClient.on("error", (err: Error) => {
  if (!redisConnected) {
    console.warn("⚠️ Redis not available - Token blacklisting disabled");
    redisConnected = false;
  }
});

// Connect with error handling - don't crash if Redis is unavailable
redisClient.connect().catch((err: Error) => {
  console.warn("⚠️ Redis not available - continuing without Redis");
});

// JWT Blacklisting Utility
export const blacklistToken = async (token: string, expiresAt: number): Promise<void> => {
  try {
    if (redisClient.isReady) {
      const ttl = expiresAt - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisClient.setEx(token, ttl, "blacklisted");
      }
    }
  } catch (error) {
    // Silent fail if Redis is down
  }
};

export default redisClient;
