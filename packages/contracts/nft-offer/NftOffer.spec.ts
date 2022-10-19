import { Builder, CellMessage, CommonMessageInfo, ExternalMessage, InternalMessage, toNano } from 'ton'
import { NftOfferLocal } from './NftOfferLocal'
import { NftOfferData } from './NftOfferData'
import { isTransferPayload } from '../nft-auction/test-tools'
import { Buffer } from 'buffer'
import { NftOfferCodeCell } from './NftOffer.source'
import { randomAddress } from "../../utils/randomAddress";

const defaultConfig: NftOfferData = {
  isComplete: false,
  createdAt: 9,
  finishAt: 1000,
  marketplaceAddress: randomAddress(),
  nftAddress: randomAddress(),
  offerOwnerAddress: randomAddress(),
  fullPrice: toNano(1),
  marketplaceFactor: 5,
  marketplaceBase: 100,
  marketplaceFeeAddress: randomAddress(),
  royaltyFactor: 3,
  royaltyBase: 100,
  royaltyAddress: randomAddress(),
}

async function setupOffer(cfg?: NftOfferData) {
  const offer = await NftOfferLocal.createFromConfig(cfg ?? defaultConfig)
  await offer.contract.sendInternalMessage(
    new InternalMessage({
      from: defaultConfig.offerOwnerAddress,
      to: offer.address,
      bounce: false,
      value: defaultConfig.fullPrice,
      body: new CommonMessageInfo({
        body: new CellMessage(
          new Builder().storeUint(0, 32).storeBuffer(Buffer.from('offer for ton-ape-1')).endCell()
        ),
      }),
    })
  )
  return offer
}

