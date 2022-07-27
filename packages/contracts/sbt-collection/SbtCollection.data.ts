import {Address, Cell, contractAddress, serializeDict, StateInit} from "ton";
import BN from "bn.js";
import {encodeOffChainContent} from "../../nft-content/nftContent";


export type SbtCollectionData = {
    ownerAddress: Address,
    nextItemIndex: number | BN
    collectionContent: string
    commonContent: string
    nftItemCode: Cell
}

// storage#_ owner_address:MsgAddress next_item_index:uint64
//           ^[collection_content:^Cell common_content:^Cell]
//           nft_item_code:^Cell
//           = Storage;

export function buildSbtCollectionDataCell(data: SbtCollectionData) {
    let dataCell = new Cell()

    dataCell.bits.writeAddress(data.ownerAddress)
    dataCell.bits.writeUint(data.nextItemIndex, 64)

    let contentCell = new Cell()

    let collectionContent = encodeOffChainContent(data.collectionContent)

    let commonContent = new Cell()
    commonContent.bits.writeBuffer(Buffer.from(data.commonContent))

    contentCell.refs.push(collectionContent)
    contentCell.refs.push(commonContent)
    dataCell.refs.push(contentCell)

    dataCell.refs.push(data.nftItemCode)

    return dataCell
}

export const OperationCodes = {
    Mint: 1,
    BatchMint: 2,
    ChangeOwner: 3,
    EditContent: 4
}

export type CollectionMintItemInput = {
    passAmount: BN
    index: number
    ownerAddress: Address
    content: string
    ownerPubKey: BN
}

export const Queries = {
    mint: (params: { queryId?: number, passAmount: BN, itemIndex: number, itemOwnerAddress: Address, itemContent: string, ownerPubKey: BN }) => {
        let msgBody = new Cell()

        msgBody.bits.writeUint(OperationCodes.Mint, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeUint(params.itemIndex, 64)
        msgBody.bits.writeCoins(params.passAmount)

        let itemContent = new Cell()
        // itemContent.bits.writeString(params.itemContent)
        itemContent.bits.writeBuffer(Buffer.from(params.itemContent))

        let nftItemMessage = new Cell()

        nftItemMessage.bits.writeAddress(params.itemOwnerAddress)
        nftItemMessage.bits.writeUint(params.ownerPubKey, 256)
        nftItemMessage.refs.push(itemContent)

        msgBody.refs.push(nftItemMessage)

        return msgBody
    },
    batchMint: (params: { queryId?: number, items: CollectionMintItemInput[] }) => {
        if (params.items.length > 250) {
            throw new Error('Too long list')
        }

        let itemsMap = new Map<string, CollectionMintItemInput>()

        for (let item of params.items) {
            itemsMap.set(item.index.toString(10), item)
        }

        let dictCell = serializeDict(itemsMap, 64, (src, cell) => {
            let nftItemMessage = new Cell()

            let itemContent = new Cell()
            // itemContent.bits.writeString(packages.content)
            itemContent.bits.writeBuffer(Buffer.from(src.content))

            nftItemMessage.bits.writeAddress(src.ownerAddress)
            nftItemMessage.bits.writeUint(src.ownerPubKey, 256)
            nftItemMessage.refs.push(itemContent)

            cell.bits.writeCoins(src.passAmount)
            cell.refs.push(nftItemMessage)
        })

        let msgBody = new Cell()

        msgBody.bits.writeUint(OperationCodes.BatchMint, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.refs.push(dictCell)

        return msgBody
    },
    changeOwner: (params: { queryId?: number, newOwner: Address}) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.ChangeOwner, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.newOwner)
        return msgBody
    },
    editContent: (params: { queryId?: number,  collectionContent: string, commonContent: string }) => {
        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.EditContent, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)

        let contentCell = new Cell()

        let collectionContent = encodeOffChainContent(params.collectionContent)

        let commonContent = new Cell()
        commonContent.bits.writeBuffer(Buffer.from(params.commonContent))

        contentCell.refs.push(collectionContent)
        contentCell.refs.push(commonContent)

        msgBody.refs.push(contentCell)

        return msgBody
    }
}