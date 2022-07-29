# Getgems NFT contracts

This repository is a collection of contracts for TON blockchain used at getgems.io


### Including: 

- standard NFT, collection, sale & marketplace implementations with tests
- SBT implementation with tests
- Getgems marketplace contract with tests
- Getgems sale contract with tests
- Getgems Single-NFT contract with tests

### SBT
Soul bound token is a special kind of NFT which can be transferred only between it owner's accounts.
For this it stores immutable public key of the owner, and to change owner's address it is needed to send transfer from new address with signature in payload.

#### Changing owner's address
If you migrated to newer version of wallet and you want to move your SBT to it, you could send transfer to SBT from new wallet with payload:
```
pull_ownership#205e9c7b query_id:uint64 signature:^(signature:(bits 512)) 
sbt_nonce:uint64 new_owner:MsgAddress response_destination:MsgAddress 
custom_payload:(Maybe ^Cell) forward_amount:(VarUInteger 16) 
forward_payload:(Either Cell ^Cell)
```
1. To do it you first need to know current SBT's nonce, you can trigger `get_nonce` method of the SBT contract to get it.
2. `new_owner` should equals your wallet from which you sends message.
3. Then you need to sign `sbt_nonce:uint64 new_owner:MsgAddress response_destination:MsgAddress custom_payload:(Maybe ^Cell) forward_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)` this part of the message and put signature as first reference.
4. Now you can send this message as internal to SBT and owner will be changed to your new wallet. 

It is also possible to destroy SBT by setting `new_owner` to null address, after that, owner's address cannot be changed anymore.

#### Proving you ownership to contracts
SBT contracts has a feature that let you implement interesting mechanics with contracts by proving ownership onchain. 

You can send message to SBT and it will proxify message to target contract with its index and your wallet address in header, 
this way target contract could know that you are owner of SBT which relates to expected collection. Contract could know that SBT relates to collection by calculating address of SBT using code and index, and comparing it with sender.

To use this functionality SBT owner's wallet can send transfer with this scheme to SBT:
```
prove_ownership#38061b82 query_id:uint64 dest:MsgAddress 
data:^Cell with_content:bool
```
After that SBT will send transfer to `dest` with scheme:
```
verify_ownership#01b628aa query_id:uint64 sbt_id:uint256 owner:MsgAddress 
data:^Cell content:(Maybe ^Cell)
```
If something goes wrong and target contract not accepts message and it will be bounced back to SBT, SBT will proxy this bounce to owner, this way coins will not stuck on SBT.

#### Verify SBT contract example

```C
int op::verify_ownership() asm "0x01b628aa PUSHINT";

int equal_slices (slice a, slice b) asm "SDEQ";

_ load_data() {
    slice ds = get_data().begin_parse();

    return (
        ds~load_msg_addr(),    ;; collection_addr
        ds~load_ref()          ;; sbt_code
    );
}

slice calculate_sbt_address(slice collection_addr, cell sbt_item_code, int wc, int index) {
  cell data = begin_cell().store_uint(index, 64).store_slice(collection_addr).end_cell();
  cell state_init = begin_cell().store_uint(0, 2).store_dict(sbt_item_code).store_dict(data).store_uint(0, 1).end_cell();

  return begin_cell().store_uint(4, 3)
                     .store_int(wc, 8)
                     .store_uint(cell_hash(state_init), 256)
                     .end_cell()
                     .begin_parse();
}


() recv_internal(int balance, int msg_value, cell in_msg_full, slice in_msg) impure {
  slice cs = in_msg_full.begin_parse();
  int flags = cs~load_uint(4);

  slice sender_address = cs~load_msg_addr();

  int op = in_msg~load_uint(32);
  int query_id = in_msg~load_uint(64);

  if (op == op::verify_ownership()) {
    int id = in_msg~load_uint(256);

    (slice collection_addr, cell sbt_code) = load_data();
    throw_unless(403, equal_slices(sender_address, collection_addr.calculate_sbt_address(sbt_code, 0, id)));

    slice owner_addr = in_msg~load_msg_addr();
    cell payload = in_msg~load_ref();

    int with_content = in_msg~load_uint(1);
    if (with_content != 0) {
        cell sbt_content = in_msg~load_ref();
    }

    ;;
    ;; sbt verified, do something
    ;;

    return ();
  }

  throw(0xffff);
}
```