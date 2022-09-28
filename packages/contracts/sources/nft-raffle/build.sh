#!/bin/bash

MINPUT="./main.func"
OUTPUT="./code"

echo "building \"${MINPUT}\""

function errvar {
    echo "[ERR] \"FUNC_STDLIB_PATH\" and \"FIFTPATH\" env vars must be set"
    exit
}

[[ -z "${FIFTPATH}" ]]          && errvar || :

func -PA -o "${OUTPUT}.fif" ${MINPUT}
echo -e "\"TonUtil.fif\" include\n$(cat ${OUTPUT}.fif)" > "${OUTPUT}.fif"
echo "\"${OUTPUT}.fif\" include 2 boc+>B \"${OUTPUT}.boc\" B>file" | fift -s