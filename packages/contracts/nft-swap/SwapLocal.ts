import {SmartContract} from "ton-contract-executor";
import {
    Address,
    Cell,
    contractAddress, parseDict,
    Slice,
} from "ton";
import BN from "bn.js";
import {
    buildSwapDataCell,
    Queries,
    SwapData
} from "./Swap.data";
import {SwapSource} from "./Swap.source";
import {compileFunc} from "../../utils/compileFunc";

type StateResponse = { state: number, left_ok: boolean, right_ok: boolean,
    leftAddr: Address, rightAddr: Address, leftNft: Map<string,boolean> | null, rightNft: Map<string,boolean> | null,
    leftComm: BN, leftAmount: BN, leftGot: BN, rightComm: BN, rightAmount: BN, rightGot: BN}

export class SwapLocal {
    private constructor(
        public readonly contract: SmartContract,
        public readonly address: Address
    ) {

    }

    static queries = Queries

    //
    // Get methods
    //

    async getTradeState(): Promise<StateResponse> {
        let res = await this.contract.invokeGetMethod('get_trade_state', [])
        if (res.type !== 'success') {
            throw new Error(`Cant invoke get_trade_state`)
        }

        let [state, left_ok, right_ok, leftAddr, rightAddr, leftNft, rightNft,
            leftComm, leftAmount, leftGot, rightComm, rightAmount, rightGot] = res.result as [BN, BN, BN, Slice, Slice, Cell, Cell, BN, BN, BN, BN, BN, BN]


        let leftMap = leftNft ? parseDict<boolean>(leftNft.beginParse(),256, function (s: Slice) {
            return s.readBit();
        }) : null
        let rightMap = rightNft ? parseDict<boolean>(rightNft.beginParse(),256, function (s: Slice) {
            return s.readBit();
        }) : null

        return {
            state: state ? state.toNumber() : 0,
            left_ok: !left_ok.isZero(),
            right_ok: !right_ok.isZero(),
            leftAddr: leftAddr.readAddress() as Address,
            rightAddr: rightAddr.readAddress() as Address,
            leftNft: leftMap,
            rightNft: rightMap,
            leftComm: leftComm,
            leftAmount: leftAmount,
            leftGot: leftGot,
            rightComm: rightComm,
            rightAmount: rightAmount,
            rightGot: rightGot,
        }
    }

    //
    //  Internal messages
    //

    static async createFromConfig(config: SwapData) {
        let code = await compileFunc(SwapSource)

        let data = buildSwapDataCell(config)
        let contract = await SmartContract.fromCell(code.cell, data, {
            debug: true
        })

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new SwapLocal(contract, address)
    }
}