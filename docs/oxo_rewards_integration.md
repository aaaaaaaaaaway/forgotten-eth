# 0x0 Rewards — local integration, September 7, 2026

Contract: `0x02b15c47b4b516a22fd2d8b1fc662afb808a2169`.
Key: `oxo_rewards`; name: **0x0 Rewards**; URL: `/oxo-rewards`.
The user explicitly approved integrating the working recipients after reviewing
the failed full-address gate. No push, deployment, production notification,
database write or watcher restart was performed.

## Verified scope

| Measure | Result |
| --- | --- |
| Complete preserved Merkle allocations | 72,512 |
| Originally positive remainders | 70,829 |
| Enabled recipients | 70,697 |
| Excluded recipients | 38 rejected payouts + 94 forwarding/sweeping recipients |
| Enabled remaining ETH | 736.140446025808501780 |
| Pool at approved-cohort verification | 736.586419732545515225 ETH |
| Pool after all enabled withdrawals | 0.445973706737013445 ETH |
| Independent Anvil claims | 70,697 passed; 0 failed |
| Cumulative Anvil withdrawals | 70,697 passed; 0 failed |

The second exhaustive run forked local reth at block **25926759**, hash
`0x7edac2c7f34fde8f36a58f2ab7ded2190201b33357971174a50aecb4b51f1868`.
No pool top-ups, storage overrides or code overrides were used. Zero gas prices
isolate gross payout. Anvil impersonation proves recipient execution behavior,
not ownership or an initiation path for arbitrary contract wallets. The enabled
cohort contains 63,484 EOAs, 6,932 EIP-7702 accounts and 281 other contracts.

Evidence: [full-address analysis](../data/oxo_rewards/anvil_verification.md),
[approved-cohort run](../data/oxo_rewards/anvil_working_withdrawals_2026-09-07.json),
[source review](../data/source_reviews/0x02b15c47b4b516a22fd2d8b1fc662afb808a2169/review.md).

The full outstanding allocation set exceeds the pool by
**0.137151375422533301 ETH**. The enabled subset is covered at the verification
block; that does not reserve its backing against other claims or owner actions.

## Data and claim safety

- `tree.json` preserves every allocation, including claimed and excluded
  recipients. Root: `0x6e51b2ba4112ae32212e472680230c1d7318995132944cfa673046160865e9dd`.
  The two source corrections are documented and cryptographically checked by
  reproducing the entire root. No dashboard JavaScript is executed.
- `cohort.json` freezes the approved set and each original maximum remainder;
  it also records all 132 exclusions. No automatic adoption of another root.
- The canonical refresh reads all claim counters and eligibility via local
  Multicall, writes through `_balance_writer`, retains claimed rows, and aborts
  on root changes, counter rollback, incomplete RPC data or insufficient backing.
- Canonical balances and shards preserve exact **remaining** wei separately
  from the cumulative allocation. Proofs are derived from the preserved layers
  by `/api/oxo-rewards`, avoiding duplication in every balance/index entry.
- Before signing: approved-recipient gate, current root, chain, claiming flag,
  eligibility, remaining amount, pool funding, exact direct payout and recipient
  net-value trace. The browser verifies the proof and rechecks contract state.
  Simulation cannot eliminate changes between checking and mining.
- After mining: receipt **and** trace must establish exact ETH delivery. The
  contract can consume the allocation and emit `Claim` despite payment failure.
  Token swaps emit the same event and are not counted as native ETH recovery.
- The watcher uses the dedicated payout-aware parser. Generic log parsers and
  receipt-only telemetry cannot credit this protocol. Partial claims do not hide
  future remainders in `/api/check`; canonical reconciliation uses the custom
  refresh instead of float-based surgical subtraction.
- `multi_step: true` selects the project's dedicated-verifier dispatch lane;
  an ordinary `claimEth` is still a single onchain transaction.

## Completed local integration checks

- Canonical balances, registry, protocol metadata, frontend claim card, exact-wei
  index, custom refresh scheduler/output validation, and watcher configuration.
