import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

// Establish Redis connection
const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

redisClient.on("error", (err) => {
  console.error(
    "Redis connection failed. Ensure your Redis server is running or the REDIS_URL is correct.",
  );
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

// 1. Global Limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: "rl:global:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    res.status(429).json({
      success: false,
      message:
        "Too many requests from this IP, please try again after 15 minutes.",
    });
  },
});

// 2. Strict Auth Limiter: 10 requests per 1 hour
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: "rl:auth:",
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    res.status(429).json({
      success: false,
      message:
        "Too many login/reset attempts from this IP, please try again after an hour.",
    });
  },
});
