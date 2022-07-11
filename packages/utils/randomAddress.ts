import {Address} from "ton";
import {pseudoRandomBytes} from "crypto";

export function randomAddress() {
    return new Address(0, pseudoRandomBytes(256/8))
}