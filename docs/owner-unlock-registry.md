# Owner-Unlock Registry — ETH a contract owner/authority could release to users

This report inverts a standard access-control risk table. Instead of *"compromise of
this privileged holder could **drain** funds"*, each row here asks: *"if this
privileged holder took one defined action, could the **original users** recover
their ETH?"*

Every contract below holds ETH that is **not freely user-claimable today** because a
project owner, admin, manager, governance body, oracle, or operator role sits between
the funds and the depositors. For each we list the **protocol, contract address, the
controlling address, the function(s) that must be called, and a short description of
the flow**.

- **Snapshot:** balances re-read from a local Ethereum archive node at block
  **25,216,528**. Owner/authority addresses resolved live via `owner()` (fallback:
  `getRoleMember(DEFAULT_ADMIN_ROLE, 0)`).
- **Verification basis:** Type A paths are Tenderly bundle-simulation verified
  (owner-unblock tx → user-claim tx, wei-exact). Other buckets are source- and
  state-reviewed; flows are production-feasible but not all end-to-end simulated.
- This is a research/outreach document. It names **projects and addresses only** — no
  individuals. It does not constitute a withdrawal guarantee.

## How to read each row

| Field | Meaning |
|---|---|
| **Contract** | The address holding the ETH. |
| **Live ETH** | Native ETH balance at the snapshot block. |
| **Owner / authority** | Address that must act first (`owner()` or admin role). |
| **Owner action (tx1)** | The function the owner/authority calls to unblock. |
| **User call (tx2)** | The function the original user calls afterward to receive ETH. Blank = no user-callable path; owner must sweep + redistribute off-chain. |
| **Class** | `Atomic` single owner tx; `Multi-tx` ordered sequence; `Sweep` admin-only custody. |

## Bucket summary

| Bucket | What the unlock achieves | Contracts | Live ETH | User outcome |
|---|---|---:|---:|---|
| **A — Paused user claims** | Owner flips one flag; users then claim themselves | 3 | 211.8 | Direct user claim |
| **D — Owner/gate unlock** | Owner sets state/oracle/role; *then* users (or original contributors) can act | 6 | 654.8 | User/contributor claim after unlock |
| **B — Admin sweep required** | Only `onlyOwner` withdraw exists; owner must sweep + redistribute off-chain | 43 | 756.8 | Project-led distribution |
| **L — Legacy / institution-blocked** | Governance, dependency, operator, or bricked; not a single owner key | 24 | 21,394 | Institution / governance / often unrecoverable |

> Entries that re-verified to ~0 native ETH (ERC20Peg, HONG, DaoStakeLocking, and 12 closed 2017–2019 refund vaults) have been **removed** from this registry; see the source notes for their drained/closed history.

> Bucket L's total is dominated by **AkuDreams (11,539 ETH, permanently bricked)** and
> **Loopring custody (3,190 ETH, active infra)** — neither is owner-unlockable. The
> realistically owner-actionable headline is **Buckets A + D = 9 contracts, ~867 ETH**,
> where one role action makes funds directly recoverable by users.

---

## Type A — Paused user claims (owner unpauses, users claim)

A user-callable claim/withdraw already exists and works; it is gated by a single
owner-flippable flag. Bundle-simulation verified end-to-end.

