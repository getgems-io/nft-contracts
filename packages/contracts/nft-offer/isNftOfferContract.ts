import { Address, Cell } from 'ton'
import { NftOfferCodeCell } from './NftOffer.source'
import { SmartContract } from 'ton-contract-executor'

const NftOfferCodeCellHash = NftOfferCodeCell.hash()

export async function isNftOfferContract(address: Address, codeCell: Cell, _dataCell: Cell) {
  if (NftOfferCodeCellHash.equals(codeCell.hash())) {
    return true
  }
  return false
}

export async function isNftOfferContractModern(contract: SmartContract) {
  if (NftOfferCodeCellHash.equals(contract.codeCell.hash())) {
    return true
  }
  return false
}
