import {Address, Cell} from "ton";
import BN from "bn.js";
import {encodeOffChainContent} from "../../nft-content/nftContent";
import {Queries as CollectionQueries} from '../nft-collection/NftCollection.data'

import {beginCell} from "ton/dist";

export type SbtItemData = {
    index: number
    collectionAddress: Address | null
    ownerAddress: Address
    authorityAddress: Address
    content: string
    revokedAt?: number
}

export function buildSbtItemDataCell(data: SbtItemData) {
    let dataCell = new Cell()

    let contentCell = new Cell()
    contentCell.bits.writeBuffer(Buffer.from(data.content))

    dataCell.bits.writeUint(data.index, 64)
    dataCell.bits.writeAddress(data.collectionAddress)
    dataCell.bits.writeAddress(data.ownerAddress)
    dataCell.refs.push(contentCell)
    dataCell.bits.writeAddress(data.authorityAddress)
    dataCell.bits.writeUint(data.revokedAt ? data.revokedAt : 0, 64)

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
    authorityAddress: Address
    revokedAt?: number
}

export function buildSingleSbtDataCell(data: SbtSingleData) {
    let dataCell = new Cell()

    let contentCell = encodeOffChainContent(data.content)

    dataCell.bits.writeAddress(data.ownerAddress)
    dataCell.bits.writeAddress(data.editorAddress)
    dataCell.refs.push(contentCell)
    dataCell.bits.writeAddress(data.authorityAddress)
    dataCell.bits.writeUint(data.revokedAt ? data.revokedAt : 0, 64)

    return dataCell
}

export const OperationCodes = {
    transfer: 0x5fcc3d14,
    excesses: 0xd53276db,
    getStaticData: 0x2fcb26a2,
    getStaticDataResponse: 0x8b771735,
    EditContent: 0x1a0b9d51,
    TransferEditorship: 0x1c04412a,
    ProveOwnership: 0x04ded148,
    OwnershipProof: 0x0524c7ae,
    OwnershipProofBounced: 0xc18e86d2,
    RequestOwnerInfo: 0xd0c3bfea,
    OwnerInfo: 0x0dd607e3,
    OwnerInfoBounced: 0x7ca7b0fe,
    Destroy: 0x1f04537a,
    Revoke: 0x6f89f5e3
}

export const Queries = {
    transfer: (params: { queryId?: number, newOwner: Address | null, responseTo?: Address, forwardAmount?: BN }) => {
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
    destroy: (params: { queryId?: number}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.Destroy, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        return msgBody
    },
    revoke: (params: { queryId?: number}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.Revoke, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        return msgBody
    },
    proveOwnership: (params: { queryId?: number, to: Address, data: Cell, withContent:boolean }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.ProveOwnership, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.to)
        msgBody.refs.push(params.data)
        msgBody.bits.writeBit(params.withContent)

        return msgBody
    },
    requestOwnerInfo: (params: { queryId?: number, to: Address, data: Cell, withContent:boolean }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.RequestOwnerInfo, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.to)
        msgBody.refs.push(params.data)
        msgBody.bits.writeBit(params.withContent)

        return msgBody
    },
    ownershipProof: (params: { queryId?: number, id: number, owner: Address, data: Cell }, bounced?: boolean) => {
        let msgBody = new Cell()
        if (bounced === true) {
            msgBody.bits.writeUint(0xffffffff, 32)
        }
        msgBody.bits.writeUint(OperationCodes.OwnershipProof, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeUint(params.id, 256)
        msgBody.bits.writeAddress(params.owner)
        msgBody.refs.push(params.data)
        msgBody.bits.writeUint(0, 64)
        msgBody.bits.writeBit(true)
        msgBody.refs.push(beginCell().endCell())

        return msgBody
    },
    ownerInfo: (params: { queryId?: number, id: number, initiator: Address, owner: Address, data: Cell }, bounced?: boolean) => {
        let msgBody = new Cell()
        if (bounced === true) {
            msgBody.bits.writeUint(0xffffffff, 32)
        }
        msgBody.bits.writeUint(OperationCodes.OwnerInfo, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeUint(params.id, 256)
        msgBody.bits.writeAddress(params.initiator)
        msgBody.bits.writeAddress(params.owner)
        msgBody.refs.push(params.data)
        msgBody.bits.writeUint(0, 64)
        msgBody.bits.writeBit(true)
        msgBody.refs.push(beginCell().endCell())

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