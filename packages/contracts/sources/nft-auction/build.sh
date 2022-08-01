#!/bin/bash

MINPUT="./nft-auction.func"
OUTPUT="./nft-auction-code"
FUNC_STDLIB_PATH="../stdlib.fc"

echo "building \"${MINPUT}\""

# build you own func compiler
/Users/i.nedzvetskiy/projects/ton/build/crypto/func -PA -o "${OUTPUT}.fif" ${FUNC_STDLIB_PATH} ${MINPUT}
echo -e "\"TonUtil.fif\" include\n$(cat ${OUTPUT}.fif)" > "${OUTPUT}.fif"
echo "\"${OUTPUT}.fif\" include 2 boc+>B \"${OUTPUT}.boc\" B>file" | fift -s
base64 "${OUTPUT}.boc" > "${OUTPUT}.base64"