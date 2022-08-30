import {Cell, CellMessage, CommonMessageInfo, ExternalMessage, InternalMessage, toNano} from "ton";
import {randomAddress} from "../../utils/randomAddress";
import {SbtItemData, SbtSingleData, OperationCodes, Queries} from "./SbtItem.data";
import {SbtItemLocal} from "./SbtItemLocal";
import {decodeOffChainContent} from "../../nft-content/nftContent";
import {SendMsgAction} from "ton-contract-executor";
import BN = require("bn.js");

import {
    createPrivateKey
} from 'node:crypto';
import {Address} from "ton/dist";

const privateKey = createPrivateKey("-----BEGIN PRIVATE KEY-----\n" +
    "MC4CAQAwBQYDK2VwBCIEIA1scXXBIFR8kubx8NyDPx5uTOzxtl2RZjgdHZhBG3v3\n" +
    "-----END PRIVATE KEY-----")

const privateKey2 = createPrivateKey("-----BEGIN PRIVATE KEY-----\n" +
    "MC4CAQAwBQYDK2VwBCIEIM6tgvtZK8ZQBwlVplZb1FxgtSgM8E6PnoQqhxZhiO5G\n" +
    "-----END PRIVATE KEY-----\n")

const pubKey = new BN("56001581745923382025098559417434591897568074235951937438714082547311791744987", 10)

const OWNER_ADDRESS = randomAddress()
const AUTHORITY_ADDRESS = randomAddress()
const COLLECTION_ADDRESS = randomAddress()
const EDITOR_ADDRESS = randomAddress()


const defaultConfig: SbtItemData = {
    index: 777,
    collectionAddress: COLLECTION_ADDRESS,
    ownerAddress: OWNER_ADDRESS,
    authorityAddress: AUTHORITY_ADDRESS,
    content: 'test',
    ownerPubKey: pubKey,
    nonce: 1
}

const singleConfig: SbtSingleData = {
    ownerAddress: OWNER_ADDRESS,
    editorAddress: EDITOR_ADDRESS,
    content: 'test_content',
    authorityAddress: AUTHORITY_ADDRESS,
    ownerPubKey: pubKey,
    nonce: 1
}

