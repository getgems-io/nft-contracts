# Swap
Contract for exchanging nft for nft, it is also supports exchanges of multiple nft. 
Contract supports marketplace commission, it can be included for any participant of exchange. 

Marketplace or one of swap participants should deploy contract with definition of conditions.
Marketplace can guarantee similarity of conditions by precalculating contract address using data which was agreed by participants.

When all conditions are met, swap will happen automatically.

#### Initialization
Contract initialization data is described by TL-B schema:
```tl-b
marketplace_info#_ supervisor:MsgAddress commission:MsgAddress = SwapMarketplaceInfo;

storage#_ state:(## 2) left_participant:MsgAddress right_participant:MsgAddress 
left_commission:Coins left_commission_got:Coins 
left_nft:(HashmapE 256 Bool)
right_commission:Coins right_commission_got:Coins
right_nft:(HashmapE 256 Bool)
marketplace:^SwapMarketplaceInfo = SwapStorage;
```
This schema needs to be serialized to contract data in StateInit and deployed together with code.

* `state` - swap state `1` = active, `2` = cancelled, `3` = completed. Initially should be `1`.
* `(left|right)_participant` - address of user who will swap nft.
* `(left|right)_commission` - amount of commission in nano ton that must be paid by user.
* `(left|right)_commission_got` - amount of commission in nano ton that was already paid by user. Initially should be `0`.
* `(left|right)_nft` - dictionary which contains address's hash part of nft as key, and Bool which indicates nft owned by swap contract. Initially all values should be false (one zero bit)
* `supervisor` - address of account which can do any transactions from swap contract, to resolve issues.
* `commission` - address which will receive commission from swap.

#### Exchange
##### NFT transfers
After initialization, participants could transfer defined NFTs to swap contract address, together with 0.05 TON + desired commission amount in forward amount of transfer message. 
0.05 TON is required to pay contract fees for transferring nft back in case of cancel, or to another side in case of complete. **If forward amount is below 0.05, NFT will be ignored!**

In case if undesirable nft was transferred to contract, it will be transferred back to previous owner (if forward amount >= 0.05). The same is applicable to undesired contract state, when swap is cancelled and someone transfers nft.

##### Commissions
Normally, commission should be transferred in forward amount of nft transfer, 
but it is also possible to send it independently, using message with schema: 
```tl-b
add_coins#00000001 query_id:uint64 commission:Coins = AddCoins;
```

##### Completion
Swap will happen when all nft will be transferred and each participant's commission will be filled.

On completion, each participant will receive transaction with return of amount of over-sent commission with schema:
```tl-b
completed#ef03d009 query_id:uint64 = CompletedNotification;
```

And commission address will receive transaction with the rest contract balance amount, except 0.001 TON for storage, with schema:
```tl-b
commission#82bd8f2a query_id:uint64 = CommissionNotification;
```

##### Cancellation
When contract is in active state and one of participants or supervisor decided to cancel exchange and get nft+commission back,
he should send message with schema:
```tl-b
cancel#00000002 query_id:uint64 = Cancel;
```

On cancellation, each participant will receive transaction with return of amount of sent commission, with schema:
```tl-b
canceled#b5188860 query_id:uint64 = CanceledNotification;
```

And commission address will receive transaction with the rest contract balance amount, except 0.001 TON for storage, with schema:
```tl-b
commission#82bd8f2a query_id:uint64 = CommissionNotification;
```

##### Maintain
In case of any issues, contract can be maintained by supervisor, he is eligible to send any transaction from the contract.
For example return stuck NFT to one of participants in case of problem.

To make transaction from contract, supervisor should send message with schema:
```tl-b
maintain#00000003 query_id:uint64 mode:uint8 msg:^Cell = Cancel;
```

##### Top up
Useful for first deployment message or for some case, to trigger conditions check.

To trigger conditions check, or to just add money to contract, anyone could send message with schema:
```tl-b
topup#00000004 query_id:uint64 = TopUp;
```
