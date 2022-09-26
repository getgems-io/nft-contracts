import { expect } from 'chai'
import * as fs from 'fs'
import BN from 'bn.js'
import {
    Builder,
    InternalMessage,
    CommonMessageInfo,
    CellMessage,
    Cell,
    toNano,
    Address
} from 'ton'
import { SmartContract } from 'ton-contract-executor'
import { encodeRaffleStorage, buffer256ToDec, RaffleStorage, NFTItem } from './raffle.storage'
import { getRandSigner } from './raffle.signers'
import { Queries } from './raffle.queries'
import { RaffleLocal } from './raffle.local'

function queryId (): BN {
    return new BN(~~(Date.now() / 1000))
}


const STATES = {
    Active: 1,
    Canceled: 2,
    Completed: 3
}

const TVM_EXIT_CODES = {
    OK: 0,
    state: 1001,
    wrongAddr: 1002,
    coins: 1003,
    notFound: 0xffff
}

describe('nft raffle main test', () => {

    const COMMISSION_FOR_NFT = 0.5
    const COMMISSION_FOR_MP = 0.5

    const LEFT_NFTS_COUNT = 3
    const RIGHT_NFTS_COUNT = 3

    const LEFT_USER = getRandSigner()
    const RIGHT_USER = getRandSigner()
    const SUPER_USER = getRandSigner()

    const LEFT_COMMISSION = toNano((COMMISSION_FOR_NFT + COMMISSION_FOR_MP) * LEFT_NFTS_COUNT)
    const RIGHT_COMMISSION = toNano((COMMISSION_FOR_NFT + COMMISSION_FOR_MP) * RIGHT_NFTS_COUNT)
    const COINS_FOR_NFT = toNano(COMMISSION_FOR_NFT + COMMISSION_FOR_MP + 0.01)

    const NFTS: NFTItem[] = []
    const EMPTY_BODY = new CommonMessageInfo(
        { body: new CellMessage(new Builder().endCell()) }
    )
    for (let i = 0; i < LEFT_NFTS_COUNT; i += 1) {
        NFTS.push({ addr: getRandSigner(), received: 0 })
    }
    for (let i = 0; i < RIGHT_NFTS_COUNT; i += 1) {
        NFTS.push({ addr: getRandSigner(), received: 1 })
    }
    const data: RaffleStorage = {
        stateSlice:
            {
                state: STATES.Active,
                rightNftsCount: RIGHT_NFTS_COUNT,
                leftNftsCount: LEFT_NFTS_COUNT
            },
        addrSlice: 
            {
                leftUser: LEFT_USER,
                rightUser: RIGHT_USER,
                superUser: SUPER_USER
            },
        commissionSlice: 
            {
                leftCommission: LEFT_COMMISSION,
                rightCommission: RIGHT_COMMISSION,
                coinsForNft: toNano(COMMISSION_FOR_NFT),
                coinsForCommission: toNano(COMMISSION_FOR_MP)
            },
        dictSlice: 
            {
                nfts: NFTS,
            }
    }
    describe('contract', () => {
        async function simpleTransferNFT (raffleLocal: RaffleLocal, nftAddr: Address, nftOwner: Address, amount: BN) {
            const msg = Queries.nftOwnerAssigned({
                prevOwner: nftOwner,
            })
            const result = await raffleLocal.contract.sendInternalMessage(new InternalMessage({
                to: raffleLocal.address,
                from: nftAddr,
                value: amount,
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(msg) })
            }))
            return result
        }

        async function sendAllNfts (raffleLocal: RaffleLocal) {
            for (let i = 0; i < LEFT_NFTS_COUNT; i += 1) {
                const result = await simpleTransferNFT(
                    raffleLocal,
                    NFTS[i].addr,
                    LEFT_USER,
                    COINS_FOR_NFT
                )
                const get = await raffleLocal.getRaffleState()
                if (get.nfts != null) { 
                    expect(get.nfts.get(buffer256ToDec(NFTS[i].addr.hash))).to.equals(2)
                }
                expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
                expect(get.leftNftsReceived).to.equals(i + 1)
            }
            for (let i = LEFT_NFTS_COUNT; i < RIGHT_NFTS_COUNT + LEFT_NFTS_COUNT - 1; i += 1) {
                const result = await simpleTransferNFT(
                    raffleLocal,
                    NFTS[i].addr,
                    RIGHT_USER,
                    COINS_FOR_NFT
                )
                const get = await raffleLocal.getRaffleState()
                if (get.nfts != null) {
                    expect(get.nfts.get(buffer256ToDec(NFTS[i].addr.hash))).to.equals(3)
                }
                expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
                expect(get.rightNftsReceived).to.equals(i - LEFT_NFTS_COUNT + 1)
            }
            const lastTransaction = await simpleTransferNFT(
                raffleLocal,
                NFTS[LEFT_NFTS_COUNT + RIGHT_NFTS_COUNT - 1].addr,
                RIGHT_USER,
                COINS_FOR_NFT
            )
            return lastTransaction
        }

        it('1) simple NFT transfer', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await simpleTransferNFT(smc, NFTS[0].addr, LEFT_USER, COINS_FOR_NFT)
            const get = await smc.getRaffleState()
            if (get.nfts != null) {
                expect(get.nfts.get(buffer256ToDec(NFTS[0].addr.hash))).to.equals(2)
            }
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
            expect(get.leftNftsReceived).to.equals(1)
            expect(get.leftCoinsGot.toNumber()).to.equals(toNano(COMMISSION_FOR_MP + COMMISSION_FOR_NFT).toNumber())
        })

        it('2) NFT transfer, but wrong commission', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await simpleTransferNFT(smc, NFTS[0].addr, LEFT_USER, toNano(0.1))
            const get = await smc.getRaffleState()
            if (get.nfts != null) {
                expect(get.nfts.get(buffer256ToDec(NFTS[0].addr.hash))).to.equals(0)
            }
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
            expect(result.actionList[0].type).to.equals('send_msg')
            expect(get.leftNftsReceived).to.equals(0)
        })
        it('3) NFT transfer, but wrong NFT address', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await simpleTransferNFT(smc, getRandSigner(), LEFT_USER, COINS_FOR_NFT)
            const get = await smc.getRaffleState()
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
            expect(get.leftNftsReceived).to.equals(0)
            expect(get.leftCoinsGot.toNumber()).to.equals(0)
        })
        it('4) Left and Right NFT transfer', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result1 = await simpleTransferNFT(smc, NFTS[0].addr, LEFT_USER, COINS_FOR_NFT)
            expect(result1.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const result2 = await simpleTransferNFT(smc, NFTS[3].addr, RIGHT_USER, COINS_FOR_NFT)
            expect(result2.exit_code).to.equals(TVM_EXIT_CODES.OK)

            const get = await smc.getRaffleState()
            if (get.nfts != null) {
                expect(get.nfts.get(buffer256ToDec(NFTS[0].addr.hash))).to.equals(2)
                expect(get.nfts.get(buffer256ToDec(NFTS[3].addr.hash))).to.equals(3)
            }
        })
        it('5) raffle cancel', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(0.1),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.cancel()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const get = await smc.getRaffleState()
            expect(get.state).to.equals(STATES.Canceled)
            const modes: number[] = [ 0, 2, 2, 130 ]
            const types: string[] = [ 'reserve_currency', 'send_msg', 'send_msg', 'send_msg' ]
            result.actionList.forEach((e, i: number) => {
                const msgo = <any>e
                expect(msgo.mode).to.equals(modes[i])
                expect(msgo.type).to.equals(types[i])
            })
        })
        it('6) raffle cancel + return nft', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result1 = await simpleTransferNFT(smc, NFTS[0].addr, LEFT_USER, COINS_FOR_NFT)
            expect(result1.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const result2 = await simpleTransferNFT(smc, NFTS[3].addr, RIGHT_USER, COINS_FOR_NFT)
            expect(result2.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(0.1),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.cancel()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const get = await smc.getRaffleState()
            expect(get.state).to.equals(STATES.Canceled)
            const modes: number[] = [ 1, 1, 0, 2, 2, 130 ]
            const types: string[] = [ 'send_msg', 'send_msg', 'reserve_currency', 'send_msg', 'send_msg', 'send_msg' ]
            result.actionList.forEach((e, i: number) => {
                const msgo = <any>e
                expect(msgo.mode).to.equals(modes[i])
                expect(msgo.type).to.equals(types[i])
            })
        })
        it('7) raffle cancel with wrong addr', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result1 = await simpleTransferNFT(smc, NFTS[0].addr, LEFT_USER, COINS_FOR_NFT)
            expect(result1.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const result2 = await simpleTransferNFT(smc, NFTS[0].addr, RIGHT_USER, COINS_FOR_NFT)
            expect(result2.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: getRandSigner(),
                value: toNano(0.1),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.cancel()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.wrongAddr)
        })
        it('8) add coins', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: LEFT_USER,
                value: toNano(0.5),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.addCoins()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const get = await smc.getRaffleState()
            expect(get.leftCoinsGot.toNumber()).to.equals(toNano(0.5).toNumber())
        })
        it('9) add coins wrong addr', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: getRandSigner(),
                value: toNano(0.5),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.addCoins()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.wrongAddr)
        })
        it('10) shouldn`t maintain (raffle not completed)', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(0.5),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.sendTrans()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.state)
        })
        it('11) shouldn`t maintain (wrong addr)', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result1 = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(0.1),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.cancel()) })
            }))
            expect(result1.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const get = await smc.getRaffleState()
            expect(get.state).to.be.equals(STATES.Canceled)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: getRandSigner(),
                value: toNano(0.5),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.sendTrans()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.wrongAddr)
        })
        it('12) Should maintain ', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result1 = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(0.1),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.cancel()) })
            }))
            expect(result1.exit_code).to.equals(TVM_EXIT_CODES.OK)
            const get = await smc.getRaffleState()
            expect(get.state).to.be.equals(STATES.Canceled)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(0.5),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.sendTrans()) })
            }))
            expect(result.exit_code).to.be.equals(TVM_EXIT_CODES.OK)
            expect(result.actionList[0].type).to.be.equal('send_msg')
        })
        it('13) Should raffle after all NFTs received', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const lastTransaction = await sendAllNfts(smc)
            expect(lastTransaction.exit_code).to.equal(TVM_EXIT_CODES.OK)
            const get = await smc.getRaffleState()
            expect(get.state).to.equal(STATES.Completed)
            const modes: number[] = [ 0, 0, 0, 0, 0, 0, 0, 130 ]
            const types: string[] = [ 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'reserve_currency', 'send_msg' ]
            lastTransaction.actionList.forEach((e, i: number) => {
                const msgo = <any>e
                expect(msgo.mode).to.equals(modes[i])
                expect(msgo.type).to.equals(types[i])
            })
        })
        it('14) cancel after raffle', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const lastTransaction = await sendAllNfts(smc)
            expect(lastTransaction.exit_code).to.equal(TVM_EXIT_CODES.OK)
            const get = await smc.getRaffleState()
            expect(get.state).to.equal(STATES.Completed)
            const modes: number[] = [ 0, 0, 0, 0, 0, 0, 0, 130 ]
            const types: string[] = [ 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'reserve_currency', 'send_msg' ]
            lastTransaction.actionList.forEach((e, i: number) => {
                const msgo = <any>e
                expect(msgo.mode).to.equals(modes[i])
                expect(msgo.type).to.equals(types[i])
            })
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(0.1),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.cancel()) })
            }))
            expect(result.exit_code).to.equals(TVM_EXIT_CODES.state)
        })
        it('15) send again without ended raffle', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(3),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.sendAgain()) })
            }))
            expect(result.exit_code).to.be.equals(TVM_EXIT_CODES.state)
        })
        it('16) send again, but small amount coins', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            await sendAllNfts(smc)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(2.8),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.sendAgain()) })
            }))
            expect(result.exit_code).to.be.equals(TVM_EXIT_CODES.coins)
        })
        it('17) send again', async () => {
            const smc = await RaffleLocal.createFromConfig(data)
            await sendAllNfts(smc)
            const result = await smc.contract.sendInternalMessage(new InternalMessage({
                to: smc.address,
                from: SUPER_USER,
                value: toNano(3),
                bounce: true,
                body: new CommonMessageInfo({ body: new CellMessage(Queries.sendAgain()) })
            }))
            const get = await smc.getRaffleState()
            expect(get.state).to.equal(STATES.Completed)
            const modes: number[] = [ 0, 0, 0, 0, 0, 0]
            const types: string[] = [ 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'send_msg', 'send_msg']
            result.actionList.forEach((e, i: number) => {
                const msgo = <any>e
                expect(msgo.mode).to.equals(modes[i])
                expect(msgo.type).to.equals(types[i])
            })
        })
    })
})
