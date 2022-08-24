import {SmartContract} from "ton-contract-executor";
import {Address, Cell, contractAddress, Slice} from "ton";
import BN from "bn.js";
import {buildNftAuctionDataCell, NftAuctionData} from "./NftAuction.data";
import {NftAuctionCodeCell} from "./NftAuction.source";

export class NftAuctionLocal {
    protected constructor(
        public readonly contract: SmartContract,
        public readonly address: Address
    ) {

    }

    async getSaleData() {
        let res = await this.contract.invokeGetMethod('get_sale_data', [])

        if (res.exit_code !== 0) {
            throw new Error(`Unable to invoke get_sale_data on auction contract`)
        }

        let [
            saleType,
            end,
            endTimestamp,
            marketplaceAddressSlice,
            nftAddressSlice,
            nftOwnerAddressSlice,
            lastBidAmount,
            lastBidAddressSlice,
            minStep,
            marketplaceFeeAddressSlice,
            marketplaceFeeFactor, marketplaceFeeBase,
            royaltyAddressSlice,
            royaltyFactor, royaltyBase,
            maxBid,
            minBid,
            createdAt,
            lastBidAt,
            isCanceled,
        ] = res.result as [BN, BN, BN, Slice, Slice, Slice, BN, Slice, BN, Slice, BN, BN, Slice, BN, BN, BN, BN, BN, BN, BN]

        if (res.result.length !== 20) {
            throw new Error(`Unexpected length of get_sale_data expect 20 got ${res.result.length}`);
        }
        if (saleType.toNumber() !== 0x415543) {
            throw new Error(`Unknown sale type: ${saleType.toString()}`);
        }

        return {
            end: end.eqn(-1),
            endTimestamp: endTimestamp.toNumber(),
            marketplaceAddress: marketplaceAddressSlice.readAddress()!,
            nftAddress: nftAddressSlice.readAddress()!,
            nftOwnerAddress: nftOwnerAddressSlice.readAddress(),
            lastBidAmount,
            lastBidAddress: lastBidAddressSlice.readAddress(),
            minStep,
            marketplaceFeeAddress: marketplaceFeeAddressSlice.readAddress()!,
            marketplaceFeeFactor, marketplaceFeeBase,
            royaltyAddress: royaltyAddressSlice.readAddress()!,
            royaltyFactor, royaltyBase,
            maxBid,
            minBid,
            createdAt: createdAt.toNumber(),
            lastBidAt: lastBidAt.toNumber(),
            isCanceled: isCanceled.eqn(-1),
        }
    }

    static async createFromConfig(config: NftAuctionData) {

        let data = buildNftAuctionDataCell(config)
        let contract = await SmartContract.fromCell(NftAuctionCodeCell, data)

        let address = contractAddress({
            workchain: 0,
            initialData: contract.dataCell,
            initialCode: contract.codeCell
        })

        contract.setC7Config({
            myself: address
        })

        return new NftAuctionLocal(contract, address)
    }

    static async create(config: { code: Cell, data: Cell, address: Address }) {
        let contract = await SmartContract.fromCell(config.code, config.data)
        contract.setC7Config({
            myself: config.address
        })
        return new NftAuctionLocal(contract, config.address)
    }

    static async createFromContract(contract: SmartContract, address: Address) {
        contract.setC7Config({
            myself: address
        })
        return new NftAuctionLocal(contract, address)
    }
}