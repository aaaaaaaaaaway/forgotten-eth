// POST /api/eligible-recognition-seen
// Body: { address: "0x..." }
// Effect: writes a 'recognition_seen' event to the events table.
// The cross-ref cron drains these events on its next run, removing the
// matching entry from data/eligible_checkers/recognition.json.
//
// Public endpoint. Rate-limited via the existing _ratelimit pattern.

import { sql } from '@vercel/postgres';
import { rateLimit } from './_ratelimit.js';
import { getClientIP, requireCloudflare, requireNonProduction } from './_security.js';

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

export default async function handler(req, res) {
  function errResp(code, body) {
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(code).json(body);
  }

  // CORS — public endpoint policy from CLAUDE.md
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return errResp(405, { error: 'POST only' });
  }

  // Disabled by default until this state-changing write is bound to a caller
  // proof/session. This must also stay closed on Vercel previews/staging:
  // those environments may share production Postgres credentials, and a
  // preview bypass would still allow arbitrary third-party address suppression.
  // Enable only for explicit local/dev testing with RECOGNITION_SEEN_WRITES=1.
  if (process.env.RECOGNITION_SEEN_WRITES !== '1' || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development')) {
    return errResp(404, { error: 'Not found' });
  }
  if (!requireNonProduction(res)) return;

  if (!requireCloudflare(req, res)) return;

  const ip = getClientIP(req);
  const allowed = await rateLimit(ip, 'recognition_seen', 30, 60);
  if (!allowed) {
    return errResp(429, { error: 'rate limited' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return errResp(400, { error: 'invalid body' });
  }
  const address = body.address;
  if (!address || typeof address !== 'string' || !ADDR_RE.test(address)) {
    return errResp(400, { error: 'invalid address' });
  }

  try {
    await sql`
      INSERT INTO events (type, address, extra)
      VALUES ('recognition_seen', ${address.toLowerCase()}, ${JSON.stringify({})}::jsonb)
    `;
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('eligible-recognition-seen:', e.message);
    return errResp(500, { error: 'internal error' });
  }
}
