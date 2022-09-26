import { Address, Builder, Cell, DictBuilder } from 'ton'
import BN from 'bn.js'


function buffer256ToDec (buff: Buffer): string {
    const build = new Builder().storeBuffer(buff).endCell()
    return build.beginParse().readUint(256).toString(10)
}

interface StateSlice {
    state: number
    rightNftsCount: number
    leftNftsCount: number
}

interface AddrSlice {
    leftUser: Address
    rightUser: Address
    superUser: Address
}

interface CommissionSlice {
    leftCommission: BN
    rightCommission: BN
    coinsForNft: BN
    coinsForCommission: BN
}

export interface NFTItem {
    addr: Address
    received: number
}

interface DictSlice {
    nfts: NFTItem[]
}

export interface RaffleStorage {
    stateSlice: StateSlice,
    addrSlice: AddrSlice,
    commissionSlice: CommissionSlice,
    dictSlice: DictSlice
}

function encodeRaffleStorage
(
    raffleStorage: RaffleStorage
): Cell {
    const stateCell = new Builder()
        .storeUint(raffleStorage.stateSlice.state, 2)
        .storeUint(raffleStorage.stateSlice.rightNftsCount, 4)
        .storeUint(0, 4)
        .storeUint(raffleStorage.stateSlice.leftNftsCount, 4)
        .storeUint(0, 4)
        .endCell()
    const addrCell = new Builder()
        .storeAddress(raffleStorage.addrSlice.leftUser)
        .storeAddress(raffleStorage.addrSlice.rightUser)
        .storeAddress(raffleStorage.addrSlice.superUser)
        .endCell()
    const commissionCell = new Builder()
        .storeCoins(raffleStorage.commissionSlice.leftCommission)
        .storeCoins(raffleStorage.commissionSlice.rightCommission)
        .storeCoins(new BN(0))
        .storeCoins(new BN(0))
        .storeCoins(raffleStorage.commissionSlice.coinsForNft)
        .storeCoins(raffleStorage.commissionSlice.coinsForCommission)
        .endCell()
    const nfts = new DictBuilder(256)
    if (raffleStorage.dictSlice.nfts.length > 0) {
        for (let i = 0; i < raffleStorage.dictSlice.nfts.length; i += 1) {
            const value = new Cell()
            value.bits.writeUint(raffleStorage.dictSlice.nfts[i].received, 4)
            nfts.storeCell(new BN(raffleStorage.dictSlice.nfts[i].addr.hash), value)
        }
    }
    const dictCell = new Builder()
        .storeDict(nfts.endCell())
        .storeDict(new DictBuilder(256).endDict())
    const storageCell = new Builder()
        .storeRef(stateCell)
        .storeRef(addrCell)
        .storeRef(commissionCell)
        .storeRef(dictCell.endCell())
    return storageCell.endCell()
}

export { encodeRaffleStorage, buffer256ToDec }
