import {SmartContract} from "ton-contract-executor";
import {Address, Cell, CellMessage, CommonMessageInfo, contractAddress, InternalMessage, toNano} from "ton";
import {buildNftAuctionV2DataCell, NftAuctionV2Data, Queries} from "./NftAuctionV2.data";
import {NftAuctionV2CodeCell} from "./NftAuctionV2.source";
import {NftAuctionLocal} from "../nft-auction/NftAuctionLocal";
import BN from "bn.js";

export class NftAuctionV2Local extends NftAuctionLocal {

    public static queries = Queries
    public queries = Queries

    async sendStopMessage(from:Address) {
        const msg = this.queries.stopMessage();
        return await this.contract.sendInternalMessage(new InternalMessage({
            to: this.address,
            from: from,
            value: toNano('1'),
            bounce: true,
            body: new CommonMessageInfo({
                body: new CellMessage(msg)
            })
        }));
    }

    async sendCancelMessage(from:Address, currentBalance?: BN) {
        const msg = this.queries.cancelMessage();
        return await this.contract.sendInternalMessage(new InternalMessage({
            to: this.address,
            from: from,
            value: currentBalance ?  currentBalance.add(toNano('1')) : toNano('1'),
            bounce: true,
            body: new CommonMessageInfo({
                body: new CellMessage(msg)
            })
        }));
    }

    static async createFromConfig(config: NftAuctionV2Data) {

        let data = buildNftAuctionV2DataCell(config)
        // const code = await buildAuctionV2ContractCode();
        // let contract = await SmartContract.fromCell(code, data)
        let contract = await SmartContract.fromCell(NftAuctionV2CodeCell, data)

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new NftAuctionV2Local(contract, address)
    }

    static async create(config: { code: Cell, data: Cell, address: Address }) {
        let contract = await SmartContract.fromCell(config.code, config.data)
        contract.setC7Config({
            myself: config.address
        })
        return new NftAuctionV2Local(contract, config.address)
    }

    static async createFromContract(contract: SmartContract, address: Address) {
        contract.setC7Config({
            myself: address
        })
        return new NftAuctionV2Local(contract, address)
    }
}