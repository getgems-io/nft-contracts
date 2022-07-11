import {Cell, CellMessage, CommonMessageInfo, ExternalMessage, InternalMessage, toNano} from "ton";
import {randomAddress} from "../../utils/randomAddress";
import {NftItemData, NftSingleData, OperationCodes, Queries} from "./NftItem.data";
import {NftItemLocal} from "./NftItemLocal";
import {decodeOffChainContent} from "../../nft-content/nftContent";
import {SendMsgAction} from "ton-contract-executor";

const OWNER_ADDRESS = randomAddress()
const COLLECTION_ADDRESS = randomAddress()
const ROYALTY_ADDRESS = randomAddress()
const EDITOR_ADDRESS = randomAddress()

const defaultConfig: NftItemData = {
    index: 777,
    collectionAddress: COLLECTION_ADDRESS,
    ownerAddress: OWNER_ADDRESS,
    content: 'test',
}

const singleConfig: NftSingleData = {
    ownerAddress: OWNER_ADDRESS,
    editorAddress: EDITOR_ADDRESS,
    content: 'test_content',
    royaltyParams: {
        royaltyFactor: 100,
        royaltyBase: 200,
        royaltyAddress: ROYALTY_ADDRESS
    }
}

describe('nft item smc', () => {
    it('should ignore external messages', async () => {
        let nft = await NftItemLocal.createFromConfig(defaultConfig)

        let res = await nft.contract.sendExternalMessage(new ExternalMessage({
            to: nft.address,
            from: OWNER_ADDRESS,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))

        expect(res.exit_code).not.toEqual(0)
    })

    it('should return item data', async () => {
        let nft = await NftItemLocal.createFromConfig(defaultConfig)
        let res = await nft.getNftData()
        if (!res.isInitialized) {
            throw new Error()
        }
        expect(res.isInitialized).toBe(true)
        expect(res.index).toEqual(defaultConfig.index)
        expect(res.collectionAddress!.toFriendly()).toEqual(defaultConfig.collectionAddress!.toFriendly())
        expect(res.ownerAddress.toFriendly()).toEqual(defaultConfig.ownerAddress!.toFriendly())
        expect(res.content).toEqual(defaultConfig.content)
    })

    it('should return editor', async () => {
        let nft = await NftItemLocal.createFromConfig(defaultConfig)
        let res = await nft.getEditor()
        expect(res).toEqual(null)
    })

    it('should transfer', async () => {
        let nft = await NftItemLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()
        let res = await nft.contract.sendInternalMessage(new InternalMessage({
            to: nft.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.transfer({
                    newOwner,
                    forwardAmount: toNano('0.01'),
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await nft.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress.toFriendly()).toEqual(newOwner.toFriendly())
    })

    it('should transfer ownership', async () => {
        let nft = await NftItemLocal.createFromConfig(defaultConfig)
    })
})

describe('single nft', () => {
    it('should return data', async () => {
        let nft = await NftItemLocal.createSingle(singleConfig)
        let res = await nft.getNftData()
        if (!res.isInitialized) {
            throw new Error()
        }
        expect(res.isInitialized).toBe(true)
        expect(res.index).toEqual(0)
        expect(res.collectionAddress).toEqual(null)
        expect(res.ownerAddress.toFriendly()).toEqual(singleConfig.ownerAddress!.toFriendly())
        expect(res.content).toEqual(singleConfig.content)
    })

    it('should return royalties', async () => {
        let nft = await NftItemLocal.createSingle(singleConfig)
        let royalties = await nft.getRoyaltyParams()
        expect(royalties).not.toEqual(null)
        expect(royalties!.royaltyBase).toEqual(singleConfig.royaltyParams.royaltyBase)
        expect(royalties!.royaltyFactor).toEqual(singleConfig.royaltyParams.royaltyFactor)
        expect(royalties!.royaltyAddress.toFriendly()).toEqual(singleConfig.royaltyParams.royaltyAddress.toFriendly())
    })

    it('should return static data', async () => {
        let nft = await NftItemLocal.createSingle(singleConfig)
        let res = await nft.sendGetStaticData(randomAddress())
        if (res.type !== 'success') {
            throw new Error()
        }

        let [responseMessage] = res.actionList as [SendMsgAction]
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let index = response.readUintNumber(256)
        let collectionAddress = response.readAddress()

        expect(op).toEqual(OperationCodes.getStaticDataResponse)
        expect(queryId).toEqual(0)
        expect(index).toEqual(0)
        expect(collectionAddress).toEqual(null)
    })

    it('should send royalty params', async () => {
        let nft = await NftItemLocal.createSingle(singleConfig)
        let sender = randomAddress()
        let res = await nft.sendGetRoyaltyParams(sender)

        expect(res.exit_code).toBe(0)
        if (res.type !== 'success') {
            throw new Error()
        }

        let [responseMessage] = res.actionList as [SendMsgAction]

        expect(responseMessage.message.info.dest!.toFriendly()).toEqual(sender.toFriendly())
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let royaltyFactor = response.readUintNumber(16)
        let royaltyBase = response.readUintNumber(16)
        let royaltyAddress = response.readAddress()!

        expect(op).toEqual(OperationCodes.GetRoyaltyParamsResponse)
        expect(queryId).toEqual(0)
        expect(royaltyFactor).toEqual(singleConfig.royaltyParams.royaltyFactor)
        expect(royaltyBase).toEqual(singleConfig.royaltyParams.royaltyBase)
        expect(royaltyAddress.toFriendly()).toEqual(singleConfig.royaltyParams.royaltyAddress.toFriendly())
    })

    it('should edit content', async () => {
        let nft = await NftItemLocal.createSingle(singleConfig)
        let sender = randomAddress()

        let royaltyAddress = randomAddress()
        let res = await nft.sendEditContent(sender, {
            content: 'new_content',
            royaltyParams: {
                royaltyFactor: 150,
                royaltyBase: 220,
                royaltyAddress
            }
        })
        // should fail if sender is not owner
        expect(res.exit_code).not.toEqual(0)

        res = await nft.sendEditContent(EDITOR_ADDRESS, {
            content: 'new_content',
            royaltyParams: {
                royaltyFactor: 150,
                royaltyBase: 220,
                royaltyAddress
            }
        })

        expect(res.exit_code).toBe(0)
        if (res.type !== 'success') {
            throw new Error()
        }

        let data = await nft.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }
        expect(decodeOffChainContent(data.contentRaw)).toEqual('new_content')
        let royalty = await nft.getRoyaltyParams()
        expect(royalty).not.toEqual(null)
        expect(royalty!.royaltyBase).toEqual(220)
        expect(royalty!.royaltyFactor).toEqual(150)
        expect(royalty!.royaltyAddress.toFriendly()).toEqual(royaltyAddress.toFriendly())
    })

    it('should return editor address', async () => {
        let nft = await NftItemLocal.createSingle(singleConfig)
        let editor = await nft.getEditor()
        expect(editor!.toFriendly()).toEqual(singleConfig.editorAddress.toFriendly())
    })

    it('should transfer editorship', async () => {
        let nft = await NftItemLocal.createSingle(singleConfig)
        let newEditor = randomAddress()
        let res = await nft.sendTransferEditorship(EDITOR_ADDRESS, {
            newEditor,
            responseTo: null,
        })
        expect(res.exit_code).toEqual(0)
        let editorRes = await nft.getEditor()
        expect(editorRes!.toFriendly()).toEqual(newEditor.toFriendly())
    })

    it('should transfer', async () => {
        let nft = await NftItemLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()
        let res = await nft.contract.sendInternalMessage(new InternalMessage({
            to: nft.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.transfer({
                    newOwner,
                    forwardAmount: toNano('0.01'),
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await nft.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress.toFriendly()).toEqual(newOwner.toFriendly())
    })
})