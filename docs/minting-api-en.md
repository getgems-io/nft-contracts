# Minting NFTs via getgems API
[На русском](minting-api-ru.md)

This API allows you to create NFTs. All interaction happens via REST API.  
Interaction with the blockchain is not required.  
To use the API, you need to top up a special wallet — tokens will be deducted from it to pay for gas.  
The API is available for both [testnet](https://testnet.getgems.io/) and [mainnet](https://getgems.io/) networks.  
Before using it in production, it is recommended to test the integration in the [testnet environment](https://testnet.getgems.io/).

***If you are looking for API to receive information about NFT check [Read API](https://github.com/getgems-io/nft-contracts/blob/main/docs/read-api-en.md)***

Telegram chat: https://t.me/getgemstech

API description in Open API format:     
UI https://api.getgems.io/public-api/docs [UI for testnet](https://api.testnet.getgems.io/public-api/docs)  
Schema https://api.getgems.io/public-api/docs.json

### Limitations

- no more than 400 requests per 5 minutes from one IP are allowed, if there is a violation, instead of a response, an html page with an error will come
- this API is temporarily provided at no additional cost, you only pay for the gas required for the blockchain to work. This will be changed in the future

### NFT Creation Process

#### 1) Generate a random requestId (string, up to 100 characters long).
Each NFT must have a unique requestId. You can use the current time in milliseconds as the requestId value.

#### 2) Send a request to create a new NFT
In the response, you will receive the NFT address and a link to getgems. However, the NFT is not created instantly — the process runs in the background and takes from 6 seconds to several minutes. You can track the NFT creation status via the GET request
```/public-api/minting/{{collectionAddress}}/{{requestId}}```.

If you receive a timeout error or an error with code 500, you can safely repeat the request with the same requestId.

Creating one NFT costs approximately ~0.023 TON.
```bash
curl -X 'POST' \
  'https://api.testnet.getgems.io/public-api/minting/{{collectionAddress}}' \
  -H 'accept: application/json' \
  -H 'Authorization: {{authorization}}' \
  -H 'Content-Type: application/json' \
  -d '{
  "requestId": "1689451433227",
  "ownerAddress": "UQB5HQfjevz9su4ZQGcDT_4IB0IUGh5PM2vAXPU2e4O6_YBm",
  "name": "Spotty",
  "description": "This is my cool nft collection",
  "image": "https://s.getgems.io/nft/b/c/62bd932a7b5f87901f3d8d19/image.png",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Red"
    }
  ]
}'
```
`requestId` (string, max 100 char) - unique request identifier used to prevent resubmission of the same request. Repeated requests with the same requestId will be ignored.  
`ownerAddress` (string) - NFT owner’s address in UQ... or EQ... format.  
The other fields belong to the NFT metadata; see the field descriptions in  [metadata.md](ru/metadata.md)

The API will respond with:, `status: "in_queue"` means the NFT is in the minting queue. This usually takes up to 20 seconds, but it can take several minutes depending on network load.

```json
{
  "success": true,
  "response": {
    "status": "in_queue",
    "index": 260343653244928,
    "address": "EQAiSecR8RXTt0-cPb5JrLD-BLVYxKd48A9ySHksrqAUXoVJ",
    "ownerAddress": "UQB5HQfjevz9su4ZQGcDT_4IB0IUGh5PM2vAXPU2e4O6_YBm",
    "url": "https://testnet.getgems.io/collection/EQD008sUupO8AvdMte6OLiriOrsoSkCoi59REKIOgyZHDz32/EQAiSecR8RXTt0-cPb5JrLD-BLVYxKd48A9ySHksrqAUXoVJ"
  }
}
```

#### 2) Check request status

If you want to know when exactly the NFT appears on the blockchain, send a request to check the status. Use the same requestId as in the creation request.
Add a delay of at least 6 seconds between repeated requests to avoid overloading the API.

```bash
curl -X 'GET' \
  'https://api.testnet.getgems.io/public-api/minting/{{collectionAddress}}/{{requestId}}' \
  -H 'accept: application/json' \
  -H 'Authorization: {{authorization}}'
```

If the API responds with `"status": "ready"`, the NFT has been created and is available on the blockchain. If it responds with "status": "in_queue", the NFT has not yet been created but the request is accepted.

```json
{
  "success": true,
  "response": {
    "status": "ready",
    "index": 260343653244928,
    "address": "EQAiSecR8RXTt0-cPb5JrLD-BLVYxKd48A9ySHksrqAUXoVJ",
    "ownerAddress": "UQB5HQfjevz9su4ZQGcDT_4IB0IUGh5PM2vAXPU2e4O6_YBm",
    "url": "https://testnet.getgems.io/collection/EQD008sUupO8AvdMte6OLiriOrsoSkCoi59REKIOgyZHDz32/EQAiSecR8RXTt0-cPb5JrLD-BLVYxKd48A9ySHksrqAUXoVJ"
  }
}
```

### Possible errors

- You need to top up your wallet
  If there are insufficient funds in the wallet to pay for gas, the API will return a 400 error. The wallet address can be found in the message from the getgems bot.
```json
{
  "name": "Logic Error",
  "status": 400,
  "errors": [
    {
      "message": "You need to top up your wallet"
    }
  ]
}
```


## More

Example TypeScript script: https://gist.github.com/a-victorovich/d401d38cdbb29a0a5dc41348a9f25b22

## Questions

### cNFT?

Compressed NFTs are a special format of NFT collections that significantly reduce minting costs. The technical documentation is available here:  
https://docs.ton.org/v3/guidelines/dapps/asset-processing/compressed-nfts  
https://docs.tonconsole.com/tonconsole/nft/cnft  

cNFTs are recommended if your collection contains more than 50,000 NFTs. You also need to know the addresses of all NFT owners in advance. If it’s not possible to determine all owners’ addresses beforehand, the collection can be minted in parts. Minting each part costs 1 TON. The number of NFTs in a single part is unlimited.  

Before creating a cNFT collection, you must specify the maximum number of NFTs it will contain. This number cannot be changed later, so it is recommended to set it with some reserve. For example, you can specify 100,000 NFTs but mint only 70,000.  

cNFT owners will need to pay about 0.085 TON to convert a cNFT into a regular NFT, after which it can be traded.  

To have your collection fully displayed on Getgems, you need to contact support: https://t.me/nfton_bot. By default, only the first 1,000 NFTs will be shown.

