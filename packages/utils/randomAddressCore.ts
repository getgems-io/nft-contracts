import {Address} from "@ton/core";
import { randomBytes } from "crypto";

export function randomAddressCore(prefix?:string) {
  if (!prefix) {
    return new Address(0, randomBytes(256 / 8))
  }
  if (prefix.length > 13) {
    throw new Error(`Too large prefix: ${prefix}`)
  }
  const prefixBuffer = Buffer.from(prefix, 'base64')

  return new Address(0, Buffer.concat([Buffer.alloc(1).fill(0), prefixBuffer, Buffer.alloc(2).fill(0), randomBytes((256 / 8) - prefixBuffer.length - 3)]))
}
