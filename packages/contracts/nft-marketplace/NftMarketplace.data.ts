import {Cell, contractAddress, StateInit} from "ton";
import {KeyPair, sign} from "ton-crypto";
import {NftMarketplaceCodeCell} from "./NftMarketplace.source";

export type NftMarketplaceData = {
    seqno: number
    subwallet: number
    publicKey: Buffer
}

export function buildNftMarketplaceDataCell(data: NftMarketplaceData) {
    let dataCell = new Cell()

    dataCell.bits.writeUint(data.seqno, 32)
    dataCell.bits.writeUint(data.subwallet, 32)
    dataCell.bits.writeBuffer(data.publicKey)

    return dataCell
}

export async function buildNftMarketplaceStateInit(keyPair: KeyPair) {
    let data: NftMarketplaceData = {
        seqno: 0,
        subwallet: 0,
        publicKey: keyPair.publicKey
    }
    let dataCell = buildNftMarketplaceDataCell(data)
    let stateInit = new StateInit({
        code: NftMarketplaceCodeCell,
        data: dataCell
    })
    let address = contractAddress({workchain: 0, initialCode: NftMarketplaceCodeCell, initialData: dataCell})

    return {
        address,
        stateInit
    }
}

export const OperationCodes = {
    DeploySale: 1,
}

export function buildSignature(params: { keyPair: KeyPair, saleStateInit: Cell, saleMessageBody: Cell }) {
  let bodyCell = new Cell()
  bodyCell.refs.push(params.saleStateInit)
  bodyCell.refs.push(params.saleMessageBody)

  return sign(bodyCell.hash(), params.keyPair.secretKey)
}

export const Queries = {
    signedDeploySale: (params: { keyPair: KeyPair, saleStateInit: Cell, saleMessageBody: Cell }) => {
        let signature = buildSignature(params)

        let msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.DeploySale, 32)
        msgBody.bits.writeBuffer(signature)
        msgBody.refs.push(params.saleStateInit)
        msgBody.refs.push(params.saleMessageBody)

        return msgBody
    }
}