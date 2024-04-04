import { Address, Builder, Cell, contractAddress, StateInit } from 'ton'
import BN from 'bn.js'
import { NftOfferCodeCell } from './NftOffer.source'

export type NftOfferData = {
  isComplete: boolean
  createdAt: number
  finishAt: number
  marketplaceAddress: Address
  nftAddress: Address
  offerOwnerAddress: Address
  fullPrice: BN
  marketplaceFeeAddress: Address
  royaltyAddress: Address
  marketplaceFactor: number
  marketplaceBase: number
  royaltyFactor: number
  royaltyBase: number
  canDeploy?: number // for tests only
}

export function buildNftOfferDataCell(data: NftOfferData) {
  const feesCell = new Cell()

  feesCell.bits.writeAddress(data.marketplaceFeeAddress)
  feesCell.bits.writeUint(data.marketplaceFactor, 32)
  feesCell.bits.writeUint(data.marketplaceBase, 32)
  feesCell.bits.writeAddress(data.royaltyAddress)
  feesCell.bits.writeUint(data.royaltyFactor, 32)
  feesCell.bits.writeUint(data.royaltyBase, 32)

  const dataCell = new Cell()

  dataCell.bits.writeUint(data.isComplete ? 1 : 0, 1)
  dataCell.bits.writeUint(data.createdAt, 32)
  dataCell.bits.writeUint(data.finishAt, 32)
  dataCell.bits.writeAddress(data.marketplaceAddress)
  dataCell.bits.writeAddress(data.nftAddress)
  dataCell.bits.writeAddress(data.offerOwnerAddress)
  dataCell.bits.writeCoins(data.fullPrice) // fullPrice
  dataCell.refs.push(feesCell)
  dataCell.bits.writeUint(1, 1) // can_deploy

  return dataCell
}

export function buildNftOfferStateInit(data: NftOfferData) {
  const dataCell = buildNftOfferDataCell({
    ...data,
    isComplete: false,
  })

  const stateInit = new StateInit({
    code: NftOfferCodeCell,
    data: dataCell,
  })
  const address = contractAddress({ workchain: 0, initialCode: NftOfferCodeCell, initialData: dataCell })

  return {
    address,
    stateInit,
  }
}

export const OperationCodes = {
  AcceptCoins: 0,
}

export const Queries = {
  deployOfferPayload: (name: string) => {
    const b = new Builder()
    b.storeUint(0, 32)
    const m = Buffer.from(name.substring(0, 121), 'utf-8')
    b.storeBuffer(m.slice(0, 121))
    return b.endCell()
  },
  cancelOfferInternalMessage: (params: { message?: string } = {}) => {
    const nextPayload = new Cell()
    if (params.message) {
      nextPayload.bits.writeUint(0, 32)
      const m = Buffer.from(params.message.substring(0, 121), 'utf-8')
      nextPayload.bits.writeBuffer(m.slice(0, 121))
    }
    const msgBody = new Cell()
    msgBody.bits.writeUint(0, 32)
    msgBody.bits.writeBuffer(Buffer.from('cancel'))
    msgBody.refs.push(nextPayload)
    return msgBody
  },
  cancelOfferByMarketplaceInternalMessage: (params: { amount: BN; message?: string }) => {
    const nextPayload = new Cell()
    if (params.message) {
      nextPayload.bits.writeUint(0, 32)
      const m = Buffer.from(params.message.substring(0, 121), 'utf-8')
      nextPayload.bits.writeBuffer(m.slice(0, 121))
    }
    const msgBody = new Cell()
    msgBody.bits.writeUint(3, 32)
    msgBody.bits.writeCoins(params.amount)
    msgBody.refs.push(nextPayload)
    return msgBody
  },
  cancelOfferExternalMessage: (params: { message?: string } = {}) => {
    const msgBody = new Cell()
    msgBody.bits.writeUint(0, 32)
    msgBody.bits.writeBuffer(Buffer.from((params.message || '').substring(0, 62)).slice(0, 62))
    return msgBody
  },
}


export type NftOfferDataV1R3 = NftOfferData & {
  swapAt?: number
}

export function buildNftOfferV1R3DataCell(data: NftOfferDataV1R3) {
  const feesCell = new Cell()

  feesCell.bits.writeAddress(data.marketplaceFeeAddress)
  feesCell.bits.writeUint(data.marketplaceFactor, 32)
  feesCell.bits.writeUint(data.marketplaceBase, 32)
  feesCell.bits.writeAddress(data.royaltyAddress)
  feesCell.bits.writeUint(data.royaltyFactor, 32)
  feesCell.bits.writeUint(data.royaltyBase, 32)

  const dataCell = new Cell()

  dataCell.bits.writeUint(data.isComplete ? 1 : 0, 1)
  dataCell.bits.writeUint(data.createdAt, 32)
  dataCell.bits.writeUint(data.finishAt, 32)
  dataCell.bits.writeUint(data.swapAt || 0, 32)
  dataCell.bits.writeAddress(data.marketplaceAddress)
  dataCell.bits.writeAddress(data.nftAddress)
  dataCell.bits.writeAddress(data.offerOwnerAddress)
  dataCell.bits.writeCoins(data.fullPrice) // fullPrice
  dataCell.refs.push(feesCell)
  dataCell.bits.writeUint(data.canDeploy === 0 || data.canDeploy === 1 ? data.canDeploy : 1, 1) // can_deploy

  return dataCell
}
