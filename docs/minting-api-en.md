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

### Creating an NFT

#### 1) Send a request to create a new NFT

Creating one NFT costs ~0.023 TON.
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

