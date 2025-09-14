import {Translate} from "./api"
let _local = {}
export async function TranslatorReq(text) {
    if (!_local[text]) {
        const wor = await Translate({text})
        console.log(wor)
        if (wor.trans) {
          _local[text] = {
            type: 1, // sentence
            content: wor.trans
          }
        }
        else {
          _local[text] = {
            type: 0, // sentence
            content: wor.detail,
            roots: wor.roots
          }
        }
    }
    return _local[text]
}

