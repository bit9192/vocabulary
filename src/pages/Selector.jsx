
import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import tokenizer from "sbd"

import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

import {
    ShallowEqual,
    IsMobile
} from '../hook/tools'


import testText from "./testText.json"

const isMobile = IsMobile()

function useSelect(text) {
    const [
        parts,
        flatWords,
        CheckIdxSelected,
        ExtractSelectedText
    ] = useMemo(() => {
        const sentences = tokenizer.sentences(text)
        let index = 0
        const flatWords = []

        const checkIdxSelected = (start, end, idx) => {
            if (start === null || end === null) return false
            if (end === -1) end = flatWords.length - 1
            return (start - idx) * (end - idx) <= 0
        }
        const extractSelectedText = (start, end) => {
            if (start === null || end === null) return []
            if (end === -1) end = flatWords.length - 1
            if (start > end) [start, end] = [end, start]
            return flatWords.slice(start, end + 1).map(v => v.word)
        }
        return [
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
            flatWords,
            checkIdxSelected,
            extractSelectedText
        ]
    },[text])

    
    return {
        parts,
        flatWords,
        CheckIdxSelected,
        ExtractSelectedText
    }
}

export function Select({text, page=0, startPage = null, endPage = null, startIdx, endIdx, onSelected = () => {}}) {
    const [[s,e], setSelectedIdex] = useState([null, null]) 
    const {
        parts,
        CheckIdxSelected,
        ExtractSelectedText
    } = useSelect(text)

    // console.log(" span render")

    useEffect(() => {
        let s,e;
        if (startPage === null && endPage === null) {
            setSelectedIdex([null, null])
        }
        else {
            if (startPage > page) {
                s = null
            }
            else if (startPage === page) {
                s = startIdx
            }
            else if (page > startPage) {
                s = 0
            }

            if (page > endPage) {
                e = null
            }
            else if (page === endPage) {
                e = endIdx
            }
            else if (endPage > page) {
                e = -1
            }
            setSelectedIdex([s, e])
        }
        onSelected(page, ExtractSelectedText(s,e))
    },[page, startPage, endPage, startIdx, endIdx, onSelected, ExtractSelectedText])
    
    return (
        parts.map((part,i) => (
            <ContextBlock
                key={i}
                data-id={part[part.length - 1].idx}
                data-page={page}
            >
                {
                    part.map(p =>
                        <SpanBlock
                            key={p.idx}
                            data-id={p.idx}
                            data-page={page}
                            selected={CheckIdxSelected(s,e, p.idx)}
                            // selected={CheckSelectedWord(p.word)}
                            
                        >{p.word}</SpanBlock>
                    )
                }
            </ContextBlock>
        ))
    )
}


