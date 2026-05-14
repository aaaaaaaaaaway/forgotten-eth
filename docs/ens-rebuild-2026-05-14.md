# ENS Old Registrar — 2026-05-14 rebuild & re-engagement

_Generated 2026-05-14 19:51 UTC_

## Summary

On 2026-05-14 the deed→owner index was rebuilt from local reth (replacing the ENS-subgraph snapshot from commit `be15ac00`). New totals:

| | before | after | delta |
|---|---:|---:|---:|
| Owners | 11,206 | 14,145 | +2,939 |
| Active deeds | ~27,404 | 101,316 | +73,912 |
| Total claimable ETH | 3,431.16 | 7,254.14 | **+3,822.97** |
| Name coverage | ~22% | 64.7% | +43,085 names |

Verification: Tenderly `debug_traceCall(releaseDeed)` returned wei-exact match for 30/30 sampled deeds.

## Past `/api/check` users with new ENS to claim

113 addresses, **+2,238.51 ETH** newly mapped. Sorted by ETH delta.

`old` / `new` are the per-address ETH totals in `data/balances/ens_old_eth_balances.json` before vs. after the rebuild.

| address | old ETH | new ETH | Δ | deeds | checks |
|---|---:|---:|---:|---:|---:|
| [`0x9a02ed4ca9ad55b75ff9a05debb36d5eb382e184`](https://etherscan.io/address/0x9a02ed4ca9ad55b75ff9a05debb36d5eb382e184) | 0.0100 | 1,700.2763 | **+1,700.2663** | 3 | 5 |
| [`0x505701b96f8470118e085f0a5466ce00802f57a7`](https://etherscan.io/address/0x505701b96f8470118e085f0a5466ce00802f57a7) | 16.6110 | 92.3670 | **+75.7560** | 38 | 2 |
| [`0x819d64ac448dfed4615079c8110dc65a7571db8f`](https://etherscan.io/address/0x819d64ac448dfed4615079c8110dc65a7571db8f) | 0.0000 | 67.7425 | **+67.7425** | 130 | 1 |
| [`0x41f89c9f82a10f1db08bec51466c40a96b95f92c`](https://etherscan.io/address/0x41f89c9f82a10f1db08bec51466c40a96b95f92c) | 51.1210 | 103.1210 | **+52.0000** | 3 | 1 |
| [`0x2014e01eefe653901a7721fa908b0055f2eb84dc`](https://etherscan.io/address/0x2014e01eefe653901a7721fa908b0055f2eb84dc) | 5.0200 | 56.0500 | **+51.0300** | 7 | 6 |
| [`0x4687466ac9bd165ca3bf2f6b6446822560b9fc3d`](https://etherscan.io/address/0x4687466ac9bd165ca3bf2f6b6446822560b9fc3d) | 0.0000 | 50.0300 | **+50.0300** | 4 | 1 |
| [`0xf5f700e1912b93ad09597bfa22484e01c0035b04`](https://etherscan.io/address/0xf5f700e1912b93ad09597bfa22484e01c0035b04) | 0.0000 | 36.7834 | **+36.7834** | 3,329 | 1 |
| [`0x22c9f9957c8299aaef77c902e291909d28451d3c`](https://etherscan.io/address/0x22c9f9957c8299aaef77c902e291909d28451d3c) | 0.0000 | 32.0675 | **+32.0675** | 121 | 2 |
| [`0xd2fa59b040852952bf4b4639edd4d8a718a4598a`](https://etherscan.io/address/0xd2fa59b040852952bf4b4639edd4d8a718a4598a) | 0.0000 | 28.7779 | **+28.7779** | 2,060 | 1 |
| [`0x893608751d68d046e85802926673cdf2f57f7cb8`](https://etherscan.io/address/0x893608751d68d046e85802926673cdf2f57f7cb8) | 27.2920 | 55.8730 | **+28.5810** | 19 | 8 |
| [`0x000fb8369677b3065de5821a86bc9551d5e5eab9`](https://etherscan.io/address/0x000fb8369677b3065de5821a86bc9551d5e5eab9) | 0.0000 | 24.8883 | **+24.8883** | 2,470 | 1 |
| [`0xf48906a0191fe68fa18cff00b05c7f4e8c8d7f80`](https://etherscan.io/address/0xf48906a0191fe68fa18cff00b05c7f4e8c8d7f80) | 0.0000 | 23.1590 | **+23.1590** | 463 | 1 |
| [`0x661eedd93da06499d3220aa2adf05d6d2417e60c`](https://etherscan.io/address/0x661eedd93da06499d3220aa2adf05d6d2417e60c) | 0.0000 | 21.6570 | **+21.6570** | 255 | 2 |
| [`0x762fb9c879a70429c6bee516cdb8a22fe28a69b9`](https://etherscan.io/address/0x762fb9c879a70429c6bee516cdb8a22fe28a69b9) | 0.0000 | 6.9820 | **+6.9820** | 674 | 2 |
| [`0xf14955b6f701a4bfd422dcc324cf1f4b5a466265`](https://etherscan.io/address/0xf14955b6f701a4bfd422dcc324cf1f4b5a466265) | 0.0000 | 5.6010 | **+5.6010** | 486 | 2 |
| [`0x8d3335f06a1121eee9d57d68dc80c226a1aa952f`](https://etherscan.io/address/0x8d3335f06a1121eee9d57d68dc80c226a1aa952f) | 0.0000 | 4.3883 | **+4.3883** | 118 | 2 |
| [`0x815bfd9c2ebcf74544f6779f71d4a4aed42c9ae2`](https://etherscan.io/address/0x815bfd9c2ebcf74544f6779f71d4a4aed42c9ae2) | 0.0000 | 4.0510 | **+4.0510** | 1 | 1 |
| [`0xe27121159f4e1c82c65274c00dc59ecb7fe96d23`](https://etherscan.io/address/0xe27121159f4e1c82c65274c00dc59ecb7fe96d23) | 8.9220 | 11.7972 | **+2.8752** | 12 | 1 |
| [`0x140ef05a724ca161d49ffe8d97d35571289fa5c4`](https://etherscan.io/address/0x140ef05a724ca161d49ffe8d97d35571289fa5c4) | 0.0000 | 2.3300 | **+2.3300** | 104 | 5 |
| [`0xbac9ac2544a993125e6d81446429397f1901ebb8`](https://etherscan.io/address/0xbac9ac2544a993125e6d81446429397f1901ebb8) | 12.7719 | 15.0170 | **+2.2451** | 96 | 2 |
| [`0xfcbbfa504f4c83e39fea90ab1784b54cc909764d`](https://etherscan.io/address/0xfcbbfa504f4c83e39fea90ab1784b54cc909764d) | 0.0000 | 2.1532 | **+2.1532** | 161 | 1 |
| [`0x70c4bcc07a2bfc0cff3c7099b4a9e0ebca181c02`](https://etherscan.io/address/0x70c4bcc07a2bfc0cff3c7099b4a9e0ebca181c02) | 0.0000 | 2.0081 | **+2.0081** | 178 | 1 |
| [`0x0004e004aad32bc6a824ff73ccd13844ba3263bc`](https://etherscan.io/address/0x0004e004aad32bc6a824ff73ccd13844ba3263bc) | 1.3900 | 3.3900 | **+2.0000** | 7 | 2 |
| [`0xdc8d255e709edf2ed2622b2691e8ed9a71abb59e`](https://etherscan.io/address/0xdc8d255e709edf2ed2622b2691e8ed9a71abb59e) | 1.8561 | 3.0204 | **+1.1643** | 62 | 12 |
| [`0x4eb75bebdf259a33b11ad1298b74e8e871af615b`](https://etherscan.io/address/0x4eb75bebdf259a33b11ad1298b74e8e871af615b) | 0.2200 | 1.3700 | **+1.1500** | 37 | 1 |
| [`0xbdef41bef47a97a4734598c79f43c37bae3fdb39`](https://etherscan.io/address/0xbdef41bef47a97a4734598c79f43c37bae3fdb39) | 0.0400 | 1.0403 | **+1.0003** | 60 | 1 |
| [`0x68467f330b2a4f727b1eb85451993884f7767a77`](https://etherscan.io/address/0x68467f330b2a4f727b1eb85451993884f7767a77) | 0.0000 | 0.8600 | **+0.8600** | 71 | 1 |
| [`0xc90fdf118e75abe82cf1532570658ce89fb500e9`](https://etherscan.io/address/0xc90fdf118e75abe82cf1532570658ce89fb500e9) | 0.0000 | 0.7900 | **+0.7900** | 79 | 1 |
| [`0x1aff1e0f1d5f76f92145a278d8c31af9ade783dd`](https://etherscan.io/address/0x1aff1e0f1d5f76f92145a278d8c31af9ade783dd) | 0.1000 | 0.8800 | **+0.7800** | 69 | 1 |
| [`0xea23ac45b17ff55d45f841aee07c006a62085d7d`](https://etherscan.io/address/0xea23ac45b17ff55d45f841aee07c006a62085d7d) | 0.0000 | 0.6300 | **+0.6300** | 59 | 1 |
| [`0x727b3e0d358d664644e71d3af75d235a6609e5be`](https://etherscan.io/address/0x727b3e0d358d664644e71d3af75d235a6609e5be) | 0.0000 | 0.4170 | **+0.4170** | 23 | 12 |
| [`0x8ffecd1114432d2e779320e4ec199815822d1005`](https://etherscan.io/address/0x8ffecd1114432d2e779320e4ec199815822d1005) | 0.2200 | 0.6000 | **+0.3800** | 4 | 1 |
| [`0x949b82dfc04558bc4d3ca033a1b194915a3a3bee`](https://etherscan.io/address/0x949b82dfc04558bc4d3ca033a1b194915a3a3bee) | 0.1700 | 0.5300 | **+0.3600** | 52 | 2 |
| [`0xfd25f9fc90ffd90f80c31303c6a35ebf69f69b9b`](https://etherscan.io/address/0xfd25f9fc90ffd90f80c31303c6a35ebf69f69b9b) | 0.2200 | 0.5700 | **+0.3500** | 48 | 4 |
| [`0x277e4b7f5dab01c8e4389b930d3bd1c9690ce1e8`](https://etherscan.io/address/0x277e4b7f5dab01c8e4389b930d3bd1c9690ce1e8) | 0.0500 | 0.3514 | **+0.3014** | 9 | 2 |
| [`0xf5c7bcb44ebafc72d46dbc70b717272e19024da4`](https://etherscan.io/address/0xf5c7bcb44ebafc72d46dbc70b717272e19024da4) | 2.7770 | 3.0504 | **+0.2734** | 6 | 3 |
| [`0x016fa53ef77cb36698720592ebfc4f9c71a342fb`](https://etherscan.io/address/0x016fa53ef77cb36698720592ebfc4f9c71a342fb) | 0.0000 | 0.2000 | **+0.2000** | 1 | 1 |
| [`0x7c4401ae98f12ef6de39ae24cf9fc51f80eba16b`](https://etherscan.io/address/0x7c4401ae98f12ef6de39ae24cf9fc51f80eba16b) | 0.2600 | 0.4000 | **+0.1400** | 40 | 2 |
| [`0x478f25e0856aa133f7f9f68f1dab2505b6ef9bd1`](https://etherscan.io/address/0x478f25e0856aa133f7f9f68f1dab2505b6ef9bd1) | 0.0000 | 0.1100 | **+0.1100** | 2 | 1 |
| [`0x5cc0ecb952ae069e1d4eaf3d1d2fe1335364e50d`](https://etherscan.io/address/0x5cc0ecb952ae069e1d4eaf3d1d2fe1335364e50d) | 0.0600 | 0.1600 | **+0.1000** | 16 | 1 |
| [`0xf8d76fa7aae3c25b1818429bb140ae31ab722c32`](https://etherscan.io/address/0xf8d76fa7aae3c25b1818429bb140ae31ab722c32) | 0.0000 | 0.1000 | **+0.1000** | 10 | 1 |
| [`0x7cb57b5a97eabe94205c07890be4c1ad31e486a8`](https://etherscan.io/address/0x7cb57b5a97eabe94205c07890be4c1ad31e486a8) | 0.0200 | 0.1100 | **+0.0900** | 11 | 33 |
| [`0xf9499a4569323dec9568d24b0f1a3226ad1d07b4`](https://etherscan.io/address/0xf9499a4569323dec9568d24b0f1a3226ad1d07b4) | 0.0000 | 0.0900 | **+0.0900** | 9 | 1 |
| [`0xb2390d660dacf30c5007461b4283c02a2a7fa20b`](https://etherscan.io/address/0xb2390d660dacf30c5007461b4283c02a2a7fa20b) | 0.0200 | 0.1022 | **+0.0822** | 6 | 1 |
| [`0xd56c60014ee7039ae10289d605693a60d44feee1`](https://etherscan.io/address/0xd56c60014ee7039ae10289d605693a60d44feee1) | 0.0000 | 0.0810 | **+0.0810** | 8 | 2 |
| [`0x4c0a8f29ad274251fc826ed19d2d34d19cdb1c40`](https://etherscan.io/address/0x4c0a8f29ad274251fc826ed19d2d34d19cdb1c40) | 0.0600 | 0.1310 | **+0.0710** | 7 | 2 |
| [`0xd8f733595f6fa6d63b0f77e75d07d67f7a18d39a`](https://etherscan.io/address/0xd8f733595f6fa6d63b0f77e75d07d67f7a18d39a) | 0.0900 | 0.1511 | **+0.0611** | 14 | 1 |
| [`0xdacc0fd259ce0de2829b38a0765970e7ab65346c`](https://etherscan.io/address/0xdacc0fd259ce0de2829b38a0765970e7ab65346c) | 0.1400 | 0.2000 | **+0.0600** | 20 | 1 |
| [`0xd60e0ff7700329a4fb68b8cfea5214f5a21b30ed`](https://etherscan.io/address/0xd60e0ff7700329a4fb68b8cfea5214f5a21b30ed) | 0.1300 | 0.1900 | **+0.0600** | 19 | 1 |
| [`0x45c2700a0b0e84fffffc74dbe4ca415bc940f93d`](https://etherscan.io/address/0x45c2700a0b0e84fffffc74dbe4ca415bc940f93d) | 0.0500 | 0.1100 | **+0.0600** | 11 | 1 |
| [`0x7777777d56309ea59568e5ec24c1705bdd5eca28`](https://etherscan.io/address/0x7777777d56309ea59568e5ec24c1705bdd5eca28) | 0.0200 | 0.0766 | **+0.0566** | 3 | 1 |
| [`0x473e625076a773dffc877c96b5932b729090c654`](https://etherscan.io/address/0x473e625076a773dffc877c96b5932b729090c654) | 0.0400 | 0.0950 | **+0.0550** | 8 | 1 |
| [`0xa74f89b540810718d3a26d9f5d4ea64bfa653af7`](https://etherscan.io/address/0xa74f89b540810718d3a26d9f5d4ea64bfa653af7) | 0.0500 | 0.1011 | **+0.0511** | 9 | 4 |
| [`0x839395e20bbb182fa440d08f850e6c7a8f6f0780`](https://etherscan.io/address/0x839395e20bbb182fa440d08f850e6c7a8f6f0780) | 0.0000 | 0.0500 | **+0.0500** | 5 | 19 |
| [`0x40eee415be5d9281ddafb9877401cbf773407732`](https://etherscan.io/address/0x40eee415be5d9281ddafb9877401cbf773407732) | 0.0000 | 0.0500 | **+0.0500** | 5 | 1 |
| [`0xfb8dbb0eb9967a71c0df854c2fc372e63e71f453`](https://etherscan.io/address/0xfb8dbb0eb9967a71c0df854c2fc372e63e71f453) | 0.0200 | 0.0700 | **+0.0500** | 7 | 1 |
| [`0x5b204f114f0d49a0a542374d1142ce120d1baada`](https://etherscan.io/address/0x5b204f114f0d49a0a542374d1142ce120d1baada) | 0.0000 | 0.0500 | **+0.0500** | 5 | 1 |
| [`0x2621ea417659ad69bae66af05ebe5788e533e5e7`](https://etherscan.io/address/0x2621ea417659ad69bae66af05ebe5788e533e5e7) | 0.0000 | 0.0400 | **+0.0400** | 4 | 1 |
| [`0x75dc8844b9b1d19ad3197cd41c9eaa1aa6afec04`](https://etherscan.io/address/0x75dc8844b9b1d19ad3197cd41c9eaa1aa6afec04) | 0.0000 | 0.0400 | **+0.0400** | 4 | 2 |
| [`0x633cf2a0637de799c7ed8f75108849f4072f2d74`](https://etherscan.io/address/0x633cf2a0637de799c7ed8f75108849f4072f2d74) | 0.0800 | 0.1200 | **+0.0400** | 12 | 3 |
| [`0x0248d0c89a5a43e7daf9380027c9588964290419`](https://etherscan.io/address/0x0248d0c89a5a43e7daf9380027c9588964290419) | 0.0500 | 0.0900 | **+0.0400** | 9 | 2 |
| [`0x8f212180bf6b8178559a67268502057fb0043dd9`](https://etherscan.io/address/0x8f212180bf6b8178559a67268502057fb0043dd9) | 0.0700 | 0.1100 | **+0.0400** | 11 | 1 |
| [`0xb0843440a10d58cbff2dea87b733dba77410a02f`](https://etherscan.io/address/0xb0843440a10d58cbff2dea87b733dba77410a02f) | 0.0000 | 0.0311 | **+0.0311** | 2 | 2 |
| [`0xb2c16ebfebe1aa9418250ffee1264bbcbf3ad48b`](https://etherscan.io/address/0xb2c16ebfebe1aa9418250ffee1264bbcbf3ad48b) | 0.0200 | 0.0500 | **+0.0300** | 5 | 1 |
| [`0x84d96968235a6a60d4f7bfaa77112bcf02e739ca`](https://etherscan.io/address/0x84d96968235a6a60d4f7bfaa77112bcf02e739ca) | 0.0200 | 0.0500 | **+0.0300** | 5 | 1 |
| [`0x568bf2922c1f08c47557abd86dc3490987ec87cc`](https://etherscan.io/address/0x568bf2922c1f08c47557abd86dc3490987ec87cc) | 0.0000 | 0.0300 | **+0.0300** | 3 | 1 |
| [`0xe2eb4e5418e8d1f90b474318b83034a15fae409f`](https://etherscan.io/address/0xe2eb4e5418e8d1f90b474318b83034a15fae409f) | 0.0000 | 0.0300 | **+0.0300** | 3 | 1 |
| [`0x41242bf2d454fd68391eeefd7a43c42439db5d8e`](https://etherscan.io/address/0x41242bf2d454fd68391eeefd7a43c42439db5d8e) | 0.0000 | 0.0300 | **+0.0300** | 3 | 8 |
| [`0x8450dc9630511500be6bc9c44f928444b3919231`](https://etherscan.io/address/0x8450dc9630511500be6bc9c44f928444b3919231) | 0.0100 | 0.0400 | **+0.0300** | 4 | 1 |
| [`0x2e3a5f60a5590959b068587c47e643e18e7f5cdf`](https://etherscan.io/address/0x2e3a5f60a5590959b068587c47e643e18e7f5cdf) | 0.0100 | 0.0400 | **+0.0300** | 4 | 2 |
| [`0x670e9bf3aa6a024249d0bac4a608eba05c21fbd4`](https://etherscan.io/address/0x670e9bf3aa6a024249d0bac4a608eba05c21fbd4) | 0.0300 | 0.0600 | **+0.0300** | 6 | 2 |
| [`0x5d7818bc4f18dbb39044ddbf5d829b00c6eabc5b`](https://etherscan.io/address/0x5d7818bc4f18dbb39044ddbf5d829b00c6eabc5b) | 0.0300 | 0.0500 | **+0.0200** | 5 | 1 |
| [`0x1e883e097834df2b5dbc12406375a7d1460a01d8`](https://etherscan.io/address/0x1e883e097834df2b5dbc12406375a7d1460a01d8) | 0.0500 | 0.0700 | **+0.0200** | 7 | 1 |
| [`0x01bdb7ada61c82e951b9ed9f0d312dc9af0ba0f2`](https://etherscan.io/address/0x01bdb7ada61c82e951b9ed9f0d312dc9af0ba0f2) | 0.0300 | 0.0500 | **+0.0200** | 5 | 1 |
| [`0xa00e47c8fbe274ab3c24b08081d661c8536bc80c`](https://etherscan.io/address/0xa00e47c8fbe274ab3c24b08081d661c8536bc80c) | 0.0000 | 0.0200 | **+0.0200** | 2 | 2 |
| [`0x8f646c5c215be6e0163f02bd2eb97afc2df70e5c`](https://etherscan.io/address/0x8f646c5c215be6e0163f02bd2eb97afc2df70e5c) | 0.0000 | 0.0200 | **+0.0200** | 2 | 6 |
| [`0x80658e3657882cfa73fff0eb20c92aa5e948230c`](https://etherscan.io/address/0x80658e3657882cfa73fff0eb20c92aa5e948230c) | 0.0000 | 0.0200 | **+0.0200** | 2 | 1 |
| [`0x6c1bf1c8c896c5a3f313e5b80b14ac0604b09b31`](https://etherscan.io/address/0x6c1bf1c8c896c5a3f313e5b80b14ac0604b09b31) | 0.0000 | 0.0200 | **+0.0200** | 2 | 1 |
| [`0x2a9eaf324a8ae647a7e79edb723e8d9e5d02bb35`](https://etherscan.io/address/0x2a9eaf324a8ae647a7e79edb723e8d9e5d02bb35) | 0.0000 | 0.0200 | **+0.0200** | 2 | 2 |
| [`0x668788a51146f4e48bf80f93084352dba3629e42`](https://etherscan.io/address/0x668788a51146f4e48bf80f93084352dba3629e42) | 0.0600 | 0.0800 | **+0.0200** | 8 | 2 |
| [`0xff767de6ad3bf190186c15e943b9842c7c8f0169`](https://etherscan.io/address/0xff767de6ad3bf190186c15e943b9842c7c8f0169) | 0.0100 | 0.0300 | **+0.0200** | 3 | 1 |
| [`0x84e4edb1fcf4a24e6fc6fff91c387dd05d2ebc9e`](https://etherscan.io/address/0x84e4edb1fcf4a24e6fc6fff91c387dd05d2ebc9e) | 0.0400 | 0.0600 | **+0.0200** | 6 | 2 |
| [`0xec65bfc11fd5d88d66bb07ad6d7071d623120299`](https://etherscan.io/address/0xec65bfc11fd5d88d66bb07ad6d7071d623120299) | 0.0100 | 0.0300 | **+0.0200** | 3 | 2 |
| [`0x458f14497244e14f27aa4acfbce267246970049e`](https://etherscan.io/address/0x458f14497244e14f27aa4acfbce267246970049e) | 0.0000 | 0.0110 | **+0.0110** | 1 | 1 |
| [`0x00f2aaa26fa8a6aada2afa7f545b141c8aca983f`](https://etherscan.io/address/0x00f2aaa26fa8a6aada2afa7f545b141c8aca983f) | 2.9500 | 2.9600 | **+0.0100** | 3 | 1 |
| [`0x006d0f31a00e1f9c017ab039e9d0ba699433a28c`](https://etherscan.io/address/0x006d0f31a00e1f9c017ab039e9d0ba699433a28c) | 0.0300 | 0.0400 | **+0.0100** | 4 | 1 |
| [`0xdfee8dc240c6cadc2c7f7f9c257c259914dea84e`](https://etherscan.io/address/0xdfee8dc240c6cadc2c7f7f9c257c259914dea84e) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0xd8da6bf26964af9d7eed9e03e53415d37aa96045`](https://etherscan.io/address/0xd8da6bf26964af9d7eed9e03e53415d37aa96045) | 0.0000 | 0.0100 | **+0.0100** | 1 | 228 |
| [`0xb3397a6feedff2b9fce9ca1086cb1bdd617c16bf`](https://etherscan.io/address/0xb3397a6feedff2b9fce9ca1086cb1bdd617c16bf) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x077904eb39fdfee17679356987beb89c7b26e5b8`](https://etherscan.io/address/0x077904eb39fdfee17679356987beb89c7b26e5b8) | 0.0000 | 0.0100 | **+0.0100** | 1 | 6 |
| [`0xafd69f00040b3486976e522e5e53ed3ca34c0fc1`](https://etherscan.io/address/0xafd69f00040b3486976e522e5e53ed3ca34c0fc1) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0xac4a5d98736fb12a3423edb7a8719dace80e6d1a`](https://etherscan.io/address/0xac4a5d98736fb12a3423edb7a8719dace80e6d1a) | 0.0100 | 0.0200 | **+0.0100** | 2 | 1 |
| [`0x839ea851397707c4e44bc06f68a540d388298c3d`](https://etherscan.io/address/0x839ea851397707c4e44bc06f68a540d388298c3d) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x559f76f4a5dd94aa0df139564d5570f698a1575d`](https://etherscan.io/address/0x559f76f4a5dd94aa0df139564d5570f698a1575d) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x3782f5bd5fe4d153106981c6834f7bb6d74b5e2e`](https://etherscan.io/address/0x3782f5bd5fe4d153106981c6834f7bb6d74b5e2e) | 0.0000 | 0.0100 | **+0.0100** | 1 | 5 |
| [`0xe70d73c76ff3b4388ee9c58747f0eaa06c6b645b`](https://etherscan.io/address/0xe70d73c76ff3b4388ee9c58747f0eaa06c6b645b) | 0.0100 | 0.0200 | **+0.0100** | 2 | 1 |
| [`0x62e966aedbc1bb80dfe146fced6ce0fd0d02dfd2`](https://etherscan.io/address/0x62e966aedbc1bb80dfe146fced6ce0fd0d02dfd2) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x93100d1707d4824eece2df656907780da1e0e049`](https://etherscan.io/address/0x93100d1707d4824eece2df656907780da1e0e049) | 0.0100 | 0.0200 | **+0.0100** | 2 | 1 |
| [`0x8628d84189a334d8baf14f8ef0dc1d81c96b0a44`](https://etherscan.io/address/0x8628d84189a334d8baf14f8ef0dc1d81c96b0a44) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0xc8d65a3927db7f66479de8642ecfb3a7ffab3fbc`](https://etherscan.io/address/0xc8d65a3927db7f66479de8642ecfb3a7ffab3fbc) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x486a28815a35a637e3f668783fb8538af1a4459f`](https://etherscan.io/address/0x486a28815a35a637e3f668783fb8538af1a4459f) | 0.0100 | 0.0200 | **+0.0100** | 2 | 3 |
| [`0xa7f3659c53820346176f7e0e350780df304db179`](https://etherscan.io/address/0xa7f3659c53820346176f7e0e350780df304db179) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x1ff808e34e4df60326a3fc4c2b0f80748a3d60c2`](https://etherscan.io/address/0x1ff808e34e4df60326a3fc4c2b0f80748a3d60c2) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0xe7e9071aa0e36931b8da3f953dc20a81ed68111e`](https://etherscan.io/address/0xe7e9071aa0e36931b8da3f953dc20a81ed68111e) | 0.0000 | 0.0100 | **+0.0100** | 1 | 3 |
| [`0x5b4fd404c33190d8d58a42e8714c773def75d7f0`](https://etherscan.io/address/0x5b4fd404c33190d8d58a42e8714c773def75d7f0) | 0.0000 | 0.0100 | **+0.0100** | 1 | 4 |
| [`0xd42bd417c8e5042efe018f9bc49e28807a3d4b1f`](https://etherscan.io/address/0xd42bd417c8e5042efe018f9bc49e28807a3d4b1f) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0xa57527ac61455f07c668f048ca2ce18d339fb852`](https://etherscan.io/address/0xa57527ac61455f07c668f048ca2ce18d339fb852) | 0.0000 | 0.0100 | **+0.0100** | 1 | 6 |
| [`0xfc5191a7c99ec879f96c28b7f4343d8e443382ec`](https://etherscan.io/address/0xfc5191a7c99ec879f96c28b7f4343d8e443382ec) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0xc89e10b80fc2a9d88df4a88c021cd3ffcc1004fd`](https://etherscan.io/address/0xc89e10b80fc2a9d88df4a88c021cd3ffcc1004fd) | 0.0000 | 0.0100 | **+0.0100** | 1 | 2 |
| [`0x2fa91c8d363baa48be6eb959976e7831dadb8a3c`](https://etherscan.io/address/0x2fa91c8d363baa48be6eb959976e7831dadb8a3c) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x750361a7caee4790f3d5a5c8e9de245ebc01703d`](https://etherscan.io/address/0x750361a7caee4790f3d5a5c8e9de245ebc01703d) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x26fa93b4c9145d2bf71e642b2eae75c8a506d751`](https://etherscan.io/address/0x26fa93b4c9145d2bf71e642b2eae75c8a506d751) | 0.0000 | 0.0100 | **+0.0100** | 1 | 1 |
| [`0x55a5f913ae82c43f1d63f338a304a0d1af0f3ac0`](https://etherscan.io/address/0x55a5f913ae82c43f1d63f338a304a0d1af0f3ac0) | 0.0200 | 0.0300 | **+0.0100** | 3 | 4 |
