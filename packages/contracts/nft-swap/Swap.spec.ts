import {
    Cell,
    CellMessage,
    CommonMessageInfo,
    ExternalMessage,
    InternalMessage,
    RawCommonMessageInfo,
    toNano
} from "ton";
import {randomAddress} from "../../utils/randomAddress";
import {SwapData, OperationCodes, Queries, SwapState} from "./Swap.data";
import {SwapLocal} from "./SwapLocal";
import BN = require("bn.js");

import {Address} from "ton/dist";
import {Queries as NftQueries} from "../nft-item/NftItem.data";
import {OutAction} from "ton-contract-executor/dist/utils/parseActionList";

const LEFT = randomAddress()
const RIGHT = randomAddress()
const SUPERVISOR = randomAddress()
const COMMISSION = randomAddress()

const NFT1 = Address.parse("EQCmP0tbZvM3UpO9iGmqxJL7Bl2Vae8kSK8HcBODUUhQC7h-")
const NFT2 = Address.parse("EQDmNBxaxh-XJR26dKWYjYuoaPStC4jj2OXxt-zVf7fKT7Us")
const NFT3 = randomAddress()
const NFT4 = randomAddress()


const defaultConfig: SwapData = {
    state: SwapState.Active,
    leftAddress: LEFT,
    rightAddress: RIGHT,
    leftNft: [],
    rightNft: [],
    supervisorAddress: SUPERVISOR,
    commissionAddress: COMMISSION,
    leftCommission: toNano("0.1"),
    leftCommissionGot: toNano("0"),
    rightCommission: toNano("0.05"),
    rightCommissionGot: toNano("0"),
}

