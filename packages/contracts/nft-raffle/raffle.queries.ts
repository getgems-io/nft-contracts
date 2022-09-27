import { Builder, Address, Cell, Slice, parseDict, toNano } from 'ton'
import BN from 'bn.js'
import { randomAddress } from '../../utils/randomAddress'

export const OperationCodes = {
    ownershipAssigned: 0x05138d91,
    cancel: 2001,
    addCoins: 2002,
    maintain: 2003,
    sendAgain: 2004,
}

export const Queries = {
    nftOwnerAssigned: (params: { queryId?: number, prevOwner: Address}) => {
        const msgBody = new Cell()
        msgBody.bits.writeUint(OperationCodes.ownershipAssigned, 32)
        msgBody.bits.writeUint(params.queryId || 0, 64)
        msgBody.bits.writeAddress(params.prevOwner)

        return msgBody
    },
    cancel: () => {
        const msg = new Builder()
            .storeUint(OperationCodes.cancel, 32)
        return msg.endCell()
    },
    addCoins: () => {
        const msg = new Builder()
            .storeUint(OperationCodes.addCoins, 32)
        return msg.endCell()
    },
    sendTrans: () => {
        const body = new Builder()
            .storeUint(0x18, 6)
            .storeAddress(randomAddress())
            .storeCoins(toNano(0.1))
            .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
        const msg = new Builder()
            .storeUint(OperationCodes.maintain, 32)
            .storeRef(body.endCell())
            .storeUint(0, 8)
            .endCell()
        return msg
    },
    sendAgain: () => {
        const msg = new Builder()
            .storeUint(OperationCodes.sendAgain, 32)
            .endCell()
        return msg
    }
}
