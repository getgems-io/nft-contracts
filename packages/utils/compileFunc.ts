//
// Unlike ton-compiler's compileFunc this function don't include stdlib.fc
//
import {readFile, writeFile} from "fs/promises";
import {compileFift, executeFunc} from "ton-compiler";
import {createTempFile} from "./createTempFile";
import {Cell} from "ton";

export async function compileFunc(source: string): Promise<{ fiftContent: string, cell: Cell  }> {
    let sourceFile = await createTempFile('.fc')
    let fiftFile = await createTempFile('.fif')
    try {
        await writeFile(sourceFile.name, source)
        executeFunc(['-PS', '-o', fiftFile.name, sourceFile.name])
        let fiftContent = await readFile(fiftFile.name, 'utf-8')
        fiftContent = fiftContent.slice(fiftContent.indexOf('\n') + 1)

        let codeCell = Cell.fromBoc(await compileFift(fiftContent))[0]

        return { fiftContent, cell: codeCell }
    } finally {
        await sourceFile.destroy()
        await fiftFile.destroy()
    }
}