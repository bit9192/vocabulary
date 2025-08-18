import {useEffect, useState, useRef} from 'react';

import {
    getVocabularyByIndex
} from './useVocabulary'

import {
    useSearchParams
} from "react-router-dom"

import {
    shuffleArray,
    getUrlParams
} from '../tools'

import {
    CreateWordHistory,
    CreateLesson
} from "../storage/cache"

import {
    GetInit,
    AddLesson,
    GetRecent,
    GetAll
} from '../api/api'

import {
    GetAllCache
} from '../context/WordList'

async function loadWidget(id = "widget-1") {
    const _on = {
        onFetchDone: () => {},
        onPlayerStateChange: () => {},
    }
    const on = (funcName, call) => {
        _on[funcName] = call
    }
    return new Promise(r => {
        var tag = document.createElement('script');
        tag.src = "https://youglish.com/public/emb/widget.js";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        // 3. This function creates a widget after the API code downloads.
        window.onYouglishAPIReady = () => {
            let widget = new window.YG.Widget(id, {
                width: 640,
                components: 9, //search box & caption 
                events: {
                    onFetchDone: (event) => {
                        _on.onFetchDone(event)
                    },
                    onPlayerStateChange: event => {
                        _on.onPlayerStateChange(event)
                    },
                }          
            });
            widget.on = on
            r(widget)
            // window.YG.setParnterKey("a88503f7-3cd1-4265-bca9-8ebcdc4acada")
        }
    })
}

// function GetWordList(r = [], n) {
//     let defaultIndex = 0
//     const list = shuffleArray(
//         GetAllCache(r.map(v => v*1), n)
//     )

//     const nextWord = () => {
//         const max = list.length - 1
//         if (defaultIndex >= max) {
//             defaultIndex = max
//         }
//         else {
//             defaultIndex++
//         }
//         return list[defaultIndex]
//     }

//     const preWord = () => {
//         if (defaultIndex > 0) {
//             defaultIndex--
//         }
//         return list[defaultIndex]
//     }

//     const setWord = word => {
//         const index = list.findIndex(v => v === word)
//         if (index === -1) throw "word error"
//         defaultIndex = index
//     }

//     const getWord = () => list[defaultIndex]

//     return {
//         list,
//         getWord,
//         preWord,
//         nextWord,
//         setWord
//     }
// }


async function WordsList(_lessons, _total) {
    const {
        refresh,
        lessons
    } = GetInit()
    await refresh()

    const [words, newWords] = lessons(_lessons || [])
    let _list = [...words]
    _list.push(...newWords.slice(0, _total))

    let _word = _list[0].word
    let _wordRightTimes = {}
    _list.forEach(v => {
        _wordRightTimes[v.word] = {
            rights: 0,
            learning: 0
        }
    })

    let _indexHistory = []
    const _addHistory = word => {
        if (word === _indexHistory[_indexHistory.length - 1]) return
        _indexHistory.push(word)
    }
    const _setWordRight = (word, state) => {
        _wordRightTimes[word].learning += 1
        if (state === 1) _wordRightTimes[word].rights += 1
        else _wordRightTimes[word].rights = 0
    }
    const _nextWord = (minRightTimes, exceptWord) => {
        const words = Object.keys(_wordRightTimes).filter(w => _wordRightTimes[w].rights < minRightTimes && exceptWord !== w)
        if (words.length === 0) {
            if (_wordRightTimes[exceptWord] >= minRightTimes ) return null
            return exceptWord
        }
        return shuffleArray(
            shuffleArray(words)
        )[0]
    }

    const _minRight = 2
    const nextWord = state => {
        // const max = _list.length - 1
        // if (defaultIndex >= max) {
        //     defaultIndex = max
        // }
        // else {
        //     defaultIndex++
        // }
        // return _list[defaultIndex].word
        _setWordRight(_word, state)
        const newWord = _nextWord(_minRight, _word)
        if (!newWord) return _word
        _word = newWord
        _addHistory(_word)
        return _word
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
        // const index = _list.findIndex(v => v.word === word)
        // if (index === -1) throw "word error"
        // defaultIndex = index
        _addHistory(word)
        _word = word
    }

    const getWord = () => _word // _list[defaultIndex].word

    const doneWords = () => {
        // return Object.keys(_wordRightTimes).filter(w => _wordRightTimes[w].rights >= minRightTimes).length
        let _done = 0, _fails = 0, _learning = 0, _rights = 0;
        Object.keys(_wordRightTimes).forEach(w => {
            const {
                rights,
                learning
            } = _wordRightTimes[w]
            if (rights >= _minRight) {
                _done += 1
                if (learning <= _minRight) _rights += 1
            } else {
                _learning += 1
            }
            if (learning > rights) {
                _fails += 1
            }
            // if (r) _fails += 1
        })
        return [_done, _fails, _learning, _rights]
    }

    const checkWord = (word = _word, minRightTimes = _minRight, maxLearn = _minRight) => {
        const {
            rights,
            learning
        } = _wordRightTimes[word]
        const _done = rights >= minRightTimes
        return [_done, learning <= maxLearn && _done]
    }

    return {
        getWord,
        preWord,
        nextWord,
        setWord,
        doneWords,
        checkWord,
        list: _list,
    }
}


