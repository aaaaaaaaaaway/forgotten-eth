// v2 ERC20 hero sub-counter totals.
//
// Serves the per-token { claimed, total } produced by
// data/build_v2_totals.py and committed to data/v2_totals.json. The
// builder aggregates tracked hero-token balances from balance files:
// token_balances, Euler-style merkle_tokens, and Nomad-style nft_details.
// Peak-based protocols can declare `peak_token_amounts` in protocols.json.
//
// Response shape: { tokens: { wbtc:{...}, dai:{...}, usdc:{...}, usdt:{...} } }

import { readFileSync } from 'fs';
import { join } from 'path';

const EMPTY = {
  generated_at: null,
  source: 'fallback-empty',
  tokens: {
    wbtc: { claimed: 0, total: 0 },
    dai:  { claimed: 0, total: 0 },
    usdc: { claimed: 0, total: 0 },
    usdt: { claimed: 0, total: 0 },
  },
};

function normalisePayload(payload) {
  if (!payload || !payload.tokens) return EMPTY;
  const tokens = {};
  for (const key of ['wbtc', 'dai', 'usdc', 'usdt']) {
    const row = payload.tokens[key] || {};
    let total = Number(row.total) || 0;
    let claimed = Number(row.claimed) || 0;
    if (total < 0) total = 0;
    if (claimed < 0) claimed = 0;
    if (claimed > total) claimed = total;
    tokens[key] = { claimed, total };
  }
  return { ...payload, tokens };
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  let payload;
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'v2_totals.json'), 'utf8');
    payload = JSON.parse(raw);
    payload = normalisePayload(payload);
  } catch {
    payload = EMPTY;
  }
  res.status(200).json(payload);
}
