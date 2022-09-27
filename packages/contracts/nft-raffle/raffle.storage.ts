import { Address, Builder, Cell, DictBuilder } from 'ton'
import BN from 'bn.js'


function buffer256ToDec (buff: Buffer): string {
    const build = new Builder().storeBuffer(buff).endCell()
    return build.beginParse().readUint(256).toString(10)
}
export interface RaffleStorage {
    state: number
    rightNftsCount: number
    leftNftsCount: number
    leftUser: Address
    rightUser: Address
    superUser: Address
    leftCommission: BN
    rightCommission: BN
    nftTransferFee: BN
    nfts: { address: Address, owner: 'left' | 'right'}[]
}

function encodeRaffleStorage
(
    raffleStorage: RaffleStorage
): Cell {
    const stateCell = new Builder()
        .storeUint(raffleStorage.state, 2)
        .storeUint(raffleStorage.rightNftsCount, 4)
        .storeUint(0, 4)
        .storeUint(raffleStorage.leftNftsCount, 4)
        .storeUint(0, 4)
        .endCell()
    const addrCell = new Builder()
        .storeAddress(raffleStorage.leftUser)
        .storeAddress(raffleStorage.rightUser)
        .storeAddress(raffleStorage.superUser)
        .endCell()
    const commissionCell = new Builder()
        .storeCoins(raffleStorage.leftCommission)
        .storeCoins(raffleStorage.rightCommission)
        .storeCoins(new BN(0))
        .storeCoins(new BN(0))
        .storeCoins(raffleStorage.nftTransferFee)
        .endCell()
    const nfts = new DictBuilder(256)
    if (raffleStorage.nfts.length > 0) {
        for (let i = 0; i < raffleStorage.nfts.length; i += 1) {
            const value = new Cell()
            const owner = raffleStorage.nfts[i].owner === 'left' ? 0 : 1
            value.bits.writeUint(owner, 4)
            nfts.storeCell(new BN(raffleStorage.nfts[i].address.hash), value)
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
