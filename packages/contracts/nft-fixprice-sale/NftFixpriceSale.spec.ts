import {NftFixpriceSaleLocal} from "./NftFixpriceSaleLocal";
import {NftFixPriceSaleData} from "./NftFixPriceSale.data";
import {toNano} from "ton";
import {randomAddress} from "../../utils/randomAddress";

let defaultConfig: NftFixPriceSaleData = {
    marketplaceAddress: randomAddress(),
    nftAddress: randomAddress(),
    nftOwnerAddress: randomAddress(),
    fullPrice: toNano(1),
    marketplaceFee: toNano(1),
    marketplaceFeeAddress: randomAddress(),
    royaltyAmount: toNano(1),
    royaltyAddress: randomAddress(),
}

describe('nft marketplace smc', () => {
    it('should return sale info', async () => {
        let sale = await NftFixpriceSaleLocal.createFromConfig(defaultConfig)

        let res = await sale.getSaleData()

        expect(res.marketplaceAddress.toFriendly()).toEqual(defaultConfig.marketplaceAddress.toFriendly())
        expect(res.nftAddress.toFriendly()).toEqual(defaultConfig.nftAddress.toFriendly())
        expect(res.nftOwnerAddress.toFriendly()).toEqual(defaultConfig.nftOwnerAddress!.toFriendly())
        expect(res.marketplaceFeeAddress.toFriendly()).toEqual(defaultConfig.marketplaceFeeAddress.toFriendly())
        expect(res.royaltyAddress.toFriendly()).toEqual(defaultConfig.royaltyAddress.toFriendly())
        expect(res.fullPrice.eq(defaultConfig.fullPrice)).toBe(true)
        expect(res.fullPrice.eq(defaultConfig.marketplaceFee)).toBe(true)
        expect(res.fullPrice.eq(defaultConfig.royaltyAmount)).toBe(true)
    })
})