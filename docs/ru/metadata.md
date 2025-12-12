## Метадата коллекции

![Collection example](../images/1collection.png "Collection example")

Пример json файла метадаты коллекции

```json
{
  "name": "Magic Mushrooms",
  "description": "Magic Mushrooms is an NFT collection of magic mushrooms created specially for Telegram and The Open Network.\n\nHand drawing brings the collection an artistic value, while various accessories and materials bring uniqueness and significance in our rapidly changing world.",
  "image": "https://s.getgems.io/nft/c/62695cb92d780b7496caea3a/avatar.png",
  "cover_image": "https://s.getgems.io/nft/c/62695cb92d780b7496caea3a/cover.png",
  "social_links": [
    "https://t.me/ton_magic_mushrooms"
  ]
}
```

|   |   |   |
|---|---|---|
|[1] name|название коллекции|рекомндуемая длина не более 15-30 символов|
|[2] description|описание коллекции|рекомндуемая длина до 500 символов|
|[3] image|ссылка на изображение|поддерживаются https и ipfs ссылки, рекомендуется использовать квадратное изображение разметом от 400x400 пикселей до 1000x1000 пикселей, поддерживаются форматы png, jpg, gif, webp, svg, размер файла не более 30 мб. Для анимированных изображений количество кадров не более ста.|
|[4] cover_image|ссылка на обложку|поддерживаются https и ipfs ссылки, рекомендуется использовать изображение размером 2880x680 пикселей, поддерживаются форматы png, jpg, gif, webp, svg, размер файла не более 30 мб. Для анимированных изображений количество кадров не более 30. Обратите внимание чтоб это изображение используется для превью коллекции, см. скриншоты|
|[5] social_links|массив со ссылками на соц. сети|не более 10 ссылок|



![Mobile view|width=300px](../images/2collection.png)
![Collection preview](../images/3collection.png "Collection preview")


## Метадата NFT

```json
{
  "name": "Magic Mushroom #57",
  "description": "Hand drawing brings the NFT an artistic value, while various accessories and materials bring uniqueness and significance in our rapidly changing world.",
  "image": "https://s.getgems.io/nft/c/62695cb92d780b7496caea3a/nft/56/629b9349e034e8e582cf6448.png",
  "attributes": [
    {
      "trait_type": "Material",
      "value": "Wool fabric"
    },
    {
      "trait_type": "Hat",
      "value": "Top hat"
    },
    {
      "trait_type": "Glasses",
      "value": "None"
    },
    {
      "trait_type": "Item",
      "value": "None"
    },
    {
      "trait_type": "Background",
      "value": "Dark"
    }
  ],
  "buttons": [
    {
      "label": "@mint",
      "uri": "https://t.me/mint?startapp"
    }
  ]
}
```

|              |                                       |                                                                                                                                                                                                                                                                                          |
|--------------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name         | название нфт                          | рекомндуемая длина не более 15-30 символов                                                                                                                                                                                                                                               |
| description  | описание нфт                          | рекомндуемая длина до 500 символов                                                                                                                                                                                                                                                       |
| image        | ссылка на изображение                 | поддерживаются https и ipfs ссылки, рекомендуется использовать квадратное изображение разметом 1000x1000 пикселей, поддерживаются форматы png, jpg, gif, webp, svg, размер файла не более 30 мб. Если вы используете видео то рекомендуется изображением сделать первый кадр этого видео |
| content_type | тип контента по ссылке из content_url | Например video/mp4                                                                                                                                                                                                                                                                       |
| content_url  | ссылка на дополнительный контент      | На текущий момент поддерживаются только видео, mp4 webm quicktime или mpeg, максимальный размер файла 100мб, рекомендуемый зармер видео 1000x1000 пикселей                                                                                                                               |
| lottie       | ссылка на json файл с лотти анимацией | Если указано то на странице с нфт будет проигрываться lottie анимания из этого файла. [Прмер нфт использующих lottie](https://getgems.io/collection/EQAG2BH0JlmFkbMrLEnyn2bIITaOSssd4WdisE4BdFMkZbir/EQCoADmGFboLrgOCDSwAe-jI-lOOVoRYllA5F4WeIMokINW8)                                   |
| attributes   | атрибуты нфт                          | Массив атрибутов где для каждлго атрибута указаны trait_type (название атрибута) value (значение атрибута). trait_type и value должны быть короткими соловосчетаниями до 128 символов                                                                                                    |
| buttons      | массив кнопок - ссылок                | Массив объектов вида `{label:string, uri:string}` `label` - название ссылки, max 24 символа, `uri` - http ссылка [Пример NFT с кнопками](https://getgems.io/collection/EQCww4swmVn32HICB5E19COsPsyEXaiw-3ZaBcEsiKt-DGKi/EQAoWa-72WRyidUaaOzOtFJgLHi4f017TAFfZSIHB_35maCZ)                |

![Mobile view|width=600px](../images/nft-metadata.jpg)
![Кнопки в NFT](../images/meta_buttons_uri.png)
