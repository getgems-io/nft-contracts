import {
  Address,
  Builder,
  Cell,
  CellMessage,
  CommonMessageInfo,
  contractAddress,
  InternalMessage,
  StateInit,
} from 'ton'
import BN from 'bn.js'

export type DeployerState = {ownerAddress:Address, randomId?: number}

export class DeployerLocal {
  static code = 'te6cckEBBQEA8AABFP8A9KQT9LzyyAsBAaDTIMcAkl8E4AHQ0wMBcbCSXwTg+kAwAdMfghAFE42RUiC64wIzMyLAAZJfA+ACgQIruo4W7UTQ+kAwWMcF8uGT1DDQ0wfUMAH7AOBbhA/y8AIC/DHTP/pA0x+CCP4O3hK98tGU1NTRIfkAcMjKB8v/ydB3dIAYyMsFywIizxaCCTEtAPoCy2sTzMzJcfsAcCB0ghBfzD0UIoAYyMsFUAnPFiP6AhjLahfLHxXLPxXLAgHPFgHPFsoAIfoCygDJWaEggggPQkC5lIED6KDjDXD7AgMEAAwwgggPQkAACIMG+wAl44cc'
  // static testnetAddress = 'EQDDX5eqHCNW1pSm2EGmX0BvJqYnKOmDTEGuxFbwW7VM3Pi8' old 9 may
  static testnetAddress = 'EQDZwUjVjK__PvChXCvtCMshBT1hrPKMwzRhyTAtonUbL2M3'
  // static mainnetAddress = 'EQCjc483caXMwWw2kwl2afFquAPO0LX1VyZbnZUs3toMYkk9' old 9 may
  static mainnetAddress = 'EQAIFunALREOeQ99syMbO6sSzM_Fa1RsPD5TBoS0qVeKQ-AR'
  static OP_CODE_DO_SALE = 0x0fe0ede
  static OP_CODE_ACCEPT_DEPLOY = 1
  static OP_CODE_PROXY_MESSAGE = 555
  static proxyMessage(msg: InternalMessage, mode: number) {
    return new Builder().storeUint(DeployerLocal.OP_CODE_PROXY_MESSAGE, 32)
      .storeRef(new Builder().storeUint(mode, 8).storeRef((() => {
        const c = new Cell()
        msg.writeTo(c)
        return c
      })()).endCell()).endCell()
  }

  static proxyMessageFromMarketplace(msg: InternalMessage, mode: number, fwdTon: BN, tonNetwork:'testnet'|'mainnet') {
    const deployerMessage = DeployerLocal.proxyMessage(msg, mode)
    return new InternalMessage({
      from: null,
      to: DeployerLocal.getDeployerContractAddress(tonNetwork),
      value: fwdTon,
      bounce: true,
      body: new CommonMessageInfo({
        body: new CellMessage(deployerMessage)
      })
    })
  }

  static buildStateCell(opts: DeployerState): Cell {
    const b = new Builder().storeAddress(opts.ownerAddress)
    if (opts.randomId) {
      b.storeUint(opts.randomId, 32)
    }
    return b.endCell()
  }

  static buildStateInit(source: DeployerState|Cell, code?:Cell) {
    const stateInit = new StateInit({
      code: code ?? Cell.fromBoc(Buffer.from(DeployerLocal.code,'base64'))[0],
      data: source instanceof Cell ? source : DeployerLocal.buildStateCell(source),
    })
    const address = contractAddress({ workchain: 0, initialCode: stateInit.code!, initialData: stateInit.data! })

    return {
      address,
      stateInit,
    }
  }

  static createDeployMessage() {
    const b = new Builder()
    b.storeUint(DeployerLocal.OP_CODE_ACCEPT_DEPLOY, 32)
    return b.endCell()
  }

  static createSaleDeployPayload(saleContractStateInit: StateInit, saleContractDeployMessage: Cell) {
    const b = new Builder()
    b.storeUint(DeployerLocal.OP_CODE_DO_SALE, 32)
      .storeRef((() => {
        const c = new Cell()
        saleContractStateInit.writeTo(c)
        return c
      })())
      .storeRef(saleContractDeployMessage)
    return b.endCell()
  }

  static deployForProduction(ownerAddress: Address) {
    return DeployerLocal.buildStateInit({
      ownerAddress,
    })
  }

  static getDeployerContractAddress(tonNetwork:'testnet'|'mainnet') {
    let address: Address
    if (tonNetwork === 'testnet') {
      address = Address.parse(DeployerLocal.testnetAddress)
    } else if (tonNetwork === 'mainnet') {
      address = Address.parse(DeployerLocal.mainnetAddress)
    } else {
      ((x:never) => {
        throw new Error(`Unexpected network ${x}`)
      })(tonNetwork)
    }
    return address
  }

  static isDeployerAddress(addr: Address) {
    const currentMainnet = DeployerLocal.getDeployerContractAddress('mainnet')
    if (currentMainnet.equals(addr)) {
      return true
    }

    const currentTestnet = DeployerLocal.getDeployerContractAddress('testnet')
    if (currentTestnet.equals(addr)) {
      return true
    }

    const oldTestnetAddress = 'EQDDX5eqHCNW1pSm2EGmX0BvJqYnKOmDTEGuxFbwW7VM3Pi8'
    const oldMainnetAddress = 'EQCjc483caXMwWw2kwl2afFquAPO0LX1VyZbnZUs3toMYkk9'

    const f = addr.toFriendly()
    return f === oldMainnetAddress || f === oldTestnetAddress
  }
}
