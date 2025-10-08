const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client is ready');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client connection ended');
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    logger.warn('⚠️  Server will start without Redis. Caching will be disabled.');
    redisClient = null;
    return false;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client not available');
    return null;
  }
  return redisClient;
};

const setCache = async (key, value, ttl = 3600) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error:', error);
    return false;
  }
};

const clearCache = async (pattern = '*') => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis clear error:', error);
    return false;
  }
};

const cacheExists = async (key) => {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Redis exists error:', error);
    return false;
  }
};

const getCacheStats = async () => {
  try {
    const client = getRedisClient();
    const info = await client.info('memory');
    const keys = await client.keys('*');
    
    return {
      connected: client.isReady,
      memoryUsage: info,
      keyCount: keys.length,
      sampleKeys: keys.slice(0, 10)
    };
  } catch (error) {
    logger.error('Redis stats error:', error);
    return { error: error.message };
  }
};

const closeRedisConnection = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  cacheExists,
  getCacheStats,
  closeRedisConnection
};