export function useWordExecute() {

    const [searchParams] = useSearchParams()
    // 0 loading | -1 pause | 1 done
    const [loading, setLoading] = useState(0)
    const [doneWords, setDoneWords] = useState([0,0,0,0])
    const [word, setWord] = useState(null)
    const [wordList, setList] = useState([])
    
    const widgetRef = useRef(null)
    const pageR = searchParams.get('r') || ""
    const pageN = searchParams.get('n')
    useEffect(() => {
        const init = async () => {
            setLoading(0)
            if (!widgetRef.current) {
                const widget = await loadWidget()
                widgetRef.current = {
                    widget
                }
            }

            const {
                list,
                getWord,
                preWord,
                nextWord,
                doneWords,
                checkWord,
                setWord: setWordByList
            } = await WordsList(pageR === "" ? [] : pageR.split('_'), pageN)
            setLoading(1)
            setList(list)
            // init list 
            let _lesson = CreateLesson(pageR === ""  ? "null-"+(new Date()*1) : pageR)
            
            let _loading = false
            widgetRef.current.widget.on('onFetchDone', (event) => {
                let _word_ = event.query
                _lesson.passOne(_word_)
                setWordByList(_word_)
                setWord(_word_)
                setDoneWords(doneWords())
            })
            
            widgetRef.current.widget.on('onPlayerStateChange', (event) => {
                const state = {
                    1: 1,
                    2: -1
                }
                const load = state[event.state] || 0
                _loading = load === 0
                setLoading(load)
            })

            

            const getWords = (word, language = "english") => {
                widgetRef.current.widget.fetch(word, language)
            }

            widgetRef.current.act = {
                go: () => {
                    if (_loading) return
                    const word = getWord()
                    getWords(word)
                },
                play: () => {
                    widgetRef.current.widget.play()
                },
                pause: widgetRef.current.widget.pause,
                replay: widgetRef.current.widget.replay,
                next: () => {
                    if (_loading) return
                    widgetRef.current.widget.next()
                    _lesson.passOne()
                    
                },
                prev: widgetRef.current.widget.previous,
                getWords: word => {
                    if (_loading) return
                    getWords(word)
                },
                previousWord: () => {
                    if (_loading) return
                    getWords(preWord())
                },
                nextWord: (state) => {
                    if (_loading) return
                    const previousWord = getWord()
                    getWords(nextWord(state))
                    // It is considered correct if there are two consecutive correct attempts and the total number of attempts does not exceed two.
                    const [done, _state] = checkWord(previousWord)
                    if (done) {
                        _lesson.done(_state === false ? 0 : 1)
                    }
                },
                done() {
                    setLoading(0)
                    // console.log(_lesson.show())
                    AddLesson(_lesson.show()).then(e => {
                        setLoading(1)
                        console.log(e)
                    })
                }
            }
        }
        init()
    }, [pageR, pageN])

    return {
        loading,
        word,
        wordList,
        widgetRef,
        doneWords
    }
}