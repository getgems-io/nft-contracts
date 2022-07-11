import {Address, Cell} from "ton";
import {NftFixPriceSaleV2CodeCell} from "./NftFixpriceSaleV2.source";
import {SmartContract} from "ton-contract-executor";

const NftFixPriceSaleV2CodeCellHash = NftFixPriceSaleV2CodeCell.hash()

export async function isNftFixPriceSaleV2Contract(address: Address, codeCell: Cell, dataCell: Cell) {
    if (NftFixPriceSaleV2CodeCellHash.equals(codeCell.hash())) {
        return true
    }
}

export async function isNftFixPriceSaleV2ContractModern(contract: SmartContract) {
    if (NftFixPriceSaleV2CodeCellHash.equals(contract.codeCell.hash())) {
        return true
    }
}