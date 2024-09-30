8109f6ec59e62b1526db41c554a5ecd6143e00b4# Getgems NFT contracts

This repository is a collection of contracts for TON blockchain used at getgems.io

### Including: 
###۱
- standard NFT, collection, sale & marketplace implementations with tests
- [SBT](sbt.md) implementation with tests
- Getgems marketplace contract with tests
- Getgems sale contract with tests
- Getgems Single-NFT contract with tests
- [NFT Swap](swap.md) contract with tests

### For sale contracts
- marketplace royalty: 5% (marketplaceFeeFactor: 5, marketplaceFeeBase: 100)
- marketplaceFeeAddress: EQCjk1hh952vWaE9bRguFkAhDAL5jj3xj9p0uPWrFBq_GEMS
- marketplaceAddress: EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS

### About EQAIFunA...Q-AR
Любой пользователь может использовать контракт https://tonviewer.com/EQAIFunALREOeQ99syMbO6sSzM_Fa1RsPD5TBoS0qVeKQ-AR для выставления нфт на продажу.
getgems не несет ответственности за пользователей, которые использую его с целью обмана. Для покупки нфт напрямую из блокчейна необходимо проверять код контракта и правильность заполнения данных контракта.

Any user can use the contract https://tonviewer.com/EQAIFunALREOeQ99syMbO6sSzM_Fa1RsPD5TBoS0qVeKQ-AR to put NFTs for sale.
getgems is not responsible for users who use it for the purpose of deception. To purchase NFT directly from the blockchain, you need to check the contract code and the correctness of the contract data.

### Actual sale contracts supported by getgems.io

#### [nft-fixprice-sale-v3r3.fc](packages%2Fcontracts%2Fsources%2Fnft-fixprice-sale-v3r3.fc)
- code hash base64(JCIfpXHlQuBVx3vt/b9SfHr0YM/cfzRMRQeHtM+h600=)
- code hash hex(24221FA571E542E055C77BEDFDBF527C7AF460CFDC7F344C450787B4CFA1EB4D)
- code boc NftFixPriceSaleV3R3CodeBoc [NftFixpriceSaleV3.source.ts:29](packages%2Fcontracts%2Fnft-fixprice-sale-v3%2FNftFixpriceSaleV3.source.ts)
- storage format buildNftFixPriceSaleV3R3DataCell [NftFixpriceSaleV3.data.ts:120](packages%2Fcontracts%2Fnft-fixprice-sale-v3%2FNftFixpriceSaleV3.data.ts)
- example testnet https://testnet.tonviewer.com/EQAPPKyXhe64XiwNNhv3Y1l15v0PWqbOonQDL9s2-8vZPlx9
- example mainnet https://tonviewer.com/EQCUn-X9Uhe1EkNRhHGT-Jx0y5RX5nj7MB9WgHi7c04wYNZw
- contract description (ru): [description-ru.md](packages%2Fcontracts%2Fnft-fixprice-sale-v3%2Fdescription-ru.md)

#### [nft-auction-v3r3.func](packages%2Fcontracts%2Fsources%2Fnft-auction-v3r3%2Fnft-auction-v3r3.func)
- code hash base64(u29ireD+stefqzuK6/CTCvmFU99gCTsgJ/Covxab/Ow=)
- code hash hex(bb6f62ade0feb2d79fab3b8aebf0930af98553df60093b2027f0a8bf169bfcec)
- code boc NftAuctionV3R3CodeBoc [NftAuctionV2.source.ts](packages%2Fcontracts%2Fnft-auction-v2%2FNftAuctionV2.source.ts)
- storage format buildNftAuctionV3R3DataCell [NftAuctionV2.data.ts](packages%2Fcontracts%2Fnft-auction-v2%2FNftAuctionV2.data.ts)
- example testnet https://testnet.tonviewer.com/kQC_fD_gbAgXsuizLU-5usV4sIuRhotmM3DYIUSkBpFYXwAR
- example mainnet https://tonviewer.com/EQCX_PNPUnJ1--3gKTR3jPj9OOJl4iwi132-07Q413vRIqI8
- contract description (ru): [description-ru.md](packages%2Fcontracts%2Fnft-auction-v2%2Fdescription-ru.md)

#### [nft-offer-v1r3.fc](packages%2Fcontracts%2Fsources%2Fnft-offer-v1r3.fc)
- code hash base64(bl1mf6bvqBh8bQKe/UAVYBIy/S42wpHbw0be2rbcgCQ=)
- code hash hex(6E5D667FA6EFA8187C6D029EFD4015601232FD2E36C291DBC346DEDAB6DC8024)
- code boc [NftOffer.source.ts:13](packages%2Fcontracts%2Fnft-offer%2FNftOffer.source.ts)
- storage format [NftOfferData.ts:116](packages%2Fcontracts%2Fnft-offer%2FNftOfferData.ts)
- example mainnet: https://tonviewer.com/EQAPCdspv0uVHTa3ItpR49FlBEaaBKFDz5G8m6fmEyqhyY3J
- example testnet: https://testnet.tonviewer.com/0QCueSxg3HIgAJkuyuGZN3N-b88OxSqpECWdEDn-ns2o0ooo
- contract description (ru): [index-notice-ru.md](packages%2Fcontracts%2Fnft-offer%2Findex-notice-ru.md)

