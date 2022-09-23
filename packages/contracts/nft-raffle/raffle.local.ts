
import { Address, Cell, contractAddress, parseDict, Slice } from 'ton'
import { SmartContract } from 'ton-contract-executor'
import { encodeRaffleStorage, RaffleStorage } from './raffle.storage'
import * as fs from 'fs'
import BN from 'bn.js'



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
    coinsForNft: BN,
    leftNfts: Map<string, boolean> | null,
    rightNfts: Map<string, boolean> | null,
    raffledNfts: Map<string, boolean> | null
}

function DictToMap (slice : Slice): boolean {
    return slice.readBit()
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
            coinsForNft, leftNfts, rightNfts, raffledNfts ] = res.result as [BN, BN,
            BN, BN,
            BN, Slice, Slice, Slice, BN, BN, BN, BN, BN, Cell, Cell, Cell]
        const leftMap = leftNfts ? parseDict<boolean>(
            leftNfts.beginParse(),
            256,
            DictToMap
        ) : null
        const rightMap = rightNfts ? parseDict<boolean>(
            rightNfts.beginParse(),
            256,
            DictToMap
        ) : null
        const raffledMap = raffledNfts ? parseDict<boolean>(
            raffledNfts.beginParse(),
            256,
            DictToMap
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
            coinsForNft: coinsForNft,
            leftNfts: leftMap,
            rightNfts: rightMap,
            raffledNfts: raffledMap
        }
    }

    static bocFileToTCell (filename: string): Cell {
        const file = fs.readFileSync(filename)
        return Cell.fromBoc(file)[0]
    }

    static async createFromConfig(raffleStorage: RaffleStorage) {
        const code = RaffleLocal.bocFileToTCell('./packages/contracts/sources/nft-raffle/code.boc')
        const data = encodeRaffleStorage(raffleStorage)
        const smc = await SmartContract.fromCell(code, data)

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