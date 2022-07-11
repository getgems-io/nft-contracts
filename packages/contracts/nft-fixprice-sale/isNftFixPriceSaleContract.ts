import {Address, Cell, Slice} from "ton";
import {NftFixPriceSaleCodeCell} from "./NftFixPriceSale.source";
import {SmartContract} from "ton-contract-executor";
import BN from "bn.js";

export async function isNftFixPriceSaleContract(address: Address, codeCell: Cell, dataCell: Cell) {
    // Most common case for standard contracts
    if (NftFixPriceSaleCodeCell.hash().equals(codeCell.hash())) {
        return true
    }

    try {
        let contract = await SmartContract.fromCell(codeCell, dataCell)

        // (int, int, slice, slice, cell) get_nft_data()
        let res = await contract.invokeGetMethod('get_sale_data', [])
        if (res.exit_code !== 0 || res.type !== 'success') {
            return false
        }

        if (res.result.length !== 5) {
            return false
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
        ] = res.result

        return (
            marketplaceAddressSlice instanceof Slice &&
            nftAddressSlice instanceof Slice &&
            nftOwnerAddressSlice instanceof Slice &&
            fullPrice instanceof BN &&
            marketplaceFeeAddressSlice instanceof Slice &&
            marketplaceFee instanceof BN &&
            royaltyAddressSlice instanceof Slice &&
            royaltyAmount instanceof BN
        )
    } catch (e) {
        return false
    }
}