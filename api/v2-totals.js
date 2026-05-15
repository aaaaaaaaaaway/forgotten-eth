// v2 ERC20 hero sub-counter totals.
//
// Serves the per-token { claimed, total } produced by
// data/build_v2_totals.py and committed to data/v2_totals.json. The
// builder aggregates protocols.json entries with `payout_tokens` and
// the per-entry `token_balances` in balance files.
//
// Until the first non-ETH protocol declares payout_tokens, the file
// contains zeros and the hero row renders four "0 / 0 TOKEN" cells.
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

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  let payload;
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'v2_totals.json'), 'utf8');
    payload = JSON.parse(raw);
    if (!payload || !payload.tokens) payload = EMPTY;
  } catch {
    payload = EMPTY;
  }
  res.status(200).json(payload);
}
