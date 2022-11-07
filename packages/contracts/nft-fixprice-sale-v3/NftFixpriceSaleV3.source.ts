import { Cell } from 'ton'
import { combineFunc } from "../../utils/combineFunc";

export const NftFixPriceSaleSourceV3 = () => {
  return combineFunc(__dirname, [
    '../sources/stdlib.fc',
    '../sources/op-codes.fc',
    '../sources/nft-fixprice-sale-v3.fc',
  ])
}

const NftFixPriceSaleV3CodeBoc =
  'te6cckECDAEAAqAAART/APSkE/S88sgLAQIBIAMCAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vACAUgFBABXoDhZ2omhpgGmP/SB9IH0gfQBqaYAYGGh9IH0AfSB9ABhBCCMkrCgFYACqwECAs0IBgH3ZghA7msoAUmCgUjC+8uHCJND6QPoA+kD6ADBTkqEhoVCHoRagUpBwgBDIywVQA88WAfoCy2rJcfsAJcIAJddJwgKwjhdQRXCAEMjLBVADzxYB+gLLaslx+wAQI5I0NOJacIAQyMsFUAPPFgH6AstqyXH7AHAgghBfzD0UgcAlsjLHxPLPyPPFlADzxbKAIIJycOA+gLKAMlxgBjIywUmzxZw+gLLaszJgwb7AHFVUHAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVAP10A6GmBgLjYSS+CcH0gGHaiaGmAaY/9IH0gfSB9AGppgBgYOCmE44BgAEwthGmP6Z+lVW8Q4AHxgRDAgRXdFOAA2CnT44LYTwhWL4ZqGGhpg+oYAP2AcBRgAPloyhJrpOEBWfGBHByUYABOGxuIHCOyiiGYOHgC8BRgAMCwoJAC6SXwvgCMACmFVEECQQI/AF4F8KhA/y8ACAMDM5OVNSxwWSXwngUVHHBfLh9IIQBRONkRW68uH1BPpAMEBmBXAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVADYMTc4OYIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxXLPyfPFifPFhTKACP6AhPKAMmAQPsAcVBmRRUEcAfIywAWyx9QBM8WWM8WAc8WAfoCzMsAye1UM/Vflw=='

export const NftFixPriceSaleV3CodeCell = Cell.fromBoc(Buffer.from(NftFixPriceSaleV3CodeBoc, 'base64'))[0]