describe('sbt item smc', () => {
    it('should ignore external messages', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)

        let res = await sbt.contract.sendExternalMessage(new ExternalMessage({
            to: sbt.address,
            from: OWNER_ADDRESS,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))

        expect(res.exit_code).not.toEqual(0)
    })

    it('should return item data', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let res = await sbt.getNftData()
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
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let res = await sbt.getEditor()
        expect(res).toEqual(null)
    })

    it('should not transfer', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
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

        expect(res.exit_code).toEqual(403)
    })

    it('bad seqno pull ownership', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: newOwner,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 2,
                    key: privateKey,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(409)
    })

    it('bad signature pull ownership', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: newOwner,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 1,
                    key: privateKey2,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('bad address pull ownership', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 1,
                    key: privateKey,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(403)
    })

    it('should pull ownership', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: newOwner,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 1,
                    key: privateKey,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await sbt.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress.toFriendly()).toEqual(newOwner.toFriendly())

        expect( await sbt.getNonce()).not.toEqual(new BN(1))
        expect( await sbt.getPubKey()).toEqual(pubKey)
    })

    it('should destroy', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.destroy({}))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await sbt.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress).toEqual(null)
        expect( await sbt.getPubKey()).toEqual(new BN(0))
    })

    it('should revoke', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.authorityAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.revoke({}))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await sbt.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress).toEqual(null)
        expect( await sbt.getPubKey()).toEqual(new BN(0))
    })

    it('should not revoke', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.revoke({}))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('should not destroy', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.authorityAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.destroy({}))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('random guy prove ownership', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)
        let someGuy = randomAddress()

        let dataCell = new Cell()
        dataCell.bits.writeUint(777,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: someGuy,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.proveOwnership({
                    to: randomAddress(),
                    data: dataCell,
                    withContent: false
                }))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('should prove ownership with content', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.proveOwnership({
                    to: randomAddress(),
                    data: dataCell,
                    withContent: true
                }))
            })
        }))
        expect(res.exit_code).toEqual(0)

        let [responseMessage] = res.actionList as [SendMsgAction]
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let index = response.readUintNumber(256)
        let owner = response.readAddress() as Address
        let data = response.readRef()
        let withCont = response.readBit()
        let cont = response.readRef()


        expect(op).toEqual(OperationCodes.VerifyOwnership)
        expect(queryId).toEqual(0)
        expect(index).toEqual(777)
        expect(owner.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
        expect(data.readUint(16).toNumber()).toEqual(888)
        expect(withCont).toEqual(true)
        expect(cont.readBuffer(4).toString()).toEqual('test')
    })

    it('should prove ownership without content', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.proveOwnership({
                    to: randomAddress(),
                    data: dataCell,
                    withContent: false
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let [responseMessage] = res.actionList as [SendMsgAction]
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let index = response.readUintNumber(256)
        let owner = response.readAddress() as Address
        let data = response.readRef()
        let withCont = response.readBit()


        expect(op).toEqual(OperationCodes.VerifyOwnership)
        expect(queryId).toEqual(0)
        expect(index).toEqual(777)
        expect(owner.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
        expect(data.readUint(16).toNumber()).toEqual(888)
        expect(withCont).toEqual(false)
    })

    it('should verify ownership bounce to owner', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            bounced: true,
            to: sbt.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.verifyOwnership({
                    id: 777,
                    to: defaultConfig.ownerAddress,
                    data: dataCell,
                }, true))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let [responseMessage] = res.actionList as [SendMsgAction]
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let index = response.readUintNumber(256)
        let owner = response.readAddress() as Address
        response.readBit()
        let data = response.readRef()

        expect(op).toEqual(OperationCodes.VerifyOwnershipBounced)
        expect(queryId).toEqual(0)
        expect(index).toEqual(777)
        expect(owner.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
        expect(data.readUint(16).toNumber()).toEqual(888)
    })

    it('should not verify ownership non bounced', async () => {
        let sbt = await SbtItemLocal.createFromConfig(defaultConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            bounced: false,
            to: sbt.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.verifyOwnership({
                    id: 777,
                    to: randomAddress(),
                    data: dataCell,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0xffff)
    })
})

describe('single sbt', () => {
    it('should return data', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let res = await sbt.getNftData()
        if (!res.isInitialized) {
            throw new Error()
        }
        expect(res.isInitialized).toBe(true)
        expect(res.index).toEqual(0)
        expect(res.collectionAddress).toEqual(null)
        expect(res.ownerAddress.toFriendly()).toEqual(singleConfig.ownerAddress!.toFriendly())
        expect(res.content).toEqual(singleConfig.content)
    })

    it('should return static data', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let res = await sbt.sendGetStaticData(randomAddress())
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

    it('should edit content', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let sender = randomAddress()

        let res = await sbt.sendEditContent(sender, {
            content: 'new_content'
        })
        // should fail if sender is not owner
        expect(res.exit_code).not.toEqual(0)

        res = await sbt.sendEditContent(EDITOR_ADDRESS, {
            content: 'new_content'
        })

        expect(res.exit_code).toBe(0)
        if (res.type !== 'success') {
            throw new Error()
        }

        let data = await sbt.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }
        expect(decodeOffChainContent(data.contentRaw)).toEqual('new_content')
    })

    it('should return editor address', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let editor = await sbt.getEditor()
        expect(editor!.toFriendly()).toEqual(singleConfig.editorAddress.toFriendly())
    })

    it('should transfer editorship', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let newEditor = randomAddress()
        let res = await sbt.sendTransferEditorship(EDITOR_ADDRESS, {
            newEditor,
            responseTo: null,
        })
        expect(res.exit_code).toEqual(0)
        let editorRes = await sbt.getEditor()
        expect(editorRes!.toFriendly()).toEqual(newEditor.toFriendly())
    })

    it('should not transfer', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
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

        expect(res.exit_code).toEqual(403)
    })

    it('bad seqno pull ownership', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: newOwner,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 2,
                    key: privateKey,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(409)
    })

    it('bad signature pull ownership', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: newOwner,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 1,
                    key: privateKey2,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('bad address pull ownership', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 1,
                    key: privateKey,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(403)
    })

    it('should pull ownership', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let newOwner = randomAddress()
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: newOwner,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.pullOwnership({
                    nonce: 1,
                    key: privateKey,
                    newOwner,
                    responseTo: randomAddress()
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await sbt.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress.toFriendly()).toEqual(newOwner.toFriendly())

        expect( await sbt.getNonce()).not.toEqual(new BN(1))
        expect( await sbt.getPubKey()).toEqual(pubKey)
    })

    it('should destroy', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.destroy({}))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await sbt.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress).toEqual(null)
        expect( await sbt.getPubKey()).toEqual(new BN(0))
    })

    it('should revoke', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.authorityAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.revoke({}))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await sbt.getNftData()
        if (!data.isInitialized) {
            throw new Error()
        }

        expect(data.ownerAddress).toEqual(null)
        expect( await sbt.getPubKey()).toEqual(new BN(0))
    })

    it('should not revoke', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.revoke({}))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('should not destroy', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.authorityAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.destroy({}))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('random guy prove ownership', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)
        let someGuy = randomAddress()

        let dataCell = new Cell()
        dataCell.bits.writeUint(777,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: someGuy,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.proveOwnership({
                    to: randomAddress(),
                    data: dataCell,
                    withContent: false,
                }))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('should prove ownership with content', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.proveOwnership({
                    to: randomAddress(),
                    data: dataCell,
                    withContent: true
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let [responseMessage] = res.actionList as [SendMsgAction]
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let index = response.readUintNumber(256)
        let owner = response.readAddress() as Address
        let data = response.readRef()
        let withCont =  response.readBit()
        let cont = response.readRef()
        cont.readBuffer(1) // skip chain tag

        expect(op).toEqual(OperationCodes.VerifyOwnership)
        expect(queryId).toEqual(0)
        expect(index).toEqual(0)
        expect(owner.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
        expect(data.readUint(16).toNumber()).toEqual(888)
        expect(withCont).toEqual(true)
        expect(cont.readBuffer('test_content'.length).toString()).toEqual('test_content')
    })

    it('should prove ownership without content', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            to: sbt.address,
            from: defaultConfig.ownerAddress,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.proveOwnership({
                    to: randomAddress(),
                    data: dataCell,
                    withContent: false
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let [responseMessage] = res.actionList as [SendMsgAction]
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let index = response.readUintNumber(256)
        let owner = response.readAddress() as Address
        let data = response.readRef()
        let withCont =  response.readBit()

        expect(op).toEqual(OperationCodes.VerifyOwnership)
        expect(queryId).toEqual(0)
        expect(index).toEqual(0)
        expect(owner.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
        expect(data.readUint(16).toNumber()).toEqual(888)
        expect(withCont).toEqual(false)
    })

    it('should verify ownership bounce to owner', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            bounced: true,
            to: sbt.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.verifyOwnership({
                    id: 777,
                    to: defaultConfig.ownerAddress,
                    data: dataCell,
                }, true))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let [responseMessage] = res.actionList as [SendMsgAction]
        let response = responseMessage.message.body.beginParse()

        let op = response.readUintNumber(32)
        let queryId = response.readUintNumber(64)
        let index = response.readUintNumber(256)
        let owner = response.readAddress() as Address
        response.readBit()
        let data = response.readRef()

        expect(op).toEqual(OperationCodes.VerifyOwnershipBounced)
        expect(queryId).toEqual(0)
        expect(index).toEqual(777)
        expect(owner.toFriendly()).toEqual(defaultConfig.ownerAddress.toFriendly())
        expect(data.readUint(16).toNumber()).toEqual(888)
    })

    it('should not verify ownership non bounced', async () => {
        let sbt = await SbtItemLocal.createSingle(singleConfig)

        let dataCell = new Cell()
        dataCell.bits.writeUint(888,16)

        let res = await sbt.contract.sendInternalMessage(new InternalMessage({
            bounced: false,
            to: sbt.address,
            from: randomAddress(),
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.verifyOwnership({
                    id: 777,
                    to: randomAddress(),
                    data: dataCell,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0xffff)
    })
})