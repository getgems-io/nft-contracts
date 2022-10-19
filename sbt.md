# SBT
Soul bound token (SBT) is a special kind of NFT which can not be transferred. 
It includes optional certificate mechanics with revoke by authority and onchain ownership proofs. 
Holder can destroy his SBT in any time.

#### Issuing (minting)
Before mint, authority (collection owner) should verify wallet code offchain, and make sure that some tradeable contract is not used. 

#### Revoke
Issuer can revoke SBT, using message with schema:
```
revoke#6f89f5e3 query_id:uint64 = InternalMsgBody
```
After that SBT will be marked as revoked and will have revoke time set. It can be checked using GET method `get_revoked_time`

#### Changing owner's address
Authority needs to send simple NFT transfer message with address of the new owner. 
It is useful in case if owner lost access to his wallet and needs to restore SBT, he could ask authority to transfer SBT to new account.
Also using transfer, authority could revoke SBT, by transferring it to null address.

It is also possible to destroy SBT, owner could do it by sending message to SBT with schema:
```
destroy#1f04537a query_id:uint64 = InternalMsgBody
```

After destroy owner and authority address will be cleared.

#### Proving you ownership to contracts
SBT contracts has a feature that let you implement interesting mechanics with contracts by proving ownership onchain. 

You can send message to SBT, and it will proxify message to target contract with its index, owner's address and initiator address in body, together with any useful for contract payload, 
this way target contract could know that you are owner of SBT which relates to expected collection. Contract could know that SBT relates to collection by calculating address of SBT using code and index, and comparing it with sender.

There are 2 methods which allow to use this functionality, **ownership proof** and **ownership info**. 
The difference is that proof can be called only by SBT owner, so it is preferred to use when you need to accept messages only from owner, for example votes in DAO.

##### Ownership proof
**SBT owner** can send message to SBT with this schema:
```
prove_ownership#04ded148 query_id:uint64 dest:MsgAddress 
forward_payload:^Cell with_content:Bool = InternalMsgBody;
```
After that SBT will send transfer to `dest` with scheme:
```
ownership_proof#0524c7ae query_id:uint64 item_id:uint256 owner:MsgAddress 
data:^Cell revoked_at:uint64 content:(Maybe ^Cell)
```
If something goes wrong and target contract not accepts message, and it will be bounced back to SBT, SBT will proxy this bounce to owner, this way coins will not stuck on SBT.

##### Ownership info
**anyone** can send message to SBT with this schema:
```
request_owner#d0c3bfea query_id:uint64 dest:MsgAddress 
forward_payload:^Cell with_content:Bool = InternalMsgBody;
```
After that SBT will send transfer to `dest` with scheme:
```
owner_info#0dd607e3 query_id:uint64 item_id:uint256 initiator:MsgAddress owner:MsgAddress 
data:^Cell revoked_at:uint64 content:(Maybe ^Cell)
```
If something goes wrong and target contract not accepts message, and it will be bounced back to SBT, amount will stay on SBT.

#### Verify SBT contract example

```C
int op::ownership_proof() asm "0x0524c7ae PUSHINT";

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

  if (op == op::ownership_proof()) {
    int id = in_msg~load_uint(256);

    (slice collection_addr, cell sbt_code) = load_data();
    throw_unless(403, equal_slices(sender_address, collection_addr.calculate_sbt_address(sbt_code, 0, id)));

    slice owner_addr = in_msg~load_msg_addr();
    cell payload = in_msg~load_ref();
    
    int revoked_at = in_msg~load_uint(64);
    throw_if(403, revoked_at > 0);
    
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
