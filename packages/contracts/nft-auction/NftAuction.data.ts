import {Address, Builder, Cell, contractAddress, StateInit} from "ton";
import BN from "bn.js";
import {NftAuctionCodeCell} from "./NftAuction.source";
import {ContractSource} from "ton/dist/contracts/sources/ContractSource";

export type NftAuctionData = {
    marketplaceFeeAddress: Address,
    marketplaceFeeFactor: BN,
    marketplaceFeeBase: BN,


    royaltyAddress: Address,
    royaltyFactor: BN,
    royaltyBase: BN,


    minBid: BN,
    maxBid: BN,
    minStep: BN,
    endTimestamp: number,
    createdAtTimestamp: number,

    stepTimeSeconds: number,
    tryStepTimeSeconds: number,

    nftOwnerAddress: Address | null,
    nftAddress: Address,

    end: boolean,
    marketplaceAddress: Address,
    activated: boolean,

}

export function buildNftAuctionDataCell(data: NftAuctionData) {

    const feesCell = new Builder()
    feesCell.storeAddress(data.marketplaceFeeAddress)      // mp_fee_addr
    feesCell.storeUint(data.marketplaceFeeFactor, 32)               // mp_fee_factor
    feesCell.storeUint(data.marketplaceFeeBase, 32)   // mp_fee_base
    feesCell.storeAddress(data.royaltyAddress)  // royalty_fee_addr
    feesCell.storeUint(data.royaltyFactor, 32)              // royalty_fee_factor
    feesCell.storeUint(data.royaltyBase, 32)   // royalty_fee_base


    const bidsCell = new Builder()
    bidsCell.storeCoins(data.minBid)       // min_bid
    bidsCell.storeCoins(data.maxBid)       // max_bid
    bidsCell.storeCoins(data.minStep)       // min_step
    bidsCell.storeBitArray([0, 0])        // last_member
    bidsCell.storeCoins(0)       // last_bid
    bidsCell.storeUint(0, 32) // last_bid_at
    bidsCell.storeUint(data.endTimestamp, 32)    // end_time
    bidsCell.storeUint(data.stepTimeSeconds, 32)               // step_time
    bidsCell.storeUint(data.tryStepTimeSeconds, 32)               // try_step_time


    let nftCell = new Builder();
    if (data.nftOwnerAddress) {
        nftCell.storeAddress(data.nftOwnerAddress)
    } else {
        nftCell.storeBitArray([0, 0])
    }
    nftCell.storeAddress(data.nftAddress)          // nft_addr


    const storage = new Builder()
    storage.storeBit(data.end)     // end?
    storage.storeAddress(data.marketplaceAddress)   // mp_addr
    storage.storeBit(data.activated)    // activated
    storage.storeUint(data.createdAtTimestamp, 32)
    storage.storeBit(false) // is_canceled
    storage.storeRef(feesCell.endCell())
    storage.storeRef(bidsCell.endCell())
    storage.storeRef(nftCell.endCell())

    return storage.endCell()
}

export function buildNftAuctionStateInit(data: NftAuctionData) {
    let dataCell = buildNftAuctionDataCell({
        ...data,
    })

    let stateInit = new StateInit({
        code: NftAuctionCodeCell,
        data: dataCell
    })
    let address = contractAddress({workchain: 0, initialCode: NftAuctionCodeCell, initialData: dataCell})

    return {
        address,
        stateInit
    }
}



export const Queries = {
    getStateInitContract: (address:Address, dataCellBase64:string) => {
        const dataCellBuffer = Buffer.from(dataCellBase64, 'base64');
        const dataCell = Cell.fromBoc(dataCellBuffer)[0];
        return {
            address: address,
            source: {
                initialCode: NftAuctionCodeCell,
                initialData: dataCell,
                workchain: 0,
                type: 'nft_auction',
                backup: () => "",
                describe: () => "nft_auction",
            },
        }
    }
}