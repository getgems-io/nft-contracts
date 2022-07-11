import {Address, Cell, contractAddress, StateInit} from "ton";
import BN from "bn.js";
import {NftFixPriceSaleV2CodeCell} from "./NftFixpriceSaleV2.source";

export type NftFixPriceSaleV2Data = {
    isComplete: boolean
    createdAt: number
    marketplaceAddress: Address
    nftAddress: Address
    nftOwnerAddress: Address|null
    fullPrice: BN
    marketplaceFeeAddress: Address
    marketplaceFee: BN
    royaltyAddress: Address
    royaltyAmount: BN
}

export function buildNftFixPriceSaleV2DataCell(data: NftFixPriceSaleV2Data) {

    let feesCell = new Cell()

    feesCell.bits.writeAddress(data.marketplaceFeeAddress)
    feesCell.bits.writeCoins(data.marketplaceFee)
    feesCell.bits.writeAddress(data.royaltyAddress)
    feesCell.bits.writeCoins(data.royaltyAmount)

    let dataCell = new Cell()

    dataCell.bits.writeUint(data.isComplete ? 1 : 0, 1)
    dataCell.bits.writeUint(data.createdAt, 32)
    dataCell.bits.writeAddress(data.marketplaceAddress)
    dataCell.bits.writeAddress(data.nftAddress)
    dataCell.bits.writeAddress(data.nftOwnerAddress)
    dataCell.bits.writeCoins(data.fullPrice)
    dataCell.refs.push(feesCell)

    return dataCell
}

export function buildNftFixPriceSaleV2StateInit(data: Omit<NftFixPriceSaleV2Data, 'nftOwnerAddress' | 'isComplete'>) {
    let dataCell = buildNftFixPriceSaleV2DataCell({
        ...data,
        // Nft owner address would be set by NFT itself by ownership_assigned callback
        nftOwnerAddress: null,
        isComplete: false,
    })

    let stateInit = new StateInit({
        code: NftFixPriceSaleV2CodeCell,
        data: dataCell
    })
    let address = contractAddress({workchain: 0, initialCode: NftFixPriceSaleV2CodeCell, initialData: dataCell})

    return {
        address,
        stateInit
    }
}

export const OperationCodes = {
    AcceptCoins: 1,
    Buy: 2,
    CancelSale: 3,
}

export const Queries = {
    cancelSale: (params: { queryId?: number }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.CancelSale, 32)
        msgBody.bits.writeUint(params.queryId ?? 0, 64)
        return msgBody
    }
}