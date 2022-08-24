import {Address, Builder, Cell, contractAddress, StateInit} from "ton";
import {NftAuctionV2CodeCell} from "./NftAuctionV2.source";
import {NftAuctionData} from "../nft-auction/NftAuction.data";

export type NftAuctionV2Data = NftAuctionData

export function buildNftAuctionV2DataCell(data: NftAuctionV2Data) {

    const constantCell = new Builder()
    const subGasPriceFromBid = 8449000
    constantCell.storeUint(subGasPriceFromBid, 32);
    constantCell.storeAddress(data.marketplaceAddress);
    constantCell.storeCoins(data.minBid)
    constantCell.storeCoins(data.maxBid)
    constantCell.storeCoins(data.minStep)
    constantCell.storeUint(data.stepTimeSeconds, 32) // step_time
    constantCell.storeAddress(data.nftAddress);
    constantCell.storeUint(data.createdAtTimestamp, 32)

    const feesCell = new Builder()
    feesCell.storeAddress(data.marketplaceFeeAddress)      // mp_fee_addr
    feesCell.storeUint(data.marketplaceFeeFactor, 32)               // mp_fee_factor
    feesCell.storeUint(data.marketplaceFeeBase, 32)   // mp_fee_base
    feesCell.storeAddress(data.royaltyAddress)  // royalty_fee_addr
    feesCell.storeUint(data.royaltyFactor, 32)              // royalty_fee_factor
    feesCell.storeUint(data.royaltyBase, 32)   // royalty_fee_base


    const storage = new Builder()
    storage.storeBit(data.end) // end?
    storage.storeBit(data.activated) // activated
    storage.storeBit(false) // is_canceled
    storage.storeBitArray([0, 0])        // last_member
    storage.storeCoins(0)       // last_bid
    storage.storeUint(0, 32) // last_bid_at
    storage.storeUint(data.endTimestamp, 32)    // end_time
    if (data.nftOwnerAddress) {
        storage.storeAddress(data.nftOwnerAddress)
    } else {
        storage.storeBitArray([0, 0])
    }
    storage.storeRef(feesCell.endCell())
    storage.storeRef(constantCell.endCell())

    return storage.endCell()
}

export function buildNftAuctionV2StateInit(data: NftAuctionV2Data) {
    let dataCell = buildNftAuctionV2DataCell({
        ...data,
    })

    let stateInit = new StateInit({
        code: NftAuctionV2CodeCell,
        data: dataCell
    })
    let address = contractAddress({workchain: 0, initialCode: NftAuctionV2CodeCell, initialData: dataCell})

    return {
        address,
        stateInit
    }
}


export const Queries = {

    stopMessage: () => {
        return new Builder().storeUint(0, 32).storeBuffer(Buffer.from('stop')).endCell();
    },

    cancelMessage: () => {
        return new Builder().storeUint(0, 32).storeBuffer(Buffer.from('cancel')).endCell();
    },

    getStateInitContract: (address: Address, dataCellBase64: string) => {
        const dataCellBuffer = Buffer.from(dataCellBase64, 'base64');
        const dataCell = Cell.fromBoc(dataCellBuffer)[0];
        return {
            address: address,
            source: {
                initialCode: NftAuctionV2CodeCell,
                initialData: dataCell,
                workchain: 0,
                type: 'nft_auction v2',
                backup: () => "",
                describe: () => "nft_auction v2",
            },
        }
    }
}

export const AuctionV2Queries = Queries