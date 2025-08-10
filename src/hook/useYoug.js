import {useEffect, useState, useRef, useMemo, use} from 'react';

import {
    getVocabularyByIndex
} from './useVocabulary'

import {
    useSearchParams
} from "react-router-dom"

import {
    shuffleArray
} from '../tools'

import {
    CreateWordHistory,
    CreateLesson
} from "../storage/cache"

import {post} from '../api'

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

function GetWordList(r) {
    let defaultIndex = 0
    const list = shuffleArray(
        getVocabularyByIndex(r)
    )

    const nextWord = () => {
        const max = list.length - 1
        if (defaultIndex >= max) {
            defaultIndex = max
        }
        else {
            defaultIndex++
        }
        return list[defaultIndex]
    }

    const preWord = () => {
        if (defaultIndex > 0) {
            defaultIndex--
        }
        return list[defaultIndex]
    }

    const setWord = word => {
        const index = list.findIndex(v => v === word)
        if (index === -1) throw "word error"
        defaultIndex = index
    }

    const getWord = () => list[defaultIndex]

    return {
        list,
        getWord,
        preWord,
        nextWord,
        setWord
    }
}

export function useWordExecute() {
    const [searchParams] = useSearchParams()
    // 0 loading | -1 pause | 1 done
    const [loading, setLoading] = useState(0)
    const [word, setWord] = useState(null)
    const [wordList, setList] = useState([])
    
    const widgetRef = useRef(null)

    const pageR = searchParams.get('r')

    useEffect(() => {
        const init = async () => {
            if (!widgetRef.current) {
                const widget = await loadWidget()
                setLoading(1)
                widget.on('onFetchDone', (event) => {
                    setWord(event.query)
                })
                
                widget.on('onPlayerStateChange', (event) => {
                    const state = {
                        1: 1,
                        2: -1
                    }
                    setLoading(state[event.state] || 0)
                })
                widgetRef.current = {
                    widget
                }
            }
            
            const {
                list,
                getWord,
                preWord,
                nextWord
            } = GetWordList(pageR.split('_'))

            setList(list)

            let _lesson = CreateLesson(pageR)
            
            const getWords = (word, language = "english") => {
                widgetRef.current.widget.fetch(word, language)
            }

            let _word;
            widgetRef.current.act = {
                go: () => {
                    console.log(131312)
                    const word = getWord()
                    console.log(word, ' go')
                    _word = CreateWordHistory(word)
                    getWords(word)
                },
                play: () => {
                    console.log(widgetRef)
                    widgetRef.current.widget.play()
                },
                pause: widgetRef.current.widget.pause,
                replay: widgetRef.current.widget.replay,
                next: () => {
                    widgetRef.current.widget.next()
                    _word.passOne()
                },
                prev: widgetRef.current.widget.prev,
                getWords: word => {
                    setWord(word)
                    getWords(word)
                    _word = CreateWordHistory(word)
                },
                previousWord: () => {
                    getWords(preWord())
                },
                nextWord: (state) => {
                    _word.done(state)
                    _lesson.add(_word.show())
                    getWords(nextWord())
                    _word = CreateWordHistory(getWord())
                },
                done() {
                    post('/api/add', _lesson.show())
                }
            }
        }
        init()
    }, [pageR])

    return {
        loading,
        word,
        wordList,
        widgetRef
    }
}