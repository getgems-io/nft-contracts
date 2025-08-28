# Getgems API
[in english](read-api-en.md)

С помощью этого API можно узнать:
- Флор NFT-коллекции (цена в тонах за самую дешевую NFT)
- Флор NFT-коллекции в разрезе по атрибутам
- Получить список NFT, которые сейчас находятся в продаже
- Получить список NFT пользователя
- Получить историю NFT-коллекции: продажи, выставления на продажу, минтинг новых NFT
- Получить список NFT определённой коллекции у пользователя
- Получить список NFT в коллекции
- Базовую информацию о NFT-коллекции: название, описание и т. д.
- Базовую информацию о NFT-айтеме: название, картинка, владелец, состояние, находится ли в продаже

Чат в телеграм: https://t.me/getgemstech

Документация по всем доступным методам API в формате Open API:  
UI https://api.getgems.io/public-api/docs  
Schema https://api.getgems.io/public-api/docs.json

## Как получить API ключ?

Для создания ключа перейдите на страницу https://getgems.io/public-api и авторизируйтесь с помощью TON Connect

## Ограничения 
- допускается не более 400 запросов на 5 минут с одного ip, при нарушении вместо ответа будет приходить html страница с ошибкой
- это API времено предоставляется без дополнительной платы, вы оплачиваете только газ необходимый для работы блокчейна. В будущем это будет изменено

## Примеры запросов и ответов

