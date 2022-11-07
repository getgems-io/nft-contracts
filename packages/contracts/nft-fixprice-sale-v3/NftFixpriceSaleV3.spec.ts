import { Builder, Cell, CellMessage, CommonMessageInfo, ExternalMessage, InternalMessage, toNano } from 'ton'
import { NftFixPriceSaleV3Data } from './NftFixpriceSaleV3.data'
import { NftFixpriceSaleV3Local } from './NftFixpriceSaleV3Local'
import BN from 'bn.js'
import { randomAddress } from "../../utils/randomAddress";

const defaultConfig: NftFixPriceSaleV3Data = {
  isComplete: false,
  createdAt: 0,
  marketplaceAddress: randomAddress(),
  nftAddress: randomAddress(),
  nftOwnerAddress: randomAddress(),
  fullPrice: toNano(1),
  marketplaceFee: toNano('0.03'),
  marketplaceFeeAddress: randomAddress(),
  royaltyAmount: toNano('0.04'),
  royaltyAddress: randomAddress(),
}

describe.skip('fix price sell contract v3', () => {
  it('should return sale info', async () => {
    const sale = await NftFixpriceSaleV3Local.createFromConfig(defaultConfig)
    const res = await sale.getSaleData()

    expect(res.isComplete).toEqual(defaultConfig.isComplete)
    expect(res.createdAt).toEqual(defaultConfig.createdAt)
    expect(res.marketplaceAddress.toFriendly()).toEqual(defaultConfig.marketplaceAddress.toFriendly())
    expect(res.nftAddress.toFriendly()).toEqual(defaultConfig.nftAddress.toFriendly())
    expect(res.nftOwnerAddress?.toFriendly()).toEqual(defaultConfig.nftOwnerAddress!.toFriendly())
    expect(res.marketplaceFeeAddress.toFriendly()).toEqual(defaultConfig.marketplaceFeeAddress.toFriendly())
    expect(res.royaltyAddress.toFriendly()).toEqual(defaultConfig.royaltyAddress.toFriendly())
    expect(res.fullPrice.eq(defaultConfig.fullPrice)).toBe(true)
    expect(res.marketplaceFee.eq(defaultConfig.marketplaceFee)).toBe(true)
    expect(res.royaltyAmount.eq(defaultConfig.royaltyAmount)).toBe(true)
  })

  it('should accept deploy only from marketplace', async () => {
    // Nft owner address is null after deploy
    const conf: NftFixPriceSaleV3Data = {
      ...defaultConfig,
      nftOwnerAddress: null,
    }
    const sale = await NftFixpriceSaleV3Local.createFromConfig(conf)

    let res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: conf.marketplaceAddress,
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)

    // Should fail if it's not from marketplace
    res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: randomAddress(),
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).not.toEqual(0)
  })

  it('should accept init message only from NFT', async () => {
    // Nft owner address is null after deploy
    const conf: NftFixPriceSaleV3Data = {
      ...defaultConfig,
      nftOwnerAddress: null,
    }
    const prevOwner = randomAddress()
    let sale = await NftFixpriceSaleV3Local.createFromConfig(conf)

    const nftOwnershipAssignedCell = new Cell()
    nftOwnershipAssignedCell.bits.writeUint(0x05138d91, 32) // ownership_assigned
    nftOwnershipAssignedCell.bits.writeUint(0, 64) // query_id
    nftOwnershipAssignedCell.bits.writeAddress(prevOwner) // prev_owner

    let res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: conf.nftAddress,
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(nftOwnershipAssignedCell),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)

    sale = await NftFixpriceSaleV3Local.createFromConfig(conf)
    // Should fail if message is not from NFT
    res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: randomAddress(),
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(nftOwnershipAssignedCell),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).not.toEqual(0)

    sale = await NftFixpriceSaleV3Local.createFromConfig(conf)
    // Should fail if it's not ownership_assigned callback
    res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: conf.nftAddress,
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    expect(res.type !== 'success').toBe(true)
  })

  it('should initialize after ownership_assigned callback', async () => {
    const conf: NftFixPriceSaleV3Data = {
      ...defaultConfig,
      nftOwnerAddress: null,
    }
    const prevOwner = randomAddress()
    const sale = await NftFixpriceSaleV3Local.createFromConfig(conf)

    const nftOwnershipAssignedCell = new Cell()
    nftOwnershipAssignedCell.bits.writeUint(0x05138d91, 32) // ownership_assigned
    nftOwnershipAssignedCell.bits.writeUint(0, 64) // query_id
    nftOwnershipAssignedCell.bits.writeAddress(prevOwner) // prev_owner

    const res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: conf.nftAddress,
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(nftOwnershipAssignedCell),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)

    const data = await sale.getSaleData()

    expect(data.nftOwnerAddress?.toFriendly()).toEqual(prevOwner.toFriendly())
  })

  it('should accept coins for op=1', async () => {
    const sale = await NftFixpriceSaleV3Local.createFromConfig(defaultConfig)

    const body = new Cell()
    body.bits.writeUint(1, 32) // op
    body.bits.writeUint(0, 64) // query_id

    const res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: randomAddress(),
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(body),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)
  })

  it('should cancel sale', async () => {
    const sale = await NftFixpriceSaleV3Local.createFromConfig(defaultConfig)

    const body = new Cell()
    body.bits.writeUint(3, 32) // op
    body.bits.writeUint(0, 64) // query_id

    let res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: randomAddress(),
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(body),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    // Should fail if sender is not current owner
    expect(res.exit_code).not.toEqual(0)

    res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: defaultConfig.nftOwnerAddress,
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(body),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)

    const data = await sale.getSaleData()
    expect(data.isComplete).toBe(true)
  })

  it('should ignore any message if completed', async () => {
    const conf: NftFixPriceSaleV3Data = {
      ...defaultConfig,
      isComplete: true,
    }
    const sale = await NftFixpriceSaleV3Local.createFromConfig(conf)

    const res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: conf.marketplaceAddress,
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).not.toEqual(0)
  })

  it('should buy nft', async () => {
    const sale = await NftFixpriceSaleV3Local.createFromConfig(defaultConfig)
    const buyerAddress = randomAddress()
    const res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: buyerAddress,
        value: toNano(2),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)

    const data = await sale.getSaleData()
    expect(data.isComplete).toEqual(true)
    const nftTransfer = res.actionList.find(tx => {
      if (tx.type === 'send_msg') {
        if (tx.message.info.type === 'internal') {
          if (tx.message.info.dest?.toFriendly() === defaultConfig.nftAddress.toFriendly()) {
            const slice = tx.message.body.beginParse()
            const op = slice.readUint(32)
            slice.readUint(64) // query_id
            const newOwner = slice.readAddress()
            slice.readAddress() // response address
            slice.readUint(1) // custom payload = 0
            const forward = slice.readCoins() // forward amount
            if (op.eq(new BN(0x5fcc3d14)) && newOwner?.equals(buyerAddress) && forward.gte(toNano('0.03'))) {
              return true
            }
            return false
          }
        }
      }
    })

    expect(nftTransfer).toBeTruthy()

    const royaltiesFee = res.actionList.find(tx => {
      if (tx.type === 'send_msg') {
        if (tx.message.info.type === 'internal') {
          if (tx.message.info.dest?.toFriendly() === defaultConfig.royaltyAddress.toFriendly()) {
            return tx.message.info.value.coins.gte(defaultConfig.royaltyAmount)
          }
        }
      }
    })

    expect(royaltiesFee).toBeTruthy()

    const marketplaceFee = res.actionList.find(tx => {
      if (tx.type === 'send_msg') {
        if (tx.message.info.type === 'internal') {
          if (tx.message.info.dest?.toFriendly() === defaultConfig.marketplaceFeeAddress.toFriendly()) {
            return tx.message.info.value.coins.gte(defaultConfig.marketplaceFee)
          }
        }
      }
    })

    expect(marketplaceFee).toBeTruthy()

    const ownerTransfer = res.actionList.find(tx => {
      if (tx.type === 'send_msg') {
        if (tx.message.info.type === 'internal') {
          if (tx.message.info.dest?.toFriendly() === defaultConfig.nftOwnerAddress?.toFriendly()) {
            return tx.message.info.value.coins.gte(
              toNano(2).sub(defaultConfig.marketplaceFee).sub(defaultConfig.royaltyAmount).sub(toNano(1))
            )
          }
        }
      }
    })

    expect(ownerTransfer).toBeTruthy()
  })

  it('should allow cancel after buy', async () => {
    const sale = await NftFixpriceSaleV3Local.createFromConfig(defaultConfig)
    const buyerAddress = randomAddress()
    let res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: buyerAddress,
        value: toNano(2),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)

    const data = await sale.getSaleData()
    expect(data.isComplete).toEqual(true) // check buy success

    const cancelMessage = new Cell()
    cancelMessage.bits.writeUint(3, 32) // op
    cancelMessage.bits.writeUint(0, 64) // query_id

    res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: defaultConfig.nftOwnerAddress,
        value: toNano(1),
        bounce: false,
        body: new CommonMessageInfo({
          body: new CellMessage(cancelMessage),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toEqual(0)

    const nftTransfer = res.actionList.find(tx => {
      if (tx.type === 'send_msg') {
        if (tx.message.info.type === 'internal') {
          if (tx.message.info.dest?.toFriendly() === defaultConfig.nftAddress.toFriendly()) {
            const slice = tx.message.body.beginParse()
            const op = slice.readUint(32)
            slice.readUint(64) // query_id
            const newOwner = slice.readAddress()
            if (op.eq(new BN(0x5fcc3d14)) && newOwner?.equals(defaultConfig.nftOwnerAddress!)) {
              return true
            }
            return false
          }
        }
      }
    })

    expect(nftTransfer).toBeTruthy()
  })

  it('should deploy by external', async () => {
    const sale = await NftFixpriceSaleV3Local.createFromConfig({
      ...defaultConfig,
      canDeployByExternal: true,
    })

    let res = await sale.contract.sendExternalMessage(
      new ExternalMessage({
        to: sale.address,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).toBe(0)

    res = await sale.contract.sendExternalMessage(
      new ExternalMessage({
        to: sale.address,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )
    if (res.logs) {
      throw new Error(res.logs)
    }
    expect(res.exit_code).not.toBe(0)
  })

  it('should allow emergency transfer after end', async () => {
    const sale = await NftFixpriceSaleV3Local.createFromConfig({
      ...defaultConfig,
    })
    const transfer = new Builder()
    transfer.storeUint(0x18, 6)
    transfer.storeAddress(defaultConfig.marketplaceAddress)
    transfer.storeCoins(toNano('0.666'))
    transfer.storeUint(1, 1 + 4 + 4 + 64 + 32 + 1 + 1)
    transfer.storeRef(new Builder().storeUint(666, 32).endCell())

    const transferBox = new Builder()
    transferBox.storeUint(2, 8)
    transferBox.storeRef(transfer.endCell())

    const msgResend = new Builder()
    msgResend.storeUint(555, 32) // op
    msgResend.storeUint(0, 64) // query_id
    msgResend.storeRef(transferBox.endCell())

    const msg = msgResend.endCell()
    let res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: defaultConfig.marketplaceAddress,
        value: toNano('0.1'),
        bounce: true,
        body: new CommonMessageInfo({
          body: new CellMessage(msg),
        }),
      })
    )

    expect(res.exit_code).not.toEqual(0) // sale not end, ignore payload

    // buy message
    await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: randomAddress(),
        value: toNano('2'),
        bounce: true,
        body: new CommonMessageInfo({
          body: new CellMessage(new Cell()),
        }),
      })
    )

    res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: randomAddress(),
        value: toNano('0.1'),
        bounce: true,
        body: new CommonMessageInfo({
          body: new CellMessage(msg),
        }),
      })
    )

    expect(res.exit_code).not.toEqual(0) // msg not from marketplace, ignore payload

    res = await sale.contract.sendInternalMessage(
      new InternalMessage({
        to: sale.address,
        from: defaultConfig.marketplaceAddress,
        value: toNano('0.1'),
        bounce: true,
        body: new CommonMessageInfo({
          body: new CellMessage(msg),
        }),
      })
    )

    expect(res.exit_code).toEqual(0) // accept message
    expect(res.actionList.length).toBe(1)

    const requestedTx = res.actionList.find(tx => {
      if (tx.type === 'send_msg') {
        if (tx.message.info.type === 'internal') {
          if (tx.message.info.dest?.toFriendly() === defaultConfig.marketplaceAddress.toFriendly()) {
            const slice = tx.message.body.beginParse()
            const op = slice.readUint(32)
            if (op.eq(new BN(666))) {
              return true
            }
            return false
          }
        }
      }
    })

    expect(requestedTx).toBeTruthy()
  })
})
