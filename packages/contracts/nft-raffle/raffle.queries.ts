import { Builder, Address, Cell, Slice, parseDict, toNano } from 'ton'
import BN from 'bn.js'
import { SmartContract } from 'ton-contract-executor'
import { getRandSigner } from './raffle.signers'

class queries {
    public static nftOwnerAssigned (
        queryId: BN,
        prevOwner: Address,
        op: number = 0x05138d91
    ): Cell {
        const msg = new Builder()
            .storeUint(op, 32)
            .storeUint(queryId, 64)
            .storeAddress(prevOwner)
            .storeBit(0)

        return msg.endCell()
    }

    public static cancel (): Cell {
        const msg = new Builder()
            .storeUint(2001, 32)

        return msg.endCell()
    }

    public static addCoins (): Cell {
        const msg = new Builder()
            .storeUint(2002, 32)
        return msg.endCell()
    }

    public static sendTrans (): Cell {
        const body = new Builder()
            .storeUint(0x18, 6)
            .storeAddress(getRandSigner())
            .storeCoins(toNano(0.1))
            .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
        const msg = new Builder()
            .storeUint(2003, 32)
            .storeRef(body.endCell())
            .storeUint(0, 8)
            .endCell()
        return msg
    }
}

export { queries }
