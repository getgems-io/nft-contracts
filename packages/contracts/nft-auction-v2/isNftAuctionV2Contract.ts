import {NftAuctionV2CodeCell} from "./NftAuctionV2.source";
import {Address, Cell} from "ton";
import {SmartContract} from "ton-contract-executor";

const NftAuctionV2CodeHash = NftAuctionV2CodeCell.hash();

export async function isNftAuctionV2Contract(address: Address, codeCell: Cell, dataCell: Cell) {
    return NftAuctionV2CodeHash.equals(codeCell.hash());
}

export async function isNftAuctionV2ContractModern(contract: SmartContract) {
    return NftAuctionV2CodeHash.equals(contract.codeCell.hash());
}
