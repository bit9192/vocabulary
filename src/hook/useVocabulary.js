import VOCABULARY_LIST from '../words/vocabulary.json'

import {
    GetInit,
    AddLesson,
    GetRecent,
    GetAll
} from '../api/api'

import {
    useReq
} from './tools'

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