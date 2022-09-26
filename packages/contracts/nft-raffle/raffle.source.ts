import { combineFunc } from "../../utils/combineFunc";


export const RaffleSource = combineFunc(__dirname, [
    "../sources/stdlib.fc",
    "../sources/nft-raffle/struct/constants.func",
    "../sources/nft-raffle/struct/storage.func",
    "../sources/nft-raffle/struct/utils.func",
    "../sources/nft-raffle/struct/handles.func",
    "../sources/nft-raffle/struct/get-methods.func",
    '../sources/nft-raffle/main.func',
])