describe('nft offer', () => {
  it('should return offer info', async () => {
    const offer = await NftOfferLocal.createFromConfig(defaultConfig)
    const res = await offer.getOfferData()

    expect(res.isComplete).toEqual(defaultConfig.isComplete)
    expect(res.createdAt).toEqual(defaultConfig.createdAt)
    expect(res.finishAt).toEqual(defaultConfig.finishAt)
    expect(res.marketplaceAddress.toFriendly()).toEqual(defaultConfig.marketplaceAddress.toFriendly())
    expect(res.nftAddress.toFriendly()).toEqual(defaultConfig.nftAddress.toFriendly())
    expect(res.offerOwnerAddress?.toFriendly()).toEqual(defaultConfig.offerOwnerAddress!.toFriendly())
    expect(res.marketplaceFeeAddress.toFriendly()).toEqual(defaultConfig.marketplaceFeeAddress.toFriendly())
    expect(res.royaltyAddress.toFriendly()).toEqual(defaultConfig.royaltyAddress.toFriendly())
    expect(res.fullPrice.eq(defaultConfig.fullPrice)).toBe(true)
    expect(res.marketplaceFactor.toNumber()).toEqual(defaultConfig.marketplaceFactor)
    expect(res.marketplaceBase.toNumber()).toEqual(defaultConfig.marketplaceBase)
    expect(res.royaltyFactor.toNumber()).toEqual(defaultConfig.royaltyFactor)
    expect(res.royaltyBase.toNumber()).toEqual(defaultConfig.royaltyBase)
  })

  it('return money on nft message', async () => {
    const offer = await setupOffer()

    const offerData = await offer.getOfferData()
    expect(offerData.isComplete).toBeFalsy()

    const nftOwner = randomAddress()
    const msgFromNft = new Builder().storeUint(0x05138d91, 32).storeUint(0, 64).storeAddress(nftOwner)

    const res = await offer.contract.sendInternalMessage(
      new InternalMessage({
        from: defaultConfig.nftAddress,
        to: offer.address,
        bounce: false,
        value: toNano('1'),
        body: new CommonMessageInfo({
          body: new CellMessage(msgFromNft.endCell()),
        }),
      })
    )

    expect(res).toOkExecuted()
    expect(res.actionList).toHasMessage({
      to: defaultConfig.nftAddress,
      check: cell => isTransferPayload(cell, defaultConfig.offerOwnerAddress),
    })
    expect(res.actionList).toHasMessage({
      to: nftOwner,
      value: [defaultConfig.fullPrice.sub(toNano('0.1')), defaultConfig.fullPrice],
    })

    const offerData2 = await offer.getOfferData()
    expect(offerData2.isComplete).toBeTruthy()
  })

  it('save fullPrice on deploy', async () => {
    const offer = await NftOfferLocal.createFromConfig(defaultConfig)

    const res = await offer.contract.sendInternalMessage(
      new InternalMessage({
        from: defaultConfig.offerOwnerAddress,
        to: offer.address,
        bounce: false,
        value: toNano('2'),
        body: new CommonMessageInfo({
          body: new CellMessage(
            new Builder().storeUint(0, 32).storeBuffer(Buffer.from('bit for ton-ape-1')).endCell()
          ),
        }),
      })
    )

    expect(res).toOkExecuted()

    const offerData = await offer.getOfferData()
    expect(offerData.fullPrice.toNumber()).toEqual(toNano('2').toNumber())
  })

  it('return strange nft', async () => {
    const offer = await setupOffer()

    const nftOwner = randomAddress()
    const msgFromNft = new Builder()
      .storeUint(0x05138d91, 32) // ownership_assigned
      .storeUint(0, 64)
      .storeAddress(nftOwner)

    const nftAddress = randomAddress()
    const res = await offer.contract.sendInternalMessage(
      new InternalMessage({
        from: nftAddress,
        to: offer.address,
        bounce: false,
        value: toNano('1'),
        body: new CommonMessageInfo({
          body: new CellMessage(msgFromNft.endCell()),
        }),
      })
    )

    expect(res).toOkExecuted()
    expect(res.actionList).toHasMessage({
      to: nftAddress,
      check: cell => isTransferPayload(cell, nftOwner),
    })
  })

  it('work fine in the world', async () => {
    const offer = await setupOffer()

    const nftOwner = randomAddress()
    const msgFromNft = new Builder()
      .storeUint(0x05138d91, 32) // ownership_assigned
      .storeUint(0, 64)
      .storeAddress(nftOwner)
      .endCell()

    const res = await offer.contract.sendInternalMessage(
      new InternalMessage({
        from: defaultConfig.nftAddress,
        to: offer.address,
        bounce: false,
        value: toNano('1'),
        body: new CommonMessageInfo({
          body: new CellMessage(msgFromNft),
        }),
      })
    )

    expect(res).toOkExecuted()
    expect(res.actionList).toHasMessage({
      to: defaultConfig.nftAddress,
      check: cell => isTransferPayload(cell, defaultConfig.offerOwnerAddress),
    })
    expect(res.actionList).toHasMessage({
      to: nftOwner,
      value: [defaultConfig.fullPrice.sub(toNano('0.1')), defaultConfig.fullPrice.add(toNano('0.1'))],
    })

    // check that after end offer returned any nft
    const res2 = await offer.contract.sendInternalMessage(
      new InternalMessage({
        from: defaultConfig.nftAddress,
        to: offer.address,
        bounce: false,
        value: toNano('1'),
        body: new CommonMessageInfo({
          body: new CellMessage(msgFromNft),
        }),
      })
    )
    expect(res2).toOkExecuted()
    expect(res2.actionList).not.toHasMessage({
      to: defaultConfig.nftAddress,
      check: cell => isTransferPayload(cell, defaultConfig.offerOwnerAddress),
    })
  })

  it('cancelled by user', async () => {
    const offer = await setupOffer()

    const cancelMessage = NftOfferLocal.queries.cancelOfferInternalMessage()
    const res = await offer.contract.sendInternalMessage(
      new InternalMessage({
        from: defaultConfig.offerOwnerAddress,
        to: offer.address,
        bounce: false,
        value: toNano('0'),
        body: new CommonMessageInfo({
          body: new CellMessage(cancelMessage),
        }),
      })
    )
    expect(res).toOkExecuted()
    expect(res.actionList).toHasMessage({
      to: defaultConfig.offerOwnerAddress,
      mode: 128,
    })
    expect(res.actionList).toHaveLength(2) // reserve money and return tx
  })

  it('cancelled by marketplace', async () => {
    const offer = await setupOffer()

    const cancelMessage = NftOfferLocal.queries.cancelOfferByMarketplaceInternalMessage({
      amount: toNano('0.03'),
    })
    const res = await offer.contract.sendInternalMessage(
      new InternalMessage({
        from: defaultConfig.marketplaceAddress,
        to: offer.address,
        bounce: false,
        value: toNano('0'),
        body: new CommonMessageInfo({
          body: new CellMessage(cancelMessage),
        }),
      })
    )
    expect(res).toOkExecuted()
    expect(res.actionList).toHasMessage({
      to: defaultConfig.offerOwnerAddress,
      mode: 128,
    })
    expect(res.actionList).toHasMessage({
      to: defaultConfig.marketplaceAddress,
      value: toNano('0.03'),
    })
  })

  it('cancelled by external', async () => {
    const offer = await setupOffer()
    offer.contract.setC7Config({
      unixtime: Math.floor(Date.now() / 1000),
    })
    const cancel = NftOfferLocal.queries.cancelOfferExternalMessage({ message: 'gg auto cancel' })
    const res = await offer.contract.sendExternalMessage(
      new ExternalMessage({
        to: offer.address,
        body: new CommonMessageInfo({
          body: new CellMessage(cancel),
        }),
      })
    )
    expect(res).toOkExecuted()
    expect(res.actionList).toHasMessage({
      to: defaultConfig.offerOwnerAddress,
      mode: 128,
    })
  })

  it('no reaction on external cancel before finishAt', async () => {
    const finishAt = Math.floor(Date.now() / 1000)
    const offer = await setupOffer({ ...defaultConfig, finishAt })
    offer.contract.setC7Config({
      unixtime: finishAt - 1000,
    })
    const cancel = NftOfferLocal.queries.cancelOfferExternalMessage({ message: 'gg auto cancel' })
    const res = await offer.contract.sendExternalMessage(
      new ExternalMessage({
        to: offer.address,
        body: new CommonMessageInfo({
          body: new CellMessage(cancel),
        }),
      })
    )
    expect(res).not.toOkExecuted()
    expect(res.actionList).not.toHasMessage({
      to: defaultConfig.offerOwnerAddress,
      mode: 128,
    })

    offer.contract.setC7Config({
      unixtime: finishAt + 1,
    })
    const res2 = await offer.contract.sendExternalMessage(
      new ExternalMessage({
        to: offer.address,
        body: new CommonMessageInfo({
          body: new CellMessage(cancel),
        }),
      })
    )
    expect(res2).toOkExecuted()
    expect(res2.actionList).toHasMessage({
      to: defaultConfig.offerOwnerAddress,
      mode: 128,
    })
  })

  it('stored code and func code are equal', async () => {
    const offer = await NftOfferLocal.createFromConfig(defaultConfig)

    const hash1 = offer.contract.codeCell.hash()

    expect(NftOfferCodeCell.hash().toString('hex')).toEqual(hash1.toString('hex'))
  })

  it('increase full price by message from owner', async () => {
    const offer = await setupOffer({ ...defaultConfig })

    const dataBefore = await offer.getOfferData()

    expect(dataBefore.fullPrice.toString()).toEqual(defaultConfig.fullPrice.toString())

    const res = await offer.contract.sendInternalMessage(new InternalMessage({
      from: defaultConfig.offerOwnerAddress,
      to: offer.address,
      bounce: true,
      value: toNano('1.55'),
      body: new CommonMessageInfo({
        body: new CellMessage((new Builder().storeUint(0, 32).endCell())),
      }),
    }))

    expect(res).toOkExecuted()

    const dataAfter = await offer.getOfferData()
    expect(dataAfter.fullPrice.toString()).toEqual(defaultConfig.fullPrice.add(toNano('1.55')).toString())
  })
})
