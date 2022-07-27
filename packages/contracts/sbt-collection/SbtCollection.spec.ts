import {CollectionMintItemInput, SbtCollectionData, OperationCodes} from "./SbtCollection.data";
import {Cell, CellMessage, CommonMessageInfo, contractAddress, ExternalMessage, toNano, TonClient} from "ton";
import {SbtCollectionLocal} from "./SbtCollectionLocal";
import {randomAddress} from "../../utils/randomAddress";
import {SendMsgAction} from "ton-contract-executor";
import BN = require("bn.js");

const OWNER_ADDRESS = randomAddress()

const defaultConfig: SbtCollectionData = {
    ownerAddress: OWNER_ADDRESS,
    nextItemIndex: 777,
    collectionContent: 'collection_content',
    commonContent: 'common_content',
    nftItemCode: new Cell()
}

describe('nft collection smc', () => {

    it('should ignore external messages', async () => {
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)

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
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)

        let res = await collection.getCollectionData()

        expect(res.nextItemId).toEqual(defaultConfig.nextItemIndex)
        expect(res.collectionContent).toEqual(defaultConfig.collectionContent)
        expect(res.ownerAddress.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
    })

    it('should return nft content', async () => {
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)

        let nftContent = new Cell()
        nftContent.bits.writeBuffer(Buffer.from('1'))
        // nftContent.bits.writeString('1')

        let res = await collection.getNftContent(0, nftContent)
        expect(res).toEqual(defaultConfig.commonContent + '1')
    })

    it('should return nft address by index', async () => {
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)

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

    it('should deploy new nft', async () => {
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)

        let itemIndex = 1

        let res = await collection.sendDeployNewSbt(OWNER_ADDRESS, toNano('1'), {
            passAmount: toNano('0.5'),
            itemIndex,
            itemOwnerAddress: OWNER_ADDRESS,
            itemContent: 'test_content',
            ownerPubKey: new BN(8)
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
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)


        let items: CollectionMintItemInput[] = [
            {
                passAmount: toNano('0.5'),
                index: 0,
                ownerAddress: randomAddress(),
                content: '1',
                ownerPubKey: new BN(7),
            },
            {
                passAmount: toNano('0.5'),
                index: 1,
                ownerAddress: randomAddress(),
                content: '2',
                ownerPubKey: new BN(8),
            },
        ]

        let res = await collection.sendBatchDeploySbt(OWNER_ADDRESS, toNano('1'), {
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
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)

        let itemIndex = 1

        let res = await collection.sendDeployNewSbt(randomAddress(), toNano('1'), {
            passAmount: toNano('0.5'),
            itemIndex,
            itemOwnerAddress: OWNER_ADDRESS,
            itemContent: 'test_content',
            ownerPubKey: new BN(8)
        })

        expect(res.exit_code).not.toEqual(0)
    })

    it('should change owner', async () => {
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()

        let res = await collection.sendChangeOwner(randomAddress(), newOwner)
        // Should fail if caller is not current user
        expect(res.exit_code).not.toEqual(0)

        res = await collection.sendChangeOwner(OWNER_ADDRESS, newOwner)

        expect(res.exit_code).toBe(0)
        let data = await collection.getCollectionData()
        expect(data.ownerAddress.toFriendly()).toEqual(newOwner.toFriendly())
    })

    it('should edit content', async () => {
        let collection = await SbtCollectionLocal.createFromConfig(defaultConfig)
        let sender = randomAddress()

        let royaltyAddress = randomAddress()
        let res = await collection.sendEditContent(sender, {
            collectionContent: 'new_content',
            commonContent: 'new_common_content'
        })
        // should fail if sender is not owner
        expect(res.exit_code).not.toEqual(0)

        res = await collection.sendEditContent(OWNER_ADDRESS, {
            collectionContent: 'new_content',
            commonContent: 'new_common_content'
        })

        expect(res.exit_code).toBe(0)
        if (res.type !== 'success') {
            throw new Error()
        }

        let data = await collection.getCollectionData()
        expect(data.collectionContent).toEqual('new_content')
    })

})