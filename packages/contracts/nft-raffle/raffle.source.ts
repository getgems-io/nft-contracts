import { Cell } from "ton";
import { combineFunc } from "../../utils/combineFunc";


export const RaffleSource = combineFunc(__dirname, [
    "../sources/stdlib.fc",
    "../sources/nft-raffle/struct/constants.func",
    "../sources/nft-raffle/struct/storage.func",
    "../sources/nft-raffle/struct/utils.func",
    "../sources/nft-raffle/struct/handles.func",
    "../sources/nft-raffle/struct/get-methods.func",
    '../sources/nft-raffle/main.func',
])

export const NftRaffleCodeBOC = 'te6ccsECGgEABKgAAA0AEgAXAD0AQwCdANwA+AEgAV4BwQHoAh8CcQJ/Ar4CwwMRAy8DYwObA7cD8QQGBEUEqAEU/wD0pBP0vPLICwECAWIFAgIBWAQDAUW6KJ2zz4QvhD+ET4RfhG+Ef4SPhJ+Er4S/hM+E34TvhP+FCBkBBbtguBUEqNAz0NMDAXGw8kDbPPpAMALTH/hHUkDHBfhIUlDHBfhJUmDHBYIQBRONkVJQuo6GEDRfBNs84IEH0VJQuo6ObDMzgQPqWbFYsfL02zzgMIEH0lJAuhkNCgYDdI6YM4ED6lMxsfL0cAGSMHHeApJyMt5DMNs84FuBB9RSILqOhhAjXwPbPOAygQfTuo6C2zzgW4QP8vAJCAcANIED6fhCcbry8oED6vhJE8cFEvL01NMHMPsAAUqBA+n4QnO98vL4RfhDoPhOqIED61IiufLy+EX4Q6CpBPhQAds8EwNyMDGBA+n4QnG68vQhwAGd+EyCCJiWgFIgoaD4bN4BwAKc+E2CCJiWgBKhoPhtkTDi2zyOgts83ts8FQ8RBLqBA+n4QnG98vKBA+nbPPLycvhi+E/4TvhH+EjbPIIID0JAcPsC+Ef4TI0E05GVCByYWZmbGUgY2FuY2VsZWSBy2zz4SPhNjQTTkZUIHJhZmZsZSBjYW5jZWxlZIHIVDBILA0TbPPhJcI0E05GVCByYWZmbGUgY2FuY2VsZWSCBAILbPNs8EhIRAmZ/jy0kgwf0fG+lII8eItcLA8ACjoZxVHZS2zzeAtcLA8ADjoZxVHUx2zzekTLiAbPmXwUYGASYggiYloASofhOoSDBAPhCcb2xjoMw2zzgIvpEMfhPAds8XLGzjoRfBNs84DQ0+G8Cm/hGpPhm+EwioPhs3pv4RKT4ZPhNAaD4bZEw4hcWFw4DEts8joLbPN7bPBUPEQRyc/hi+FD4T9s8+HD4UPhO2zyCCA9CQHD7AvhJcI0FU5GVCByYWZmbGUgY29tbWlzc2lvboIEAgts8FBMSEAEE2zwRAJj4UPhPyPQA9ADJyPhK+gL4S/oC+Ez6AvhN+gL4TvoCycj4R88W+EjPFvhJzxbJ+Eb4RfhE+EP4QsjLAcsDywPLA8sDycjMzMzMye1UADhwIIAYyMsFUAbPFlAE+gIUy2oSyx8BzxbJAfsAAmB/jyoigwf0fG+lII8bAtcLAMABjohw+EdUZDHbPI6IcPhIVGQx2zzikTLiAbPmXwMYGABsf44xIYMH9HxvpTIhjiNy+BHAAJ1xyMsAydBUIAWDB/QWnXDIywDJ0FQgBYMH9BbiA94Bs+ZbATLbPPhD+ES6+EX4Rrqw+Ez4Sr6w+E34S76wGQBwcFRwEoMH9A5vocAAlF8EcCDg0wMwwACeMXLIywPJ0EADgwf0Fn+fMHPIywPJ0EADgwf0Fn8C4lgBJIBA1yH6QDAB+kQxgEACcALbPBgAenAg+CWCEF/MPRTIyx/LPyTPFlAEzxYTygAi+gISygDJcXAgcoAYyMsFywHLAMsHE8v/UAP6AstqzMkB+wAAwvhBbt3tRNDUAdDTAQH4YtMDAfhj0wMB+GTTAwH4ZdMDMPhm1AHQ+kAB+Gf6QAH4aPpAMPhp1AHQ+gAB+Gr6AAH4a/oAAfhs+gAB+G36ADD4btQw0PQEAfhv9AQw+HB/+GEoOcFW'
export const NftRaffleCodeCell = Cell.fromBoc(Buffer.from(NftRaffleCodeBOC, 'base64'))[0]