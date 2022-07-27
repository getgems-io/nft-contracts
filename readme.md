# Getgems NFT contracts

This repository is a collection of contracts for TON blockchain used at getgems.io


### Including: 

- standard NFT, collection, sale & marketplace implementations with tests
- SBT and collection implementations with tests
- Getgems marketplace contract with tests
- Getgems sale contract with tests
- Getgems Single-NFT contract with tests

### SBT
Soul bound token is a special kind of NFT which can be transferred only between it owner's accounts.
For this it stores immutable public key of the owner, and to change owner's address it is needed to send transfer from new address with signature in payload.

#### Changing owner's address
If you migrated to newer version of wallet and you want to move your SBT to it, you could send transfer to SBT from new wallet with payload:
```
pull_ownership#2ad91252 query_id:uint64 signature:^(signature:(bits 512)) sbt_seqno:uint32 new_owner:MsgAddress response_destination:MsgAddress custom_payload:(Maybe ^Cell) forward_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell) = InternalMsgBody
```
1. To do it you first need to know current SBT's seqno, you can trigger `seqno` method of SBT contract to get it.
2. `new_owner` should equals your wallet from which you sends message.
3. Then you need to sign `sbt_seqno:uint32 new_owner:MsgAddress response_destination:MsgAddress custom_payload:(Maybe ^Cell) forward_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)` this part of the message and put signature as first reference.
4. Now you can send this message as internal to SBT and owner will be changed to your new wallet. 

It is also possible to destroy SBT by setting `new_owner` to null address, after that, owner's address cannot be changed anymore.

#### Proving you ownership to contracts
SBT contracts has a feature that let you implement interesting mechanics with contracts by proving ownership onchain. 

You can send message to SBT and it will proxify message to target contract with its index and your wallet address in header, 
this way target contract could know that you are owner of SBT which relates to expected collection. Contract could know that SBT relates to collection by calculating address of SBT using code and index, and comparing it with sender.

To use this functionality SBT owner's wallet can send transfer with this scheme to SBT:
```
prove_ownership#2e0de890 query_id:uint64 dest:MsgAddress data:(Either Cell ^Cell)
```
After that SBT will send transfer to `dest` with scheme:
```
verify_ownership#5d795580 query_id:uint64 sbt_id:uint256 owner:MsgAddress data:(Either Cell ^Cell)
```
If something goes wrong and target contract not accepts message and it will be bounced back to SBT, SBT will proxy this bounce to owner, this way coins will not stuck on SBT.