describe('swap smc', () => {
    it('should ignore external messages', async () => {
        let contract = await SwapLocal.createFromConfig(defaultConfig)

        let res = await contract.contract.sendExternalMessage(new ExternalMessage({
            to: contract.address,
            from: LEFT,
            body: new CommonMessageInfo({
                body: new CellMessage(new Cell())
            })
        }))

        expect(res.exit_code).not.toEqual(0)
    })

    it('should accept nft + commission', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: false}]
        cfg.leftCommission = toNano("1.0")
        cfg.rightNft = [{addr:NFT2, sent: false}]

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT1,
            value: toNano("1.10"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.nftOwnerAssigned({
                    prevOwner: LEFT,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(true)
        expect(data.right_ok).toEqual(false)
        expect(data.state).toEqual(SwapState.Active)
    })

    it('should accept nft right + commission', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: false}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightNft = [{addr:NFT2, sent: false}]

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT2,
            value: toNano("1.10"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.nftOwnerAssigned({
                    prevOwner: RIGHT,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(true)
        expect(data.state).toEqual(SwapState.Active)
    })

    it('should accept nft + partial commission', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: false}]
        cfg.leftCommission = toNano("1.0")
        cfg.rightNft = [{addr:NFT2, sent: false}]

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT1,
            value: toNano("1.0999"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.nftOwnerAssigned({
                    prevOwner: LEFT,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(false)
        expect(data.state).toEqual(SwapState.Active)
    })

    it('should return unexpected nft', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: false}]
        cfg.leftCommission = toNano("1.0")
        cfg.rightNft = [{addr:NFT2, sent: false}]

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT3,
            value: toNano("1.10"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.nftOwnerAssigned({
                    prevOwner: LEFT,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        checkActions(res.actionList,[{
            to: NFT3,
            amount: new BN(0),
            body: NftQueries.transfer({newOwner: LEFT, responseTo: LEFT}),
            mode: 64,
        }],[])

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(false)
        expect(data.state).toEqual(SwapState.Active)
    })

    it('should return nft when not active', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Cancelled
        cfg.leftNft = [{addr:NFT1, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.rightNft = [{addr:NFT2, sent: false}]

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT2,
            value: toNano("1.10"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.nftOwnerAssigned({
                    prevOwner: RIGHT,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        checkActions(res.actionList,[{
            to: NFT2,
            amount: new BN(0),
            body: NftQueries.transfer({newOwner: RIGHT, responseTo: RIGHT}),
            mode: 64,
        }],[])

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(false)
        expect(data.state).toEqual(SwapState.Cancelled)
    })

    it('should ignore nft, too small amount', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.rightNft = [{addr:NFT2, sent: false}]

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT2,
            value: toNano("0.0499"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.nftOwnerAssigned({
                    prevOwner: RIGHT,
                }))
            })
        }))

        expect(res.exit_code).toEqual(405)

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(false)
        expect(data.state).toEqual(SwapState.Active)
    })

    it('should accept partial commission', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.8")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)
        c.contract.setBalance(toNano("10"))

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: LEFT,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.addCoins({
                    coins: toNano("0.1"),
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        checkActions(res.actionList,[],[{
            mode:0,
            amount: new BN(toNano("0.1").toNumber()+toNano("10").toNumber())
        }])

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(true)
        expect(data.state).toEqual(SwapState.Active)
    })

    it('should complete after nft+commission', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: false},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)
        c.contract.setBalance(toNano("0.05"))

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT1,
            value: toNano("1.15"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.nftOwnerAssigned({
                    prevOwner: LEFT,
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        checkActions(res.actionList,[{
            to: LEFT,
            amount: toNano("0.05"),
            body: Queries.transferComplete({}),
            mode: 3,
        },{
            to: RIGHT,
            amount: toNano("0"),
            body: Queries.transferComplete({}),
            mode: 3,
        },{
            to: NFT1,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: RIGHT, responseTo: RIGHT}),
            mode: 1,
        },{
            to: NFT3,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: RIGHT, responseTo: RIGHT}),
            mode: 1,
        },{
            to: NFT2,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: LEFT, responseTo: LEFT}),
            mode: 1,
        },{
            to: COMMISSION,
            amount: new BN(0),
            body: Queries.transferCommission({}),
            mode: 130,
        }],[{
            mode: 0,
            amount: toNano("0.001")
        }])

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(true)
        expect(data.right_ok).toEqual(true)
        expect(data.state).toEqual(SwapState.Completed)
    })

    it('should complete after commission', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: true},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: LEFT,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.addCoins({
                    coins: toNano("0.1"),
                }))
            })
        }))

        expect(res.exit_code).toEqual(0)

        checkActions(res.actionList,[{
            to: LEFT,
            amount: toNano("0"),
            body: Queries.transferComplete({}),
            mode: 3,
        },{
            to: RIGHT,
            amount: toNano("0"),
            body: Queries.transferComplete({}),
            mode: 3,
        },{
            to: NFT1,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: RIGHT, responseTo: RIGHT}),
            mode: 1,
        },{
            to: NFT3,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: RIGHT, responseTo: RIGHT}),
            mode: 1,
        },{
            to: NFT2,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: LEFT, responseTo: LEFT}),
            mode: 1,
        },{
            to: COMMISSION,
            amount: new BN(0),
            body: Queries.transferCommission({}),
            mode: 130,
        }],[{
            mode: 0,
            amount: toNano("0.001")
        }])

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(true)
        expect(data.right_ok).toEqual(true)
        expect(data.state).toEqual(SwapState.Completed)
    })

    it('should fail commission > amount', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: true},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: LEFT,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.addCoins({
                    coins: toNano("0.2"),
                }))
            })
        }))

        expect(res.exit_code).toEqual(405)
    })

    it('should fail commission from unknown', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.leftNft = [{addr:NFT1, sent: true},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: SUPERVISOR,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.addCoins({
                    coins: toNano("0.1"),
                }))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('should fail commission after complete', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Completed
        cfg.leftNft = [{addr:NFT1, sent: true},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: LEFT,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.addCoins({
                    coins: toNano("0.1"),
                }))
            })
        }))

        expect(res.exit_code).toEqual(403)
    })

    it('should fail cancel after complete', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Completed
        cfg.leftNft = [{addr:NFT1, sent: true},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = cfg.leftCommission
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: LEFT,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.cancel({}))
            })
        }))

        expect(res.exit_code).toEqual(403)
    })

    it('should fail cancel by unknown', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Active
        cfg.leftNft = [{addr:NFT1, sent: false},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = cfg.leftCommission
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: COMMISSION,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.cancel({}))
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('should cancel', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Active
        cfg.leftNft = [{addr:NFT1, sent: false},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: SUPERVISOR,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.cancel({}))
            })
        }))

        expect(res.exit_code).toEqual(0)

        checkActions(res.actionList,[{
            to: LEFT,
            amount: toNano("0.9"),
            body: Queries.transferCancel({}),
            mode: 3,
        },{
            to: RIGHT,
            amount: toNano("1"),
            body: Queries.transferCancel({}),
            mode: 3,
        },{
            to: NFT3,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: LEFT, responseTo: LEFT}),
            mode: 1,
        },{
            to: NFT2,
            amount: toNano("0.05"),
            body: NftQueries.transfer({newOwner: RIGHT, responseTo: RIGHT}),
            mode: 1,
        },{
            to: COMMISSION,
            amount: new BN(0),
            body: Queries.transferCommission({}),
            mode: 130,
        }],[{
            mode: 0,
            amount: toNano("0.001")
        }])

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(true)
      //  expect(data.state).toEqual(SwapState.Cancelled)
    })

    it('should maintain', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Completed
        cfg.leftNft = [{addr:NFT1, sent: false},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let msg = Queries.makeMessage({to: LEFT, amount: toNano("0.61"), body: Queries.transferCancel({}) })
        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: SUPERVISOR,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.maintain({mode: 3,
                    msg: msg,
                })),
            })
        }))

        expect(res.exit_code).toEqual(0)

        checkActions(res.actionList,[{
            to: LEFT,
            amount: toNano("0.61"),
            body: Queries.transferCancel({}),
            mode: 3,
        }],[])

        let data = await c.getTradeState()
        expect(data.left_ok).toEqual(false)
        expect(data.right_ok).toEqual(true)
        expect(data.state).toEqual(SwapState.Completed)
    })

    it('should not maintain from unknown', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Completed
        cfg.leftNft = [{addr:NFT1, sent: false},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let msg = Queries.makeMessage({to: LEFT, amount: toNano("0.61"), body: Queries.transferCancel({}) })
        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: LEFT,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.maintain({mode: 3,
                    msg: msg,
                })),
            })
        }))

        expect(res.exit_code).toEqual(401)
    })

    it('should top up', async () => {
        let cfg = Object.create(defaultConfig);
        cfg.state = SwapState.Active
        cfg.leftNft = [{addr:NFT1, sent: false},{addr:NFT3, sent: true}]
        cfg.leftCommission = toNano("1.0")
        cfg.leftCommissionGot = toNano("0.9")
        cfg.rightNft = [{addr:NFT2, sent: true}]
        cfg.rightCommission = toNano("1.0")
        cfg.rightCommissionGot = cfg.rightCommission

        let c = await SwapLocal.createFromConfig(cfg)

        let res = await c.contract.sendInternalMessage(new InternalMessage({
            to: c.address,
            from: NFT4,
            value: toNano("0.12"),
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(Queries.topup({})),
            })
        }))

        expect(res.exit_code).toEqual(0)
    })
})