const GetIdOnTounchElement = e => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    return el
}
const INIT = {
    startPage: null,
    endPage: null,
    startIdx: null,
    endIdx: null,
    target: null,
    moveEnd: false
}
function useSelectListener() {

    const ref = useRef(null)
    const [
        {
            startPage, endPage, startIdx, endIdx, target, moveEnd
        },
        setIdx
    ] = useState(INIT)

    const {
        GetPage,
        InitPage,
        SetData,
        RenderPage,
        SelectEnd
    } = useMemo(() => {
        let _start, _end, _target, _moveEnd;
        const InitPage  = () => {
            _start = {page: null, id: null}
            _end = {page: null, id: null}
            _target = null
            _moveEnd = false
        }
        InitPage()
        const RenderPage = () => {
            // console.log("RenderPage", _end, _target)
            setIdx(v => {
                const newV = GetPage()
                // console.log(v, newV, ShallowEqual(newV, v))
                if (ShallowEqual(newV, v)) {
                    return v
                }
                else {
                    return newV
                }
            })
        }
        const SetData = (el) => {
            const dataset = el.dataset
            if (!dataset.page) return
            let {page, id} = dataset
            page = page * 1
            id = id * 1
            if (!_start.page && _start.page !== 0) _start = {page, id}
            _end = {page, id}
            _target = el
            _moveEnd = false
        }

        const SelectEnd = () => {
            _moveEnd = true
            RenderPage()
        }
        const GetPage = () => {
            if (_start.page > _end.page) {
                return {
                    startPage: _end.page,
                    startIdx: _end.id,
                    endPage: _start.page,
                    endIdx: _start.id,
                    target: _target,
                    moveEnd: _moveEnd
                }
            } else {
                return {
                    startPage: _start.page,
                    startIdx: _start.id,
                    endPage: _end.page,
                    endIdx: _end.id,
                    target: _target,
                    moveEnd: _moveEnd
                }
            }
            
        }
        return {
            GetPage,
            InitPage,
            SetData,
            RenderPage,
            SelectEnd
        }
    }, [])
    useEffect(() => {
        let events = []
        if (isMobile) {
            // 3 actions :
            // click -> touch start then touch end without touch move
            // scroll -> touch start then touch move before longtocuh >= 200
            // select -> keep touch start until longtocuh >= 200 then move

            // -1 nothing , 0 selecting, > 0 waiting move to active scroll | -2 click while selected , need cancal
            let _longTouch = -1;
            events = [
                {
                    e: "touchstart",
                    call: el => {
                        const page = GetPage()
                        if (page.startPage !== null) {
                            _longTouch = -2;
                            return
                        }
                        // SetMoveEnd(0)
                        InitPage()

                        const element = GetIdOnTounchElement(el)
                        SetData(element)
                        _longTouch = setTimeout(() => {
                            RenderPage()
                            _longTouch = 0
                        }, 300)
                    }
                },
                {
                    e: "touchmove",
                    call: el => {
                        if (_longTouch < 0) {
                            _longTouch = -1
                            return
                        }
                        // _longTouch > 0 Equivalent longtocuh < 200
                        else if (_longTouch > 0) {
                            // cancel timeout then move function will never be active
                            clearTimeout(_longTouch)
                            _longTouch = -1
                            InitPage()
                        }
                        // _longTouch === 0 Equivalent longtocuh >= 200
                        else if (_longTouch === 0) {
                            el.preventDefault()
                            const element = GetIdOnTounchElement(el)
                            SetData(element)
                            RenderPage()
                        }
                    }
                },
                {
                    e: "touchend",
                    call: () => {
                        if (_longTouch >= 0) {
                            // = click
                            SelectEnd()
                            clearTimeout(_longTouch)
                            _longTouch = -1
                        }
                        else if (_longTouch === -2) {
                            InitPage()
                            SelectEnd()
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
                        const _startDataset = el.target.dataset
                        if (!_startDataset.page) {
                            // clear select
                            InitPage()
                            return
                        }
                        // SetMoveEnd(0)
                        SetData(el.target)
                        SelectEnd()
                        InitPage()
                    }
                },
                {
                    e: "mousedown",
                    call: el => {
                        const _startDataset = el.target.dataset
                        if (!_startDataset.page) {
                            // clear select
                            InitPage()
                            return
                        }
                        SetData(el.target)
                        // prevent click
                        _longTouch = setTimeout(() => {
                            _longTouch = 0
                        }, 300)
                    }
                },
                {
                    e: "mouseover",
                    call: el => {
                        if (_longTouch === -1) return
                        const _endDataset = el.target.dataset
                        if (_endDataset !== undefined) {
                            SetData(el.target)
                            RenderPage()
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
                            const _endDataset = el.target.dataset
                            if (_endDataset !== undefined) {
                                SetData(el.target)
                            }
                            SelectEnd()
                            InitPage()
                            _longTouch = -1
                        }
                        else if (_longTouch > 0) {
                            clearTimeout(_longTouch)
                            InitPage()
                            SelectEnd()
                            _longTouch = -1
                        }
                        
                    }
                },
                {
                    e: "mouseleave",
                    call: (el) => {
                        if (_longTouch !== -1) {
                            const _endDataset = el.target.dataset
                            if (_endDataset !== undefined) {
                                SetData(el.target)
                            }
                            SelectEnd()
                            InitPage()
                            _longTouch = -1
                        }
                    }
                }
            ]
        }

        events.forEach(event => {
            if (ref.current) {
                ref.current.addEventListener(
                    event.e,
                    event.call,
                    { passive: event.e === "touchmove" ? false : true }
                )
            }
        })

        return () => {
            // console.log(selectWrapRef.current, " selectWrapRef.current")
            events.forEach(event => {
                if (ref.current) {
                    ref.current.removeEventListener(
                        event.e,
                        event.call
                    )
                }
                
            })
        }
        
    }, [InitPage, SetData, SelectEnd, RenderPage, GetPage])
    return {
        ref,
        target,
        startPage,
        endPage,
        startIdx,
        endIdx,
        moveEnd,
        GetPage,
        InitPage,
    }
}


export function useSelectorListener() {
    const {
        ref,
        target,
        startPage,
        endPage,
        startIdx,
        endIdx,
        moveEnd
    } = useSelectListener()

    const [text, onMoveEnd] = useState("")
    // render flow order : 
    // startPage change -> parent render[page change] -> span render[page change] -> onSelected -> span render[page]
    const {onSelected} = useMemo(() => {
        let _texts = {}
        const onSelected = (page, text) => {
            if (text.length > 0) {
                _texts[page] = text
            }
            else {
                delete _texts[page]
            }
            const t = Texts()
            onMoveEnd(t)
        }
        const Texts = () => Object.values(_texts).flat().join(" ")
        return {
            onSelected,
            Texts,
            InitTexts: () => _texts = {}
        }
    }, [])

    // console.log(text, " parent render")
    
    return {
        ref,
        startPage,
        endPage,
        startIdx,
        endIdx,
        endTarget: target,
        text,
        moveEnd,
        onSelected
    }
}

export function EelectorListener({View = () => null, onMoveEnd = () => {}, ...porp}) {
    const {
        ref,
        startPage,
        endPage,
        startIdx,
        endIdx,
        moveEnd,
        onSelected,
        endTarget,
        text,
    } = useSelectorListener()
    onMoveEnd(
        endTarget,
        text,
        moveEnd
    )
    return (
        <div
            {...porp}
            ref={ref}
        >
            {
                <View
                    startPage={startPage}
                    endPage={endPage}
                    startIdx={startIdx}
                    endIdx={endIdx}
                    onSelected={onSelected}
                />
            }
        </div>
    )
    
}

// console.log(testText)
export default function Index() {
    const onMoveEnd = useCallback((el, text) => {
        console.log(el, text)
    }, [])
    return <div>
        <EelectorListener
            onMoveEnd={onMoveEnd}
            View={({startPage, endPage, startIdx, endIdx, onSelected}) => {
                return (
                    testText.map((v,i) => (
                        <div key={i}>
                            <Select
                                page={i}
                                startPage={startPage}
                                endPage={endPage}
                                startIdx={startIdx}
                                endIdx={endIdx}
                                text={v}
                                onSelected={onSelected}
                            />
                            <Divider />
                        </div>
                    ))
                )
            }}
        />
    </div>
}


const ContextBlock = styled('div')`
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    user-select: none;
    -webkit-user-select: none;
    font-size: 22px;
    white-space: normal;
    padding-bottom: 22px;
    & div {
        padding: 4px 14px 4px 0px;
        user-select: none;
        -webkit-user-select: none;
        /* margin-right: 6px; */

    }
`

function SpanBlock({children, style = {}, selected = false, ...prop}) {
    return <div
        {...prop}
        style={{
            background: selected ? "#f8f343": "transparent",
            ...style
        }}
    >
        {children}
    </div>
}
