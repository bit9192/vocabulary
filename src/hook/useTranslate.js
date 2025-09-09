import { useState, useCallback, useRef} from "react";

import {
    TranslatorReq,
    TranslateLocal
} from "../api/translater"

import {Search} from "../api/news"


export function useTranslate() {
    const [results, setResults] = useState(null)
    const [type, setType] = useState(null)

    const trans = useCallback(async (text) => {
        setResults(null)
        const r = await TranslatorReq(text)
        setResults(r.content)
        setType(r.type)
    },[])

    const speak = () => {
        if (results) {
            const utter = new SpeechSynthesisUtterance(results);
            utter.lang = "en-US"; // 英文
            speechSynthesis.speak(results);
        }
    }

    return {
        type,
        results,
        trans,
        speak
    }
}

function CreatWord(currentPage, pages) {
    return {
        currentPage,
        pages,
        pageSize: 10,
        readed: null,
        list: []
    }
}
function SearchText() {

    let _text=null;
    let _wordslist = []

    async function AddSearch(word) {
        if (!_wordslist[word]) {
            _wordslist[word] = CreatWord(0, 1)
        }
        const _w = _wordslist[word]
        if (_w.currentPage >= _w.pages) return
        const {
            results: res,
            pages,
            currentPage
        } = await Search(word, _w.currentPage+1)
        _w.currentPage = currentPage
        _w.pages = pages
        let index = _w.list.length
        _w.list.push(
            ...res.map(v => {
                return {
                    title: v.webTitle,
                    text: v.fields.bodyText,
                    readCount: 0,
                    id: index++
                }
            })
        )
    }

    

    async function GetText(word) {
        if (!_wordslist[word]) {
            await AddSearch(word)
        }

        let _w = _wordslist[word]
        let list = _w.list.sort((x,y) => {
            if (x.readCount !== y.readCount) {
                return x.readCount - y.readCount
            }
            if (x.id !== y.id) {
                return x.id - y.id
            }
        })
        if ( list[0].readCount > 0 ) {
            if (_w.currentPage >= _w.pages) _text = list[0]
            else {
                await AddSearch(word)
                _text = _wordslist[word].list[list.length]
            }
        } else _text = list[0]
        return _text
    }

    function ReadedWord(_text_ = _text) {
        _text.readCount += 1
    }

    function Next(word) {
        ReadedWord()
        let _w = _wordslist[word]
        _w.list.sort((x,y) => {
            if (x.readCount !== y.readCount) {
                return x.readCount - y.readCount
            }
            if (x.id !== y.id) {
                return x.id - y.id
            }
        })
        _text = _w.list[0]
        return _text
    }

    return {
        GetText,
        ReadedWord,
        Next
    }

}

const {
    GetText,
    ReadedWord,

} = SearchText()
export function useNewsContent() {
    const [results, setResults] = useState(null)

    const search = useCallback(async (word) => {
        setResults(null)
        const r = await GetText(word)
        setResults(r)
        return {
            ReadedWord: () => {
                ReadedWord(r)
            }
        }
    },[])

    return {
        search,
        results
    }
}