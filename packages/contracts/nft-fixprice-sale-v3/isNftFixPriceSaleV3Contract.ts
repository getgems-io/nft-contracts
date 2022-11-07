import { Address, Cell } from 'ton'
import { NftFixPriceSaleV3CodeCell } from './NftFixpriceSaleV3.source'
import { SmartContract } from 'ton-contract-executor'

const NftFixPriceSaleV3CodeCellHash = NftFixPriceSaleV3CodeCell.hash()

export async function isNftFixPriceSaleV3Contract(address: Address, codeCell: Cell, _dataCell: Cell) {
  if (NftFixPriceSaleV3CodeCellHash.equals(codeCell.hash())) {
    return true
  }
}

export async function isNftFixPriceSaleV3ContractModern(contract: SmartContract) {
  if (NftFixPriceSaleV3CodeCellHash.equals(contract.codeCell.hash())) {
    return true
  }
}
