# Минтинг NFT через API getgems
[English version](minting-api-en.md)

Это API позволяет создавать NFT. Все взаимодействие происходит посредством REST API. 
Взаимодействие с блокчейном не требуется. 
Для использования API необходимо пополнить специальный кошелек — с него будут списываться тоны, необходимые для оплаты газа. 
API доступно как для [testnet](https://testnet.getgems.io/), так и для [mainnet](https://getgems.io/) сетей. 
Перед использованием в продакшене рекомендуется проверить интеграцию в [testnet-окружении](https://testnet.getgems.io/).

Чат в телеграм: https://t.me/getgemstech

Описание API в формате Open API:   
UI https://api.getgems.io/public-api/docs  
Schema https://api.getgems.io/public-api/docs.json

### Ограничения

- допускается не более 400 запросов на 5 минут с одного ip, при нарушении вместо ответа будет приходить html страница с ошибкой
- это API времено предоставляется без дополнительной платы, вы оплачиваете только газ необходимый для работы блокчейна. В будущем это будет изменено


### Создание NFT

#### 1) Выполните запрос на создание новой NFT

создание одной NFT стоит ~0.023 TON.
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
`requestId` (string, max 64 char) - уникальный идентификатор запроса, используется для предотвращения повторной отправки одного и того же запроса. Повторные запросы с одним и тем-же requestId будут игнорироваться.  
`ownerAddress` (string) - адрес владельца NFT, в формате `UQ...` или `EQ...`.  
остальные поля относятся к метадате NFT, описание полей смотри в [metadata.md](ru/metadata.md)

API ответит такими данными, `status: "in_queue"` означает что NFT находится в очереди на минтинг, обычно это занимает до 20 секунд, но время может быть увеличено до нескольких минут в зависимости от нагрузки на сеть.

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

#### 2) Проверка статуса запроса

Если требуется узнать когда именно нфт появилась в блокчейне выполните запрос на проверку статуса запроса, в этом запросе необходимо указывать `requestId`, такой-же, как и, в запросе на создание NFT. Делайте задержку перед повторами запроса не менее 6 секунд, чтобы не перегружать API.

```bash
curl -X 'GET' \
  'https://api.testnet.getgems.io/public-api/minting/{{collectionAddress}}/{{requestId}}' \
  -H 'accept: application/json' \
  -H 'Authorization: {{authorization}}'
```

Если API ответило `"status": "ready"` то NFT уже создана и доступна в блокчейне. В ответе будет адрес созданной NFT, а также адрес владельца NFT. Если API ответило `"status": "in_queue"` то NFT еще не создана, но запрос принят и будет обработан в ближайшее время.

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

### Возможные ошибки

- You need to top up your wallet
Если на кошельке недостаточно средств для оплаты газа, то API вернет ошибку с кодом 400. Адрес кошелька можно найти в сообщении от гетгемс бота
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

## Другие материалы

Пример скрипта на TypeScript https://gist.github.com/a-victorovich/d401d38cdbb29a0a5dc41348a9f25b22
