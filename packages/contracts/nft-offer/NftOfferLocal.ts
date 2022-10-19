import { SmartContract } from 'ton-contract-executor'
import { Address, Cell, contractAddress, Slice } from 'ton'
import BN from 'bn.js'
import { buildNftOfferDataCell, NftOfferData, Queries } from './NftOfferData'
import { NftOfferSource } from './NftOffer.source'
import { compileFunc } from "../../utils/compileFunc";


export class NftOfferLocal {
  private constructor(public readonly contract: SmartContract, public readonly address: Address, private readonly balance?: BN) {}

  static queries = Queries

  async getOfferData() {
    const res = await this.contract.invokeGetMethod('get_offer_data', [])

    if (res.exit_code !== 0) {
      throw new Error('Unable to invoke get_offer_data on offer contract')
    }

    const [
      offerType,
      isComplete,
      createdAt,
      finishAt,
      marketplaceAddressSlice,
      nftAddressSlice,
      offerOwnerAddressSlice,
      fullPrice,
      marketplaceFeeAddressSlice,
      marketplaceFactor,
      marketplaceBase,
      royaltyAddressSlice,
      royaltyFactor,
      royaltyBase,
      profitPrice,
    ] = res.result as [BN, BN, BN, BN, Slice, Slice, Slice, BN, Slice, BN, BN, Slice, BN, BN, BN]

    if (offerType.toNumber() !== 0x4f46464552) {
      throw new Error(`Unknown offer type: ${offerType.toString()}`)
    }

    return {
      isComplete: isComplete.eqn(-1),
      createdAt: createdAt.toNumber(),
      finishAt: finishAt.toNumber(),
      marketplaceAddress: marketplaceAddressSlice.readAddress()!,
      nftAddress: nftAddressSlice.readAddress()!,
      offerOwnerAddress: offerOwnerAddressSlice.readAddress()!,
      fullPrice,
      marketplaceFeeAddress: marketplaceFeeAddressSlice.readAddress()!,
      marketplaceFactor,
      marketplaceBase,
      royaltyAddress: royaltyAddressSlice.readAddress()!,
      royaltyFactor,
      royaltyBase,
      profitPrice,
    }
  }

  static async createFromConfig(config: NftOfferData) {
    const code = await compileFunc(NftOfferSource())

    const data = buildNftOfferDataCell(config)
    const contract = await SmartContract.fromCell(code.cell, data)

    const address = contractAddress({
      workchain: 0,
      initialData: contract.dataCell,
      initialCode: contract.codeCell,
    })

    contract.setC7Config({
      myself: address,
    })

    return new NftOfferLocal(contract, address)
  }

  static async create(config: { code: Cell; data: Cell; address: Address, balance: BN }) {
    const contract = await SmartContract.fromCell(config.code, config.data)
    contract.setC7Config({
      myself: config.address,
    })
    return new NftOfferLocal(contract, config.address, config.balance)
  }

  static async createFromContract(contract: SmartContract, address: Address, balance?: BN) {
    contract.setC7Config({
      myself: address,
    })
    return new NftOfferLocal(contract, address, balance)
  }
}
