# DutchX dx_2 — Withdrawal Guide

**Contract**: `0xb9812e2fa995ec53b5b6df34d21f9304762c5497`  
**Balance file**: `dx_2_eth_balances.json`  
**Same contract ABI applies to dx_3** (`0xaf1745c0f8117384dfa5fff40f824057c70f2ed3`)

## Token addresses

| Token | Address |
|---|---|
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| SAI (old DAI) | `0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359` |

---

## Balance file schema

Top-level fields describe the contract. Each object in `balances[]` represents one depositor address.

**Per-address fields:**

| Field | Type | Meaning |
|---|---|---|
| `address` | string | Depositor (lowercase) |
| `balance_eth` | float | Total claimable WETH (weth_direct + sum of position `w` values) |
| `balance_wei` | string | `balance_eth` in wei |
| `weth_direct` | float | L1 direct WETH balance — withdraw immediately, no prior step needed |
| `weth_direct_wei` | string | `weth_direct` in wei — use this for the contract call |
| `sai_balance` | float | Total claimable SAI — in dx_2 all SAI is L1 direct so this equals the direct balance; withdraw immediately |
| `sai_balance_wei` | string | `sai_balance` in wei — use this for the contract call |
| `positions` | array | Unclaimed auction positions — require a claim step before withdraw |

**Position object fields:**

| Field | Type | Meaning |
|---|---|---|
| `t` | string | `"seller"` or `"buyer"` — determines which claim function to call |
| `st` | string | sellToken address |
| `bt` | string | buyToken address |
| `ai` | integer | auctionIndex |
| `w` | float | Claimable WETH amount (ETH, not wei) |
| `w_wei` | string | `w` converted to wei (truncated to 5 dp before conversion — keeps call below on-chain balance) |

All positions in this dataset result in **WETH** being credited to the user's internal balance after claiming.

---

## Contract ABIs

```
function withdraw(address token, uint256 amount)
function claimSellerFunds(address sellToken, address buyToken, address user, uint256 auctionIndex) returns (uint256, uint256)
function claimBuyerFunds(address sellToken, address buyToken, address user, uint256 auctionIndex) returns (uint256, uint256)
```

The `claimXxxFunds` functions can be called by **anyone** on behalf of the user. `withdraw` must be called by the user themselves.

---

## Withdrawal flows by case

### Case 1 — WETH direct balance only
Condition: has `weth_direct`, no `positions`, no `sai_balance`

Single transaction, user calls:
```
withdraw(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, weth_direct_wei)
```

### Case 2 — SAI direct balance only
Condition: has `sai_balance`, no `weth_direct`, no `positions`

Single transaction, user calls:
```
withdraw(0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359, sai_balance_wei)
```

### Case 3 — WETH positions only (no direct balance)
Condition: has `positions`, no `weth_direct`

Two transactions per position. For each position in `positions[]`:

```
// Step 1 — anyone can call on behalf of the user:
if pos.t == "seller":
    claimSellerFunds(pos.st, pos.bt, user_address, pos.ai)
if pos.t == "buyer":
    claimBuyerFunds(pos.st, pos.bt, user_address, pos.ai)

// Step 2 — user calls:
withdraw(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, pos.w_wei)
```

After all positions are claimed, one additional withdraw call collects them all at once:
```
withdraw(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, balance_wei)
```

### Case 4 — WETH direct + positions
Condition: has both `weth_direct` and `positions`

Claim all positions first (Case 3 Step 1), then withdraw the full WETH balance in one call:
```
withdraw(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, balance_wei)
```
`balance_wei` already includes both the direct balance and all position amounts.

### Case 5 — SAI + WETH (any combination)
Condition: has `sai_balance` alongside any WETH fields

Handle WETH as in Cases 1/3/4 above. Then separately:
```
withdraw(0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359, sai_balance_wei)
```
SAI always comes from a direct L1 balance — never from positions.

---

## Unattributable gap

The contract holds ~113 ETH on-chain. This file attributes 106.76 WETH + 2,587 SAI (~94.5% coverage). The remaining ~6.3 ETH could not be attributed to any address after exhaustive layer 1/2/3 scanning. Amounts here are a floor, not a ceiling.
