import { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import styled from "styled-components"
import { styled } from '@mui/material/styles';

import tokenizer from "sbd"

import {IsMobile} from "../hook/tools"
// import "../api/news"
import {PopoverCard, TranslatorCard} from "./Translater"


const GetIdOnTounch = e => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    return el.dataset.id
}

const MoveContraller = ({
    onChange = () => {},
    onMoveEnded = () => {}
} = {}) => {
    let _start, _end;
    const Init = () => {
        _start = null
        _end = null
    }
    Init()

    const SetId = id => {
        if (!id && id !== 0) return
        if (_start === null) _start = id
        _end = id
    }

    const EimtChange = () => {
        if (_end === null) return
        onChange(_start, _end)
    }

    const EimtMoveEnded = () => {
        onMoveEnded(_start, _end)
    }
    return {
        SetId,
        EimtMoveEnded,
        Init,
        EimtChange
    }
}

function useSelect(title, text) {
    const selectWrapRef = useRef(null)
    // [start, end, if move ended]
    const [selected, setSelected] = useState([null, null, 1])
    const [titleParts, parts, flatWords] = useMemo(() => {
        const titleParts = tokenizer.sentences(title)
        const sentences = tokenizer.sentences(text)
        let index = 0
        const flatWords = []
        return [
            titleParts.map(text => {
                const parts = (text).split(" ")
                return parts.map(v => {
                    const w = {
                        word: v,
                        idx: index++
                    }
                    flatWords.push(w)
                    return w
                })
            }),
            sentences.map(text => {
                const parts = (text).split(" ")
                return parts.map(v => {
                    const w = {
                        word: v,
                        idx: index++
                    }
                    flatWords.push(w)
                    return w
                })
            }),
            flatWords
        ]
        
    },[title, text])

    const {
        SetId,
        EimtMoveEnded,
        Init,
        EimtChange
    } = useMemo(() => {
        return MoveContraller({
            onChange(s,e) {
                // console.log(s,e, " onChange")
                setSelected([s,e,0])
            },
            onMoveEnded(s,e) {
                if (s === null) {
                    // setSelected([])
                    setSelected([null, null, 1])
                }
                else {
                    setSelected(v => {
                        return [s,e, v[2] + 1]
                    })
                }
            }
        })
    }, [title, text])


    const value = useMemo(() => {
        let [s,e] = selected
        if (s === null) return []
        if (s*1 > e*1) [s,e] = [e,s];
        return flatWords.slice(s,e*1 + 1).map(v => v.word)
    }, [...selected, title, text])

    const CheckSelectedWord = word => {
        if (value.length === 0) return false
        return value.includes(word)
    }

    const CheckSelected = id => {
        const [s, e] = selected
        if (s === null) return false
        return (id - s) * (id - e) <= 0
    }

    
    useEffect(() => {
        let events = []
        if (IsMobile()) {
            // 3 actions :
            // click -> touch start then touch end without touch move
            // scroll -> touch start then touch move before longtocuh >= 200
            // select -> keep touch start until longtocuh >= 200 then move

            // -1 nothing , 0 selecting, > 0 waiting move to active scroll
            let _longTouch = -1;
            events = [
                // {
                //     e: "dblclick",
                //     call: el => {
                //         Init()
                //         EimtMoveEnded()
                //     }
                // },
                {
                    e: "touchstart",
                    call: el => {
                        const _start = GetIdOnTounch(el)
                        SetId(_start)
                        _longTouch = setTimeout(() => {
                            EimtChange()
                            _longTouch = 0
                        }, 280)
                    }
                },
                {
                    e: "touchmove",
                    call: el => {
                        if (_longTouch === -1) return
                        // _longTouch > 0 Equivalent longtocuh < 200
                        else if (_longTouch > 0) {
                            // cancel timeout then move function will never be active
                            clearTimeout(_longTouch)
                            _longTouch = -1
                            Init()
                        }
                        // _longTouch === 0 Equivalent longtocuh >= 200
                        else if (_longTouch === 0) {
                            el.preventDefault()
                            const _start = GetIdOnTounch(el)
                            SetId(_start)
                            EimtChange()
                        }
                    }
                },
                {
                    e: "touchend",
                    call: () => {
                       if (_longTouch >= 0) {
                            if (_longTouch > 0) {
                                EimtChange()
                                // Init()
                                // EimtMoveEnded()
                            }
                            // else {
                            //     EimtMoveEnded()
                            //     Init()
                            // }
                            EimtMoveEnded()
                            Init()
                            clearTimeout(_longTouch)
                            _longTouch = -1
                        }
                    }
                }
            ]
        }
        else {
            // 0 selecting , 2 double click
            let _longTouch = -1;
            events = [
                {
                    e: "dblclick",
                    call: el => {
                        const _start = el.target.dataset.id
                        SetId(_start)
                        // EimtChange()
                        EimtMoveEnded()
                        Init()
                    }
                },
                {
                    e: "mousedown",
                    call: el => {
                        // console.log("mousedown")
                        // return
                        const _start = el.target.dataset.id
                        if (!_start) {
                            Init()
                            EimtMoveEnded()
                            return
                        }
                        SetId(_start)
                        _longTouch = setTimeout(() => {
                            EimtChange()
                            _longTouch = 0
                        }, 300)
                    }
                },
                {
                    e: "mouseover",
                    call: el => {
                        if (_longTouch === -1) return
                        const _e = el.target.dataset.id
                        if (_e !== undefined) {
                            SetId(_e)
                            EimtChange()
                            if (_longTouch > 0) {
                                clearTimeout(_longTouch)
                                _longTouch = 0
                            }
                        }
                    }
                },
                {
                    e: "mouseup",
                    call: (el) => {
                        if (_longTouch === 0) {
                            const _e = el.target.dataset.id
                            if (_e !== undefined) {
                                SetId(_e)
                            }
                            EimtMoveEnded()
                            Init()
                            _longTouch = -1
                        }
                        else if (_longTouch > 0) {
                            clearTimeout(_longTouch)
                            Init()
                            EimtMoveEnded()
                            _longTouch = -1
                        }
                        
                    }
                },
                {
                    e: "mouseleave",
                    call: (el) => {
                        if (_longTouch !== -1) {
                            const _e = el.target.dataset.id
                            if (_e !== undefined) {
                                SetId(_e)
                            }
                            EimtMoveEnded()
                            Init()
                            console.log(_longTouch, " mouseleave")
                            _longTouch = -1
                        }
                        else if (_longTouch > 0) {
                            clearTimeout(_longTouch)
                            Init()
                            _longTouch = -1
                        }
                    }
                }
            ]
        }

        events.forEach(event => {
            selectWrapRef.current.addEventListener(
                event.e,
                event.call,
                { passive: event.e === "touchmove" ? false : true }
            )
        })

        return () => {
            // console.log(selectWrapRef.current, " selectWrapRef.current")
            events.forEach(event => {
                if (selectWrapRef.current) {
                    selectWrapRef.current.removeEventListener(
                        event.e,
                        event.call
                    )
                }
                
            })
        }
        
    }, [SetId, EimtMoveEnded, Init, EimtChange])

    const ClearnSelect = () => {
        setSelected([null, null, false])
    }
    
    return {
        titleParts,
        parts,
        selectWrapRef,
        CheckSelected,
        CheckSelectedWord,
        selected,
        value,
        ClearnSelect
    }
}

