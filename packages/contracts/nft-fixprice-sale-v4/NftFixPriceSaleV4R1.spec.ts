import { NftFixPriceSaleV4R1CodeHashB64, NftFixPriceSaleV4R1CompileFunction } from './NftFixPriceSaleV4.source'
import { Cell, toNano } from "@ton/core";
import { buildFixPriceV4SaleData, buildNftFixPriceSaleV4R1DeployData } from "./NftFixPriceSaleV4.data";
import { randomAddressCore } from "../../utils/randomAddressCore";
import { NftFixPriceSaleV4 } from "./NftFixPriceSaleV4";
import { Blockchain } from "@ton/sandbox";
import '@ton/test-utils';
import { bufferToInt } from "../../ton/bigint";

describe('fix-price-v4r1', () => {
  // const MARKETPLACE_ADDRESS = randomAddressNew('_MP_ADDR_')
  // const FEE_ADDRESS = randomAddressNew('_FEE_ADDR_')
  // const NFT_ADDRESS = randomAddressNew('_NFT_ADDR_')
  // const OWNER_ADDRESS = randomAddressNew('_OWNER_ADDR_')
  // const ROYALTY_ADDRESS = randomAddressNew('_ROYALTY_')
  // const JETTON_WALLET_ADDRESS = randomAddressNew('_JETTON_')
  // const BUYER_ADDRESS = randomAddressNew('_BUYER_')
  // const JETTON_PRICE = 4040404n
  //
  // const defaultSaleConfig: NftFixPriceSaleV4DR1Data = {
  //   createdAt: now(),
  //   fullTonPrice: 0n,
  //   isComplete: false,
  //   marketplaceAddress: MARKETPLACE_ADDRESS,
  //   marketplaceFeeAddress: FEE_ADDRESS,
  //   marketplaceFeePercent: 0.05,
  //   nftAddress: NFT_ADDRESS,
  //   nftOwnerAddress: OWNER_ADDRESS,
  //   royaltyAddress: ROYALTY_ADDRESS,
  //   royaltyPercent: 0.07,
  //   soldAtTime: 0,
  //   soldQueryId: 0n,
  // }
  //
  // let nftSaleCodeCell: Cell
  //
  // async function getDefaultDeploy(opts?:{
  //   cfg: NftFixPriceSaleV4DR1Data,
  //   jettonPrices: { [key:string]: bigint },
  // }) {
  //   const deploy = await buildNftFixPriceSaleV4R1DeployData({
  //     queryId: 0n,
  //     marketplaceAddress: MARKETPLACE_ADDRESS,
  //     deployerAddress: MARKETPLACE_ADDRESS,
  //     config: opts?.cfg ?? defaultSaleConfig,
  //     codeCell: nftSaleCodeCell,
  //     jettonPrices: opts?.jettonPrices ?? { [JETTON_WALLET_ADDRESS.toString()]: JETTON_PRICE },
  //     jettonWalletAddressResolver: async () => JETTON_WALLET_ADDRESS,
  //   })
  //   const view = new TonContractView(ShardAccount.createBlank())
  //   const res = await view.sendMessage(internalMessageFullOldCell({
  //     from: MARKETPLACE_ADDRESS,
  //     to: deploy.address,
  //     stateInit: deploy.stateInit,
  //     payload: deploy.message,
  //     value: toNano('0.05'),
  //   }))
  //   if (res.exit_code !== 0) {
  //     throw new Error(`Default deploy failed exit code: ${res.exit_code} logs:${res.logs}`)
  //   }
  //   if (res.logs) {
  //     throw new Error(`Default deploy failed exit code: ${res.exit_code} logs:${res.logs}`)
  //   }
  //   return {
  //     deploy,
  //     view,
  //     getSaleDataV4: async () => {
  //       const sale = await NftFixpriceSaleV3Local.createFromContract(view, view.address)
  //       return await sale.getSaleDataV4()
  //     },
  //     assertIsCompete: async () => {
  //       const sale = await NftFixpriceSaleV3Local.createFromContract(view, view.address)
  //       expect({
  //         isComplete: await sale.getSaleDataV4().then(x => x.isComplete),
  //       }).toMatchObject({
  //         isComplete: true,
  //       })
  //     },
  //     cancelSale: async () => {
  //       const cancelMessage = NftFixpriceSaleV3Local.queries.cancelSale({})
  //       const res = await view.sendInternalMessage(internalFullCell({
  //         body: cancelMessage,
  //         value: toNano('0.1'),
  //         src: (opts?.cfg ?? defaultSaleConfig).nftOwnerAddress!,
  //         dest: view.address,
  //       }))
  //       expect(res).toOkExecuted()
  //     },
  //     getBuyTonTransaction: async (buyerAddress:AddressCore, customPrice?: bigint) => {
  //       const sale = await NftFixpriceSaleV3Local.createFromContract(view, view.address)
  //       const saleData = await sale.getSaleDataV4()
  //       const price = saleData.fullPrice + toNano('0.1')
  //       if (saleData.jetton && !customPrice) {
  //         throw new Error('is sale for jetton, cant buy with ton')
  //       }
  //       return view.sendInternalMessage(internalFullCell({
  //         src: buyerAddress,
  //         dest: view.address,
  //         value: customPrice ?? price,
  //       }))
  //     },
  //     getBuyJettonTransaction: async (buyerAddress:AddressCore, customPrice?: bigint) => {
  //       const sale = await NftFixpriceSaleV3Local.createFromContract(view, view.address)
  //       const saleData = await sale.getSaleDataV4()
  //       if (!saleData.jetton && !customPrice) {
  //         throw new Error('is sale is not for jetton')
  //       }
  //       const jettonTransferPayload = fakeJettonNotify(buyerAddress, customPrice ?? saleData.fullPrice)
  //
  //       const buyTx = await view.sendMessage(internalMessageFullOldCell({
  //         from: JETTON_WALLET_ADDRESS,
  //         to: deploy.address,
  //         payload: jettonTransferPayload,
  //         value: toNano('0.26'),
  //       }))
  //       return buyTx
  //     },
  //   }
  // }
  //
  // async function getDefaultTonDeploy(fullPrice: bigint) {
  //   return await getDefaultDeploy({
  //     jettonPrices: {},
  //     cfg: {
  //       ...defaultSaleConfig,
  //       fullTonPrice: fullPrice,
  //     },
  //   })
  // }
  //
  // beforeAll(async () => {
  //   await setupTVMTestContainer()
  //   TvmEmulatorClient.___setupForTestOnly()
  //   const compileCode = await NftFixPriceSaleV4R1CompileFunction()
  //   nftSaleCodeCell = Cell.fromBase64(compileCode.codeBoc)
  // })

  it('code in sourcecode are equal', async () => {
    const freshCode = await NftFixPriceSaleV4R1CompileFunction()
    const nftSaleCodeCell = Cell.fromBase64(freshCode.codeBoc)
    const compiledHash = nftSaleCodeCell.hash().toString('base64')
    expect(compiledHash).toEqual(NftFixPriceSaleV4R1CodeHashB64)
  })

  it('deploy via deployer with jetton', async () => {
    const codeCell = Cell.fromBase64((await NftFixPriceSaleV4R1CompileFunction()).codeBoc)

    const blockchain = await Blockchain.create();
    const userWallet = await blockchain.treasury('userWallet');

    const jettonWallet = randomAddressCore('_JETTON_')
    const jettonMaster = randomAddressCore('_JTN_MASTER_')
    const deployData = await buildNftFixPriceSaleV4R1DeployData({
      codeCell,
      queryId: 0n,
      deployerAddress: userWallet.address,
      marketplaceAddress: randomAddressCore('_MP_'),
      config: buildFixPriceV4SaleData({
        nftAddress: randomAddressCore('_NFT_'),
        nftOwnerAddress: randomAddressCore('_OWNER_'),
        royaltyAddress: randomAddressCore('_ROYALTY_'),
        royaltyPercent: 0.05,
        fullTonPrice: 0n,
      }),
      jettonPrices: {
        [jettonMaster.toString()]: 6000000n,
      },
      jettonWalletAddressResolver: async () => jettonWallet,
    })

    const saleBlank = NftFixPriceSaleV4.createBlack(deployData.address, deployData.stateInit)

    const sale = blockchain.openContract(saleBlank)

    // deploy sale contract
    const res = await sale.sendDeploy(userWallet.getSender(), toNano('0.02'), deployData.message)
    expect(res.transactions).toHaveTransaction({
      to: saleBlank.address,
      success: true,
    })

    // check sale data
    const saleData = await sale.getFixPriceDataV4()
    expect(saleData).toMatchObject({
      isComplete: false,
      soldAt: 0,
      fullPrice: 0n,
      soldQueryId: 0n,
      jettonPriceDict: {
        size: 1,
        get: expect.any(Function),
      },
    })
    const jettonPrice = saleData.jettonPriceDict?.get(bufferToInt(jettonWallet.hash))
    expect({
      ...jettonPrice,
      jettonMaster: jettonPrice?.jettonMaster.toString(),
    }).toMatchObject({
      jettonMaster: jettonMaster.toString(),
      price: 6000000n,
    })

    // buy nft via jetton

  })

  // it('deploy check state', async () => {
  //   const deploy = await buildNftFixPriceSaleV4R1DeployData({
  //     queryId: 0n,
  //     marketplaceAddress: MARKETPLACE_ADDRESS,
  //     deployerAddress: MARKETPLACE_ADDRESS,
  //     config: defaultSaleConfig,
  //     jettonPrices: { [JETTON_WALLET_ADDRESS.toString()]: JETTON_PRICE },
  //     codeCell: nftSaleCodeCell,
  //     jettonWalletAddressResolver: async () => JETTON_WALLET_ADDRESS,
  //   })
  //   const view = new TonContractView(ShardAccount.createBlank())
  //   const res = await view.sendMessage(internalMessageFullOldCell({
  //     from: MARKETPLACE_ADDRESS,
  //     to: deploy.address,
  //     stateInit: deploy.stateInit,
  //     payload: deploy.message,
  //     value: toNano('0.05'),
  //   }))
  //   expect(res).toOkExecuted()
  //
  //   const contractDataRaw = parseNftFixPriceSaleV4R1Data(view.dataCell.beginParse())
  //   const isValidSaleData = isValidFixPriceSaleV4DR1Data(contractDataRaw)
  //   expect(isValidSaleData).toEqual(true)
  //   expect({
  //     ...contractDataRaw,
  //     marketplaceAddress: contractDataRaw.marketplaceAddress?.toString(),
  //     marketplaceFeeAddress: contractDataRaw.marketplaceFeeAddress?.toString(),
  //     nftAddress: contractDataRaw.nftAddress?.toString(),
  //     nftOwnerAddress: contractDataRaw.nftOwnerAddress?.toString(),
  //     royaltyAddress: contractDataRaw.royaltyAddress?.toString(),
  //     jettonPriceLen: contractDataRaw.jettonPrice.size,
  //     jettonPrice: contractDataRaw.jettonPrice.get(bufferToInt(JETTON_WALLET_ADDRESS.hash)),
  //   }).toMatchObject({
  //     createdAt: defaultSaleConfig.createdAt,
  //     fullTonPrice: defaultSaleConfig.fullTonPrice,
  //     isComplete: false,
  //     marketplaceAddress: MARKETPLACE_ADDRESS.toString(),
  //     marketplaceFeeAddress: FEE_ADDRESS.toString(),
  //     marketplaceFeePercent: defaultSaleConfig.marketplaceFeePercent,
  //     nftAddress: NFT_ADDRESS.toString(),
  //     nftOwnerAddress: OWNER_ADDRESS.toString(),
  //     royaltyAddress: ROYALTY_ADDRESS.toString(),
  //     royaltyPercent: defaultSaleConfig.royaltyPercent,
  //     soldAtTime: 0,
  //     soldQueryId: 0n,
  //     jettonPriceLen: 1,
  //     jettonPrice: {
  //       // jettonMaster: JETTON_WALLET_ADDRESS,
  //       price: 4040404n,
  //     },
  //   })
  // })
  //
  // it('sale for jetton', async () => {
  //   const { view, deploy, getSaleDataV4 } = await getDefaultDeploy()
  //
  //   const jettonTransferPayload = fakeJettonNotify(BUYER_ADDRESS, JETTON_PRICE)
  //
  //   const buyTx = await view.sendMessage(internalMessageFullOldCell({
  //     from: JETTON_WALLET_ADDRESS,
  //     to: deploy.address,
  //     payload: jettonTransferPayload,
  //     value: toNano('0.26'),
  //   }))
  //   expect(buyTx).toOkExecuted()
  //
  //   expect(buyTx.actionList).toHasMessage({
  //     to: NFT_ADDRESS,
  //   })
  //   expect(buyTx.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(OWNER_ADDRESS, 3555556n),
  //   })
  //   expect(buyTx.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(ROYALTY_ADDRESS, 282828n),
  //   })
  //   expect(buyTx.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(FEE_ADDRESS, 202020n),
  //   })
  //
  //   const saleData = await getSaleDataV4()
  //   expect({
  //     isComplete: saleData.isComplete,
  //     mpAddress: saleData.marketplaceAddress.toString(),
  //   }).toMatchObject({
  //     isComplete: true,
  //     mpAddress: MARKETPLACE_ADDRESS.toString(),
  //   })
  // })
  //
  // it('get get_sale_data_v4', async () => {
  //   const x = await getDefaultDeploy()
  //   const sale = await NftFixpriceSaleV3Local.createFromContract(x.view, x.view.address)
  //   const saleData = await sale.getSaleDataV4()
  //   expect({
  //     ...saleData,
  //     jetton: saleData.jetton
  //       ? {
  //         wallet: saleData.jetton.wallet.toString(),
  //         master: saleData.jetton.master.toString(),
  //       }
  //       : null,
  //   }).toMatchObject({
  //     createdAt: defaultSaleConfig.createdAt,
  //     fullPrice: JETTON_PRICE,
  //     jetton: {
  //       wallet: JETTON_WALLET_ADDRESS.toString(),
  //       master: JETTON_WALLET_ADDRESS.toString(),
  //     },
  //     isComplete: false,
  //     marketplaceFee: 202020n,
  //     marketplaceFeePercent: defaultSaleConfig.marketplaceFeePercent,
  //     soldAt: 0,
  //     soldQueryId: 0n,
  //     royaltyPercent: defaultSaleConfig.royaltyPercent,
  //     royaltyAmount: 282828n,
  //   })
  // })
  //
  // it('cancel sale form owner', async () => {
  //   const x = await getDefaultDeploy()
  //   const cancelMessage = NftFixpriceSaleV3Local.queries.cancelSale({})
  //   const res = await x.view.sendInternalMessage(internalFullCell({
  //     body: cancelMessage,
  //     value: toNano('0.1'),
  //     src: OWNER_ADDRESS,
  //     dest: x.view.address,
  //   }))
  //   expect(res).toOkExecuted()
  //   expect(res.actionList).toHasMessage({
  //     to: NFT_ADDRESS,
  //     check: m => isTransferPayload(m, OWNER_ADDRESS),
  //   })
  //   const sale = await NftFixpriceSaleV3Local.createFromContract(x.view, x.view.address)
  //   const saleData = await sale.getSaleDataV4()
  //   expect(saleData).toMatchObject({
  //     isComplete: true,
  //     soldAt: 0,
  //     soldQueryId: 0n,
  //   })
  // })
  //
  // it('cancel sale form market', async () => {
  //   const x = await getDefaultDeploy()
  //   const cancelMessage = NftFixpriceSaleV3Local.queries.cancelSale({})
  //   const res = await x.view.sendInternalMessage(internalFullCell({
  //     body: cancelMessage,
  //     value: toNano('0.1'),
  //     src: MARKETPLACE_ADDRESS,
  //     dest: x.view.address,
  //   }))
  //   expect(res).toOkExecuted()
  //   expect(res.actionList).toHasMessage({
  //     to: NFT_ADDRESS,
  //     check: m => isTransferPayload(m, OWNER_ADDRESS, undefined, MARKETPLACE_ADDRESS),
  //   })
  //   const sale = await NftFixpriceSaleV3Local.createFromContract(x.view, x.view.address)
  //   const saleData = await sale.getSaleDataV4()
  //   expect(saleData).toMatchObject({
  //     isComplete: true,
  //     soldAt: 0,
  //     soldQueryId: 0n,
  //   })
  // })
  //
  // it('cancel sale form stranger', async () => {
  //   const x = await getDefaultDeploy()
  //   const cancelMessage = NftFixpriceSaleV3Local.queries.cancelSale({})
  //   const res = await x.view.sendInternalMessage(internalFullCell({
  //     body: cancelMessage,
  //     value: toNano('0.1'),
  //     src: randomAddressNew(),
  //     dest: x.view.address,
  //   }))
  //   expect(res).toOkExecuted(458)
  // })
  //
  // it('change price ton owner', async () => {
  //   const x = await getDefaultDeploy()
  //   const sale = await NftFixpriceSaleV3Local.createFromContract(x.view, x.view.address)
  //   const oldTonPrice = await sale.getSaleDataV4().then(x => x.fullPrice)
  //   const changePriceMessage = nftFixPriceV4ChangePriceMessage({
  //     queryId: 0n,
  //     newTonPrice: toNano('501'),
  //     newJettonPrice: null,
  //   })
  //   const res = await x.view.sendInternalMessage(internalFullCell({
  //     body: changePriceMessage,
  //     value: toNano('0.005'),
  //     src: OWNER_ADDRESS,
  //     dest: x.view.address,
  //   }))
  //   expect(res).toOkExecuted()
  //   const newTonPrice = await sale.getSaleDataV4().then(x => x.fullPrice)
  //   expect(newTonPrice).toEqual(toNano('501'))
  //   expect(newTonPrice).not.toEqual(oldTonPrice)
  // })
  // it('change price jetton owner', async () => {
  //   const x = await getDefaultDeploy()
  //   const sale = await NftFixpriceSaleV3Local.createFromContract(x.view, x.view.address)
  //   const oldJettonPrice = await sale.getSaleDataV4().then(x => x.fullPrice)
  //   const changePriceMessage = nftFixPriceV4ChangePriceMessage({
  //     queryId: 0n,
  //     newTonPrice: 0n,
  //     newJettonPrice: await buildJettonPriceDict({
  //       saleAddress: x.view.address,
  //       jettonPrices: { [JETTON_WALLET_ADDRESS.toString()]: toNano('321') },
  //       jettonWalletAddressResolver: async () => JETTON_WALLET_ADDRESS,
  //     }),
  //   })
  //   const res = await x.view.sendInternalMessage(internalFullCell({
  //     body: changePriceMessage,
  //     value: toNano('0.005'),
  //     src: OWNER_ADDRESS,
  //     dest: x.view.address,
  //   }))
  //   expect(res).toOkExecuted()
  //   const saleData = await sale.getSaleDataV4()
  //   const newJettonPrice = saleData.fullPrice
  //   expect(newJettonPrice).toEqual(toNano('321'))
  //   expect(newJettonPrice).not.toEqual(oldJettonPrice)
  //   expect(saleData.jetton?.master.toString()).toEqual(JETTON_WALLET_ADDRESS.toString())
  // })
  //
  // it('buy ton after cancel', async () => {
  //   const s = await getDefaultTonDeploy(toNano('5'))
  //   await s.cancelSale()
  //   await s.assertIsCompete()
  //   const res = await s.getBuyTonTransaction(randomAddressNew())
  //   expect(res).toOkExecuted(404)
  // })
  //
  // it('buy jetton after cancel', async () => {
  //   const s = await getDefaultDeploy()
  //   await s.cancelSale()
  //   await s.assertIsCompete()
  //   const buyer = randomAddressNew()
  //   const res = await s.getBuyJettonTransaction(buyer)
  //   expect(res).toOkExecuted()
  //   expect(res.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(buyer, JETTON_PRICE),
  //   })
  // })
  //
  // it('buy ton wrong amount', async () => {
  //   const s = await getDefaultTonDeploy(toNano('9'))
  //   const buyer = randomAddressNew()
  //   const res = await s.getBuyTonTransaction(buyer, toNano('8'))
  //   expect(res).toOkExecuted(450)
  // })
  // it('buy jetton wrong amount', async () => {
  //   const s = await getDefaultDeploy()
  //   const buyer = randomAddressNew()
  //   const res = await s.getBuyJettonTransaction(buyer, 1234n)
  //   expect(res).toOkExecuted()
  //   expect(res.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(buyer, 1234n),
  //   })
  // })
  //
  // it('buy ton zero ton price', async () => {
  //   const s = await getDefaultDeploy()
  //   const buyer = randomAddressNew()
  //   const res = await s.getBuyTonTransaction(buyer, 1234000000000n)
  //   expect(res).toOkExecuted(459)
  // })
  //
  // it('emergency message', async () => {
  //   const s = await getDefaultTonDeploy(toNano('9'))
  //   const buyer = randomAddressNew()
  //   const res = await s.getBuyTonTransaction(buyer)
  //   expect(res).toOkExecuted() // check bought
  //   await s.assertIsCompete()
  //   const msg = NftFixpriceSaleV3Local.queries.proxyMessage({
  //     msg: internalRelaxedCell({
  //       value: toNano('21'),
  //       to: buyer,
  //     }),
  //     mode: 2,
  //   })
  //   const failedAttempt = await s.view.sendInternalMessage(internalFullCell({
  //     dest: s.view.address,
  //     src: MARKETPLACE_ADDRESS,
  //     body: msg,
  //     value: toNano('22'),
  //   }))
  //   expect(failedAttempt).toOkExecuted(406) // to quick, need wait 10 min
  //   s.view.setC7Config({
  //     unixtime: now() + 60 * 10,
  //   })
  //   const okAttempt = await s.view.sendInternalMessage(internalFullCell({
  //     dest: s.view.address,
  //     src: MARKETPLACE_ADDRESS,
  //     body: msg,
  //     value: toNano('22'),
  //   }))
  //   expect(okAttempt).toOkExecuted()
  //   expect(okAttempt.actionList).toHasMessage({
  //     to: buyer,
  //     value: toNano('21'),
  //   })
  // })
  //
  // it('init by nft notify TON', async () => {
  //   const sale = await getDefaultDeploy({
  //     jettonPrices: {},
  //     cfg: {
  //       ...defaultSaleConfig,
  //       fullTonPrice: toNano('10'),
  //       nftOwnerAddress: null,
  //     },
  //   })
  //   const saleDataBefore = await sale.getSaleDataV4()
  //   expect(saleDataBefore.nftOwnerAddress).toEqual(null)
  //   const buyBeforeInit = await sale.getBuyTonTransaction(randomAddressNew())
  //   expect(buyBeforeInit).toOkExecuted(500)
  //
  //   const nftOwner = randomAddressNew()
  //   const res = await sale.view.sendInternalMessage(internalFullCell({
  //     src: NFT_ADDRESS,
  //     dest: sale.view.address,
  //     value: toNano('0.02'),
  //     body: beginCellCore()
  //       .storeUint(NftOpOwnershipAssigned, 32) // ownership_assigned
  //       .storeUint(0, 64) // query_id
  //       .storeAddress(nftOwner)
  //       .endCell(),
  //   }))
  //   expect(res).toOkExecuted()
  //   const saleDataAfter = await sale.getSaleDataV4()
  //   expect(saleDataAfter.nftOwnerAddress?.toString()).toEqual(nftOwner.toString())
  //
  //   const buyer = randomAddressNew()
  //   const buyAttempt = await sale.getBuyTonTransaction(buyer)
  //   expect(buyAttempt).toOkExecuted()
  //
  //   expect(buyAttempt.actionList).toHasMessage({
  //     to: NFT_ADDRESS,
  //     check: c => isTransferPayload(c, buyer),
  //     mode: 130,
  //   })
  //   expect(buyAttempt.actionList).toHasMessage({
  //     to: nftOwner,
  //     value: toNano('8.8'),
  //   })
  //   expect(buyAttempt.actionList).toHasMessage({
  //     to: FEE_ADDRESS,
  //     value: toNano('0.5'),
  //   })
  //   expect(buyAttempt.actionList).toHasMessage({
  //     to: ROYALTY_ADDRESS,
  //     value: toNano('0.7'),
  //   })
  //   await sale.assertIsCompete()
  // })
  //
  // it('init by nft notify JETTON', async () => {
  //   const sale = await getDefaultDeploy({
  //     jettonPrices: { [JETTON_WALLET_ADDRESS.toString()]: JETTON_PRICE },
  //     cfg: {
  //       ...defaultSaleConfig,
  //       nftOwnerAddress: null,
  //     },
  //   })
  //   const saleDataBefore = await sale.getSaleDataV4()
  //   expect(saleDataBefore.nftOwnerAddress).toEqual(null)
  //   const b1 = randomAddressNew()
  //   const buyBeforeInit = await sale.getBuyJettonTransaction(b1)
  //   expect(buyBeforeInit).toOkExecuted()
  //   expect(buyBeforeInit.actionList).toHaveLength(1)
  //   expect(buyBeforeInit.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(b1, JETTON_PRICE),
  //   })
  //
  //   const nftOwner = randomAddressNew()
  //   const res = await sale.view.sendInternalMessage(internalFullCell({
  //     src: NFT_ADDRESS,
  //     dest: sale.view.address,
  //     value: toNano('0.02'),
  //     body: beginCellCore()
  //       .storeUint(NftOpOwnershipAssigned, 32) // ownership_assigned
  //       .storeUint(0, 64) // query_id
  //       .storeAddress(nftOwner)
  //       .endCell(),
  //   }))
  //   expect(res).toOkExecuted()
  //   const saleDataAfter = await sale.getSaleDataV4()
  //   expect(saleDataAfter.nftOwnerAddress?.toString()).toEqual(nftOwner.toString())
  //
  //   const buyer = randomAddressNew()
  //   const buyAttempt = await sale.getBuyJettonTransaction(buyer)
  //   expect(buyAttempt).toOkExecuted()
  //   await sale.assertIsCompete()
  // })
  //
  // it('buy ton with op = 0', async () => {
  //   const s = await getDefaultTonDeploy(toNano('5'))
  //   const buyer = randomAddressNew()
  //   const saleRes = await s.view.sendInternalMessage(internalFullCell({
  //     src: buyer,
  //     dest: s.view.address,
  //     value: toNano('5.2'),
  //   }))
  //   expect(saleRes).toOkExecuted()
  //
  //   const sale = await NftFixpriceSaleV3Local.createFromContract(s.view, s.view.address)
  //   const saleData = await sale.getSaleDataV4()
  //   expect(saleData.soldAt).toBeGreaterThanOrEqual(now() - 1)
  //   expect({
  //     isComplete: saleData.isComplete,
  //     fullPrice: saleData.fullPrice,
  //     jetton: saleData.jetton,
  //   }).toMatchObject({
  //     jetton: null,
  //     fullPrice: toNano('5'),
  //     isComplete: true,
  //   })
  // })
  // it('buy ton with op = fix_price_v4_buy', async () => {
  //   const s = await getDefaultTonDeploy(toNano('15'))
  //   const buyer = randomAddressNew()
  //   const saleRes = await s.view.sendInternalMessage(internalFullCell({
  //     src: buyer,
  //     dest: s.view.address,
  //     value: toNano('15.1'),
  //     body: NftFixpriceSaleV3Local.queries.buyMessage({
  //       queryId: 3456n,
  //     }),
  //   }))
  //   expect(saleRes).toOkExecuted()
  //
  //   const sale = await NftFixpriceSaleV3Local.createFromContract(s.view, s.view.address)
  //   const saleData = await sale.getSaleDataV4()
  //   expect(saleData.soldAt).toBeGreaterThanOrEqual(now() - 1)
  //   expect({
  //     isComplete: saleData.isComplete,
  //     fullPrice: saleData.fullPrice,
  //     jetton: saleData.jetton,
  //     soldQueryId: saleData.soldQueryId,
  //   }).toMatchObject({
  //     jetton: null,
  //     fullPrice: toNano('15'),
  //     isComplete: true,
  //     soldQueryId: 3456n,
  //   })
  // })
  //
  // it('random message', async () => {
  //   const x = await getDefaultDeploy()
  //   const res = await x.view.sendInternalMessage(internalFullCell({
  //     body: beginCellCore().storeAddress(randomAddressNew()).endCell(),
  //     value: toNano('0.1'),
  //     src: OWNER_ADDRESS,
  //     dest: x.view.address,
  //   }))
  //   expect(res).toOkExecuted(0xffff)
  // })
  //
  // it('bounce message', async () => {
  //   const x = await getDefaultDeploy()
  //   const srcAddress = randomAddressNew()
  //   const res = await x.view.sendInternalMessage(internalFullCell({
  //     body: beginCellCore().storeAddress(randomAddressNew()).endCell(),
  //     value: toNano('0.1'),
  //     src: srcAddress,
  //     dest: x.view.address,
  //     bounced: true,
  //   }))
  //   expect(res).toOkExecuted()
  //   expect(res.actionList).toHaveLength(0)
  // })
  //
  // it('jetton buy for ton sale', async () => {
  //   const sale = await getDefaultTonDeploy(toNano('2'))
  //   const b1 = randomAddressNew()
  //   const tx = await sale.getBuyJettonTransaction(b1, toNano('1'))
  //   expect(tx).toOkExecuted()
  //   expect(tx.actionList).toHaveLength(1)
  //   expect(tx.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(b1, toNano('1')),
  //   })
  // })
  //
  // it('broken static cell', async () => {
  //   const jettonPriceDict = await buildJettonPriceDict({
  //     saleAddress: randomAddressNew(),
  //     jettonPrices: { [JETTON_WALLET_ADDRESS.toString()]: toNano('121') },
  //     jettonWalletAddressResolver: async () => JETTON_WALLET_ADDRESS,
  //   })
  //
  //   const dataCell = beginCell()
  //     .storeBit(defaultSaleConfig.isComplete)
  //     .storeAddress(defaultSaleConfig.marketplaceAddress)
  //     .storeAddress(defaultSaleConfig.nftOwnerAddress)
  //     .storeCoins(defaultSaleConfig.fullTonPrice)
  //     .storeUint(defaultSaleConfig.soldAtTime, 32)
  //     .storeUint(defaultSaleConfig.soldQueryId, 64)
  //     .storeRef(beginCell()
  //       .storeAddress(defaultSaleConfig.marketplaceFeeAddress)
  //       .storeAddress(defaultSaleConfig.royaltyAddress)
  //       .endCell())
  //     .storeDict(jettonPriceDict) // empty jetton dict
  //     .storeMaybeBuffer(null)
  //     .endCell()
  //
  //   const si: StateInit = {
  //     code: nftSaleCodeCell,
  //     data: dataCell,
  //   }
  //   const saleAddress = contractAddress(0, si)
  //   const view = new TonContractView(ShardAccount.createFromState(saleAddress, {
  //     balance: toNano('0.02'),
  //     code: nftSaleCodeCell.toBoc({ idx: false }),
  //     data: dataCell.toBoc({ idx: false }),
  //     state: 'active',
  //     lastTransaction: null,
  //     blockId: { workchain: 1, shard: '', seqno: 1 },
  //   }))
  //
  //   const buyerAddress = randomAddressNew()
  //   const jettonTransferPayload = fakeJettonNotify(buyerAddress, toNano('121'))
  //   const buy = await view.sendInternalMessage(internalFullCell({
  //     src: JETTON_WALLET_ADDRESS,
  //     dest: saleAddress,
  //     value: toNano('1'),
  //     body: jettonTransferPayload,
  //   }))
  //   expect(buy).toOkExecuted()
  //   expect(buy.actionList).toHaveLength(1)
  //   expect(buy.actionList).toHasMessage({
  //     to: JETTON_WALLET_ADDRESS,
  //     check: isInternalJettonTransfer(buyerAddress, toNano('121')),
  //   })
  // })
  //
  // it('wrong wc fee address', async () => {
  //   const sale = await getDefaultDeploy({
  //     jettonPrices: {},
  //     cfg: {
  //       ...defaultSaleConfig,
  //       fullTonPrice: toNano('3'),
  //       marketplaceFeeAddress: AddressCore.toNew(fakeAddressFromInt64('FEE', 2n)),
  //       royaltyAddress: AddressCore.toNew(fakeAddressFromInt64('FEE', 1n)),
  //       nftOwnerAddress: AddressCore.toNew(fakeAddressFromInt64('FEE', 3n)),
  //     },
  //   })
  //   const b1 = randomAddressNew()
  //   const tx = await sale.view.sendInternalMessage(internalFullCell({
  //     src: b1,
  //     dest: sale.view.address,
  //     value: toNano('3.1'),
  //   }))
  //   expect(tx.actionList).toHasMessage({
  //     to: NFT_ADDRESS,
  //     check: c => isTransferPayload(c, b1),
  //   })
  // })
})
