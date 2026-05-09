import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import { requireNonProduction } from './_security.js';

let MULTI_ITEM_PROTOCOLS = [];
try {
  const cfg = JSON.parse(readFileSync(join(process.cwd(), 'data', 'withdrawal_events.json'), 'utf8'));
  MULTI_ITEM_PROTOCOLS = Array.isArray(cfg.multi_item_protocols) ? cfg.multi_item_protocols : [];
} catch {}

export default async function handler(req, res) {
  if (!requireNonProduction(res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  try {
    const result = await sql`
      WITH raw_events AS (
        SELECT id, LOWER(address) AS address, contract, amount_eth, tx_hash, log_index, ts AS claim_ts
        FROM events
        WHERE type = 'claim_confirmed'
          AND contract != 'donation'
          AND amount_eth > 0
          AND NOT (contract = ANY(${MULTI_ITEM_PROTOCOLS}::text[]))
      ),
      from_events AS (
        SELECT address, amount_eth, claim_ts
        FROM (
          SELECT DISTINCT ON (contract, address, tx_hash, amount_eth)
                 address, amount_eth, claim_ts
          FROM raw_events
          WHERE tx_hash IS NOT NULL
          ORDER BY contract, address, tx_hash, amount_eth, (log_index IS NULL), id
        ) deduped_tx_events
        UNION ALL
        SELECT address, amount_eth, claim_ts
        FROM raw_events
        WHERE tx_hash IS NULL
      ),
      from_ca AS (
        SELECT LOWER(address) AS address, amount_eth, claimed_at AS claim_ts
        FROM claimed_addresses
        WHERE protocol = ANY(${MULTI_ITEM_PROTOCOLS}::text[])
          AND amount_eth IS NOT NULL
          AND amount_eth > 0
      ),
      combined AS (
        SELECT * FROM from_events
        UNION ALL
        SELECT * FROM from_ca
      ),
      daily AS (
        SELECT
          DATE_TRUNC('day', claim_ts)::date AS day,
          COUNT(*)::int AS claim_rows,
          COUNT(DISTINCT address)::int AS claimants,
          COALESCE(SUM(amount_eth), 0)::float8 AS eth_claimed
        FROM combined
        GROUP BY 1
      )
      SELECT
        day::text AS day,
        claim_rows,
        claimants,
        eth_claimed,
        SUM(eth_claimed) OVER (ORDER BY day)::float8 AS cumulative_eth
      FROM daily
      ORDER BY day ASC
    `;

    const days = result.rows.map((row) => ({
      day: row.day,
      claim_rows: Number(row.claim_rows || 0),
      claimants: Number(row.claimants || 0),
      eth_claimed: Number(row.eth_claimed || 0),
      cumulative_eth: Number(row.cumulative_eth || 0),
    }));
    const last = days[days.length - 1] || null;
    const summary = {
      days: days.length,
      first_day: days[0]?.day || null,
      last_day: last?.day || null,
      total_claimants_by_day: days.reduce((sum, row) => sum + row.claimants, 0),
      total_claim_rows: days.reduce((sum, row) => sum + row.claim_rows, 0),
      cumulative_eth: last ? last.cumulative_eth : 0,
    };

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).json({ summary, days });
  } catch (e) {
    console.error('Claim chart query failed:', e.message);
    return res.status(500).json({ error: 'Claim chart data unavailable' });
  }
}
