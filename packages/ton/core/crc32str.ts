const POLYNOMIAL = -306674912;
let crc32Table: Int32Array | undefined;
function calcTable() {
  crc32Table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let r = i;
    for (let bit = 8; bit > 0; --bit) {
      r = ((r & 1) ? ((r >>> 1) ^ POLYNOMIAL) : (r >>> 1));
    }
    crc32Table[i] = r;
  }
  return crc32Table;
}
function crc32(bytes: Buffer) {
  let crc = 0xFFFFFFFF;
  if (crc32Table === undefined) {
    crc32Table = calcTable();
  }
  for (let i = 0; i < bytes.length; ++i) {
    crc = crc32Table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

export function crc32str(src: string) {
  return crc32(Buffer.from(src, 'utf-8'));
}

export function crc32num(input: Buffer) {
  return crc32(input);
}
