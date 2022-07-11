import {Cell, Slice} from "ton";
import {NftCollectionCodeCell} from "./NftCollection.source";
import {SmartContract} from "ton-contract-executor";
import BN from "bn.js";

const NftCollectionCodeCellHash = NftCollectionCodeCell.hash()

export async function isNftCollectionContract(contract: SmartContract) {
    let codeHash = contract.codeCell.hash()

    // Most common case for standard contracts
    if (NftCollectionCodeCellHash.equals(codeHash)) {
        return true
    }

    try {
        // (int, cell, slice) get_collection_data()
        let res = await contract.invokeGetMethod('get_collection_data', [])

        if (res.exit_code !== 0 || res.type !== 'success') {
            return false
        }

        if (res.result.length !== 3) {
            return false
        }

        let [index, content, owner] = res.result

        if (!(index instanceof BN)) {
            return false
        }

        if (!(content instanceof Cell)) {
            return false
        }

        if (!(owner instanceof Slice)) {
            return false
        }

        return true
    } catch (e) {
        return false
    }
}