const isM = IsMobile()

function SelectWrap({title, content, onChange = () => {}, ...prop}) {
    const {
        titleParts,
        parts,
        selectWrapRef,
        // CheckSelected,
        CheckSelectedWord,
        value,
        selected
    } = useSelect(title, content)
    // console.log(value, selected[2] , " selected[2] ")
    useEffect(() => {
        // console.log(value, selected[2] , " useEffect selected[2] ")
        onChange({
            value,
            moveEnded: selected[2]
        })
    }, [value.join(""), selected[2], onChange])
    // console.log(value, " value")
    return (
        <div
            ref={selectWrapRef}
            {...prop}
        >
            {
                titleParts.map((part,i) => (
                    <ContextBlock key={i} data-id={isM? null :part[part.length - 1].idx}>
                        {
                            part.map(p =>
                                <SpanBlock
                                    key={p.idx}
                                    dataId={p.idx}
                                    selected={CheckSelectedWord(p.word)}
                                    style={{
                                        fontSize: "34px"
                                    }}
                                >{p.word}</SpanBlock>
                            )
                        }
                    </ContextBlock>
                ))
            }
            {
                parts.map((part,i) => (
                    <ContextBlock key={i} data-id={isM? null :part[part.length - 1].idx}>
                        {
                            part.map(p =>
                                <SpanBlock
                                    key={p.idx}
                                    dataId={p.idx}
                                    // selected={CheckSelected(p.idx)}
                                    selected={CheckSelectedWord(p.word)}
                                    
                                >{p.word}</SpanBlock>
                            )
                        }
                    </ContextBlock>
                ))
            }
        </div>
    );
}

function SpanBlock({children, style = {},dataId, selected = false, ...prop}) {
    return <div
        {...prop}
        data-id={dataId}
        style={{
            background: selected ? "#f8f343": "transparent",
            ...style
        }}
    >
        {children}
    </div>
}


export function NewsContent({title, content}) {
    const [contentOfTranslate, setContentOfTranslate] = useState(null)
    const [open, setOpen] = useState(false)
    const onChange = useCallback((e) => {
        if (e.value.length > 0) {
            setContentOfTranslate(
                e.value.join(" ")
            )
            setOpen(e.moveEnded > 0)

            // if (e.moveEnded > 0) {
            //     requestAnimationFrame(() => setOpen(true));
            // }
            // else {
            //     setOpen(false)
            // }
            
        }
        else {
            setOpen(false)
        }
    }, [])
    return (
        <NewShell>
            <PopoverCard
                value={open}
                onClose={e => {
                    setOpen(false)
                }}
            >
                {/* {
                    (!open && contentOfTranslate!== null) ? null: <TranslatorCard text={contentOfTranslate} />
                } */}
                <TranslatorCard text={contentOfTranslate} />
            </PopoverCard>
            <SelectWrap
                title={title}
                content={content}
                style={{fontSize: '22px', background: "#fffef6"}}
                onChange={onChange}
            />
        </NewShell>
    )
}


export default function Index() {
    return <div>
        sd
    </div>
}

const ContextBlock = styled('div')`
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    user-select: none;
    -webkit-user-select: none;
    /* font-size: 22px; */
    white-space: normal;
    padding-bottom: 22px;
    & div {
        padding: 2px 12px 2px 0px;
        user-select: none;
        -webkit-user-select: none;
        /* margin-right: 6px; */

    }
`

const NewShell = styled('div')`
    padding: 14px;
    max-width: 1080px;
    margin: auto;

`