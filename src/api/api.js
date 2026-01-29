
import {get, post} from './index'
import VOCABULARY_LIST from '../words/vocabulary.json'
import { GetBays } from '../hook/tools'

export function AddLesson(_lesson) {
    return post('/add', _lesson)
}


export function GetRecent(num) {
    return get('/recent?n='+num)
}

export function GetAll() {
    return get('/wordList')
}

export function TranslateSentence({text} = {}) {
    return post('/translate', {text})
}

export function TranslateWord({text} = {}) {
    return get('/translate?n='+text)
}

// word list controller
let _INIT = null
async function Init() {
    const {
        hours
    } = GetBays()
    const wordList = await GetAll()
    // console.log({wordList})
    return VOCABULARY_LIST.map((list, lesson) => {
        return list.map(word => {
            if (!wordList[word]) {
                return {
                    word,
                    sicnceLastStudyHours: 0,
                    lastTimestamp: -1,
                    lastStatus: 0,
                    learnTimes: 0,
                    rightTimes: 0,
                    wrongTimes: 0,
                    lesson
                }
            }
            return {
                word,
                ...wordList[word],
                sicnceLastStudyHours: hours(wordList[word].lastTimestamp)
            }
        })
    })
}

export function GetInit() { 
    const refresh = async () => {
        _INIT = await Init()
        return _INIT
    }

    const all = () => _INIT

    const lessons = _lessons => {
        _lessons  = _lessons.map(v => v*1)
        if (!_INIT) return []

        let words = []
        let _newW = []
        _INIT.forEach((w,i) => {
            if (_lessons.includes(i)) {
                words.push(...w)
            }
            else {
                _newW.push(...w)
            }
        })
        _newW = _newW.sort((x, y) => {
            if (x.lastStatus !== y.lastStatus) {
                return x.lastStatus - y.lastStatus
            }
            if (x.wrongTimes !== y.wrongTimes) {
                return y.wrongTimes - x.wrongTimes
            }
            if (x.rightTimes !== y.rightTimes) {
                return x.rightTimes - y.rightTimes
            }
            
            // if (x.wrongTimes !== y.wrongTimes) {
            //     return y.wrongTimes - x.wrongTimes
            // }
            return x.learnTimes - y.learnTimes
        })
        return [words, _newW]
    }
    return {
        refresh,
        all,
        lessons
    }
}

export async function WordsList(_lessons, _total) {
    const {
        refresh,
        lessons
    } = GetInit()
    await refresh()

    const [words, newWords] = lessons(_lessons || [])
    let _list = [...words]
    _list.push(...newWords.slice(0, _total))

    if (_list.length === 0) throw new Error("not word")
    let _word = _list[0].word
    let _indexHistory = [_word]
    const _addHistory = word => {
        if (word === _indexHistory[_indexHistory.length - 1]) return
        _indexHistory.push(word)
    }
    
    const nextWord = () => {
        const index = _list.findIndex(v => v.word === _word)
        if (index === null) return _word
        else {
            if (index ===  _list.length - 1) return _word
            _word = _list[index+1].word
            _addHistory(_word)
            return _word
        }
    }

    const preWord = () => {
        // if (defaultIndex > 0) {
        //     defaultIndex--
        // }
        // return _list[defaultIndex].word
        if (_indexHistory.length <= 1) return _word
        _indexHistory = _indexHistory.slice(0, _indexHistory.length - 1)
        _word = _indexHistory[_indexHistory.length - 1]
        return _word
    }

    const setWord = word => {
        _addHistory(word)
        _word = word
    }

    const getWord = () => _word // _list[defaultIndex].word

    return {
        getWord,
        preWord,
        nextWord,
        setWord,
        list: _list,
    }
}