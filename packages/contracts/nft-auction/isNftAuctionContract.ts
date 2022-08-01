import {NftAuctionCodeCell} from "./NftAuction.source";
import {Address, Cell} from "ton";
import {SmartContract} from "ton-contract-executor";

const NftAuctionCodeHash = NftAuctionCodeCell.hash();

export async function isNftAuctionContract(address: Address, codeCell: Cell, dataCell: Cell) {
    return NftAuctionCodeHash.equals(codeCell.hash());
}

export async function isNftAuctionContractModern(contract: SmartContract) {
    return NftAuctionCodeHash.equals(contract.codeCell.hash());
}
