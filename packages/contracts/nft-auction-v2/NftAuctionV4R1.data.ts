import type { Address, Cell, StateInit } from '@ton/core';
import { beginCell, contractAddress, toNano } from '@ton/core';
import { sign } from '@ton/crypto';
import { crc32str } from "../../ton/core/crc32str";
import { randomKeyPair } from "../../utils/randomKeyPair";
import { NftAuctionV4R1CodeCell } from "./NftAuctionV4.source";

export type NftAuctionV4R1Data = {
  marketplaceFeeAddress: Address,
  marketplaceFeeFactor: bigint,
  marketplaceFeeBase: bigint,


  royaltyAddress: Address,
  royaltyFactor: bigint,
  royaltyBase: bigint,


  minBid: bigint,
  maxBid: bigint,
  minPercentStep: number,
  endTimestamp: number,
  createdAtTimestamp: number,

  stepTimeSeconds: number,
  tryStepTimeSeconds: number,

  nftOwnerAddress: Address | null,
  nftAddress: Address,

  end: boolean,
  marketplaceAddress: Address,

  jettonWallet: Address | null;
  jettonMaster: Address | null;
  publicKey: Buffer | null;
};

export function buildNftAuctionV4R1DataCell(data: NftAuctionV4R1Data) {
  if (data.minPercentStep < 1) {
    throw new Error('minPercentStep less 1');
  }
  if (data.minPercentStep > 100) {
    throw new Error('minPercentStep great 100');
  }

  const constantCell = beginCell();
  constantCell.storeAddress(data.marketplaceAddress);
  constantCell.storeCoins(data.minBid);
  constantCell.storeCoins(data.maxBid);
  constantCell.storeUint(data.minPercentStep, 7);
  constantCell.storeUint(data.stepTimeSeconds, 17); // step_time
  constantCell.storeAddress(data.nftAddress);
  constantCell.storeUint(data.createdAtTimestamp, 32);

  const feesCell = beginCell();
  feesCell.storeAddress(data.marketplaceFeeAddress); // mp_fee_addr
  feesCell.storeAddress(data.royaltyAddress); // royalty_fee_addr
  feesCell.storeUint(data.marketplaceFeeFactor, 32); // mp_fee_factor
  feesCell.storeUint(data.marketplaceFeeBase, 32); // mp_fee_base
  feesCell.storeUint(data.royaltyFactor, 32); // royalty_fee_factor
  feesCell.storeUint(data.royaltyBase, 32); // royalty_fee_base

  const storage = beginCell();
  storage.storeBit(data.end); // end?
  storage.storeBit(false); // is_canceled
  storage.storeAddress(null); // last_member
  storage.storeCoins(0); // last_bid
  storage.storeUint(0, 32); // last_bid_at
  storage.storeUint(data.endTimestamp, 32); // end_time
  storage.storeAddress(data.nftOwnerAddress);
  storage.storeUint(0, 64); // query_id

  storage.storeRef(feesCell.endCell());
  storage.storeRef(constantCell.endCell());

  if (data.publicKey || data.jettonMaster || data.jettonWallet) {
    storage.storeUint(1, 1);
    const jettonCell = beginCell()
      .storeAddress(data.jettonWallet)
      .storeAddress(data.jettonMaster)
      .storeUint(data.publicKey ? 1 : 0, 1);
    if (data.publicKey) {
      jettonCell.storeBuffer(data.publicKey, 256 / 8);
    }
    storage.storeRef(jettonCell.endCell());
  } else {
    storage.storeUint(0, 1);
  }

  return storage.endCell();
}

export const AuctionV4R1Codes = {
  process_ton_bid: crc32str('process_ton_bid'),
  set_jetton_wallet: crc32str('set_jetton_wallet'),
  finish_auction: crc32str('finish_auction'),
  cancel_auction: crc32str('cancel_auction'),
  deploy_auction: crc32str('deploy_auction'),
};

export const AuctionV4R1Messages = {
  processTonBid: (queryId: bigint) => {
    return beginCell().storeUint(AuctionV4R1Codes.process_ton_bid, 32).storeUint(queryId, 64).endCell();
  },
  finish: (queryId: bigint) => {
    return beginCell().storeUint(AuctionV4R1Codes.finish_auction, 32).storeUint(queryId, 64).endCell();
  },
  cancel: (queryId: bigint) => {
    return beginCell().storeUint(AuctionV4R1Codes.cancel_auction, 32).storeUint(queryId, 64).endCell();
  },
  deploy: (queryId: bigint) => {
    return beginCell()
      .storeUint(AuctionV4R1Codes.deploy_auction, 32)
      .storeUint(queryId, 64)
      .endCell();
  },
  setJettonWallet: (queryId: bigint, jettonWallet: Address, secretKey: Buffer) => {
    const signedData = beginCell()
      .storeAddress(jettonWallet)
      .endCell();
    const signature = sign(signedData.hash(), secretKey);

    return beginCell()
      .storeUint(AuctionV4R1Codes.set_jetton_wallet, 32)
      .storeUint(queryId, 64)
      .storeBuffer(signature, 512 / 8)
      .storeAddress(jettonWallet)
      .endCell();
  },
};

export async function buildNftAuctionV4R1DeployData(opts: {
  codeCell?: Cell;
  queryId: bigint;
  deployerAddress: Address;
  config: Omit<NftAuctionV4R1Data, 'jettonWallet' | 'publicKey'>;
  jettonWalletAddressResolver: (jettonMaster: Address, address: Address) => Promise<Address>;
}) {
  const keypair = await randomKeyPair();
  const dataCell = buildNftAuctionV4R1DataCell({
    ...opts.config,
    ...(opts.config.jettonMaster
      ? {
        publicKey: keypair.publicKey,
        jettonWallet: opts.deployerAddress,
      }
      : {
        jettonWallet: null,
        publicKey: null,
      }),
  });

  const si: StateInit = {
    code: opts.codeCell ?? NftAuctionV4R1CodeCell,
    data: dataCell,
  };
  const saleAddress = contractAddress(0, si);

  return {
    address: saleAddress,
    stateInit: si,
    value: toNano('0.01'),
    message: opts.config.jettonMaster
      ? AuctionV4R1Messages.setJettonWallet(opts.queryId, await opts.jettonWalletAddressResolver(opts.config.jettonMaster, saleAddress), keypair.secretKey)
      : AuctionV4R1Messages.deploy(opts.queryId),
  };
}

export const AUC_V4_PRICE_FOR_JETTON_BID_PROCESSING = toNano('0.05');
export const AUC_V4_PRICE_FOR_FINISH_AUCTION = toNano('0.25');
