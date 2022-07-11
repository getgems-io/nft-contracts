import {randomAddress} from "../../utils/randomAddress";
import {Cell, CellMessage, CommonMessageInfo, InternalMessage, toNano} from "ton";
import {NftFixPriceSaleV2Data} from "./NftFixpriceSaleV2.data";
import {NftFixpriceSaleV2Local} from "./NftFixpriceSaleV2Local";

let defaultConfig: NftFixPriceSaleV2Data = {
    isComplete: false,
    createdAt: 0,
    marketplaceAddress: randomAddress(),
    nftAddress: randomAddress(),
    nftOwnerAddress: randomAddress(),
    fullPrice: toNano(1),
    marketplaceFee: toNano('0.01'),
    marketplaceFeeAddress: randomAddress(),
    royaltyAmount: toNano('0.01'),
    royaltyAddress: randomAddress(),
}

describe('fix price sell contract', () => {
    it('should return sale info', async () => {
        let sale = await NftFixpriceSaleV2Local.createFromConfig(defaultConfig)
        let res = await sale.getSaleData()

        expect(res.isComplete).toEqual(defaultConfig.isComplete)
        expect(res.createdAt).toEqual(defaultConfig.createdAt)
        expect(res.marketplaceAddress.toFriendly()).toEqual(defaultConfig.marketplaceAddress.toFriendly())
        expect(res.nftAddress.toFriendly()).toEqual(defaultConfig.nftAddress.toFriendly())
        expect(res.nftOwnerAddress!.toFriendly()).toEqual(defaultConfig.nftOwnerAddress!.toFriendly())
        expect(res.marketplaceFeeAddress.toFriendly()).toEqual(defaultConfig.marketplaceFeeAddress.toFriendly())
        expect(res.royaltyAddress.toFriendly()).toEqual(defaultConfig.royaltyAddress.toFriendly())
        expect(res.fullPrice.eq(defaultConfig.fullPrice)).toBe(true)
        expect(res.marketplaceFee.eq(defaultConfig.marketplaceFee)).toBe(true)
        expect(res.royaltyAmount.eq(defaultConfig.royaltyAmount)).toBe(true)
    })

    it('should accept deploy only from marketplace', async () => {
        // Nft owner address is null after deploy
        let conf: NftFixPriceSaleV2Data = {
            ...defaultConfig,
            nftOwnerAddress: null
        }
        let sale = await NftFixpriceSaleV2Local.createFromConfig(conf)

        let res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: conf.marketplaceAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))
        expect(res.exit_code).toEqual(0)

        // Should fail if it's not from marketplace
        res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))
        expect(res.exit_code).not.toEqual(0)

    })

    it('should accept init message only from NFT', async () => {
        // Nft owner address is null after deploy
        let conf: NftFixPriceSaleV2Data = {
            ...defaultConfig,
            nftOwnerAddress: null
        }
        let prevOwner = randomAddress()
        let sale = await NftFixpriceSaleV2Local.createFromConfig(conf)

        let nftOwnershipAssignedCell = new Cell()
        nftOwnershipAssignedCell.bits.writeUint(0x05138d91, 32) // ownership_assigned
        nftOwnershipAssignedCell.bits.writeUint(0, 64) // query_id
        nftOwnershipAssignedCell.bits.writeAddress(prevOwner) // prev_owner

        let res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: conf.nftAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(nftOwnershipAssignedCell)
            })
        }))
        expect(res.exit_code).toEqual(0)

        sale = await NftFixpriceSaleV2Local.createFromConfig(conf)
        // Should fail if message is not from NFT
        res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(nftOwnershipAssignedCell)
            })
        }))
        expect(res.exit_code).not.toEqual(0)

        sale = await NftFixpriceSaleV2Local.createFromConfig(conf)
        // Should fail if it's not ownership_assigned callback
        res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: conf.nftAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))
        expect(res.type !== 'success').toBe(true)
    })

    it('should initialize after ownership_assigned callback', async () => {
        let conf: NftFixPriceSaleV2Data = {
            ...defaultConfig,
            nftOwnerAddress: null
        }
        let prevOwner = randomAddress()
        let sale = await NftFixpriceSaleV2Local.createFromConfig(conf)

        let nftOwnershipAssignedCell = new Cell()
        nftOwnershipAssignedCell.bits.writeUint(0x05138d91, 32) // ownership_assigned
        nftOwnershipAssignedCell.bits.writeUint(0, 64) // query_id
        nftOwnershipAssignedCell.bits.writeAddress(prevOwner) // prev_owner

        let res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: conf.nftAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(nftOwnershipAssignedCell)
            })
        }))
        expect(res.exit_code).toEqual(0)

        let data = await sale.getSaleData()

        expect(data.nftOwnerAddress!.toFriendly()).toEqual(prevOwner.toFriendly())
    })

    it('should accept coins for op=1', async () => {
        let sale = await NftFixpriceSaleV2Local.createFromConfig(defaultConfig)

        let body = new Cell()
        body.bits.writeUint(1, 32)  // op
        body.bits.writeUint(0, 64)  // query_id

        let res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(body)
            })
        }))
        expect(res.exit_code).toEqual(0)
    })

    it('should cancel sale', async () => {
        let sale = await NftFixpriceSaleV2Local.createFromConfig(defaultConfig)

        let body = new Cell()
        body.bits.writeUint(3, 32)  // op
        body.bits.writeUint(0, 64)  // query_id

        let res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(body)
            })
        }))
        // Should fail if sender is not current owner
        expect(res.exit_code).not.toEqual(0)

        res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: defaultConfig.nftOwnerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(body)
            })
        }))
        expect(res.exit_code).toEqual(0)

        let data = await sale.getSaleData()
        expect(data.isComplete).toBe(true)
    })

    it('should ignore any message if completed', async () => {
        let conf: NftFixPriceSaleV2Data = {
            ...defaultConfig,
            isComplete: true
        }
        let sale = await NftFixpriceSaleV2Local.createFromConfig(conf)

        let res = await sale.contract.sendInternalMessage(new InternalMessage({
            to: sale.address,
            from: conf.marketplaceAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))
        expect(res.exit_code).not.toEqual(0)
    })

    // it('should buy nft', async () => {
    //     let sale = await NftFixpriceSaleV2Local.createFromConfig(defaultConfig)
    //     // let res = await sale.contract.sendInternalMessage(new InternalMessage({
    //     //     to: sale.address,
    //     //     from: randomAddress(),
    //     //     value: toNano(2),
    //     //     bounce: false,
    //     //     body: new CommonMessageInfo({
    //     //         body: new CellMessage(new Cell())
    //     //     })
    //     // }))
    //     // expect(res.exit_code).toEqual(0)
    // })
})