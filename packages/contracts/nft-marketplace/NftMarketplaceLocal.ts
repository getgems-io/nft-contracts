import {SmartContract} from "ton-contract-executor";
import {Address, Cell, CellMessage, CommonMessageInfo, contractAddress, InternalMessage, toNano} from "ton";
import {
    buildNftMarketplaceDataCell,
    buildNftMarketplaceStateInit,
    NftMarketplaceData, OperationCodes,
    Queries
} from "./NftMarketplace.data";
import {NftMarketplaceSource} from "./NftMarketplace.source";
import BN from "bn.js";
import {KeyPair} from "ton-crypto";
import {compileFunc} from "../../utils/compileFunc";

export class NftMarketplaceLocal {
    private constructor(
        public readonly contract: SmartContract,
        public readonly address: Address
    ) {

    }

    static operationCodes = OperationCodes
    static queries = Queries

    static async buildStateInit(keyPair: KeyPair) {
        return buildNftMarketplaceStateInit(keyPair)
    }

    async getSeqno() {
        let res = await this.contract.invokeGetMethod('seqno', [])
        return res.result[0] as BN
    }

    async getPublicKey() {
        let res = await this.contract.invokeGetMethod('get_public_key', [])
        return (res.result[0] as BN).toBuffer()
    }

    async sendDeploySaleSigned(from: Address, saleConf: { keyPair: KeyPair, saleStateInit: Cell, saleMessageBody: Cell }) {
        let request = Queries.signedDeploySale(saleConf)

        return await this.contract.sendInternalMessage(new InternalMessage({
            to: this.address,
            from: from,
            value: toNano(1),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(request)
            })
        }))
    }

    static async createFromConfig(config: NftMarketplaceData) {
        let code = await compileFunc(NftMarketplaceSource)

        let data = buildNftMarketplaceDataCell(config)
        let contract = await SmartContract.fromCell(code.cell, data)

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new NftMarketplaceLocal(contract, address)
    }

    static async create(config: { code: Cell, data: Cell, address: Address }) {
        let contract = await SmartContract.fromCell(config.code, config.data)
        contract.setC7Config({
            myself: config.address
        })
        return new NftMarketplaceLocal(contract, config.address)
    }
}