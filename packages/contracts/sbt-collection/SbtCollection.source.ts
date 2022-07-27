import {combineFunc} from "../../utils/combineFunc";

export const SbtCollectionSource = combineFunc(__dirname, [
    '../sources/stdlib.fc',
    '../sources/op-codes.fc',
    '../sources/params.fc',
    '../sources/sbt-collection-editable.fc',
])