Получаение списка NFT, которые находятся на продаже в коллекции Telegram Usernames
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
      },
      {
        "address": "EQC9IPqUGtU_LuvmGeSNgWTqH_a3rMzrJkxoA5mz1mXL6uSB",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQDWatLmbYL2OW9HjG-gIbUyVoB5rZP1EXBU9bzTI_fqK0KV",
        "actualOwnerAddress": "EQDWatLmbYL2OW9HjG-gIbUyVoB5rZP1EXBU9bzTI_fqK0KV",
        "image": "https://i.getgems.io/sbWuvgfPNjy3M9TRrpmqtiAFMTLJa86S_mnmODxnvY4/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvZTVjYTk2ZjE2ZWFjYWViMg.png",
        "name": "@karalina",
        "description": "The @karalina username on Telegram. Aliases: karalina.t.me, t.me/karalina",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "3000000000",
          "maxBid": null,
          "finishAt": 1755262486,
          "lastBidAmount": "2000000000",
          "lastBidAddress": "EQAcz-M01bBJ-JqHsaSKJOTihk6-uz1A8m_-5U9Qy9dfXRd0",
          "lastBidAt": 1754658485,
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "factor": 5,
            "base": 100
          },
          "version": "1b028711a4af0000,s:3,m:5f367da17984bbd2"
        }
      },
      {
        "address": "EQDQtzvhNJijOQXE-5dtPKOkFo4TTuJ5Jr3Dpt2sjJeUdIWU",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQAHSPSfUCMx1A2fDDknUcVWa20UajiZ99im8glRaOVl3k6y",
        "actualOwnerAddress": "EQC8slf3Sx5gYWqb9P-RkgGbOJzG80inwu8Zt2K4-zKE44ON",
        "image": "https://i.getgems.io/FG5DUl2vIdYYaDVV8-rvd-Yk_9bJwoXoLkMFOKoGVxI/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvYmM4ZjY5OTAzZWM0NmEwMw.png",
        "name": "@christmas_present",
        "description": "The @christmas_present username on Telegram. Aliases: christmas_present.t.me, t.me/christmas_present",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5000000000",
          "maxBid": "50000000000",
          "finishAt": "2025-08-12T16:44:56.000Z",
          "lastBidAmount": null,
          "lastBidAddress": null,
          "lastBidAt": null,
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1afedbf5a024e000,s:mywpiww:TON,m:c62f7d9043575ac0"
        }
      },
      {
        "address": "EQDQDx3oadlHj1pY2sNgwjQZpF-tRHH7AWvxUY-x_9HMLR7h",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQBAiSN3XfedrUwUt_IO5wnGRm3XLcupoU26xJl6tExqyGgF",
        "actualOwnerAddress": "EQCX0_C0QpS44J6PXHz_ejeLW9I5jBqDBltLWTu2wO9YiZiQ",
        "image": "https://i.getgems.io/kpxNveurg6yWcR66gbaNNo2bISFDvHTFgUvCReBgt60/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvOWI5MmNmYjljNzUxZDMyZg.png",
        "name": "@news_espn",
        "description": "The @news_espn username on Telegram. Aliases: news_espn.t.me, t.me/news_espn",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5000000000",
          "maxBid": "350000000000",
          "finishAt": "2025-08-14T23:14:37.000Z",
          "lastBidAmount": null,
          "lastBidAddress": null,
          "lastBidAt": null,
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1b01c8551df6a000,s:4gscyoe8:TON,m:aa35b78970b2a58a"
        }
      },
      {
        "address": "EQAR6a0hCgAmBEEwLEHbUqiLIhcTSAEgDM2b1_aJgqTI8N2r",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQBFMLysL4pS6TDvUO9GRV9XuGRzHNoh8TeoRe1-CPJoCVu_",
        "actualOwnerAddress": "EQB987rdzdl1UfPq0b4Ytw1EIayRHRgr5QS80c1n0A0XAIPo",
        "image": "https://i.getgems.io/MG4wz-24x7-G55UYTLRaw5HwllPspGB8YCYFspRBZSk/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvOWNkNjlhYjg0ZjVlMmRkYw.png",
        "name": "@mrjetton",
        "description": "The @mrjetton username on Telegram. Aliases: mrjetton.t.me, t.me/mrjetton",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5300000000",
          "maxBid": null,
          "finishAt": "2025-08-10T22:02:40.000Z",
          "lastBidAmount": "5200000000",
          "lastBidAddress": "EQAVu1wjmUw1LBdNV_NDKjuGCDRsl94_KZTJwzsG0khU6fMC",
          "lastBidAt": "2025-08-04T15:27:19.000Z",
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1afd8094c2ba0000,s:0:TON,m:b1f21eda26c8f100"
        }
      },
      {
        "address": "EQC-Sx9TKyQC0DE0IiKqxmK2xeflT94A9c8osQBXT1mNi3Xu",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQBCsCm7uHOikoF6Z8OweMveq2hbf2ARXGH5AbUxRRHdFeHW",
        "actualOwnerAddress": "EQCBST2jzdXMXcacdrEDiFX_HRv9R0LhIwTjZaCGz8hMG_fk",
        "image": "https://i.getgems.io/ulQOblOA5LFrdLIkXyFk-Usn6f12qyB_P8QZbcmppu4/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvYzExM2FlNWFiYzNiNzQwNw.png",
        "name": "@durovpartner",
        "description": "The @durovpartner username on Telegram. Aliases: durovpartner.t.me, t.me/durovpartner",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5300000000",
          "maxBid": null,
          "finishAt": "2025-08-19T06:43:07.000Z",
          "lastBidAmount": "5200000000",
          "lastBidAddress": "EQCGMfhIQYHcrWV0whW4cblVlt41CilxufIlricOuVvfQpH1",
          "lastBidAt": "2025-08-06T22:38:48.000Z",
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1b007684a6ef8000,s:0:TON,m:a3dd54e343f88ec4"
        }
      },
      {
        "address": "EQAdzlvdWJUHdIGkjcnO5UAwQbkSE6Hniyxh65YMhCT86Nq0",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQAQUnwLz7rFpRuMXZhtiwQ_ChWbGVB6q6Wq8JjrsLqD5hTD",
        "actualOwnerAddress": "EQC8slf3Sx5gYWqb9P-RkgGbOJzG80inwu8Zt2K4-zKE44ON",
        "image": "https://i.getgems.io/2045O8YeJgjmGR1qIX8HRnjsHsmU52ZxPJ_UYW70V1k/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvZDU2MTRkODk4MmMyM2U3Ng.png",
        "name": "@color_collection",
        "description": "The @color_collection username on Telegram. Aliases: color_collection.t.me, t.me/color_collection",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5600000000",
          "maxBid": "50000000000",
          "finishAt": "2025-08-12T16:56:48.000Z",
          "lastBidAmount": "5500000000",
          "lastBidAddress": "EQAVu1wjmUw1LBdNV_NDKjuGCDRsl94_KZTJwzsG0khU6fMC",
          "lastBidAt": "2025-08-06T23:20:53.000Z",
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1b00802589ef8000,s:mywpiww:TON,m:3c27dfe51fdcb1d4"
        }
      },
      {
        "address": "EQCotmJcjvcjaaAPXXcW40z5VswtRVG2KNJ-YK6LvBt8LBf2",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQCcn_ocq7C3zHYgo56rs8UxAUKl1lhjDC6EKFhDvQ2LUO7H",
        "actualOwnerAddress": "EQC8slf3Sx5gYWqb9P-RkgGbOJzG80inwu8Zt2K4-zKE44ON",
        "image": "https://i.getgems.io/BWlR2fxqc0Z_7ek6NG6nps05xtnvq42T3E6QzUqoDtA/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvYjZmZmE0ZjI1M2I2NWRmMw.png",
        "name": "@overfunny",
        "description": "The @overfunny username on Telegram. Aliases: overfunny.t.me, t.me/overfunny",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5700000000",
          "maxBid": "100000000000",
          "finishAt": "2025-08-12T17:01:23.000Z",
          "lastBidAmount": "5600000000",
          "lastBidAddress": "EQAVu1wjmUw1LBdNV_NDKjuGCDRsl94_KZTJwzsG0khU6fMC",
          "lastBidAt": "2025-08-06T23:19:54.000Z",
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1b007fecdaaf8000,s:19xtf1ts:TON,m:8971171ec74e48ae"
        }
      },
      {
        "address": "EQA333zSiwRas5a0bIChkp1Xh4-VX7TLVROgfHTxzKfpHoPF",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQDAWyDR5iZ9dLyF6TpREdpKrg-VnzcT3la81u3HYt-A99zT",
        "actualOwnerAddress": "EQB5FVyraGcuVV_BTDOw_OLCN56NiJ-MOK4nioxtY4evkqt5",
        "image": "https://i.getgems.io/NirSMzrsqGWQju2HZiTc08JmKmHwBm2JD0mhL1V4Hp8/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvNGFkMGMzYzRjMzIzM2FkOQ.png",
        "name": "@futurecointon",
        "description": "The @futurecointon username on Telegram. Aliases: futurecointon.t.me, t.me/futurecointon",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5700000000",
          "maxBid": null,
          "finishAt": "2025-08-09T22:39:03.000Z",
          "lastBidAmount": "5600000000",
          "lastBidAddress": "EQAVu1wjmUw1LBdNV_NDKjuGCDRsl94_KZTJwzsG0khU6fMC",
          "lastBidAt": "2025-08-06T23:19:40.000Z",
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1b007fddab6f8000,s:0:TON,m:30cb300a40d8be24"
        }
      },
      {
        "address": "EQBR1rrC0PFONIdC6f6pAIY60QxNUiUk5DMlkFWr5ez7m1X2",
        "collectionAddress": "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
        "ownerAddress": "EQAFjBYY9DrqpMCOYmmTikXQicbuhei_UMp0n7Ytxsq8oK47",
        "actualOwnerAddress": "EQC8slf3Sx5gYWqb9P-RkgGbOJzG80inwu8Zt2K4-zKE44ON",
        "image": "https://i.getgems.io/iXnzIM9iFxzpZHC6rLQUR4T7EiPeJ-clzdfwhryKccU/rs:fill:500:500:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUNBMTRvMS1WV2hTMmVmcW9oXzlNMWJfQTlEdEtUdW9xZm1rbjgzQWJKenduUGkvOTA2ODZjY2YwZDg5NWQ3ZQ.png",
        "name": "@cryptos_card",
        "description": "The @cryptos_card username on Telegram. Aliases: cryptos_card.t.me, t.me/cryptos_card",
        "attributes": [],
        "sale": {
          "type": "Auction",
          "currency": "TON",
          "minBid": "5700000000",
          "maxBid": "50000000000",
          "finishAt": "2025-08-12T16:54:52.000Z",
          "lastBidAmount": "5600000000",
          "lastBidAddress": "EQDvmIvHcFnntXuAMDPp89qwSTIKcytdFNK4lzr_JMGPAzDd",
          "lastBidAt": "2025-08-08T09:12:04.000Z",
          "marketplaceFee": "0",
          "marketplaceFeeAddress": "EQC-56PXuMBvlVIDLDiApWp0twKtiyJPQr-xrBwzvXGQgPYM",
          "royaltyAddress": "EQBAjaOyi2wGWlk-EDkSabqqnF-MrrwMadnwqrurKpkla9nE",
          "royaltyPercent": {
            "base": 100,
            "factor": 0
          },
          "version": "1b02510cbf36a000,s:mywpiww:TON,m:2d56f73ebe67500c"
        }
      }
    ],
    "cursor": "5.7%2C6813a6976428bb255010d739"
  }
}
```
