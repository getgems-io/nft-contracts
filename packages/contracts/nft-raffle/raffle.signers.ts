import { randomBytes } from 'crypto'
import { Address } from 'ton'

function getRandSigner (): Address {
    return new Address(0, randomBytes(32))
}

export { getRandSigner }
