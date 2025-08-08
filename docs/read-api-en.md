# Getgems API

This API allows you to retrieve information about NFTs and collections, find NFTs for sale, and generate transactions for purchasing and listing NFTs.

Telegram chat: https://t.me/getgemstech

Documentation for all available API methods in Open API format:  
UI https://api.getgems.io/public-api/docs  
Schema https://api.getgems.io/public-api/docs.json

## How to get an API key?

To create a key, go to https://getgems.io/public-api and log in using TON Connect.

## Limitations
- No more than 400 requests per 5 minutes from a single IP are allowed. If exceeded, instead of a response you will receive an HTML error page.
- This API is temporarily provided free of charge; you only pay the gas fees required for blockchain operations. This will change in the future.

## Request and response examples

Retrieving a list of NFTs that are for sale in the Telegram Usernames collection:
```bash
curl -X 'GET' \
  'https://api.getgems.io/public-api/v1/nfts/on-sale/EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi' \
  -H 'accept: application/json' \
  -H 'Authorization: <API KEY>'
```


```json
{
  "success": true,
  "response": {
    "items": [
      {
        "address": "EQAtjj8TSTMlGcSV4noceB3D7_NrqQsRfWd6Wxo33NzfV7Yi",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQDO-o9ZgXFTS23bE_nG88PfB39-9X6IAtCrh6QB88V9j7YX",
        "actualOwnerAddress": "EQCY2l1vlXnfIl62sE-_AuGeUXA9i0Jp2zjwLMpXgpbTyj2O",
        "image": "https://i.getgems.io/NqiR1Ch-5m-h_5PpX6069a565wQqvizA6XuNsdGdriA/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvMjdhMzE1NzEzMGI0NDMyMQ.png",
        "name": "@notpixelroyale",
        "description": "The @notpixelroyale username on Telegram. Aliases: notpixelroyale.t.me, t.me/notpixelroyale",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "2200000000",
          "maxBid": null,
          "finishAt": "2025-08-18T01:01:05.000Z",
          "lastBidAmount": "2000000000",
          "lastBidAddress": "EQCch6yDUm-Ebhx5a2zmEI8U9igWvTkBS51RN99tXYbFJAA6",
          "lastBidAt": "2025-08-07T12:18:14.000Z",
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1b0132132afa3000,s:0:TON,m:c2de3029a60a7dd1"
        }
      }
      // ... Other NFT objects
    ],
    "cursor": "5.7%2C6813a6976428bb255010d739"
  }
}
```
