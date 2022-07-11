import {Address, Cell, Slice} from "ton";
import {SmartContract} from "ton-contract-executor";
import BN from "bn.js";
import {NftItemCodeCell, NftSingleCodeCell} from "./NftItem.source";

const NftItemCodeCellHash = NftItemCodeCell.hash()
const NftSingleCodeCellHash = NftSingleCodeCell.hash()

export async function isNftItemContract(address: Address, codeCell: Cell, dataCell: Cell) {
    let contract = await SmartContract.fromCell(codeCell, dataCell)
    return await isNftItemContractModern(contract)
}

export async function isNftItemContractModern(contract: SmartContract) {
    let codeHash = contract.codeCell.hash()

    // Most common case for standard contracts
    if (NftItemCodeCellHash.equals(codeHash)) {
        return true
    }
    if (NftSingleCodeCellHash.equals(codeHash)) {
        return true
    }

    try {
        // (int, int, slice, slice, cell) get_nft_data()
        let res = await contract.invokeGetMethod('get_nft_data', [])
        if (res.exit_code !== 0 || res.type !== 'success') {
            return false
        }

        // Actually it should be strictly 5, but some NFT's return extra info
        if (res.result.length < 5) {
            return false
        }

        let [initialized, index, collectionAddress, ownerAddress, content] = res.result

        if (!(initialized instanceof BN)) {
            return false
        }
        if (!(index instanceof BN)) {
            return false
        }
        if (!(collectionAddress instanceof Slice)) {
            return false
        }
        if (!(ownerAddress instanceof Slice)) {
            return false
        }
        if (!(content instanceof Cell)) {
            return false
        }

        return true
    } catch (e) {
        return false
    }
}