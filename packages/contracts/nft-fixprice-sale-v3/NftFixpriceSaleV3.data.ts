import { Address, Builder, Cell, contractAddress, StateInit } from 'ton'
import BN from 'bn.js'
import { NftFixPriceSaleV3CodeCell } from './NftFixpriceSaleV3.source'

export type NftFixPriceSaleV3Data = {
  isComplete: boolean
  createdAt: number
  marketplaceAddress: Address
  nftAddress: Address
  nftOwnerAddress: Address | null
  fullPrice: BN
  marketplaceFeeAddress: Address
  marketplaceFee: BN
  royaltyAddress: Address
  royaltyAmount: BN
  canDeployByExternal?: boolean
}

export function buildNftFixPriceSaleV3DataCell(data: NftFixPriceSaleV3Data) {
  const feesCell = new Cell()

  feesCell.bits.writeAddress(data.marketplaceFeeAddress)
  feesCell.bits.writeCoins(data.marketplaceFee)
  feesCell.bits.writeAddress(data.royaltyAddress)
  feesCell.bits.writeCoins(data.royaltyAmount)

  const dataCell = new Cell()

  dataCell.bits.writeUint(data.isComplete ? 1 : 0, 1)
  dataCell.bits.writeUint(data.createdAt, 32)
  dataCell.bits.writeAddress(data.marketplaceAddress)
  dataCell.bits.writeAddress(data.nftAddress)
  dataCell.bits.writeAddress(data.nftOwnerAddress)
  dataCell.bits.writeCoins(data.fullPrice)
  dataCell.refs.push(feesCell)
  dataCell.bits.writeUint(data.canDeployByExternal ? 1 : 0, 1) // can_deploy_by_external

  return dataCell
}

export function buildNftFixPriceSaleV3StateInit(
  data: Omit<NftFixPriceSaleV3Data, 'nftOwnerAddress' | 'isComplete'>
) {
  const dataCell = buildNftFixPriceSaleV3DataCell({
    ...data,
    // Nft owner address would be set by NFT itself by ownership_assigned callback
    nftOwnerAddress: null,
    isComplete: false,
  })

  const stateInit = new StateInit({
    code: NftFixPriceSaleV3CodeCell,
    data: dataCell,
  })
  const address = contractAddress({
    workchain: 0,
    initialCode: NftFixPriceSaleV3CodeCell,
    initialData: dataCell,
  })

  return {
    address,
    stateInit,
  }
}

export const OperationCodes = {
  AcceptCoins: 1,
  Buy: 2,
  CancelSale: 3,
  ChangePrice: 0x6c6c2080,
}

export const Queries = {
  cancelSale: (params: { queryId?: number }) => {
    const msgBody = new Cell()
    msgBody.bits.writeUint(OperationCodes.CancelSale, 32)
    msgBody.bits.writeUint(params.queryId ?? 0, 64)
    return msgBody
  },
  deployMsg: (params: { queryId?: number }) => {
    const msgBody = new Cell()
    msgBody.bits.writeUint(OperationCodes.AcceptCoins, 32)
    msgBody.bits.writeUint(params.queryId ?? 0, 64)
    return msgBody
  },
  changePrice: (params: { price: BN, marketplaceFee: BN, royaltyAmount: BN }) => {
    const msgBody = new Cell()
    msgBody.bits.writeUint(OperationCodes.ChangePrice, 32)
    msgBody.bits.writeUint(0, 64) // query id

    msgBody.bits.writeCoins(params.price)
    msgBody.bits.writeCoins(params.marketplaceFee)
    msgBody.bits.writeCoins(params.royaltyAmount)

    return msgBody
  },
  buyMessage(param: { queryId: bigint }) {
    return new Builder().storeUint(OperationCodes.Buy, 32)
      .storeUint(new BN(param.queryId.toString()), 64)
      .endCell()
  },
}

export type NftFixPriceSaleV3R3Data = {
  isComplete: boolean
  createdAt: number
  marketplaceAddress: Address
  nftAddress: Address
  nftOwnerAddress: Address | null
  fullPrice: BN
  marketplaceFeeAddress: Address
  marketplaceFee: BN
  royaltyAddress: Address
  royaltyAmount: BN
  soldAt: number
  queryId: BN
}

export function buildNftFixPriceSaleV3R3DataCell(data: NftFixPriceSaleV3Data | NftFixPriceSaleV3R3Data) {
  const feesCell = new Cell()

  feesCell.bits.writeAddress(data.marketplaceFeeAddress)
  feesCell.bits.writeCoins(data.marketplaceFee)
  feesCell.bits.writeAddress(data.royaltyAddress)
  feesCell.bits.writeCoins(data.royaltyAmount)

  const dataCell = new Cell()

  dataCell.bits.writeUint(data.isComplete ? 1 : 0, 1)
  dataCell.bits.writeUint(data.createdAt, 32)
  dataCell.bits.writeAddress(data.marketplaceAddress)
  dataCell.bits.writeAddress(data.nftAddress)
  dataCell.bits.writeAddress(data.nftOwnerAddress)
  dataCell.bits.writeCoins(data.fullPrice)
  dataCell.refs.push(feesCell)
  dataCell.bits.writeUint('soldAt' in data ? data.soldAt : 0, 32)
  dataCell.bits.writeUint('queryId' in data ? data.queryId : 0, 64)

  return dataCell
}
