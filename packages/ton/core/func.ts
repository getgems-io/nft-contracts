import path from 'path'
import fs from 'fs'
import { compileFunc, compilerVersion, ErrorResult } from '@ton-community/func-js'

export class CodeCompileError extends Error {
  constructor(message: string, public res: ErrorResult) {
    super(message)
  }
}
export async function compileFuncCode(funcAbsolutePath:string) {
  const cNftCollectionSourceCode = funcAbsolutePath

  const cfg = {
    targets: [path.basename(cNftCollectionSourceCode)],
    sources: (src:string) => {
      const file = path.join((path.dirname(cNftCollectionSourceCode)), src)
      return fs.readFileSync(path.resolve(file), { encoding: 'utf-8' })
    },
  }

  const ver = await compilerVersion()
  const res = await compileFunc(cfg)

  if (res.status === 'error') {
    throw new CodeCompileError(res.message, res)
  } else {
    if (res.warnings) {
      throw new CodeCompileError(`warnings ${res.warnings}`, {
        status: 'error',
        message: res.warnings,
        snapshot: res.snapshot,
      })
    }
    return {
      ...res,
      compilerVersion: ver.funcVersion,
    }
  }
}
