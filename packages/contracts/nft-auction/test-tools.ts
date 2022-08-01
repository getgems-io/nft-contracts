import {Address, Cell, CellMessage, CommonMessageInfo, fromNano, InternalMessage} from "ton";
import {OutAction} from "ton-contract-executor";
import BN from "bn.js";
import {NftAuctionLocal} from "./NftAuctionLocal";

declare global {
    namespace jest {
        interface Matchers<R> {
            toHasMessage(expected: {
                to:Address,
                mode?:number,
                check?: (message:Cell) => boolean,
                value?: BN,
            }): R
        }
    }
}

expect.extend({
    toHasMessage(received:OutAction[], params:{
        to:Address,
        mode?:number,
        check?: (message:Cell) => boolean,
        value?: BN
    }) {
        let log:string[] = []
        for(const action of received) {
            const msg = transformMessage(action);
            if (msg && msg.to?.equals(params.to)) {
                if (!params.mode || params.mode === msg.mode) {
                    if (!params.check || params.check(msg.body)) {
                        if (!params.value || msg.value.eq(params.value)) {
                            return {
                                pass: true,
                                message: () => `has message to:${params.to.toFriendly()}`
                            }
                        }
                    }
                }
            }
            log.push(`to:${msg?.to?.toFriendly()} amount:${fromNano(msg?.value||new BN(0))} mode:${msg?.mode}`)
        }
        return {
            pass: false,
            message: () => `No messages:\n\tlist:\n\t\t${log.join("\n\t\t")}${received.length === 0 ? 'action list empty': ''}\n\tsearch\n\t\tto:${params.to.toFriendly()} amount:${params.value ? fromNano(params.value) : 'any'} mode:${params.mode}`
        }
    }
});


export function transformMessage(action: OutAction) {
    if (action.type === 'send_msg') {
        return {
            to: action.message.info.dest,
            value: action.message.info.type === 'internal' ? action.message.info.value.coins : new BN(0),
            body: action.message.body,
            mode: action.mode,
        }
    }
    return null;
}

/**
 * @deprecated use expect.toHasMessage()
 * @param actions
 * @param params
 */
export function hasMessage(actions: OutAction[], params:{
    to:Address,
    mode?:number,
    check?: (message:Cell) => boolean
}): boolean {
    for(const action of actions) {
        const msg = transformMessage(action);
        if (msg && msg.to?.equals(params.to)) {
            if (!params.mode || params.mode === msg.mode) {
                if (!params.check || params.check(msg.body)) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function isTransferPayload(cell:Cell, to: Address, forwardAmountLimit?: BN) {
    const slice = cell.beginParse();
    const op = slice.readUint(32);
    slice.readUint(64); // query_id
    const newOwner = slice.readAddress();
    slice.readAddress(); // response address
    slice.readUint(1); // custom payload = 0
    const forward = slice.readCoins(); // forward amount
    if ((
        op.eq(new BN(0x5fcc3d14))
        && newOwner?.equals(to)
        && (!forwardAmountLimit || forward.gt(forwardAmountLimit)) )) {
        return true;
    }
    return false;
}

export async function makeBid(auc: NftAuctionLocal, buyerAddress: Address, amount: BN) {
    return auc.contract.sendInternalMessage(new InternalMessage({
        to: auc.address,
        from: buyerAddress,
        value: amount,
        bounce: true,
        body: new CommonMessageInfo({
            body: new CellMessage(new Cell())
        })
    }));
}