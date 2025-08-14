import { useState, createContext, useContext, useEffect } from 'react'

import {
    AddLesson,
    GetRecent,
    GetAll
} from '../api/api'

import VOCABULARY_LIST from '../words/vocabulary.json'

// import {
//     shuffleArray
// } from '../tools'

let _ALL_ = null
async function Init() {
    const wordList = await GetAll()
    console.log({wordList})
    const words = VOCABULARY_LIST.map(list => {
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
    _ALL_ = words
    return {
        wordAll: words
    }
}

// lessons = [12,34] , newNum = 20
export const GetAllCache = (lessons, newNum = 0) => {
    if (!_ALL_) return []
    let words = []
    let _newW = []
    _ALL_.forEach((w,i) => {
        if (lessons.includes(i)) {
            words.push(...w.map(v => v.word))
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

    console.log(_newW)
    words.push(
        ..._newW.slice(0, newNum).map(v => v.word)
    )
    return words
}



export const Context = createContext({
    list: []
})
export const useAllList = () => useContext(Context)


function useWordAll() {
    const [loading, setLoad] = useState(true)
    const [wAll, setAll] = useState([])
    useEffect(() => {
        setLoad(true)
        Init().then(v => {
            setLoad(false)
            setAll(v.wordAll)
        })
    }, [])
    return {
        loading,
        all: wAll
    }
}

function WordAllContext({children}) {
    const p = useWordAll()
    return (
        <Context.Provider
            value={p}
        >
            {children}
        </Context.Provider>
    )
}

export default WordAllContext