### Deprecated sale contracts

#### [nft-auction-v3r2.func](packages%2Fcontracts%2Fsources%2Fnft-auction-v3r2%2Fnft-auction-v3r2.func)
- code hash base64(G9nFo5v_t6DzQViLXdkrgTqEK_Ze8UEJOCIAzq-Pct8)
- code hash hex(1BD9C5A39BFFB7A0F341588B5DD92B813A842BF65EF14109382200CEAF8F72DF)
- code boc [NftAuctionV2.source.ts:7](packages%2Fcontracts%2Fnft-auction-v2%2FNftAuctionV2.source.t)
- storage format [NftAuctionV2.data.ts:11](packages%2Fcontracts%2Fnft-auction-v2%2FNftAuctionV2.data.ts)
- example https://tonviewer.com/EQDQq1YoQr9P9jNSRalcq6_PJjYSJKrsG5zLuvyVp74aoTp7

#### [nft-fixprice-sale-v3r2.fc](packages%2Fcontracts%2Fsources%2Fnft-fixprice-sale-v3r2.fc)
- code hash base64(3rU7bFdlwebNI4v0e8XoO6WWvcwEsLhM1Qqx5HSgjzE)
- code hash hex(DEB53B6C5765C1E6CD238BF47BC5E83BA596BDCC04B0B84CD50AB1E474A08F31)
- code boc [NftFixpriceSaleV3.source.ts:25](packages%2Fcontracts%2Fnft-fixprice-sale-v3%2FNftFixpriceSaleV3.source.ts)
- storage format [NftFixpriceSaleV3.data.ts:19](packages%2Fcontracts%2Fnft-fixprice-sale-v3%2FNftFixpriceSaleV3.data.ts)
- example https://tonviewer.com/EQDxTK7_BNQ9Vx7c2NENtvQdNlDs92foEzmjuc48vAoCDt86

#### [nft-fixprice-sale-v3.fc](packages%2Fcontracts%2Fsources%2Fnft-fixprice-sale-v3.fc)
- code hash base64(MgUN-sRPZIZrzIbyzZ4TBf6dyts5WcACI3z7CQLUQyM)
- code hash hex(32050DFAC44F64866BCC86F2CD9E1305FE9DCADB3959C002237CFB0902D44323)
- code boc [NftFixpriceSaleV3.source.ts:20](packages%2Fcontracts%2Fnft-fixprice-sale-v3%2FNftFixpriceSaleV3.source.ts)
- storage format [NftFixpriceSaleV3.data.ts:19](packages%2Fcontracts%2Fnft-fixprice-sale-v3%2FNftFixpriceSaleV3.data.ts)
- example https://tonviewer.com/EQDhQQWcxuN8MeEm75pOgT3E2XeIUPAhz1Frmy5oufsXED8m

#### [nft-fixprice-sale-v2.fc](packages%2Fcontracts%2Fsources%2Fnft-fixprice-sale-v2.fc)
- code hash base64(gnj0xSM95vvtyWmvUZNEp6m__FRIVtuphqlcC8-Fcck)
- code hash hex(8278F4C5233DE6FBEDC969AF519344A7A9BFFC544856DBA986A95C0BCF8571C9)
- code boc [NftFixpriceSaleV2.source.ts:10](packages%2Fcontracts%2Fnft-fixprice-sale-v2%2FNftFixpriceSaleV2.source.ts)
- storage format [NftFixpriceSaleV2.data.ts:18](packages%2Fcontracts%2Fnft-fixprice-sale-v2%2FNftFixpriceSaleV2.data.ts)
- example https://tonviewer.com/EQCQJVX5xrOZNo69w6b2SK-D8gTkG8pfEuldIKXM4Kdn2j_U

#### [nft-auction-v2.func](packages%2Fcontracts%2Fsources%2Fnft-auction-v2%2Fnft-auction-v2.func)
- code hash base64(ZmiHL6eXBUQ__UdSPo6eqfdquZ-aC1nSfej4GhwnudQ)
- code hash hex(6668872FA79705443FFD47523E8E9EA9F76AB99F9A0B59D27DE8F81A1C27B9D4)
- code boc [NftAuctionV2.source.ts:3](packages%2Fcontracts%2Fnft-auction-v2%2FNftAuctionV2.source.t)
- storage format [NftAuctionV2.data.ts:25](packages%2Fcontracts%2Fnft-auction-v2%2FNftAuctionV2.data.ts)
- example https://tonviewer.com/EQAN1LCxXZtfM1kVrBTcEP1KRRlwNmhOcue6w0NXt6O4trU8
0:0816e9c02d110e790f7db3231b3bab12cccfc56b546c3c3e530684b4a9578a43