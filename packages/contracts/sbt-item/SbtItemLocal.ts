import {SmartContract} from "ton-contract-executor";
import {Address, Cell, CellMessage, CommonMessageInfo, contractAddress, InternalMessage, Slice, toNano} from "ton";
import BN from "bn.js";
import {
    buildSbtItemDataCell,
    buildSingleSbtDataCell,
    SbtItemData,
    SbtSingleData,
    Queries
} from "./SbtItem.data";
import {SbtItemSource, SbtSingleSource} from "./SbtItem.source";
import {decodeOffChainContent} from "../../nft-content/nftContent";
import {compileFunc} from "../../utils/compileFunc";

type NftDataResponse =
    | { isInitialized: false, index: number, collectionAddress: Address | null }
    | { isInitialized: true, index: number, collectionAddress: Address | null, ownerAddress: Address | null, content: string, contentRaw: Cell }

export class SbtItemLocal {
    private constructor(
        public readonly contract: SmartContract,
        public readonly address: Address
    ) {

    }

    static queries = Queries

    //
    // Get methods
    //

    async getNftData(): Promise<NftDataResponse> {
        let res = await this.contract.invokeGetMethod('get_nft_data', [])
        if (res.type !== 'success') {
            throw new Error(`Cant invoke getNftData`)
        }

        let [initialized, index, collectionAddressSlice, ownerAddress, content] = res.result as [BN, BN, Slice, Slice, Cell]

        let isInitialized = initialized.eqn(-1)

        if (!isInitialized) {
            return {
                isInitialized: false,
                index: index.toNumber(),
                collectionAddress: collectionAddressSlice.readAddress()!
            }
        }

        let collectionAddress = collectionAddressSlice.readAddress()
        let isSingle = !collectionAddress

        return {
            isInitialized: true,
            index: index.toNumber(),
            collectionAddress,
            ownerAddress: ownerAddress.readAddress()!,
            content: isSingle ? decodeOffChainContent(content) : content.bits.buffer.toString(),
            contentRaw: content
        }
    }

    async getAuthority(): Promise<Address | null> {
        let res = await this.contract.invokeGetMethod('get_authority_address', [])
        if (res.type !== 'success') {
            throw new Error(`Cant invoke get_authority_address`)
        }

        let [key] = res.result as [Slice]

        return key.readAddress()
    }

    async getEditor(): Promise<Address | null> {
        let res = await this.contract.invokeGetMethod('get_editor', [])
        if (res.type !== 'success') {
            return null
        }
        let [editorSlice] = res.result as [Slice]
        return editorSlice.readAddress()
    }

    //
    //  Internal messages
    //

    async sendTransfer(from: Address, to: Address) {

    }

    async sendGetStaticData(from: Address) {
        let msgBody = Queries.getStaticData({})

        return await this.contract.sendInternalMessage(new InternalMessage({
            to: this.address,
            from: from,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(msgBody)
            })
        }))
    }

    async sendEditContent(from: Address, params: { queryId?: number, content: string}) {
        let msgBody = Queries.editContent(params)
        return await this.contract.sendInternalMessage(new InternalMessage({
            to: this.address,
            from: from,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(msgBody)
            })
        }))
    }

    async sendTransferEditorship(from: Address, params: { queryId?: number, newEditor: Address, responseTo: Address | null, forwardAmount?: BN }) {
        let msgBody = Queries.transferEditorship(params)
        return await this.contract.sendInternalMessage(new InternalMessage({
            to: this.address,
            from: from,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(msgBody)
            })
        }))
    }

    static async createFromConfig(config: SbtItemData) {
        let code = await compileFunc(SbtItemSource)

        let data = buildSbtItemDataCell(config)
        let contract = await SmartContract.fromCell(code.cell, data, {
            debug: true
        })

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new SbtItemLocal(contract, address)
    }

    static async createSingle(config: SbtSingleData) {
        let code = await compileFunc(SbtSingleSource)

        let data = buildSingleSbtDataCell(config)
        let contract = await SmartContract.fromCell(code.cell, data)

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new SbtItemLocal(contract, address)
    }

    static async create(config: { code: Cell, data: Cell, address: Address }) {
        let contract = await SmartContract.fromCell(config.code, config.data)
        contract.setC7Config({
            myself: config.address
        })
        return new SbtItemLocal(contract, config.address)
    }

    static async createFromContract(contract: SmartContract, address: Address) {
        contract.setC7Config({
            myself: address
        })
        return new SbtItemLocal(contract, address)
    }
}