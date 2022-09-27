
import { Address, Cell, contractAddress, parseDict, Slice } from 'ton'
import { SmartContract } from 'ton-contract-executor'
import { encodeRaffleStorage, RaffleStorage } from './raffle.storage'
import * as fs from 'fs'
import BN from 'bn.js'
import { compileFunc } from "../../utils/compileFunc";
import { RaffleSource } from './raffle.source'



type StateResponse = {
    state: number,
    rightNftsCount: number,
    rightNftsReceived: number,
    leftNftsCount: number,
    leftNftsReceived: number,
    leftUser: Address,
    rightUser: Address,
    superUser: Address,
    leftCommission: BN,
    rightCommission: BN,
    leftCoinsGot: BN,
    rightCoinsGot: BN,
    nftTransferFee: BN,
    marketplaceFee: BN,
    nfts: Map<string, string> | null,
    raffledNfts: Map<string, string> | null
}

function DictToMapN (slice : Slice): string {
    const value = slice.readUint(4).toNumber()
    if (value == 0) {
        return 'left not received'
    }
    if (value == 1) {
        return 'right not received'
    }
    if (value == 2) {
        return 'left received'
    } else {
        return 'right received'
    }
}

function DictToMapB (slice: Slice): string {
    if(slice.readBit() == false) {
        return 'left'
    } else {
        return 'right'
    }
}

export class RaffleLocal {
    private constructor(
        public readonly contract: SmartContract,
        public readonly address: Address
    ) {

    }


    async getRaffleState (): Promise<StateResponse> {
        const res = await this.contract.invokeGetMethod('raffle_state', [])
        if (res.type !== 'success') {
            throw new Error('Can`t run get raffle state')
        }
        const [ state, rightNftsCount, rightNftsReceived, leftNftsCount,
            leftNftsReceived, leftUser, rightUser, superUser, leftCommission,
            rightCommission, leftCoinsGot, rightCoinsGot,
            nftTransferFee, marketplaceFee, nfts, raffledNfts ] = res.result as [BN, BN,
            BN, BN,
            BN, Slice, Slice, Slice, BN, BN, BN, BN, BN, BN, Cell, Cell, Cell]
        const nftMap = nfts ? parseDict<string>(
            nfts.beginParse(),
            256,
            DictToMapN
        ) : null
        const raffledMap = raffledNfts ? parseDict<string>(
            raffledNfts.beginParse(),
            256,
            DictToMapB
        ) : null
        return {
            state: state ? state.toNumber() : 0,
            rightNftsCount: rightNftsCount.toNumber(),
            rightNftsReceived: rightNftsReceived.toNumber(),
            leftNftsCount: leftNftsCount.toNumber(),
            leftNftsReceived: leftNftsReceived.toNumber(),
            leftUser: leftUser.readAddress() as Address,
            rightUser: rightUser.readAddress() as Address,
            superUser: superUser.readAddress() as Address,
            leftCommission: leftCommission,
            rightCommission: rightCommission,
            leftCoinsGot: leftCoinsGot,
            rightCoinsGot: rightCoinsGot,
            nftTransferFee: nftTransferFee,
            marketplaceFee: marketplaceFee,
            nfts: nftMap,
            raffledNfts: raffledMap
        }
    }

    static async createFromConfig(raffleStorage: RaffleStorage) {
        const code = await compileFunc(RaffleSource)
        const data = encodeRaffleStorage(raffleStorage)
        const smc = await SmartContract.fromCell(code.cell, data)

        const address = contractAddress({
            workchain: 0,
            initialData: smc.dataCell,
            initialCode: smc.codeCell
        })

        smc.setC7Config({
            myself: address
        })

        return new RaffleLocal(smc, address)
    }
}