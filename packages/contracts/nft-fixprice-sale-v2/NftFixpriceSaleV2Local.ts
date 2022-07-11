import {SmartContract} from "ton-contract-executor";
import {Address, Cell, contractAddress, Slice} from "ton";
import BN from "bn.js";
import {buildNftFixPriceSaleV2DataCell, NftFixPriceSaleV2Data, Queries} from "./NftFixpriceSaleV2.data";
import {NftFixPriceSaleSourceV2} from "./NftFixpriceSaleV2.source";
import {compileFunc} from "../../utils/compileFunc";

export class NftFixpriceSaleV2Local {
    private constructor(
        public readonly contract: SmartContract,
        public readonly address: Address
    ) {

    }

    static queries = Queries

    async getSaleData() {
        let res = await this.contract.invokeGetMethod('get_sale_data', [])

        if (res.exit_code !== 0) {
            throw new Error(`Unable to invoke get_sale_data on sale contract`)
        }

        let [
            saleType,
            isComplete,
            createdAt,
            marketplaceAddressSlice,
            nftAddressSlice,
            nftOwnerAddressSlice,
            fullPrice,
            marketplaceFeeAddressSlice,
            marketplaceFee,
            royaltyAddressSlice,
            royaltyAmount,
        ] = res.result as [BN, BN, BN, Slice, Slice, Slice, BN, Slice, BN, Slice, BN]

        if (saleType.toNumber() !== 0x46495850) {
            throw new Error(`Unknown sale type: ${saleType.toString()}`)
        }

        return {
            isComplete: isComplete.eqn(-1),
            createdAt: createdAt.toNumber(),
            marketplaceAddress: marketplaceAddressSlice.readAddress()!,
            nftAddress: nftAddressSlice.readAddress()!,
            nftOwnerAddress: nftOwnerAddressSlice.readAddress(),
            fullPrice,
            marketplaceFeeAddress: marketplaceFeeAddressSlice.readAddress()!,
            marketplaceFee,
            royaltyAddress: royaltyAddressSlice.readAddress()!,
            royaltyAmount,
        }
    }

    static async createFromConfig(config: NftFixPriceSaleV2Data) {
        let code = await compileFunc(NftFixPriceSaleSourceV2)

        let data = buildNftFixPriceSaleV2DataCell(config)
        let contract = await SmartContract.fromCell(code.cell, data)

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new NftFixpriceSaleV2Local(contract, address)
    }

    static async create(config: { code: Cell, data: Cell, address: Address }) {
        let contract = await SmartContract.fromCell(config.code, config.data)
        contract.setC7Config({
            myself: config.address
        })
        return new NftFixpriceSaleV2Local(contract, config.address)
    }

    static async createFromContract(contract: SmartContract, address: Address) {
        contract.setC7Config({
            myself: address
        })
        return new NftFixpriceSaleV2Local(contract, address)
    }
}