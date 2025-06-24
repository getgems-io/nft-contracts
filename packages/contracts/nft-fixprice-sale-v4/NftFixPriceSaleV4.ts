import { address, Address, Cell, Contract, ContractProvider, Dictionary, Sender, SendMode, StateInit } from "@ton/core";
import { NftFixPriceJettonPriceValue } from "./NftFixPriceSaleV4.data";

export class NftFixPriceSaleV4 implements Contract {

  constructor(public address: Address, public init: StateInit) {
  }

  public static createBlack(address:Address, init:StateInit) {
    return new NftFixPriceSaleV4(address, init)
  }

  public async sendDeploy(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body,
    });
  }

  async getFixPriceDataV4(provider: ContractProvider) {
    const { stack } = await provider.get('get_fix_price_data_v4', [])
    return {
      isComplete: stack.readBigNumber() === -1n,
      createdAt: stack.readNumber(),
      marketplaceAddress: stack.readAddress(),
      nftAddress: stack.readAddress(),
      nftOwnerAddress: stack.readAddressOpt(),
      fullPrice: stack.readBigNumber(), // price in ton or zero
      marketplaceFeeAddress: stack.readAddress(),
      marketplaceFeePercent: stack.readNumber() / 100_000,
      royaltyAddress: stack.readAddress(),
      royaltyPercent: stack.readNumber() / 100_000,
      soldAt: stack.readNumber(),
      soldQueryId: stack.readBigNumber(),
      jettonPriceDict: stack.readCellOpt()?.beginParse()
        .loadDictDirect(Dictionary.Keys.BigUint(256), NftFixPriceJettonPriceValue) ?? null,
    }
  }
}
