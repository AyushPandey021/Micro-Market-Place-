import Redis from "ioredis";

const redis = process.env.NODE_ENV === 'test'
    ? {
        status: 'ready',
        get: async () => null,
        set: async () => null,
    }
    : new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
        connectTimeout: 10000,
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        }
    });

if (process.env.NODE_ENV !== 'test') {
    redis.on("connect", () => {
        console.log("Connected to Redis");
    });
    redis.on("error", (err) => {
        console.error("Redis connection error:", err);
    });
}

export default redis;