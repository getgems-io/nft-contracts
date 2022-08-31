import {Address, Cell, DictBuilder} from "ton";
import BN from "bn.js";
import {encodeOffChainContent} from "../../nft-content/nftContent";
import {Queries as CollectionQueries} from '../nft-collection/NftCollection.data'

import {
    KeyObject,
    sign
} from 'node:crypto';
import {beginCell} from "ton/dist";
import {amount} from "ton/dist/traits/trait_amount";

export const SwapState = {
    Active: 1,
    Cancelled: 2,
    Completed: 3,
}

interface NFTItem {
    addr: Address
    sent: boolean
}

export type SwapData = {
    state: number,
    leftAddress: Address
    rightAddress: Address
    rightNft: NFTItem[]
    leftNft: NFTItem[]
    supervisorAddress: Address
    commissionAddress: Address
    leftCommission: BN
    leftCommissionGot: BN
    rightCommission: BN
    rightCommissionGot: BN
}

export function buildSwapDataCell(data: SwapData) {
    let dataCell = new Cell()
    dataCell.bits.writeUint(data.state, 2)
    dataCell.bits.writeAddress(data.leftAddress)
    dataCell.bits.writeAddress(data.rightAddress)

    dataCell.bits.writeCoins(data.leftCommission)
    dataCell.bits.writeCoins(data.leftCommissionGot)
    dataCell.bits.writeBit(data.leftNft.length > 0)

    if (data.leftNft.length > 0) {
        let leftNft = new DictBuilder(256)
        for (const leftNftKey in data.leftNft) {
            let bitCell = new Cell();
            bitCell.bits.writeBit(data.leftNft[leftNftKey].sent);

            leftNft.storeCell(new BN(data.leftNft[leftNftKey].addr.hash), bitCell)
        }
        dataCell.refs.push(leftNft.endCell())
    }

    dataCell.bits.writeCoins(data.rightCommission)
    dataCell.bits.writeCoins(data.rightCommissionGot)
    dataCell.bits.writeBit(data.rightNft.length > 0)

    if (data.rightNft.length > 0) {
        let rightNft = new DictBuilder(256)
        for (const rightNftKey in data.rightNft) {
            let bitCell = new Cell();
            bitCell.bits.writeBit(data.rightNft[rightNftKey].sent);

            rightNft.storeCell(new BN(data.rightNft[rightNftKey].addr.hash), bitCell)
        }
        dataCell.refs.push(rightNft.endCell())
    }

    let marketCell = new Cell()
    marketCell.bits.writeAddress(data.commissionAddress)
    marketCell.bits.writeAddress(data.supervisorAddress)
    dataCell.refs.push(marketCell)

    return dataCell
}

export const OperationCodes = {
    ownershipAssigned: 0x05138d91,
    addCoins: 1,
    cancel: 2,
    maintain: 3,
    transferCommission: 0x82bd8f2a,
    transferCancel: 0xb5188860,
}

export const Queries = {
    nftOwnerAssigned: (params: { queryId?: number, prevOwner: Address}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.ownershipAssigned, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.prevOwner)

        return msgBody
    },
    addCoins: (params: { queryId?: number, coins: BN}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.addCoins, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeCoins(params.coins)

        return msgBody
    },
    cancel: (params: { queryId?: number}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.cancel, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)

        return msgBody
    },
    transferCommission: (params: { queryId?: number}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.transferCommission, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)

        return msgBody
    },
    transferCancel: (params: { queryId?: number}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.transferCancel, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)

        return msgBody
    },
    maintain: (params: { queryId?: number, mode: number, msg: Cell}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.maintain, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeUint(params.mode, 8)
        msgBody.refs.push(params.msg)

        return msgBody
    },
    makeMessage: (params: { queryId?: number, to: Address, amount: BN, body: Cell}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(0x18, 6)
        msgBody.bits.writeAddress(params.to)
        msgBody.bits.writeCoins(params.amount)
        msgBody.bits.writeUint(0,1 + 4 + 4 + 64 + 32 + 1 + 1)
        msgBody.writeCell(params.body)

        return msgBody
    }
}