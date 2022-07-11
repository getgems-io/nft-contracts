import {SmartContract} from "ton-contract-executor";
import {Address, Cell, contractAddress, Slice} from "ton";
import {NftFixPriceSaleSource} from "./NftFixPriceSale.source";
import {buildNftFixPriceSaleDataCell, NftFixPriceSaleData} from "./NftFixPriceSale.data";
import BN from "bn.js";
import {compileFunc} from "../../utils/compileFunc";

export class NftFixpriceSaleLocal {
    private constructor(
        public readonly contract: SmartContract,
        public readonly address: Address
    ) {

    }

    async getSaleData() {
        let res = await this.contract.invokeGetMethod('get_sale_data', [])

        if (res.exit_code !== 0) {
            throw new Error(`Unable to invoke get_sale_data on sale contract`)
        }

        let [
            marketplaceAddressSlice,
            nftAddressSlice,
            nftOwnerAddressSlice,
            fullPrice,
            marketplaceFeeAddressSlice,
            marketplaceFee,
            royaltyAddressSlice,
            royaltyAmount,
        ] = res.result as [Slice, Slice, Slice, BN, Slice, BN, Slice, BN, BN]

        return {
            marketplaceAddress: marketplaceAddressSlice.readAddress()!,
            nftAddress: nftAddressSlice.readAddress()!,
            nftOwnerAddress: nftOwnerAddressSlice.readAddress()!,
            fullPrice,
            marketplaceFeeAddress: marketplaceFeeAddressSlice.readAddress()!,
            marketplaceFee,
            royaltyAddress: royaltyAddressSlice.readAddress()!,
            royaltyAmount,
        }
    }

    static async createFromConfig(config: NftFixPriceSaleData) {
        let code = await compileFunc(NftFixPriceSaleSource)

        let data = buildNftFixPriceSaleDataCell(config)
        let contract = await SmartContract.fromCell(code.cell, data)

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new NftFixpriceSaleLocal(contract, address)
    }

    static async create(config: { code: Cell, data: Cell, address: Address }) {
        let contract = await SmartContract.fromCell(config.code, config.data)
        contract.setC7Config({
            myself: config.address
        })
        return new NftFixpriceSaleLocal(contract, config.address)
    }
}