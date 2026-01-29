import {useEffect, useState, useRef, useCallback} from 'react';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { Virtuoso } from 'react-virtuoso'

import {
    useBooks
} from "../hook/useBooks"

import {
  Animations
} from "../components/mui"


import {
    SetPageOfUrl,
} from "../hook/tools"

import {
    Select,
    useSelectorListener
} from "./Selector"

import {
    PopoverTranslator
} from "./Translater"


export default function Index() {

    const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    })
    const {
        page,
        currentPage,
        pages,
        all
    } = useBooks()

    useEffect(() => {
        if(visibleRange.endIndex*1 > 0) {
            SetPageOfUrl(visibleRange.endIndex*1)
        }
    }, [visibleRange.endIndex])

    const {
        ref,
        startPage,
        endPage,
        startIdx,
        endIdx,
        onSelected,
        endTarget,
        text,
        moveEnd
    } = useSelectorListener()

    return (
        <>
            <div ref={ref}>
                {
                    page === null ?
                    <Animations /> :
                    <div style={{position: 'relative'}}>
                        <Virtuoso
                            defaultItemHeight={460}
                            initialTopMostItemIndex={currentPage}
                            style={{ height: '100vh' }}
                            totalCount={pages}
                            rangeChanged={setVisibleRange}
                            itemContent={(page) => {
                                const content = all()[page]
                                return (
                                    <div
                                        style={{
                                            padding: "12px",
                                            background: "rgb(255 254 248)"
                                        }}
                                    >
                                        {
                                            content.images.length > 0 ?
                                            content.images.map((v,i) => <Imgs key={i} src={"data:image/png;base64,"+v}/>)
                                            : null 
                                        }
                                        {
                                            content.paragraphs.length > 0 ?
                                            <Select
                                                page={page}
                                                startPage={startPage}
                                                endPage={endPage}
                                                startIdx={startIdx}
                                                endIdx={endIdx}
                                                text={content.paragraphs.join(" ")}
                                                onSelected={onSelected}
                                            />
                                            : null 
                                        }
                                        <div style={{marginBottom: "10px"}}> - {page} - </div>
                                        <Divider />
                                    </div>
                                )
                            }}
                        />
                    </div>
                }
            </div>
            <PopoverTranslator
                target={endTarget}
                text={text}
                moveEnd={moveEnd}
            />
        </>
        
    )
}

const Imgs = styled('img')`
    max-width: 100%;
    display: block;
`
