import {combineFunc} from "../../utils/combineFunc";

export const SbtItemSource = combineFunc(__dirname, [
    '../sources/stdlib.fc',
    '../sources/op-codes.fc',
    '../sources/params.fc',
    '../sources/sbt-item.fc',
])

export const SbtSingleSource = combineFunc(__dirname, [
    '../sources/stdlib.fc',
    '../sources/op-codes.fc',
    '../sources/params.fc',
    '../sources/sbt-single.fc',
])
