import { Address, beginCell, Cell, contractAddress, Dictionary, DictionaryValue, Slice, StateInit } from '@ton/core'
import { NftFixPriceSaleV4R1CodeCell } from './NftFixPriceSaleV4.source'
import { sign, mnemonicNew,mnemonicToPrivateKey } from '@ton/crypto'
import { bufferToInt, toBufferBE } from "../../ton/bigint";

export type JettonPriceType = {
  price: bigint,
  jettonMaster: Address,
}

export type NftFixPriceSaleV4DR1Data = {
  isComplete: boolean
  createdAt: number
  marketplaceAddress: Address
  nftAddress: Address
  nftOwnerAddress: Address | null
  fullTonPrice: bigint
  marketplaceFeeAddress: Address
  marketplaceFeePercent: number
  royaltyAddress: Address
  royaltyPercent: number
  soldAtTime: number,
  soldQueryId: bigint,
}

export function buildFixPriceV4SaleData(input: Pick<NftFixPriceSaleV4DR1Data, 'nftAddress'|'royaltyAddress'|'royaltyPercent'|'fullTonPrice'|'nftOwnerAddress'>): Omit<NftFixPriceSaleV4DR1Data, 'marketplaceAddress'> {
  return {
    ...input,
    isComplete: false,
    createdAt: Math.floor(Date.now()/1000),
    marketplaceFeeAddress: Address.parse('EQDDuxx7sa3Dt2GE85a0sIHp4GVoa7OKbAanfo3co9H-h06d'),
    marketplaceFeePercent: 0.05,
    soldAtTime: 0,
    soldQueryId: 0n,
  }
}

export const OP_FIX_PRICE_V4_DEPLOY_JETTON = 0xfb5dbf47
export const OP_FIX_PRICE_V4_DEPLOY_BLANK = 0x664c0905
export const OP_FIX_PRICE_V4_CHANGE_PRICE = 0xfd135f7b

export const NftFixPriceJettonPriceValue: DictionaryValue<JettonPriceType> = {
  serialize(src, builder) {
    builder.storeCoins(src.price)
      .storeAddress(src.jettonMaster)
  },
  parse(slice) {
    return {
      price: slice.loadCoins(),
      jettonMaster: slice.loadAddress(),
    }
  },
}

function assertPercent(x: number) {
  if (x < 0) {
    throw new Error(`Percent can not be less zero, got ${x}`)
  }
  if (x > 1) {
    throw new Error('Percent should be less than one')
  }
  const p = Number((x * 100_000).toFixed(0))
  if (!Number.isInteger(p) || p < 0) {
    throw new Error(`Percent should be integer after multiple 100k ${x} -> ${p}`)
  }
  return p
}

async function randomKeyPair() {
  const mnemonics = await mnemonicNew()
  return mnemonicToPrivateKey(mnemonics)
}

export function buildNftFixPriceSaleV4R1Data(cfg: NftFixPriceSaleV4DR1Data & {publicKey: Buffer | null}) {
  return beginCell()
    .storeBit(cfg.isComplete)
    .storeAddress(cfg.marketplaceAddress)
    .storeAddress(cfg.nftOwnerAddress)
    .storeCoins(cfg.fullTonPrice)
    .storeUint(cfg.soldAtTime, 32)
    .storeUint(cfg.soldQueryId, 64)
    .storeRef(beginCell()
      .storeAddress(cfg.marketplaceFeeAddress)
      .storeAddress(cfg.royaltyAddress)
      .storeUint(assertPercent(cfg.marketplaceFeePercent), 17)
      .storeUint(assertPercent(cfg.royaltyPercent), 17)
      .storeAddress(cfg.nftAddress)
      .storeUint(cfg.createdAt, 32)
      .endCell())
    .storeDict(undefined) // empty jetton dict
    .storeMaybeBuffer(cfg.publicKey, 256 / 8)
    .endCell()
}

export function parseNftFixPriceSaleV4R1Data(slice: Slice) {
  const isComplete = slice.loadBit()
  const marketplaceAddress = slice.loadMaybeAddress()
  const nftOwnerAddress = slice.loadMaybeAddress()
  const fullTonPrice = slice.loadCoins()
  const soldAtTime = slice.loadUint(32)
  const soldQueryId = slice.loadUintBig(64)
  const staticData = slice.loadRef().beginParse()
  const marketplaceFeeAddress = staticData.loadMaybeAddress()
  const royaltyAddress = staticData.loadMaybeAddress()
  const marketplaceFeePercent = staticData.loadUint(17)
  const royaltyPercent = staticData.loadUint(17)
  const nftAddress = staticData.loadMaybeAddress()
  const createdAt = staticData.loadUint(32)
  const jettonPrice = slice.loadDict(Dictionary.Keys.BigUint(256), NftFixPriceJettonPriceValue)
  const publicKey = slice.remainingBits > 0 ? slice.loadMaybeUintBig(256) : null
  return {
    isComplete,
    createdAt,
    marketplaceAddress,
    nftAddress,
    nftOwnerAddress,
    fullTonPrice,
    marketplaceFeeAddress,
    marketplaceFeePercent: marketplaceFeePercent / 100_000,
    royaltyAddress,
    royaltyPercent: royaltyPercent / 100_000,
    jettonPrice,
    soldAtTime,
    soldQueryId,
    publicKey: publicKey ? toBufferBE(publicKey, 256 / 8) : null,
  }
}

export type NftFixPriceSaleV4DR1DataRelaxed = ReturnType<typeof parseNftFixPriceSaleV4R1Data>

