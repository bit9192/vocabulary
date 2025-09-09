import VOCABULARY_LIST from '../words/vocabulary.json'

import {
    GetInit,
    WordsList
} from '../api/api'

import {
    useReq
} from './tools'
import {
    getUrlParams
} from '../tools'
import { useCallback, useState, useRef, useEffect } from 'react'

export {
    VOCABULARY_LIST
}

export function useWordsList() {
    const {refresh} = GetInit()
    return useReq({
        call: refresh,
        type: [],
        initReq: true
    })
}

export function getVocabularyByIndex(arg) {
    const list = []
    // console.log(arg)
    arg.forEach(v => {
        list.push(...VOCABULARY_LIST[v])
    })
    return list
}

export function getRandomIndex(start) {
    let r = start - 1
    if (r < 0) return [start]
    return [start, Math.floor( Math.random() * 1000000 ) % (start)]
    // if (r == 0) return [start, start - 1]
    // const rand = [start, start - 1, Math.floor( Math.random() * 1000000 ) % (start - 1)]
    // return rand
}

const INIT_WORD_FUN = {
    getWord() {
        return null
    },
    preWord() {},
    nextWord() {},
    setWord() {},
}
export function useVocabularyList() {
    const [wordsList, setWords] = useState([])
    const [word, setWord] = useState(null)
    const ref = useRef(INIT_WORD_FUN)
    
    const InitWords = useCallback(async (_lessons, _total) => {
        setWords(false)
        const {
            getWord,
            preWord,
            nextWord,
            setWord: setWordList,
            list
        } = await WordsList(_lessons, _total)
        setWords(list)
        setWord(getWord())
        // setWordList()

        ref.current.getWord = getWord
        ref.current.preWord = () => {
            preWord()
            setWord(getWord())
        }

        ref.current.nextWord = () => {
            nextWord()
            setWord(getWord())
        }

        ref.current.setWord = (word) => {
            setWordList(word)
            setWord(getWord())
        }
    }, [])

    return {
        wordsList,
        word,
        InitWords,
        GetWord: ref.current.getWord,
        PreWord: ref.current.preWord,
        NextWord: ref.current.nextWord,
        SetWord: ref.current.setWord,
    }
}

export function useVocabularyConsole() {
    const {
        wordsList,
        word,
        InitWords,
        // GetWord,
        PreWord,
        NextWord,
        SetWord,
    } = useVocabularyList()

    useEffect(() => {
        let {r, n} = getUrlParams()
        let _lessons = r ? r.split('_') : []
        let _total = n || 0
        InitWords(_lessons, _total)
    }, [InitWords])

    useEffect(() => {
        const clickRef = {
            69: () => PreWord(), // E
            82: () => {
                NextWord()
            }, // R
        }
        function keydown(e) {
            if (clickRef[e.keyCode]) clickRef[e.keyCode]()
        }
        document.addEventListener('keydown', keydown, false);
        return () => {
            document.removeEventListener('keydown', keydown)
        }
    }, [PreWord, NextWord])
    return {
        wordsList,
        word,
        PreWord,
        NextWord,
        SetWord
    }
}