/**
 * Convert a BigInt to a big-endian buffer.
 * @param num   The BigInt to convert.
 * @param width The number of bytes that the resulting buffer should be.
 * @returns A big-endian buffer representation of num.
 */
export function toBufferBE(num: bigint, width: number): Buffer {
  const hex = num.toString(16)
  return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
}

export function bufferToInt(b: Buffer): bigint {
  return BigInt('0x' + b.toString('hex'))
}
