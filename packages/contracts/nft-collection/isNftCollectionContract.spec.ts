import {Address, Cell, TonClient} from "ton";
import {isNftCollectionContract} from "./isNftCollectionContract";
import {SmartContract} from "ton-contract-executor";

describe('collection detector', () => {
    it('should detect nft collection', async () => {
        let client = new TonClient({
            endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        })

        let address = Address.parse('EQC5RIVNDIX2pw-LHugckLEv82s9SpT7f-n-PnrQaCxcDQM6')
        let res = await client.getContractState(address)

        let code = Cell.fromBoc(res.code!)[0]
        let data = Cell.fromBoc(res.data!)[0]

        let isCollection = await isNftCollectionContract(await SmartContract.fromCell(code, data))

        expect(isCollection).toBe(true)
    })
})