| Protocol | Contract | Live ETH | Owner / authority | Owner action (tx1) | User call (tx2) | Class |
|---|---|---:|---|---|---|---|
| TransitFinanceRefund | [0xc213…7f63](https://etherscan.io/address/0xc213f258f4142f53d086f9edb7a36e67eb347f63) | 161.02 | [0x8576…d5c5](https://etherscan.io/address/0x8576910497930b79a97a24de1acb0333399d0c55) (executor `0x7e5c1595…`) | `setClaim(false, 0)` | `claim()` | Atomic |
| Tito Surf MasterChef | [0x6db1…f4be](https://etherscan.io/address/0x6db1c1b318275df254bb47c63e7f316380baf4be) | 42.57 | [0xa81e…c3bb](https://etherscan.io/address/0xa81eac3009bd6e6cce36602d6851fda789ddc3bb) | `setSurfPoolActive(true)` | `withdraw(pid, amount)` per pool | Multi-tx |
| EpikStaking | [0x59ac…62a3](https://etherscan.io/address/0x59accd277add23ee736e70a456a3d2c89e9a62a3) | 8.17 | [0xbada…d7bd](https://etherscan.io/address/0xbada7b23a99e46f9739719f291f646b2b2d1d7d4) | `unpause()` | `claimReward()` | Atomic |

### TransitFinanceRefund — flow
1. **Owner** `0x8576…d5c5` (via executor `0x7e5c1595…`) calls `setClaim(false, 0)`, flipping `claimPause` (storage slot 4) from `1` → `0`.
2. **Each user** calls `claim()` and receives their set refund entitlement.
- **Caveat — structurally insolvent for unclaimed users.** 621 entitlements totalling 3,937.84 ETH were committed; 3,776.81 ETH already paid to 321 claimants pre-pause. 300 unclaimed users hold 1,056.86 ETH of entitlements but only **161.02 ETH remains**. Post-unpause, claims succeed first-come-first-served until the balance falls below the next claimant's entitlement; the seven smallest (0.0993 ETH each) succeed instantly, the top five (50–333 ETH) will revert. Net positive (161 ETH distributed vs locked forever), but UX must explain the FCFS dynamic.

### Tito Surf MasterChef — flow
1. **Owner** `0xa81e…c3bb` calls `setSurfPoolActive(true)`.
2. **Each staker** calls `withdraw(_pid, _amount)` for each of the 25 pools they hold.
- Framework-ready; the user side needs per-PID enumeration before a wei-exact bundle.

### EpikStaking — flow
1. **Owner** `0xbada…d7bd` calls `unpause()`.
2. **Each user** calls `claimReward()`. Bundle-verified (sample user received +2.09e-6 ETH — mechanically sound, small per-user amounts).

---

## Type D — Owner/gate unlock (state/oracle/role must change first)

A plausible user or original-contributor route exists but is blocked behind a state
machine, missing oracle, refund window, bounty state, or operator role. These need the
owner/manager to act before the path opens.

| Protocol | Contract | Live ETH | Owner / authority | Owner action (tx1) | User call (tx2) | Class |
|---|---|---:|---|---|---|---|
| InstantListingV2 | [0xb9fb…009a](https://etherscan.io/address/0xb9fbe1315824a466d05df4882ffac592ce9c009a) | 200.00 | [0x39e9…07e4](https://etherscan.io/address/0x39e951f197b9f4c704f7290ce7accad0b5e607e4) | `setRefundable(token, futureTime)` per token | `refund(tokenAddress)` | Multi-tx |
| ICO+Kraken (unverified) | [0xe29b…b9c9](https://etherscan.io/address/0xe29bbc8fcd866dfff36dcac6b006a3a97adba9c9) | 170.11 | [0x8a97…8314](https://etherscan.io/address/0x8a970573f88dbc7b69dfed2ba193c98c2d5d8314) | set Kraken oracle + exchange rates + unpause | `redeemAll()` | Multi-tx |
| RemovePutinBounty | [0xaf5f…4b99](https://etherscan.io/address/0xaf5fc45258b5d0af72031ab154bf6dfcfec74b99) | 100.12 | [0x7ac4…9d94](https://etherscan.io/address/0x7ac476a319b07faf75fdd07a72800732d8b59d94) | `cancel()` *or* `report(time)` | `redeem()` (after Cancelled) / `withdraw()` (after Executed+100d) | Multi-tx |
| CapitalConverter / Nsure ETH | [0xa6b6…fb84](https://etherscan.io/address/0xa6b658ce4b1cdb4e7d8f97dffb549b8688cafb84) | 91.18 | [0x1995…299c](https://etherscan.io/address/0x1995dc62b91163e4693f63eae7af6559c8ab299c) | renounce `operator` role | `exit()` (original depositors only) | Atomic |
| PembiCoinICO | [0x5535…a1cc](https://etherscan.io/address/0x5535a72556727c221c567e0fc4208c5a99dba1cc) | 69.24 | [0xa977…2608](https://etherscan.io/address/0xa977aadc92473abe464bef836e57d4203ccb2608) | `setFailed()` | `refund()` | Atomic |
| RefundVault (crowdsale `0xc928ea49…`) | [0x93d8…f534](https://etherscan.io/address/0x93d812bf90a575d628e246b0966505a9e466f534) | 24.10 | crowdsale [0x61db…eb0d](https://etherscan.io/address/0x61db4c9db2bb58da4777b73463257a6dde90eb0d) | `enableRefunds()` | `claimRefund()` | Atomic |

### InstantListingV2 — flow
1. **Owner** `0x39e9…07e4` calls `setRefundable(token, futureTime)` for each token to open the refund window (`refund()` requires `refundable[token] > 0 && now < refundable[token]`).
2. **Each proposer** calls `refund(tokenAddress)` — ETH returns to `proposalInfos[token].sender` (the original proposer), not an arbitrary caller.

### ICO+Kraken — flow
1. **Owner** `0x8a97…8314` initializes the Kraken Oraclize oracle (`kraken()` currently returns `address(0)`), populates exchange rates (currently zero), and clears the pause/whitelist gates.
2. **Each whitelisted contributor** calls `redeemAll()`. Until the oracle/rate state is repaired, `redeemAll()` reverts — treat as reject-until-repaired.

### RemovePutinBounty — flow
- 3-state machine, currently `Initial`. Two mutually exclusive owner paths:
  - **Owner** `0x7ac4…9d94` calls `cancel()` → state `Cancelled` → contributors call `redeem()`.
  - *or* **Owner** calls `report(time)` → state `Executed` → after 100 days the addressee calls `withdraw()`.
- Owner has done neither for years. Contributor-favourable path is `cancel()`.

### CapitalConverter / Nsure ETH — flow
1. **Owner/operator** `0x1995…299c` renounces the `operator` role (which can currently drain ETH via `onlyOperator payouts(address,uint256)`).
2. **Original depositors** call `exit()` (`exit()` requires `depositAt[user] > 0`; transferred-in nETH holders cannot exit). Token is 1:1 ETH-backed (smartBalance = totalSupply = 91.18). **Deferred** until operator risk is removed or a depositor-only set is proven.

### PembiCoinICO — flow
1. **Owner** `0xa977…2608` calls `setFailed()` (current state `Idle`; `refund()` requires `inState(Failed)`).
2. **Each of 23 contributors** calls `refund()`.

### RefundVault (paired crowdsale) — flow
1. **Crowdsale owner** (crowdsale at `0xc928ea49…`, currently the vault's `owner()` = `0x61db…eb0d`) calls `enableRefunds()`, switching the OZ RefundVault from `Active` → `Refunding`.
2. **Each depositor** calls `claimRefund()`. The paired crowdsale is unverified — confirm source before outreach.

---

## Type B — Admin sweep required (owner withdraws, redistributes off-chain)

These have **no user-callable ETH-out path**. Only `withdraw()` / `withdrawAll()` /
equivalent exists and is `onlyOwner`. Recovery requires the owner to sweep the contract
and forward funds to the original users from a recovery wallet.

**Shared flow:**
1. **Owner** calls the admin withdraw function → ETH lands at the owner address.
2. **Owner** derives the original buyer list (for NFT mints, from on-chain mint `Transfer` events) and distributes off-chain.

These are **outreach targets, not site integrations**. Most are sold-out NFT mints.

| Protocol | Contract | Live ETH | Owner / authority | Admin function |
|---|---|---:|---|---|
| PandaDAOFarewell ⚠ | [0x229c…e3f3](https://etherscan.io/address/0x229cc0a81a1d6b4a2fc1452b3bd166462216e3f3) | 68.36 | **`0x…dead` (burned)** | `withdrawEther` |
| Token | [0x9237…3333](https://etherscan.io/address/0x92373e9ad216762eeb0794086f5ad63883343333) | 43.05 | [0xed1b…b62a](https://etherscan.io/address/0xed1bdbc93bc6741af76910f223b9282732c9b62a) | `withdraw`, `withdrawAll` |
| Treasury | [0xa0da…95fe](https://etherscan.io/address/0xa0da53447c0f6c4987964d8463da7e6628b30f82) | 40.20 | [0x3c1f…95fe](https://etherscan.io/address/0x3c1ff68f5aa342d296d4dee4bb1cacca912d95fe) | admin-only ETH-out |
| LAND | [0x1936…d85e](https://etherscan.io/address/0x193616faf0f51b454fabe38088616a1fd5a5d85e) | 38.59 | [0x0d65…a416](https://etherscan.io/address/0x0d65d69355944339cda43cf48b4c5f32b78ba416) | `withdraw` |
| SAWGamesPass | [0x347e…5ceb](https://etherscan.io/address/0x347e3513ca6d5118cb2df3bc386eade1e8f25ceb) | 39.18 | [0x96c8…57e6](https://etherscan.io/address/0x96c80ab80a920efd32485bc2fb9dfec601f357e6) | `withdraw` |
| AsterFi | [0x0193…8b62](https://etherscan.io/address/0x0193b85c38337eb90338ed8660810ba66c548b62) | 33.20 | [0xe955…11ae](https://etherscan.io/address/0xe955c098abdc6e266068e5e7fd2367b6713911ae) | `withdraw` |
| ForgottenRunesWizardsCult | [0x521f…6f42](https://etherscan.io/address/0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42) | 30.63 | [0xd584…4a51](https://etherscan.io/address/0xd584fe736e5aad97c437c579e884d15b17a54a51) | `withdraw`, `withdrawAll` |
| dotdotdot | [0xce25…92c3](https://etherscan.io/address/0xce25e60a89f200b1fa40f6c313047ffe386992c3) | 29.75 | [0x74b0…7f8a](https://etherscan.io/address/0x74b01c2371988f6bc173e7386f3e012790e57f8a) | `withdraw` |
| AvidlinesMinter | [0x43a1…c304](https://etherscan.io/address/0x43a113c71a26d04cb2e8938cd84883e181fcc304) | 29.72 | role-based (`owner()` = 0x0) | `fpWithdrawal`, `generatorWithdrawal` |
| Oosagi | [0xff5c…39f5e](https://etherscan.io/address/0xff5cdc2c1b3f3583e8f7a67cb7a7d3af75339f5e) | 29.25 | [0xec05…e1f3](https://etherscan.io/address/0xec0576bda6d2bf43baeefee6096efc74accde1f3) | `withdraw`, `withdrawTokens` |
| VisualMassageModule | [0xe255…5608](https://etherscan.io/address/0xe255fd35cec33a10e46c807423ea318c072de5d2) | 27.50 | [0xe9cb…5608](https://etherscan.io/address/0xe9cbf8c606322e23215b9932d57c3d9115305608) | `withdraw` |
| TerminalV1_1 | [0x981c…5c68](https://etherscan.io/address/0x981c8ecd009e3e84ee1ff99266bf1461a12e5c68) | 26.88 | [0xaf28…4b1e](https://etherscan.io/address/0xaf28bcb48c40dbc86f52d459a6562f658fc94b1e) | `withdraw` |
| Indelible | [0xc00f…3633](https://etherscan.io/address/0xc00ffeb7cf191c3432ede000478901f99fd53633) | 26.46 | [0x61f8…adec](https://etherscan.io/address/0x61f874551c69f0e40c9f55219107b408c989adec) | `withdraw` |
| envoContract | [0xd329…c448](https://etherscan.io/address/0xd32919fcdd0b2af289e45c9a916fd9f18cacc448) | 21.27 | [0x195e…75e8](https://etherscan.io/address/0x195e710e75c8465af635130fc6079201047975e8) | `withdraw`, `withdrawAllToAddress` |
| URSStore | [0xd19f…25b1f](https://etherscan.io/address/0xd19fa1565564f552200ab656c3003d5868555539) | 16.96 | [0xae1b…25b1f](https://etherscan.io/address/0xae1b0edfd2bed6be0abd7e9377f3a85b19225b1f) | `withdraw` |
| DtfGenesis | [0x97f4…f8be](https://etherscan.io/address/0x97f456b3927141f7d97cbe07dfc0e1ac9de3813c) | 15.40 | [0xdb92…f8be](https://etherscan.io/address/0xdb92205d379865076a1e3b7b901bd498a2abf8be) | `withdraw` |
| BondingNOM | [0x264c…77e](https://etherscan.io/address/0x264c13cfed981e3137fb43b198d14d8d5d64977e) | 13.87 | [0xe6f4…db24](https://etherscan.io/address/0xe6f47dc4a98efc9f1faa7d1a75c361b2ccdddb24) | `withdraw` |
| MergeBears | [0x16d2…2904](https://etherscan.io/address/0x16d267ab31f7f18051c9115cc8f9ca066cd82904) | 12.28 | role-based (`owner()` = 0x0) | `withdraw` |
| Minter | [0x08f0…0ff3](https://etherscan.io/address/0x08f095520bbc7ab9f8351a1bf7f8c0084e1b0ff3) | 11.70 | [0x095f…b21a](https://etherscan.io/address/0x095f46500fb5b976eb23b62b12cf036c75c5b21a) | `withdraw` |
| CryptoCalaverasMembership | [0xcf67…4186](https://etherscan.io/address/0xcf67349cd2dbc798e8fc7cec5fa5082d2c6f4186) | 11.12 | [0xb304…f9a2](https://etherscan.io/address/0xb304bf6baae65ac9a3b1cdbb4e48e5589a3ff9a2) | `withdraw` |
| MxtterAuctionManager | [0xdc06…9d86c](https://etherscan.io/address/0xdc0625599a7a15273c591bb7bfe39b280439d86c) | 10.90 | [0x6c6a…7b58](https://etherscan.io/address/0x6c6af3b1a70df1e4596557da92b16ed812e27b58) | `withdraw` |
| Musess | [0x89d2…7c8c](https://etherscan.io/address/0x89d2167554e2a91da051b92863019d199aa17c8c) | 10.62 | [0x2ed0…bd07](https://etherscan.io/address/0x2ed07b3b14dcbac232df8787a2b9bc82a4bdbd07) | `withdrawFunds` |
| JsnyNftClubMinter | [0x0076…24f5](https://etherscan.io/address/0x00767367f6eccc7047ea2695ccd103a5654324f5) | 10.00 | [0xcd1b…3b0c](https://etherscan.io/address/0xcd1b5613e06a6d66f5106cf13e103c9b98253b0c) | `withdraw` |
| FounderBoards | [0xad3c…ccbb0](https://etherscan.io/address/0xad3c8147fce7cfe52b4bb5218683e50866bccbb0) | 9.87 | [0xb5ca…79d8](https://etherscan.io/address/0xb5ca1d19a30c9b45b160a7ebbf3a1ce6980b79d8) | `withdraw` |
| Chronicles | [0x8557…b671](https://etherscan.io/address/0x85576c1b10371a77d6a594eec88653538e82b804) | 8.55 | [0xdb27…b671](https://etherscan.io/address/0xdb275fac4239aa53e3c56b7e999dfc2b2406b671) | `withdrawAll` |
| Ronin | [0x2127…f4be](https://etherscan.io/address/0x2127fe7ffce4380459cced92f2d4793f3af094a4) | 8.52 | [0xd959…ad5b](https://etherscan.io/address/0xd9590932576498fcf0df68f8b7d9a8d09e03ad5b) | `withdrawAll` |
| QuirkyMfers | [0x783d…4115](https://etherscan.io/address/0x783da55d4dbfee0d9f2e6f5f0850ad039cae33f3) | 8.16 | [0xf5f1…4115](https://etherscan.io/address/0xf5f1b3f9fa252a19f413178ccd4353a8246e4115) | `withdraw` |
| BasicERC1155 | [0xe4aa…1ae0](https://etherscan.io/address/0xe4aad3dece6d5fbdd80e6a270217efa013f04ad3) | 8.00 | [0xb855…1ae0](https://etherscan.io/address/0xb8551ffebfe8de8b3ae7b754003aacf64bf41ae0) | `withdraw` |
| GoldenTicket | [0xac61…05d5](https://etherscan.io/address/0xac61b9156f556c5be7d56a199515592c0550d5d1) | 7.88 | [0x4d65…e2d5](https://etherscan.io/address/0x4d65e3b5660e4d4c6c443aa95a389ddc3937e2d5) | `withdraw` |
| MoonTotems | [0x8fe8…fe4b2](https://etherscan.io/address/0x8fe83f6f7f726a2c9e238b7e094c4bf530bc9720) | 7.10 | [0x6a33…e4b2](https://etherscan.io/address/0x6a3397824a105d7fd6260754413c92cc84cfe4b2) | `withdraw` |
| EulerBeatsPairStaking | [0xfa21…636d](https://etherscan.io/address/0xfa21807ede5486c83d665812525ff44c5b72f3ed) | 7.05 | [0x0fcb…636d](https://etherscan.io/address/0x0fcb8ecf48d327d8da77a92e63bce07ec17f636d) | `withdrawUnclaimed` |
| XSFC | [0x6538…3748](https://etherscan.io/address/0x65388aef0d748434d741146e84d0efd635df383d) | 7.04 | [0x75db…3748](https://etherscan.io/address/0x75dbe3144a918ef9dcf19f6552df65916baf3748) | `withdraw` |
| mfatches | [0x237c…ea25](https://etherscan.io/address/0x237c23d2a1c6320d6010338a48db3fcc29f64eed) | 6.88 | [0xd52e…ea25](https://etherscan.io/address/0xd52e7e6cfc54dc437bf5a4535766e7516e0cea25) | `withdraw` |
| KemigawaJinjaCollection | [0x721b…68c4](https://etherscan.io/address/0x721b7323ca223b6f60d8184b1329f04c32f1486c) | 6.46 | [0xab08…68c4](https://etherscan.io/address/0xab08ce4ec986cef98a33af119afcd1e1260468c4) | `withdraw` |
| TAW | [0xc128…f772](https://etherscan.io/address/0xc12803d3665b12940c2a7083c13ceb3caa8c79fe) | 6.38 | [0xaef4…f772](https://etherscan.io/address/0xaef48567b5f50c8a16b638bfa8fcd240e349f772) | `withdraw` |
| DegenBlues | [0xbd31…74bc](https://etherscan.io/address/0xbd31226243f09cb8117c5afefdb82f59f46d5d1b) | 6.30 | [0xebf9…74bc](https://etherscan.io/address/0xebf90f3f11475166460890ef953d9141fd6174bc) | `withdraw` |
| PPADealers | [0x9912…5636](https://etherscan.io/address/0x99120d128a5f7cb81c318a24fa1f60f66d9777d7) | 5.92 | [0x1322…5636](https://etherscan.io/address/0x132266286f204d9eb2b48f16d25ed74ce5275636) | `withdraw` |
| RocketFactoryMarket | [0x6541…9126](https://etherscan.io/address/0x6541b83d41e5c2a64ef1f72c8ed4fff671630cd1) | 5.91 | [0x76c5…9126](https://etherscan.io/address/0x76c54c77a58c376ff9533b3582b1f73c49049126) | `withdraw` |
| SaveUkraineFactory | [0xee50…6326](https://etherscan.io/address/0xee50d5a8cf42b6b7b8a5466a5b1dffcad22e1fc1) | 5.50 | [0x11ce…6326](https://etherscan.io/address/0x11ce0559da9803cc83efcda1c1af14a065426326) | `withdrawEther` |
| MetaBoom | [0x4c22…ade5](https://etherscan.io/address/0x4c22d3b875437d43402f5b81ae4f61b8f764e1b1) | 5.30 | [0x69eb…ade5](https://etherscan.io/address/0x69ebe7701a7aa0b27cb6d1b9c07755adc281ade5) | `withdraw` |
| HoQ | [0x8e81…104c](https://etherscan.io/address/0x8e81a2844bedfb50ed774083bc3538e23cca6a35) | 5.13 | [0xaf51…104c](https://etherscan.io/address/0xaf518e4cd3a68d8a4eabb27524260739cb88104c) | `withdraw`, `withdrawDeveloper` |
| MeebitsDAOGeneralMembership | [0x8054…e747](https://etherscan.io/address/0x80549075471291d8e7e14e1defe4280c743d86af) | 5.05 | [0x2009…e747](https://etherscan.io/address/0x2009a752a50d3cde486d7b5921944377b729e747) | `withdraw` |
| LocalCoinSwapEthereumEscrow | [0x0e87…2271](https://etherscan.io/address/0x0e87bf5286c4091e0eeb7814d802115dfbb4c4cd) | 28.92 | [0x7ab6…2271](https://etherscan.io/address/0x7ab685a614d0aac012e85f778fcc36913f3b2271) | `withdrawFees` |

⚠ **PandaDAOFarewell** — `owner()` is the burn address `0x…dead`. The `onlyOwner withdrawEther` is **permanently uncallable**; the 68.36 ETH is effectively bricked unless a non-owner recovery exists. Re-classify as bricked, not owner-recoverable.

---

## Type L — Legacy / institution-blocked appendix

Not single-owner-key unlocks. Governance bodies, dissolved dependencies, operator/
custody flows, or contract bugs sit in the way. Included for research and targeted
outreach, not direct integration.

> **Verification note (block 25,216,528).** Several legacy figures from earlier
> research did **not** survive a current-balance re-check and were **removed** from
> this registry. Three distinct cases were conflated as "stuck ETH" in the source
> notes: (a) **genuinely drained recently** — ERC20Peg (42.25 ETH out at block
> 25,028,278, tx `0x84e8be5b…970b`); (b) **emptied years ago in original operation**
> — the 2017–2019 refund vaults, whose recorded figures were historical throughput or
> mid-life snapshots, not current native balance; (c) **never held native ETH** — HONG
> and DaoStakeLocking, whose figures were token / ETH-equivalent values (DAO tokens,
> DGD). Rows below are only those still holding native ETH.

### Governance / dependency / protocol-state / bricked

| Protocol | Contract | Live ETH | Authority | Blocking condition / what would unfreeze it |
|---|---|---:|---|---|
| AkuDreams | [0xf42c…bae9](https://etherscan.io/address/0xf42c318dbfbaab0eee040279c6a2588fa01a961d) | 11,539.50 | owner `0xcc0e…bae9` | `processRefunds` stuck by a griefing bug. **Bricked** — team rescue/migration/settlement only, not a clean owner call. |
| Loopring DefaultDepositContract | [0x674b…bd3f](https://etherscan.io/address/0x674bdf20a0f284d710bc40872100128e2d66bd3f) | 3,190.31 | owner `0x96f1…4d97` | `withdraw(...)` is `onlyExchange`; active custody infrastructure, not forgotten ETH. |
| ThreeFMutual | [0x66be…cb32](https://etherscan.io/address/0x66be1bc6c6af47900bbd4f3711801be6c2c6cb32) | 1,918.82 | role-based | `claim()` depends on Maker `Vat.live() == 0`; Maker is still live. Needs Maker emergency shutdown / external migration. |
| BETFI/BFI Launchpad | [0xa205…07e4](https://etherscan.io/address/0xa205d797243126f312ae63bb0a5ea9a32fb14f41) | 1,012.60 | role-based | Refund mode false; owner-only `setupLiquidity()` moves ETH to team/LP/fees, not depositors. No user-refund route. |
| Alpha Homora v1 | [0x67b6…1295](https://etherscan.io/address/0x67b66c99d3eb37fa76aa3ed1ff33e8e39f0b9c7a) | 11.01 | owner `0x5f5e…1295` | Insolvent accounting: `withdraw()` computes against `totalETH` incl. unpaid loans; `safeTransferETH` reverts. Needs recapitalization. |
| Rouleth | [0x18a6…9601](https://etherscan.io/address/0x18a672e11d637fffadccc99b152f4895da069601) | 91.00 | role-based | Broken old bytecode; calls revert via invalid jump. No contract-level path. |

### Admin / operator / fixed-recipient ETH paths

| Protocol | Contract | Live ETH | Authority | Why blocked |
|---|---|---:|---|---|
| BlackFortGenesisNFT | [0x6c31…f932](https://etherscan.io/address/0x6c3197c9f3954b682b0e64b520e6da5fe74fcf8b) | 551.10 | owner `0x46b8…f932` | Sold-out NFT mint; `withdraw()` is `onlyOwner`. Admin sweep only. |
| unverified_bd6 | [0x5978…aeaa](https://etherscan.io/address/0x5978c6153a06b141cd0935569f600a83eb44aeaa) | 476.39 | operator/keyholder | Operator-signed custodial vault; withdraw needs offchain signature + admin controls. |
| MintedTokenCappedCrowdsaleExtv1 | [0xc9d7…c834](https://etherscan.io/address/0xc9d7bd1fad7d5621dda20335818e9575ae07ea03) | 451.32 | owner `0xc7ca…c834` | Goal reached; no `claimRefund()`; multisig blocks withdrawal and owner can redirect. |
| DavyJones | [0xaba5…6e0d](https://etherscan.io/address/0xaba513097f04d637727fdcda0246636e0d5d6833) | 348.24 | role-based | No user ETH-out; public fn swaps ETH into token baskets, owner controls unwinds. |
| Custodian | [0xe5c4…fa0c](https://etherscan.io/address/0xe5c405c5578d84c5231d3a9a29ef4374423fa0c2) | 304.81 | role-based | Whitelisted exchange/custodian flow, not depositor withdrawal. |
| GuildBank | [0x83d0…c500a](https://etherscan.io/address/0x83d0d842e6db3b020f384a2af11bd14787bec8e7) | 283.01 | owner `0xf2b8…500a` | ETH movement is owner/burner-oriented, not a depositor claim. |
| Miner | [0x6435…c526](https://etherscan.io/address/0x64356f9e79957fa6d84564fa75f53028799c52de) | 245.95 | owner `0x2aaf…a841` | `userWithdraw` and `withdraw` both admin-gated; operational pool. |
| XifraICO2 | [0x7488…529e](https://etherscan.io/address/0x7488451db91df618759b8af15e36f70c0fdd529e) | 193.59 | role-based | `withdrawICOFunds()` is permissionless but sends ETH to immutable `xifraWallet`, not investors. |
| Kyber reserve A | [0x9149…c79e](https://etherscan.io/address/0x9149c59f087e891b659481ed665768a57247c79e) | 196.95 | role-based | `withdraw(token,amount,destination)` operator/admin gated with approved destinations. |
| Kyber reserve B | [0x773a…3144](https://etherscan.io/address/0x773a58c0ae122f56d6747bc1264f00174b3144c3) | 117.75 | role-based | Same as reserve A. |
| R1Exchange | [0xc7c9…45e7](https://etherscan.io/address/0xc7c9b856d33651cc2bcd9e0099efa85f59f78302) | 150.36 | owner `0xfe2d…45e7` | `withdrawEnabled()` false; balances probed near-zero. Complete balance scan before any promotion. |
| EtherkingJackpot | [0xab5c…f7b2](https://etherscan.io/address/0xab5cffaaec03efc94ab5c0c4c0bc85ae2b2b65ac) | 101.00 | owner `0x1e6a…f7b2` | Jackpot payout + pending-balance drain are owner-only. |
| NativeOFT | [0x4f7a…6bca](https://etherscan.io/address/0x4f7a67464b5976d7547c860109e4432d50afb38e) | 68.59 | owner `0x707e…6bca` | LayerZero NativeOFT bridge wrapper; ETH backs bridged OFT accounting. |
| ApeToken | [0x22ad…760f](https://etherscan.io/address/0x22ad3fab750fb53118e4d6aa85343056a736394b) | 59.64 | admin role `0x22f6…760f` | `claimPresale()` mints tokens only; developer-only `listOnUniswap()` spends ETH. |
| EmCandyPool | [0x1863…d269](https://etherscan.io/address/0x18639f44f946983bf3413d9b51322d05c29d269e) | 50.00 | role-based | Configured queue/admin flow, not public ETH refund. |
| RocketSmoothingPool | [0xd4e9…605d](https://etherscan.io/address/0xd4e96ef8eee8678dbff4d535e033ed1a4f7605b7) | 25.63 | role-based | ETH-out gated by `onlyLatestNetworkContract` (Rocket Pool network). |
| ETHRegistrarController | [0x2535…2552](https://etherscan.io/address/0x253553366da8546fc250f225fe3d25d0c782303b) | 0.38 | owner `0x6262…2552` | `withdraw` sends ETH to fixed ENS owner/infra. Now ~empty. |

### Blocked refund-vault family (2017–2018)

Standard OZ RefundVault pattern, owner/manager never moved the vault from `Active` →
`Refunding`. Of the family originally recorded, only `0x58fc…c0df` still holds native
ETH; the other 13 addresses were verified at 0 (emptied in their original 2017–2019
operation) and **removed from this registry**.

| Protocol | Contract | Live ETH | Owner | Verified status |
|---|---|---:|---|---|
| 2017-18 vault | [0x58fc…c0df](https://etherscan.io/address/0x58fcf11196abaeefdf23198ec4ec9c5237963e17) | 6.46 | `0x958e…c0df` | **Still holds 6.46 ETH** — refund state never enabled. Only live row in this family. |

---

## Outreach priority

1. **Type A (3, 212 ETH)** — highest priority. Owner does not take custody; one tx re-enables users' own claims. Lowest legal/ops friction.
2. **Type D (6, 655 ETH)** — outreach or periodic state re-check; actionable once the gate changes.
3. **Type B (43, 757 ETH)** — owner sweeps + redistributes off-chain; buyer lists derivable from mint events. Skip PandaDAOFarewell (owner burned).
4. **Type L** — research / institution outreach only; do not promote without fresh source + state + simulation evidence.

## Methodology & provenance

- Source research: `docs/owner-action-required.md`, `data/.scan_state/owner_blocked_candidates.md`, `data/research_notes/2026-05-02_bricked_contracts_unfreeze_memory.md`.
- Owner/authority + live balances re-resolved against a local reth archive node at block 25,216,528 via `data/_owner_unlock_scan.py`.
- Type A flows are Tenderly bundle-simulation verified (`data/.scan_state/owner_action_verification_2026-05-05.md`).
- Entries that re-verified to ~0 native ETH were **removed** from this registry (they fell into three classes: genuinely drained recently — ERC20Peg, tx `0x84e8be5b…970b` at block 25,028,278; emptied during original 2017–2019 operation — the closed refund vaults; never held native ETH — HONG, DaoStakeLocking, whose figures were token / ETH-equivalent). Their drained/closed history is preserved in the source notes.
- No individual names are listed, per project policy.
