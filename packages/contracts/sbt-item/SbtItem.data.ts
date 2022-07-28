import {Address, Cell} from "ton";
import BN from "bn.js";
import {encodeOffChainContent} from "../../nft-content/nftContent";
import {Queries as CollectionQueries} from '../nft-collection/NftCollection.data'

import {
    KeyObject,
    sign
} from 'node:crypto';

export type SbtItemData = {
    index: number
    collectionAddress: Address | null
    ownerAddress: Address
    content: string
    ownerPubKey: BN
    seqno: number
}

export function buildSbtItemDataCell(data: SbtItemData) {
    let dataCell = new Cell()

    let contentCell = new Cell()
    contentCell.bits.writeBuffer(Buffer.from(data.content))

    dataCell.bits.writeUint(data.index, 64)
    dataCell.bits.writeAddress(data.collectionAddress)
    dataCell.bits.writeAddress(data.ownerAddress)
    dataCell.refs.push(contentCell)
    dataCell.bits.writeUint(data.ownerPubKey, 256)
    dataCell.bits.writeUint(data.seqno, 32)

    return dataCell
}

export function buildSbtItemDeployMessage(conf: { queryId?: number, collectionAddress: Address, passAmount: BN, itemIndex: number, itemOwnerAddress: Address, itemContent: string, ownerPubKey: BN }) {
    let msgBody = CollectionQueries.mint(conf)

    return {
        messageBody: msgBody,
        collectionAddress: conf.collectionAddress
    }
}

export type SbtSingleData = {
    ownerAddress: Address
    editorAddress: Address
    content: string
    ownerPubKey: BN
    seqno: number
}

export function buildSingleSbtDataCell(data: SbtSingleData) {
    let dataCell = new Cell()

    let contentCell = encodeOffChainContent(data.content)

    dataCell.bits.writeAddress(data.ownerAddress)
    dataCell.bits.writeAddress(data.editorAddress)
    dataCell.refs.push(contentCell)
    dataCell.bits.writeUint(data.ownerPubKey, 256)
    dataCell.bits.writeUint(data.seqno, 32)

    return dataCell
}

export const OperationCodes = {
    transfer: 0x5fcc3d14,
    getStaticData: 0x2fcb26a2,
    getStaticDataResponse: 0x8b771735,
    EditContent: 0x1a0b9d51,
    TransferEditorship: 0x1c04412a,
    PullOwnership: 0x2ad91252,
    ProveOwnership: 0x2e0de890,
    VerifyOwnership: 0x5d795580
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
    pullOwnership: (params: { queryId?: number, seqno: number, key: KeyObject, newOwner?: Address, responseTo?: Address, forwardAmount?: BN }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.PullOwnership, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)

        let msgPayload = new Cell()
        msgPayload.bits.writeUint(params.seqno, 32)
        msgPayload.bits.writeAddress(params.newOwner || null)
        msgPayload.bits.writeAddress(params.responseTo || null)
        msgPayload.bits.writeBit(false) // no custom payload
        msgPayload.bits.writeCoins(params.forwardAmount || 0)
        msgPayload.bits.writeBit(0) // no forward_payload yet

        let signCell = new Cell()
        let signature = sign(null, msgPayload.hash(), params.key);
        signCell.bits.writeBuffer(signature)

        msgBody.refs.push(signCell)
        msgBody.bits.writeBitString(msgPayload.bits)

        return msgBody
    },
    proveOwnership: (params: { queryId?: number, to: Address, data: Cell }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.ProveOwnership, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.to)
        msgBody.bits.writeBit(true) // either
        msgBody.refs.push(params.data)

        return msgBody
    },
    verifyOwnership: (params: { queryId?: number, id: number, to: Address, data: Cell }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.VerifyOwnership, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeUint(params.id, 256)
        msgBody.bits.writeAddress(params.to)
        msgBody.bits.writeBit(true) // either
        msgBody.refs.push(params.data)

        return msgBody
    },
    getStaticData: (params: {queryId?: number}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)

        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)
        msgBody.bits.writeUint(OperationCodes.getStaticData, 32)

        return msgBody
    },
    editContent: (params: { queryId?: number,  content: string  }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.EditContent, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)

        let contentCell = encodeOffChainContent(params.content)

        msgBody.refs.push(contentCell)

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