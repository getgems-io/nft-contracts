# NFT Raffle contract

The point of the contract is the possibility of a random exchange of NFTs. Each party can provide an arbitrary number of NFTs. 

## Contract work concept

Participant A and B want to randomly exchange their NFTs. The Marketplace or one of the participants can deploy a contract to randomly exchange NFTs. Both participants can verify the original data.


## Initialization


```
STORAGE TL-B

state_info#_ state:uint2 right_nfts_count:uint4 right_nfts_received:uint4
left_nfts_count:uint4
left_nfts_received:uint4 = StateInfo;

addr_info#_ left_user:MsgAddress right_user:MsgAddress super_user:MsgAddress = AddressInfo;

commission_info#_ left_commission:Coins right_commission:Coins left_coins_got:Coins right_coins_got:Coins coins_for_nft:Coins coins_for_commission:Coins = CommissionInfo;

dict_info#_ nfts:(HashmapE 256 uint4) raffled_nfts:(HashmapE 256 Bool) = DictInfo;

storage#_ state:StateInfo addr:AddressInfo commissions:CommissionInfo dict:DictInfo = RaffleStorage;
```

Данная TL-B схема описывает storage контракта при деплое

* `state` - raffle state `1` = active, `2` = cancelled, `3` = completed. Initially should be `1`.
* `right nfts count` -  the number of NFT right-hand side participant. 
* `right nfts received` - the number of NFTs received by the right-hand side participant, increases by  `1` when NFT is received. Initially should be `0`.
* `left nft count` - the number of NFT left-hand side participant. 
* `left nfts received` - the number of NFTs received by the left-hand side participant, increases by  `1` when NFT is received. Initially should be `0`.

* `left user` - is the address of the left-hand user.
* `right user` - is the address of the right-hand user.
* `super user` - is the address of the marketplace.

* `left commission` - the left-hand participant's commission, determined by the formula `(sending commission for NFT + marketplace commission for NFT) * left-hand number of NFTs`.

* `right commission` - the right-hand participant's commission, determined by the formula `(sending commission for NFT + marketplace commission for NFT) * right-hand number of NFTs`.

* `left coins got` - the commission received by the left-handed participant, Initially should be `0`.

* `right coins got` - the commission received by the right-handed participant, Initially should be `0`.

* `coins for nft` - the commission for sending NFTs, which is used to send NFTs after a successful raffle.

* `coins for commission` - the commission for marketplace, marketplace receive it after successful raffle.

* `nfts` - a dictionary that contains all addresses as keys, and their status as values. `0` - left nft, not received, `1` right nft, not received, `2` - left nft, received, `3` - right nft, received.

* `raffled nfts` - a dictionary that contains addresses as keys, to whom they belong as values. `0` - left-hand user won this nft, `1` - right-hand user won this nft.


## Full work description

After successfully contract deploying, each participant must send their NFTs. If all conditions are completed and the last NFT is received, all NFTs will be randomly raffled and transferred to their new owners.

### Cancel
Both participants or the marketplace can cancel the raffle by sending a message.

```
TL-B
cancel#000007D1 = Cancel;
```
Only if contract state = Active

### Maintain

If something has gone wrong, the super user can send a message manually, only if contract state != Active

```
TL-B
maintain#000007D3 msg:^Cell mode:uint8 = Maintain;
```

### Add coins
If not all conditions are met when sending the last NFT, e.g. one user has no money for the commission, he can add coins manually, only if contract state = active. The NFT raffle will start too.

```
TL-B
add_coins#000007D2 = AddCoins;
```

### Send Again
If the NFTs are raffled but some NFTs require a special ton amount, the user can send a number of coins to the contract address and thereby initiate the sending of all NFTs again. Provided contract state = completed.
```
TL-B
send_again#000007D4 = SendAgain;
```