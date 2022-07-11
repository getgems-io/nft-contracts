import {CollectionMintItemInput, NftCollectionData, OperationCodes} from "./NftCollection.data";
import {Cell, CellMessage, CommonMessageInfo, contractAddress, ExternalMessage, toNano, TonClient} from "ton";
import {NftCollectionLocal} from "./NftCollectionLocal";
import {randomAddress} from "../../utils/randomAddress";
import {SendMsgAction} from "ton-contract-executor";

const OWNER_ADDRESS = randomAddress()
const ROYALTY_ADDRESS = randomAddress()

const defaultConfig: NftCollectionData = {
    ownerAddress: OWNER_ADDRESS,
    nextItemIndex: 777,
    collectionContent: 'collection_content',
    commonContent: 'common_content',
    nftItemCode: new Cell(),
    royaltyParams: {
        royaltyFactor: 100,
        royaltyBase: 200,
        royaltyAddress: ROYALTY_ADDRESS
    }
}

describe('nft collection smc', () => {

    it('should ignore external messages', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)

        let res = await collection.contract.sendExternalMessage(new ExternalMessage({
            to: collection.address,
            from: OWNER_ADDRESS,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))

        expect(res.exit_code).not.toEqual(0)
    })

    it('should return collection data', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)

        let res = await collection.getCollectionData()

        expect(res.nextItemId).toEqual(defaultConfig.nextItemIndex)
        expect(res.collectionContent).toEqual(defaultConfig.collectionContent)
        expect(res.ownerAddress.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
    })

    it('should return nft content', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)

        let nftContent = new Cell()
        nftContent.bits.writeBuffer(Buffer.from('1'))
        // nftContent.bits.writeString('1')

        let res = await collection.getNftContent(0, nftContent)
        expect(res).toEqual(defaultConfig.commonContent + '1')
    })

    it('should return nft address by index', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)

        let index = 77

        let res = await collection.getNftAddressByIndex(index)

        // Basic nft item data
        let nftItemData = new Cell()
        nftItemData.bits.writeUint(index, 64)
        nftItemData.bits.writeAddress(collection.address)

        let expectedAddress = contractAddress({
            workchain: 0,
            initialCode: defaultConfig.nftItemCode,
            initialData: nftItemData
        })

        expect(res.toFriendly()).toEqual(expectedAddress.toFriendly())
    })

    it('should return royalty params', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)

        let res = await collection.getRoyaltyParams()

        expect(res.royaltyBase).toEqual(defaultConfig.royaltyParams.royaltyBase)
        expect(res.royaltyFactor).toEqual(defaultConfig.royaltyParams.royaltyFactor)
        expect(res.royaltyAddress.toFriendly()).toEqual(defaultConfig.royaltyParams.royaltyAddress.toFriendly())
    })

    it('should deploy new nft', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)

        let itemIndex = 1

        let res = await collection.sendDeployNewNft(OWNER_ADDRESS, toNano('1'), {
            passAmount: toNano('0.5'),
            itemIndex,
            itemOwnerAddress: OWNER_ADDRESS,
            itemContent: 'test_content'
        })

        if (res.type !== 'success') {
            throw new Error()
        }

        // Basic nft item data
        let nftItemData = new Cell()
        nftItemData.bits.writeUint(itemIndex, 64)
        nftItemData.bits.writeAddress(collection.address)

        // As a result of mint query, collection contract should send stateInit message to NFT item contract
        expect(res.actionList.length).toBe(1)
        let [initMessage] = res.actionList as [SendMsgAction]

        expect(initMessage.message.init!.code!.toString()).toEqual(defaultConfig.nftItemCode.toString())
        expect(initMessage.message.init!.data!.toString()).toEqual(nftItemData.toString())

    })

    it('should batch deploy nft\'s', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)


        let items: CollectionMintItemInput[] = [
            {
                passAmount: toNano('0.5'),
                index: 0,
                ownerAddress: randomAddress(),
                content: '1'
            },
            {
                passAmount: toNano('0.5'),
                index: 1,
                ownerAddress: randomAddress(),
                content: '2'
            },
        ]

        let res = await collection.sendBatchDeployNft(OWNER_ADDRESS, toNano('1'), {
            items
        })
        if (res.type !== 'success') {
            throw new Error()
        }

        expect(res.actionList.length).toBe(2)

        let [initMessage1, initMessage2] = res.actionList as [SendMsgAction, SendMsgAction]

        let nftItemData1 = new Cell()
        nftItemData1.bits.writeUint(0, 64)
        nftItemData1.bits.writeAddress(collection.address)

        let nftItemData2 = new Cell()
        nftItemData2.bits.writeUint(1, 64)
        nftItemData2.bits.writeAddress(collection.address)

        expect(initMessage1.message.init!.code!.toString()).toEqual(defaultConfig.nftItemCode.toString())
        expect(initMessage1.message.init!.data!.toString()).toEqual(nftItemData1.toString())
        expect(initMessage2.message.init!.code!.toString()).toEqual(defaultConfig.nftItemCode.toString())
        expect(initMessage2.message.init!.data!.toString()).toEqual(nftItemData2.toString())
    })

    it('should deploy nft only if owner calls', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)

        let itemIndex = 1

        let res = await collection.sendDeployNewNft(randomAddress(), toNano('1'), {
            passAmount: toNano('0.5'),
            itemIndex,
            itemOwnerAddress: OWNER_ADDRESS,
            itemContent: 'test_content'
        })

        expect(res.exit_code).not.toEqual(0)
    })

    it('should change owner', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()

        let res = await collection.sendChangeOwner(randomAddress(), newOwner)
        // Should fail if caller is not current user
        expect(res.exit_code).not.toEqual(0)

        res = await collection.sendChangeOwner(OWNER_ADDRESS, newOwner)

        expect(res.exit_code).toBe(0)
        let data = await collection.getCollectionData()
        expect(data.ownerAddress.toFriendly()).toEqual(newOwner.toFriendly())
    })

    it('should send royalty params', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)
        let sender = randomAddress()
        let res = await collection.sendGetRoyaltyParams(sender)

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
        expect(royaltyFactor).toEqual(defaultConfig.royaltyParams.royaltyFactor)
        expect(royaltyBase).toEqual(defaultConfig.royaltyParams.royaltyBase)
        expect(royaltyAddress.toFriendly()).toEqual(defaultConfig.royaltyParams.royaltyAddress.toFriendly())
    })

    it('should edit content', async () => {
        let collection = await NftCollectionLocal.createFromConfig(defaultConfig)
        let sender = randomAddress()

        let royaltyAddress = randomAddress()
        let res = await collection.sendEditContent(sender, {
            collectionContent: 'new_content',
            commonContent: 'new_common_content',
            royaltyParams: {
                royaltyFactor: 150,
                royaltyBase: 220,
                royaltyAddress
            }
        })
        // should fail if sender is not owner
        expect(res.exit_code).not.toEqual(0)

        res = await collection.sendEditContent(OWNER_ADDRESS, {
            collectionContent: 'new_content',
            commonContent: 'new_common_content',
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

        let data = await collection.getCollectionData()
        expect(data.collectionContent).toEqual('new_content')
        let royalty = await collection.getRoyaltyParams()
        expect(royalty.royaltyBase).toEqual(220)
        expect(royalty.royaltyFactor).toEqual(150)
        expect(royalty.royaltyAddress.toFriendly()).toEqual(royaltyAddress.toFriendly())
    })

})