- Monthly native TVL: **129 points**, each independently rechecked against local
  archive balances. Sampled peak: **788.0859 ETH**. Deployment verified from its
  receipt: block 17859175, August 6, 2023.
- Activity: **18,043 log-emitting transactions across 38 active months**, with
  zero chunk errors. This is activity, not a count of successful ETH recoveries.
- Offline Python tests: complete tree proof verification, exact cohort selection,
  every approved shard, all exclusions, pool reconciliation, refresh guards.
- JavaScript regressions: exact amounts, root/counter/eligibility/funding changes,
  rejected and forwarding payouts, partial claims, token-path rejection, mined
  Anvil receipt/trace fixtures, API validation and no-store errors.
- Real Chrome: desktop/mobile protocol rendering, populated TVL/activity charts,
  changelog/RSS, exact-wei claim card, unavailable-verifier safe retry, excluded
  recipient hidden, no uncaught page errors. Network/DB telemetry was disabled.
- Final protocol validator: **3,051 passed, zero errors**. One unrelated coverage
  warning remains: `quantfury_qdt`. An earlier `metadrop_webaverse` warning cleared
  during the concurrent existing refresh work; unrelated edits were preserved.
- Watcher audit: all **293 protocols** resolve to tracked addresses. No service
  restart was performed. Orchestrator dry-run selects the custom refresh and
  exhaustive working-cohort test correctly.
- The [homepage changelog preview](../public/index.html),
  [web changelog](../public/changelog.html) and
  [Markdown changelog](../CHANGELOG.md) updated. Live at
  [changelog](https://forgotteneth.com/changelog) and
  [0x0 protocol page](https://forgotteneth.com/oxo-rewards).

Browser screenshots from this run are under `/tmp/oxo-rewards-preview/`:
`protocol-desktop.png`, `protocol-mobile.png`, `claim-card.png`,
`changelog-desktop.png`, `changelog-mobile.png`.

## Deployment gate — not yet configured or deployed

Set **`OXO_RPC_URL` to a trace-capable read-only Ethereum mainnet endpoint** in
the deployed environment. It must support `debug_traceCall` and
`debug_traceTransaction` with `callTracer`, plus ordinary state/receipt reads.
Local dev defaults to `http://127.0.0.1:8545`. Production and preview builds
fail closed if this variable is absent. Never expose an unrestricted local
node just to satisfy this requirement.

The free Publicnode endpoint was tested: `debug_traceCall` is unavailable and
`trace_call` requires its archive access token. No paid fallback is selected or
used. Choosing/configuring a remote provider or exposing local infrastructure
requires a separate operator decision. The integration is **not deploy-ready**
until this read-only endpoint is configured and its preflight/receipt paths pass.

After the user authorizes deployment: verify that endpoint, deploy, verify the
deployed protocol/API assets, then restart `feth-webhook-watcher.service`.
Never restart first: the old deployed receiver would discard unknown claims.
Production re-engagement/notifications remain deferred to that authorized release.

## Reproduce locally

```bash
.venv/bin/python data/refresh_oxo_rewards.py --dry-run
.venv/bin/python data/refresh_oxo_rewards.py
.venv/bin/python data/test_oxo_rewards_withdrawals.py --working-only \
  --audit data/.scan_state/oxo_rewards_latest_audit.json \
  --output /tmp/oxo-working-new-report.json
.venv/bin/python -m unittest discover -s data -p test_oxo_rewards.py
node data/test_oxo_rewards.mjs
node data/test_oxo_rewards_render.mjs
python3 data/validate_protocols.py
python3 data/webhook_watcher.py --audit
```

Browser tests use the existing `puppeteer-core` and local Chrome, plus temporary
copies of the exact pinned ethers 6.13.5 and Chart.js 4.4.7 CDN assets at
`/tmp/oxo-test-ethers-6.13.5.js` and `/tmp/oxo-test-chart-4.4.7.js`.
Withdrawal report paths must be new; limited fixture runs intentionally do not
return a full-suite acceptance pass. Do not run the full add-protocol orchestrator
outside dry-run merely to repeat these checks: its final step sends notifications.
