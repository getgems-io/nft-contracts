import { SmartContract } from 'ton-contract-executor'
import { Address, Cell, contractAddress, Slice } from 'ton'
import BN from 'bn.js'
import { buildNftFixPriceSaleV3DataCell, NftFixPriceSaleV3Data, Queries } from './NftFixpriceSaleV3.data'
import { NftFixPriceSaleSourceV3 } from './NftFixpriceSaleV3.source'
import { compileFunc } from "../../utils/compileFunc";

export class NftFixpriceSaleV3Local {
  private constructor(public readonly contract: SmartContract, public readonly address: Address) {}

  static queries = Queries

  async getSaleData() {
    const res = await this.contract.invokeGetMethod('get_sale_data', [])

    if (res.exit_code !== 0) {
      throw new Error('Unable to invoke get_sale_data on sale contract')
    }

    const [
      saleType,
      isComplete,
      createdAt,
      marketplaceAddressSlice,
      nftAddressSlice,
      nftOwnerAddressSlice,
      fullPrice,
      marketplaceFeeAddressSlice,
      marketplaceFee,
      royaltyAddressSlice,
      royaltyAmount,
    ] = res.result as [BN, BN, BN, Slice, Slice, Slice, BN, Slice, BN, Slice, BN]

    if (saleType.toNumber() !== 0x46495850) {
      throw new Error(`Unknown sale type: ${saleType.toString()}`)
    }

    return {
      isComplete: isComplete.eqn(-1),
      createdAt: createdAt.toNumber(),
      marketplaceAddress: marketplaceAddressSlice.readAddress()!,
      nftAddress: nftAddressSlice.readAddress()!,
      nftOwnerAddress: nftOwnerAddressSlice.readAddress(),
      fullPrice,
      marketplaceFeeAddress: marketplaceFeeAddressSlice.readAddress()!,
      marketplaceFee,
      royaltyAddress: royaltyAddressSlice.readAddress()!,
      royaltyAmount,
    }
  }

  static async createFromConfig(config: NftFixPriceSaleV3Data) {
    const code = await compileFunc(NftFixPriceSaleSourceV3())

    const data = buildNftFixPriceSaleV3DataCell(config)
    const contract = await SmartContract.fromCell(code.cell, data)

    const address = contractAddress({
      workchain: 0,
      initialData: contract.dataCell,
      initialCode: contract.codeCell,
    })

    contract.setC7Config({
      myself: address,
    })

    return new NftFixpriceSaleV3Local(contract, address)
  }

  static async create(config: { code: Cell; data: Cell; address: Address }) {
    const contract = await SmartContract.fromCell(config.code, config.data)
    contract.setC7Config({
      myself: config.address,
    })
    return new NftFixpriceSaleV3Local(contract, config.address)
  }

  static async createFromContract(contract: SmartContract, address: Address) {
    contract.setC7Config({
      myself: address,
    })
    return new NftFixpriceSaleV3Local(contract, address)
  }
}
