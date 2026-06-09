# DutchX dx_3 — Withdrawal Guide

**Contract**: `0xaf1745c0f8117384dfa5fff40f824057c70f2ed3`  
**Balance file**: `dx_3_eth_balances.json`  
**Same ABI as dx_2** (`0xb9812e2fa995ec53b5b6df34d21f9304762c5497`) — identical master copy

## Token addresses

| Token | Address |
|---|---|
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| SAI (old DAI) | `0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359` |

---

## Key difference from dx_2

In dx_2 all positions pay out WETH. In dx_3, **positions can pay out either WETH or SAI** depending on which side of the auction the user was on. Each position object carries `received_token` and `received_symbol` — use those to determine which token to withdraw after claiming.

---

## Balance file schema

Same top-level structure as `dx_2_eth_balances.json` with two coverage figures instead of one: `coverage_pct_weth` and `coverage_pct_sai`.

**Per-address fields:**

| Field | Type | Meaning |
|---|---|---|
| `address` | string | Depositor (lowercase) |
| `balance_eth` | float | Total claimable WETH (weth_direct + sum of WETH position `w` values) |
| `balance_wei` | string | `balance_eth` in wei |
| `weth_direct` | float | L1 direct WETH only — withdraw immediately without a prior claim step |
| `weth_direct_wei` | string | `weth_direct` in wei |
| `sai_balance` | float | **Total** claimable SAI (sai_direct + sum of SAI position `w` values) |
| `sai_balance_wei` | string | `sai_balance` in wei |
| `sai_direct` | float | L1 direct SAI only — withdraw immediately without a prior claim step |
| `sai_direct_wei` | string | `sai_direct` in wei |
| `positions` | array | Unclaimed positions — require a claim step before withdraw; includes WETH and SAI payouts |

**Position object fields:**

| Field | Type | Meaning |
|---|---|---|
| `t` | string | `"seller"` or `"buyer"` |
| `st` | string | sellToken address |
| `bt` | string | buyToken address |
| `ai` | integer | auctionIndex |
| `received_token` | string | Token address credited after the claim step |
| `received_symbol` | string | Symbol of the received token (`"WETH"`, `"SAI"`, `"GEN"`, `"OMG"`, etc.) |
| `w` | float | Claimable amount (in the received token's units, not wei) |
| `w_wei` | string | `w` truncated to 5 dp then converted to wei — use for the withdraw call |

---

## Contract ABIs

```
function withdraw(address token, uint256 amount)
function claimSellerFunds(address sellToken, address buyToken, address user, uint256 auctionIndex) returns (uint256, uint256)
function claimBuyerFunds(address sellToken, address buyToken, address user, uint256 auctionIndex) returns (uint256, uint256)
```

`claimXxxFunds` can be called by anyone on behalf of the user. `withdraw` must be called by the user.

---

## Withdrawal flows by case

### Case 1 — WETH direct only
```
withdraw(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, weth_direct_wei)
```

### Case 2 — SAI direct only
```
withdraw(0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359, sai_balance_wei)
```

### Case 3 — Positions only
For each entry in `positions[]`:

```
// Step 1 — anyone can call:
if pos.t == "seller":
    claimSellerFunds(pos.st, pos.bt, user_address, pos.ai)
if pos.t == "buyer":
    claimBuyerFunds(pos.st, pos.bt, user_address, pos.ai)

// Step 2 — user calls, using pos.received_token:
withdraw(pos.received_token, pos.w_wei)
```

Unlike dx_2, do NOT assume the received token is always WETH — check `pos.received_token`.

After all positions are claimed, the credited amounts can be swept in one call per token:
```
withdraw(WETH_ADDRESS, total_weth_from_positions_wei)
withdraw(SAI_ADDRESS,  total_sai_from_positions_wei)
```

### Case 4 — WETH direct + positions
Claim all positions first (Case 3 Step 1). Then withdraw full WETH balance in one call:
```
withdraw(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, balance_wei)
```
`balance_wei` includes both direct WETH and WETH from positions.
For SAI, withdraw separately as in Case 2 (SAI direct) or accumulate from position claims.

### Case 5 — Any combination with SAI
Handle WETH as above. For the SAI portion:
```
withdraw(0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359, sai_balance_wei)
```
`sai_balance_wei` covers the full claimable SAI amount (both direct and from positions). If displaying a breakdown, show `sai_direct` as the portion available without a prior claim step.

---

## Unattributable gap

Contract holds 70.968 WETH and 18,542 SAI. This file attributes 47.97 WETH (~67.6%) and 16,103 SAI (~86.8%). The gap (~23 WETH, ~2,439 SAI) was extensively investigated:
- All 147 unique depositors identified and confirmed
- Balance recheck (single-threaded) returned 0 new entries
- Stuck positions, extraTokens, and addTokenPair callers all verified as non-causes
- Most likely cause: silent 429 failures during the multi-threaded position scan; gap is quantity not identity
- Amounts here are a floor. See `contribute/dutchx/dutchx_2/RESEARCH_SUMMARY.md` for full gap analysis.
