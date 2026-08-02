import Redis from 'ioredis';

let redis: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ex?: 'EX', ttl?: number) => Promise<'OK' | null>;
  del: (key: string) => Promise<number>;
  keys: (pattern: string) => Promise<string[]>;
};

const redisUrl = process.env.REDIS_URL;

if (redisUrl && redisUrl.startsWith('redis://')) {
  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true, // Don't block startup
      enableOfflineQueue: false,
    });

    client.on('error', (err) => {
      console.warn('⚠️ Redis connection error. Falling back to in-memory cache.', err.message);
    });

    redis = {
      async get(key) {
        try {
          return await client.get(key);
        } catch {
          return memoryCache.get(key) || null;
        }
      },
      async set(key, value, ex, ttl) {
        try {
          if (ex && ttl) {
            await client.set(key, value, ex, ttl);
          } else {
            await client.set(key, value);
          }
          return 'OK';
        } catch {
          memoryCache.set(key, value, ttl);
          return 'OK';
        }
      },
      async del(key) {
        try {
          return await client.del(key);
        } catch {
          return memoryCache.delete(key) ? 1 : 0;
        }
      },
      async keys(pattern) {
        try {
          return await client.keys(pattern);
        } catch {
          return memoryCache.keys(pattern);
        }
      }
    };
  } catch (e) {
    console.warn('⚠️ Failed to initialize Redis. Using in-memory fallback.');
    redis = createMemoryCache();
  }
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ REDIS_URL not configured. Using in-memory fallback cache.');
  }
  redis = createMemoryCache();
}

// Simple in-memory fallback implementation
const cacheStore = new Map<string, { value: string; expiry: number | null }>();

const memoryCache = {
  get(key: string): string | null {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      cacheStore.delete(key);
      return null;
    }
    return item.value;
  },
  set(key: string, value: string, ttlSeconds?: number) {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    cacheStore.set(key, { value, expiry });
  },
  delete(key: string): boolean {
    return cacheStore.delete(key);
  },
  keys(pattern: string): string[] {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const result: string[] = [];
    const now = Date.now();
    for (const [key, item] of cacheStore.entries()) {
      if (item.expiry && item.expiry < now) {
        cacheStore.delete(key);
      } else if (regexPattern.test(key)) {
        result.push(key);
      }
    }
    return result;
  }
};

function createMemoryCache() {
  return {
    async get(key: string) {
      return memoryCache.get(key);
    },
    async set(key: string, value: string, ex?: 'EX', ttl?: number) {
      memoryCache.set(key, value, ttl);
      return 'OK' as const;
    },
    async del(key: string) {
      return memoryCache.delete(key) ? 1 : 0;
    },
    async keys(pattern: string) {
      return memoryCache.keys(pattern);
    }
  };
}

export default redis;
