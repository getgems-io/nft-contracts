import {combineFunc} from "../../utils/combineFunc";

export const SwapSource = combineFunc(__dirname, [
    '../sources/stdlib.fc',
    '../sources/op-codes.fc',
    '../sources/params.fc',
    '../sources/nft-swap.fc',
])