interface WantMsg {
    to: Address
    amount: BN
    body: Cell
    mode: number
}

interface WantReserve {
    mode: number
    amount: BN
}

function checkActions(list: OutAction[], msgs: WantMsg[], reserves: WantReserve[]) {
    let oks: boolean[] = [];

    let actsNum = msgs.length+reserves.length
    if (list.length != actsNum) {
        throw new Error("actions count not match, got "+list.length+", want "+actsNum+": "+JSON.stringify(list, null, 2))
    }

    list.forEach(a => {
        let same = false;

        if (a.type == "send_msg") {
            msgs = msgs.filter(m => { // remove from array if we found same
                let aMsg = a.message.info;
                if (aMsg.type != "internal") {
                    throw new Error()
                }

                if(aMsg.dest?.toFriendly() != m.to.toFriendly()) {
                    return true
                }

                if (a.message.body.hash().compare(m.body.hash()) != 0) {
                    console.log("body not match\n"+a.message.body.toDebugString()+"\n"+m.body.toDebugString())
                    return true
                }

                if (a.mode != m.mode) {
                    console.log("mode not match"+a.mode+" "+m.mode)
                    return true
                }

                if (!aMsg.value.coins.eq(m.amount)) {
                    console.log("amount not match "+aMsg.value.coins+" "+m.amount)
                    return true
                }

                same = true;

                return false
            })
        } else if (a.type == "reserve_currency") {
            reserves = reserves.filter(m => { // remove from array if we found same
                if(a.mode != m.mode) {
                    return true
                }

                if (!a.currency.coins.eq(m.amount)) {
                    return true
                }

                same = true;

                return false
            })
        }

        oks.push(same);
    })

    oks.forEach((o,i) => {
        if (!o) {
            console.error(list[i])
            throw new Error("action not match: "+JSON.stringify(list[i], null, 2))
        }
    })

}