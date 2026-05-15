// v2 ERC20 hero sub-counter totals.
//
// PREVIEW STUB — lives on the v2-hero-subcounters branch only. Returns
// illustrative numbers matching the design mockup so the in-page populator
// path (fetch → parse → DOM update → reveal container) is exercised
// end-to-end. The real backend will eventually replace this with totals
// derived from the v2 ERC20 discovery pipeline
// (data/research_notes/2026-05-05_v2_erc20_plan.md).
//
// Response shape (matching the ETH hero's claimed/total split):
//   { tokens: { wbtc: { claimed, total }, dai: {...}, usdc: {...}, usdt: {...} } }
//   - claimed: amount already withdrawn historically (raw token units)
//   - total:   claimable + claimed (the original peak / "ever forgotten")
// Display: `<claimed> / <total> TOKEN`, gold-on-token-color.

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  res.status(200).json({
    generated_at: new Date().toISOString(),
    source: 'preview-stub',
    tokens: {
      wbtc: { claimed: 1.5,    total: 33.9    },
      dai:  { claimed: 460000, total: 2300000 },
      usdc: { claimed: 580000, total: 2680000 },
      usdt: { claimed: 290000, total: 1530000 },
    },
  });
}
