# Getgems Public API

This documentation describes the main usage scenarios for the **Getgems Public API**, primarily the methods available in the `ReadApi` section.

You can purchase API access here: _[https://getgems.io/public-api]_.

## Important Notes

- Do not exceed the limit of **400 requests per 5 minutes**. Higher rate limits are currently not available.
- The API provides data and methods for building transactions, but **does not interact directly with your payment wallet**.
- The API does not purchase NFTs on behalf of a specific wallet. To complete a purchase, you must sign the generated transaction yourself and submit it to the blockchain.
- A single API token can be used with multiple wallets. In other words, you may use any wallet or multiple wallets to sign transactions.
- Do not use GraphQL endpoints. They are not a public API, are not supported for third-party integrations, may be rate-limited or blocked, and may change without notice.
---

# Building a Trading Bot

Below is the recommended approach for monitoring new events and purchasing NFTs.

## 1. Getting the Initial Cursor

After your application starts, you should fetch the current `cursor` value once.

### For Gifts

```http
GET /v1/nfts/history/gifts?limit=1
```

### For Stickers

```http
GET /v1/nfts/history/stickers?limit=1
```

### For a Specific Collection

```http
GET /v1/collection/{collectionAddress}?limit=1
```

Save the following value from the response:

```text
response.cursor
```

This `cursor` will be used to retrieve new history events.

---

## 2. Fetching New Events

After obtaining the initial `cursor`, periodically request new events.

Do not perform these requests more frequently than **once per second**.

### For Gifts

```http
GET /v1/nfts/history/gifts?limit=10&reverse=true&after={cursor}
```

### For Stickers

```http
GET /v1/nfts/history/stickers?limit=10&reverse=true&after={cursor}
```

### For a Specific Collection

```http
GET /v1/collection/{collectionAddress}?limit=10&reverse=true&after={cursor}
```

The key difference from step 1 is the use of:

```text
reverse=true
after={cursor}
```

Step 1 is only required to obtain the current starting position in the event history.

After each request in step 2, save the new value:

```text
response.cursor
```

and use it in the next request.

> Whenever the application restarts, it is recommended to repeat step 1 and obtain a fresh `cursor`.

If you need to monitor several Gift collections, it is more efficient to use the general endpoint:

```http
GET /v1/nfts/history/gifts
```

instead of making separate requests to:

```http
GET /v1/collection/{collectionAddress}
```

for each individual collection.

This helps reduce the total number of API requests.

---

## 3. Filtering Events

In step 2, history events are returned in:

```text
response.items
```

If necessary, you can restrict the returned event types using the `types` query parameter.

For example, to receive only events where Gifts are listed for a fixed-price sale or auction:

```http
GET /v1/nfts/history/gifts?limit=10&reverse=true&after={cursor}&types[]=putUpForSale&types[]=putUpForAuction
```

Each item in `response.items` contains:

```text
typeData.version
```

You should save the `version` value if you plan to use the event to purchase the NFT in the next step.

---

## 4. Getting a Transaction for an NFT Purchase

If, during step 3, you detect a suitable NFT listing and want to purchase the NFT, use:

```http
POST /v1/nfts/buy-fix-price/{nftAddress}
```

The request `BODY` must include the `version` obtained from the history event:

```json
{
  "version": "version_from_step_3"
}
```

Passing `version` helps ensure that the purchase is being performed against the expected current state of the NFT.

---

## 5. Signing and Sending the Transaction

The response from step 4 contains the data required to build the transaction.

You then need to:

1. sign the transaction using your wallet or private key;
2. submit the signed transaction to the TON Blockchain.

To submit a signed transaction to the blockchain, you may use the free version of:

https://tonapi.io

---

# Monitoring All Active Listings in a Collection

This scenario is useful when your application needs to maintain a local list of all currently available listings for a specific collection.

For example, you may want to display all available NFTs from the **Anonymous Telegram Numbers** collection.

This workflow consists of two parallel processes:

1. performing the initial load of all active listings;
2. monitoring subsequent changes through history events.

---

## 1. Initial Listings Load

Fetch all available listings for the collection page by page:

```http
GET /v1/nfts/on-sale/{collectionAddress}?limit=100
```

Do not include the `after` parameter in the first request.

If the API returns:

```text
response.cursor
```

the next request should look like this:

```http
GET /v1/nfts/on-sale/{collectionAddress}?limit=100&after={cursor}
```

For each subsequent iteration, use the `response.cursor` value from the previous response.

The received listings should be stored locally, for example in your application's database or cache.

The recommended interval between requests to this endpoint is **at least 2 seconds**.

The initial load is complete when the API returns:

```text
cursor = null
```

---

## 2. Monitoring Changes Through History in Parallel

At the same time as the initial listings load, you should begin fetching collection history events.

This is important because the state of the collection may change while step 1 is still in progress.

### 2.1. Getting the History Cursor

Send the following request:

```http
GET /v1/collection/{collectionAddress}?limit=1
```

and save:

```text
response.cursor
```

> This `cursor` belongs to the event history and is completely independent from the `cursor` used in step 1 for pagination of `/v1/nfts/on-sale`.

---

### 2.2. Fetching New Events

Then periodically perform:

```http
GET /v1/collection/{collectionAddress}?limit=10&reverse=true&after={cursor}
```

Do not perform this request more frequently than **once every 2 seconds**.

After every response, make sure to update the local cursor value:

```text
cursor = response.cursor
```

The received events should be applied to the listing data stored locally.

For example:

- new listing — add the NFT;
- price change — update the NFT;
- sale or listing cancellation — remove the NFT from the list of active listings.

---

## After the Initial Load Is Complete

Once step 1 is fully completed and `/v1/nfts/on-sale/{collectionAddress}` returns:

```text
cursor = null
```

there is no need to repeatedly reload the complete listings dataset.

From this point onward, it is sufficient to keep running step **2.2** and update your local collection state based on history events.

In other words:

```text
/v1/nfts/on-sale
```

is used to obtain the initial snapshot of the collection state, while:

```text
/v1/collection/{collectionAddress}
```

is used to track subsequent changes.

---

# Other Usage Scenarios

Most integrations can be built using the same principles described in the examples above.

The main recommendations for working with the API are:

1. Do not exceed the request limit of **400 requests per 5 minutes**.

2. Most history-related endpoints (`/history/`) allow you to control the direction in which events are returned using the `reverse` query parameter.

3. For many use cases, it is sufficient to retrieve only new history events starting from the current `cursor`. This approach is described in detail in the examples above.

4. For the initial population of a local database, you can use list endpoints that return the current NFT state. For example:

   ```text
   /v1/nfts/on-sale/{collectionAddress}
   /v1/nfts/offchain/on-sale/{collectionAddress}
   /v1/nfts/collection/{collectionAddress}
   ```

   These endpoints are best suited for the initial data load.

   To track subsequent changes, it is recommended to use history-related endpoints:

   ```text
   /v1/nfts/history/...
   ```

   In other words, list endpoints are used to obtain the initial state, while history endpoints are used to keep that state up to date.

## Rate limits

The current Read API limit is 400 requests per 5 minutes per client.

Do not try to bypass this limit using multiple IP addresses, API tokens,
proxies or parallel workers.

For bulk synchronization:
- request the maximum supported page size;
- paginate using the returned cursor;
- store results locally;
- after the initial synchronization, consume incremental history/update
  endpoints instead of downloading the entire dataset again;
- honor HTTP 429 and Retry-After.
