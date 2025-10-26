// Simple in-memory rate limiter (per key) for dev/staging.
// Not for production at scale. Replace with a durable store if needed.

const buckets = new Map();

export function rateLimit({ windowMs = 60000, max = 60 } = {}) {
  return (key) => {
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, reset: now + windowMs };
    if (now > bucket.reset) {
      bucket.count = 0;
      bucket.reset = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    const remaining = Math.max(0, max - bucket.count);
    const limited = bucket.count > max;
    return { limited, remaining, reset: bucket.reset };
  };
}
