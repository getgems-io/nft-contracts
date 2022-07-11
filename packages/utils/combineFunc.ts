import {readFileSync} from "fs";
import {resolve} from "path";

export function combineFunc(root: string, paths: string[]) {
    let res = ''

    for (let path of paths) {
        res += readFileSync(resolve(root, path), 'utf-8')
        res += '\n'
    }

    return res
}