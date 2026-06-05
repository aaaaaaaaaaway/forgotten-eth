import { db, sql } from '@vercel/postgres';
import { createHash } from 'crypto';

// Postgres-backed rate limiting for Vercel serverless.
// Check BEFORE insert to prevent table flooding from blocked requests.
// Global circuit breaker caps total requests across all IPs.

const GLOBAL_LIMIT_PER_MIN = 3000; // max total requests/min across all IPs, all endpoints

function hashIP(ip) {
  const salt = process.env.IP_HASH_SALT || process.env.ANALYTICS_SECRET || 'rl';
  return createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
}

// In-memory fallback when Postgres is unavailable
const memCache = new Map();

function memoryRateLimit(ip, endpoint, limit, windowSeconds) {
  const key = ip + ':' + endpoint;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // In-memory fallback: no global circuit breaker (only per-IP)
  // The Postgres path has the global breaker; this is a lenient fallback

  if (memCache.size > 1000) {
    for (const [k, v] of memCache) {
      if (now - v.start > windowMs) memCache.delete(k);
    }
  }

  const entry = memCache.get(key);
  if (!entry || now - entry.start > windowMs) {
    memCache.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

let tableCreated = false;
let lastPruneAt = 0;

async function ensureTable() {
  if (tableCreated) return;
  await sql`CREATE TABLE IF NOT EXISTS rate_limit_buckets (
    ip TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (ip, endpoint, window_start)
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_window ON rate_limit_buckets(window_start)`.catch(() => {});
  tableCreated = true;
}

/**
 * Check and record a request. Returns true if allowed, false if over limit.
 * Check-before-insert: blocked requests do NOT insert rows (prevents table flooding).
 */
export async function rateLimit(ip, endpoint, limit, windowSeconds) {
  // Skip rate limiting on localhost/LAN
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || ip?.startsWith('192.168.') || ip?.startsWith('10.')) return true;
  try {
    await ensureTable();

    const hashedIP = hashIP(ip);

    // Best-effort bounded retention. Run before counting, but at most once
    // per warm container minute, so the limiter does not depend on a separate
    // health endpoint or cron to keep the table from growing indefinitely.
    const now = Date.now();
    if (now - lastPruneAt > 60_000) {
      lastPruneAt = now;
      await sql`DELETE FROM rate_limit_buckets WHERE window_start < NOW() - INTERVAL '10 minutes'`.catch(() => {});
    }

    // Fixed-window counters under an explicit transaction and advisory lock.
    // The separate lock/count/upsert statements avoid both old failure modes:
    // (1) blocked requests do not insert local rows after either limit is full;
    // (2) concurrent requests cannot all observe stale under-limit counts.
    const client = await db.connect();
    try {
      await client.sql`BEGIN`;
      await client.sql`SELECT pg_advisory_xact_lock(4399001202500605::bigint)`;
      const { rows } = await client.sql`
        WITH windows AS (
          SELECT
            to_timestamp(floor(extract(epoch from NOW()) / ${windowSeconds}) * ${windowSeconds}) AS local_window,
            to_timestamp(floor(extract(epoch from NOW()) / 60) * 60) AS global_window
        )
        SELECT
          COALESCE((SELECT count FROM rate_limit_buckets, windows
            WHERE ip = ${hashedIP} AND endpoint = ${endpoint} AND window_start = local_window), 0) AS local_cnt,
          COALESCE((SELECT count FROM rate_limit_buckets, windows
            WHERE ip = '__global__' AND endpoint = '__global__' AND window_start = global_window), 0) AS global_cnt,
          local_window,
          global_window
        FROM windows
      `;
      const row = rows[0];
      const localCount = Number(row?.local_cnt ?? 0);
      const globalCount = Number(row?.global_cnt ?? 0);
      if (localCount >= limit || globalCount >= GLOBAL_LIMIT_PER_MIN) {
        await client.sql`ROLLBACK`;
        return false;
      }
      await client.sql`
        INSERT INTO rate_limit_buckets (ip, endpoint, window_start, count)
        VALUES (${hashedIP}, ${endpoint}, ${row.local_window}, 1)
        ON CONFLICT (ip, endpoint, window_start) DO UPDATE
          SET count = rate_limit_buckets.count + 1
      `;
      await client.sql`
        INSERT INTO rate_limit_buckets (ip, endpoint, window_start, count)
        VALUES ('__global__', '__global__', ${row.global_window}, 1)
        ON CONFLICT (ip, endpoint, window_start) DO UPDATE
          SET count = rate_limit_buckets.count + 1
      `;
      await client.sql`COMMIT`;
      return true;
    } catch (e) {
      await client.sql`ROLLBACK`.catch(() => {});
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('Rate limit DB failed, using in-memory fallback:', e.message);
    return memoryRateLimit(ip, endpoint, limit, windowSeconds);
  }
}
