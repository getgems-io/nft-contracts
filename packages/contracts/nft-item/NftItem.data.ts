import {Address, Cell, contractAddress, StateInit} from "ton";
import {NftItemCodeCell, NftSingleCodeCell} from "./NftItem.source";
import BN from "bn.js";
import {encodeOffChainContent} from "../../nft-content/nftContent";
import {Queries as CollectionQueries} from '../nft-collection/NftCollection.data'

export type NftItemData = {
    index: number
    collectionAddress: Address | null
    ownerAddress: Address
    content: string
}

export function buildNftItemDataCell(data: NftItemData) {
    let dataCell = new Cell()

    let contentCell = new Cell()
    // contentCell.bits.writeString(data.content)
    contentCell.bits.writeBuffer(Buffer.from(data.content))

    dataCell.bits.writeUint(data.index, 64)
    dataCell.bits.writeAddress(data.collectionAddress)
    dataCell.bits.writeAddress(data.ownerAddress)
    dataCell.refs.push(contentCell)

    return dataCell
}

export function buildNftItemDeployMessage(conf: { queryId?: number, collectionAddress: Address, passAmount: BN, itemIndex: number, itemOwnerAddress: Address, itemContent: string }) {
    let msgBody = CollectionQueries.mint(conf)

    return {
        messageBody: msgBody,
        collectionAddress: conf.collectionAddress
    }
}

export type RoyaltyParams = {
    // numerator
    royaltyFactor: number
    // denominator
    royaltyBase: number
    royaltyAddress: Address
}

export type NftSingleData = {
    ownerAddress: Address
    editorAddress: Address
    content: string
    royaltyParams: RoyaltyParams
}

export function buildSingleNftDataCell(data: NftSingleData) {
    let dataCell = new Cell()

    let contentCell = encodeOffChainContent(data.content)

    let royaltyCell = new Cell()
    royaltyCell.bits.writeUint(data.royaltyParams.royaltyFactor, 16)
    royaltyCell.bits.writeUint(data.royaltyParams.royaltyBase, 16)
    royaltyCell.bits.writeAddress(data.royaltyParams.royaltyAddress)

    dataCell.bits.writeAddress(data.ownerAddress)
    dataCell.bits.writeAddress(data.editorAddress)
    dataCell.refs.push(contentCell)
    dataCell.refs.push(royaltyCell)

    return dataCell
}

export function buildSingleNftStateInit(conf: NftSingleData) {
    let dataCell = buildSingleNftDataCell(conf)

    let stateInit = new StateInit({
        code: NftSingleCodeCell,
        data: dataCell
    })

    let stateInitCell = new Cell()
    stateInit.writeTo(stateInitCell)

    let address = contractAddress({workchain: 0, initialCode: NftSingleCodeCell, initialData: dataCell})

    return {
        stateInit: stateInitCell,
        stateInitMessage: stateInit,
        address
    }
}

export const OperationCodes = {
    transfer: 0x5fcc3d14,
    getStaticData: 0x2fcb26a2,
    getStaticDataResponse: 0x8b771735,
    GetRoyaltyParams: 0x693d3950,
    GetRoyaltyParamsResponse: 0xa8cb00ad,
    EditContent: 0x1a0b9d51,
    TransferEditorship: 0x1c04412a
}

export const Queries = {
    transfer: (params: { queryId?: number, newOwner: Address, responseTo?: Address, forwardAmount?: BN }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.transfer, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.newOwner)
        msgBody.bits.writeAddress(params.responseTo || null)
        msgBody.bits.writeBit(false) // no custom payload
        msgBody.bits.writeCoins(params.forwardAmount || 0)
        msgBody.bits.writeBit(0) // no forward_payload yet

        return msgBody
    },
    getStaticData: (params: {queryId?: number}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        return msgBody
    },
    getRoyaltyParams: (params: { queryId?: number }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.GetRoyaltyParams, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        return msgBody
    },
    editContent: (params: { queryId?: number,  content: string, royaltyParams: RoyaltyParams  }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.EditContent, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)

        let royaltyCell = new Cell()
        royaltyCell.bits.writeUint(params.royaltyParams.royaltyFactor, 16)
        royaltyCell.bits.writeUint(params.royaltyParams.royaltyBase, 16)
        royaltyCell.bits.writeAddress(params.royaltyParams.royaltyAddress)

        let contentCell = encodeOffChainContent(params.content)

        msgBody.refs.push(contentCell)
        msgBody.refs.push(royaltyCell)

        return msgBody
    },
    transferEditorship: (params: { queryId?: number, newEditor: Address, responseTo: Address|null, forwardAmount?: BN }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.TransferEditorship, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.newEditor)
        msgBody.bits.writeAddress(params.responseTo || null)
        msgBody.bits.writeBit(false) // no custom payload
        msgBody.bits.writeCoins(params.forwardAmount || 0)
        msgBody.bits.writeBit(0) // no forward_payload yet

        return msgBody
    },
}