export function isValidFixPriceSaleV4DR1Data(input: NftFixPriceSaleV4DR1DataRelaxed): input is (NftFixPriceSaleV4DR1Data & {
  jettonPrice: Dictionary<bigint, JettonPriceType>,
  publicKey: Buffer|null
}) {
  if (!input.marketplaceAddress) {
    throw new Error('marketplaceAddress is null')
  }
  if (!input.nftAddress) {
    throw new Error('nftAddress is null')
  }
  if (!input.marketplaceFeeAddress) {
    throw new Error('marketplaceFeeAddress is null')
  }
  if (!input.royaltyAddress) {
    throw new Error('royaltyAddress is null')
  }

  if (input.marketplaceAddress.workChain !== 0) {
    throw new Error('marketplaceAddress wrong workchain')
  }
  if (input.nftAddress.workChain !== 0) {
    throw new Error('nftAddress wrong workchain')
  }
  if (input.marketplaceFeeAddress.workChain !== 0) {
    throw new Error('marketplaceFeeAddress wrong workchain')
  }
  if (input.royaltyAddress.workChain !== 0) {
    throw new Error('royaltyAddress wrong workchain')
  }
  if (input.nftOwnerAddress && input.nftOwnerAddress.workChain !== 0) {
    throw new Error('nftOwnerAddress wrong workchain')
  }

  if (input.marketplaceFeePercent < 0 || input.marketplaceFeePercent > 1 || isNaN(input.marketplaceFeePercent)) {
    throw new Error('marketplaceFeePercent wrong value')
  }
  if (input.royaltyPercent < 0 || input.royaltyPercent > 1 || isNaN(input.royaltyPercent)) {
    throw new Error('royaltyPercent wrong value')
  }

  if ((input.marketplaceFeePercent + input.royaltyPercent) > 1) {
    throw new Error('fee to big')
  }
  return true
}

export function nftFixPriceV4CreateDeployMessage(queryId: bigint, marketplaceAddress: Address, jettonPrice: Dictionary<bigint, JettonPriceType>, secretKey: Buffer) {
  const signedData = beginCell()
    .storeAddress(marketplaceAddress)
    .storeDict(jettonPrice)
    .endCell()
  const signature = sign(signedData.hash(), secretKey)
  return beginCell()
    .storeUint(OP_FIX_PRICE_V4_DEPLOY_JETTON, 32)
    .storeUint(queryId, 64)
    .storeBuffer(signature, 512 / 8)
    .storeAddress(marketplaceAddress)
    .storeDict(jettonPrice)
    .endCell()
}

export function nftFixPriceV4ChangePriceMessage(opts: {
  queryId: bigint,
  newTonPrice: bigint,
  newJettonPrice: Dictionary<bigint, JettonPriceType> | null,
}) {
  return beginCell()
    .storeUint(OP_FIX_PRICE_V4_CHANGE_PRICE, 32)
    .storeUint(opts.queryId, 64)
    .storeCoins(opts.newTonPrice)
    .storeDict(opts.newJettonPrice)
    .endCell()
}

export async function buildJettonPriceDict(opts: {
  saleAddress: Address,
  jettonPrices: { [key: string]: bigint }, // jettonMasterWallet:price
  jettonWalletAddressResolver: (jettonMaster: Address, address: Address) => Promise<Address>
}) {
  const jettonPricesTags = Object.keys(opts.jettonPrices)
  const jettonPriceDict = Dictionary.empty(Dictionary.Keys.BigUint(256), NftFixPriceJettonPriceValue)
  for (const jettonMasterStr of jettonPricesTags) {
    const jettonMaster = Address.parse(jettonMasterStr)
    const jettonWalletAddress = await opts.jettonWalletAddressResolver(jettonMaster, opts.saleAddress)
    if (jettonWalletAddress.workChain !== 0) {
      throw new Error(`Jetton address has wrong workchain ${jettonWalletAddress.workChain} for jetton ${jettonMasterStr}`)
    }
    const price = opts.jettonPrices[jettonMasterStr]
    if (!price || price <= 0n) {
      throw new Error(`Wrong jetton price for jetton ${jettonMasterStr}, ${price}`)
    }
    jettonPriceDict.set(bufferToInt(jettonWalletAddress.hash), {
      jettonMaster,
      price,
    })
  }
  return jettonPriceDict
}

export async function buildNftFixPriceSaleV4R1DeployData(opts: {
  codeCell?: Cell,
  queryId: bigint,
  deployerAddress: Address,
  marketplaceAddress: Address,
  config: Omit<NftFixPriceSaleV4DR1Data, 'marketplaceAddress'>,
  jettonPrices: { [key: string]: bigint }, // jettonMasterWallet:price
  jettonWalletAddressResolver: (jettonMaster: Address, address: Address) => Promise<Address>
}) {
  const keypair = await randomKeyPair()
  const dataCell = buildNftFixPriceSaleV4R1Data({
    ...opts.config,
    publicKey: keypair.publicKey,
    marketplaceAddress: opts.deployerAddress,
  })
  const si: StateInit = {
    code: opts.codeCell ?? NftFixPriceSaleV4R1CodeCell,
    data: dataCell,
  }
  const saleAddress = contractAddress(0, si)
  const jettonPriceDict = await buildJettonPriceDict({
    saleAddress,
    jettonPrices: opts.jettonPrices,
    jettonWalletAddressResolver: opts.jettonWalletAddressResolver,
  })
  return {
    address: saleAddress,
    stateInit: si,
    message: nftFixPriceV4CreateDeployMessage(opts.queryId, opts.marketplaceAddress, jettonPriceDict, keypair.secretKey),
  }
}
