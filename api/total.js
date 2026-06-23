import { readFileSync } from 'fs';
import { join } from 'path';
import { sql } from '@vercel/postgres';
import { rateLimit } from './_ratelimit.js';
import { requireCloudflare, getClientIP } from './_security.js';

let fileData = null;
let fileDataExpiry = 0;
let multiItemProtocols = null;
let claimsCache = null;
let claimsCacheExpiry = 0;

function loadMultiItemProtocols() {
  if (multiItemProtocols) return multiItemProtocols;
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'withdrawal_events.json'), 'utf8');
    const parsed = JSON.parse(raw);
    multiItemProtocols = (parsed.multi_item_protocols || [])
      .filter((key) => /^[a-z0-9_]+$/.test(key));
  } catch {
    multiItemProtocols = [];
  }
  return multiItemProtocols;
}

export default async function handler(req, res) {
  function errResp(code, body) {
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(code).json(body);
  }

  if (req.method !== 'GET') {
    return errResp(405, { error: 'Method not allowed' });
  }

  if (!requireCloudflare(req, res)) return;

  const ip = getClientIP(req) || 'unknown';
  const allowed = await rateLimit(ip, 'total', 300, 60);
  if (!allowed) {
    return errResp(429, { error: 'Rate limit exceeded. Try again in 1 minute.' });
  }

  const ts = Date.now();
  if (!fileData || ts > fileDataExpiry) {
    try {
      const raw = readFileSync(join(process.cwd(), 'data', 'total.json'), 'utf8');
      fileData = JSON.parse(raw);
      fileDataExpiry = ts + 300000; // re-read every 5 min
    } catch (e) {
      if (!fileData) return errResp(500, { error: 'Total data not available' });
    }
  }

  // Live claims from DB (cached 5 min, falls back to static file data).
  // Keep this query in sync with data/build_index.py: single-item protocols
  // come from deduped events, while multi-item protocols come from
  // claimed_addresses so per-item histories are counted without double-counting
  // webhook/summary events. We still take max(file, live) so transient DB
  // failures or event retention cannot make the public counter decrease.
  const now = Date.now();
  if (!claimsCache || now > claimsCacheExpiry) {
    const fileEth = parseFloat(fileData.eth_claimed || 0);
    const fileWallets = parseInt(fileData.unique_claimers || 0, 10);
    try {
      const multi = loadMultiItemProtocols();
      const result = await sql`
        WITH raw_events AS (
          SELECT id, LOWER(address) AS address, contract, amount_eth, tx_hash, log_index
          FROM events
          WHERE type = 'claim_confirmed'
            AND contract != 'donation'
            AND amount_eth > 0
            AND NOT (contract = ANY(${multi}))
        ),
        from_events AS (
          SELECT address, amount_eth
          FROM (
            SELECT DISTINCT ON (contract, address, tx_hash, amount_eth)
                   address, amount_eth
            FROM raw_events
            WHERE tx_hash IS NOT NULL
            ORDER BY contract, address, tx_hash, amount_eth, (log_index IS NULL), id
          ) deduped_tx_events
          UNION ALL
          SELECT address, amount_eth
          FROM raw_events
          WHERE tx_hash IS NULL
        ),
        from_ca AS (
          SELECT LOWER(address) AS address, amount_eth
          FROM claimed_addresses
          WHERE protocol = ANY(${multi})
            AND amount_eth IS NOT NULL
            AND amount_eth > 0
        ),
        combined AS (
          SELECT * FROM from_events UNION ALL SELECT * FROM from_ca
        )
        SELECT COALESCE(SUM(amount_eth), 0) AS eth, COUNT(DISTINCT address) AS wallets
        FROM combined
      `;
      const siteEth = parseFloat(parseFloat(result.rows[0].eth).toFixed(2));
      const siteWallets = parseInt(result.rows[0].wallets, 10);
      // Add detected onchain withdrawals (not done through the site)
      const detectedEth = parseFloat(fileData.detected_eth || 0);
      const detectedWallets = parseInt(fileData.detected_wallets || 0, 10);
      const liveEth = parseFloat((siteEth + detectedEth).toFixed(2));
      const liveWallets = siteWallets + detectedWallets;
      claimsCache = {
        eth_claimed: Math.max(fileEth, liveEth),
        unique_claimers: Math.max(fileWallets, liveWallets),
      };
      claimsCacheExpiry = now + 300000; // 5 min
    } catch {
      // DB unavailable — use static file values
      claimsCache = {
        eth_claimed: fileEth,
        unique_claimers: fileWallets,
      };
      claimsCacheExpiry = now + 60000; // retry in 1 min
    }
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({
    ...fileData,
    eth_claimed: claimsCache.eth_claimed,
    unique_claimers: claimsCache.unique_claimers,
  });
}
