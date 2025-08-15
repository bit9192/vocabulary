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
    let defaultIndex = 0
    let _list = [...words]
    _total = _total - _list.length
    if (_total > 0) {
        _list.push(...newWords.slice(0, _total))
    }

    let _wordRightTimes = {}

    const nextWord = (state) => {
        
        const max = _list.length - 1
        if (defaultIndex >= max) {
            defaultIndex = max
        }
        else {
            defaultIndex++
        }
        return _list[defaultIndex].word
    }

    const preWord = () => {
        if (defaultIndex > 0) {
            defaultIndex--
        }
        return _list[defaultIndex].word
    }

    const setWord = word => {
        const index = _list.findIndex(v => v.word === word)
        if (index === -1) throw "word error"
        defaultIndex = index
    }

    const getWord = () => _list[defaultIndex].word

    

    return {
        getWord,
        preWord,
        nextWord,
        setWord,
        list: _list,
    }
}


export function useWordExecute() {

    const [searchParams] = useSearchParams()
    // 0 loading | -1 pause | 1 done
    const [loading, setLoading] = useState(0)
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
                setWord: setWordByList
            } = await WordsList(pageR === "" ? [] : pageR.split('_'), pageN)
            setLoading(1)
            console.log(list)
            setList(list)
            // init list 
            let _lesson = CreateLesson(pageR === ""  ? "null-"+(new Date()*1) : pageR)
            
            let _loading = false
            widgetRef.current.widget.on('onFetchDone', (event) => {
                let _word_ = event.query
                _lesson.passOne(_word_)
                setWordByList(_word_)
                setWord(_word_)
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
                    _lesson.done(state)
                    getWords(nextWord(state))
                },
                done() {
                    setLoading(0)
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
        widgetRef
    }
}