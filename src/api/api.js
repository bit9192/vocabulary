
import {get, post} from './index'
import VOCABULARY_LIST from '../words/vocabulary.json'

export function AddLesson(_lesson) {
    return post('/api/add', _lesson)
}


export function GetRecent(num) {
    return get('/api/recent?n='+num)
}

export function GetAll() {
    return get('/api/wordList')
}


// word list controller
let _INIT = null
async function Init() {
    const wordList = await GetAll()
    // console.log({wordList})
    return VOCABULARY_LIST.map(list => {
        return list.map(word => {
            if (!wordList[word]) {
                return {
                    word,
                    lastTimestamp: -1,
                    lastStatus: 0,
                    learnTimes: 0,
                    rightTimes: 0,
                    wrongTimes: 0
                }
            }
            return {
                word,
                ...wordList[word]
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