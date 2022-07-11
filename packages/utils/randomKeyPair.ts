import {mnemonicNew, mnemonicToPrivateKey} from "ton-crypto";

export async function randomKeyPair() {
    let mnemonics = await mnemonicNew()
    return mnemonicToPrivateKey(mnemonics)
}