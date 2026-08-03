import { headers } from 'next/headers';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired IP keys periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const ip in store) {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  }
}, 60000);

export async function checkRateLimit(
  actionName: string = 'default',
  limit: number = 10, // Max requests
  windowMs: number = 60000 // 1 minute window
): Promise<{ success: boolean; error?: string }> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    
    const key = `${actionName}:${ip}`;
    const now = Date.now();
    
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return { success: true };
    }

    if (store[key].count >= limit) {
      return {
        success: false,
        error: `Rate limit exceeded. Please wait ${Math.ceil((store[key].resetTime - now) / 1000)} seconds before trying again.`,
      };
    }

    store[key].count += 1;
    return { success: true };
  } catch (err) {
    // If headers() is unavailable or fails, fallback to allow
    return { success: true };
  }
}
