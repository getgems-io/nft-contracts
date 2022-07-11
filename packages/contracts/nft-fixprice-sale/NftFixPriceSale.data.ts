import {Address, Cell, contractAddress, StateInit} from "ton";
import BN from "bn.js";
import {NftFixPriceSaleCodeCell} from "./NftFixPriceSale.source";

export type NftFixPriceSaleData = {
    marketplaceAddress: Address
    nftAddress: Address
    nftOwnerAddress: Address|null
    fullPrice: BN
    marketplaceFee: BN
    marketplaceFeeAddress: Address
    royaltyAmount: BN
    royaltyAddress: Address
}

export function buildNftFixPriceSaleDataCell(data: NftFixPriceSaleData) {

    let feesCell = new Cell()

    feesCell.bits.writeCoins(data.marketplaceFee)
    feesCell.bits.writeAddress(data.marketplaceFeeAddress)
    feesCell.bits.writeAddress(data.royaltyAddress)
    feesCell.bits.writeCoins(data.royaltyAmount)

    let dataCell = new Cell()

    dataCell.bits.writeAddress(data.marketplaceAddress)
    dataCell.bits.writeAddress(data.nftAddress)
    dataCell.bits.writeAddress(data.nftOwnerAddress)
    dataCell.bits.writeCoins(data.fullPrice)
    dataCell.refs.push(feesCell)

    return dataCell
}

export function buildNftFixPriceSaleStateInit(data: Omit<NftFixPriceSaleData, 'nftOwnerAddress'>) {
    let dataCell =  buildNftFixPriceSaleDataCell({
        ...data,
        // Nft owner address would be set by NFT itself by ownership_assigned callback
        nftOwnerAddress: null
    })

    let stateInit = new StateInit({
        code: NftFixPriceSaleCodeCell,
        data: dataCell
    })
    let address = contractAddress({workchain: 0, initialCode: NftFixPriceSaleCodeCell, initialData: dataCell})

    return {
        address,
        stateInit
    }
}