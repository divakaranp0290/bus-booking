// backend/src/utils/redis.ts
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

// Redis key for a seat
export function seatKey(busId: string, seatNo: string) {
  return `seat:${busId}:${seatNo}`;
}

// Acquire lock: returns token & key on success, otherwise null
export async function acquireSeatLock(busId: string, seatNo: string, ttlMs = 10 * 60 * 1000) {
  const key = seatKey(busId, seatNo);
  const token = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  // SET key token PX ttl NX => atomic set-if-not-exists with ttl
  const res = await redis.set(key, token, 'PX', ttlMs, 'NX');
  if (res === 'OK') return { key, token };
  return null;
}

// Safe release using Lua script (delete only if token matches)
const RELEASE_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export async function releaseSeatLock(key: string, token: string) {
  if (!key || !token) return false;
  const res = await redis.eval(RELEASE_LUA, 1, key, token);
  return res === 1;
}

export async function extendSeatLock(key: string, token: string, ttlMs = 5 * 60 * 1000) {
  // extend by re-setting only if token matches (simple approach)
  const current = await redis.get(key);
  if (current !== token) return false;
  await redis.pexpire(key, ttlMs);
  return true;
}

export default redis;
