import {useEffect, useState, useRef} from 'react';
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

import {NewsContent} from "./News"

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
        SetPageOfUrl(visibleRange.endIndex*1)
    }, [visibleRange.endIndex])
    return (
        page === null ?
        <Animations /> :
        <div style={{position: 'relative'}}>
            <Virtuoso
                initialTopMostItemIndex={currentPage}
                style={{ height: '100vh' }}
                totalCount={pages}
                rangeChanged={setVisibleRange}
                itemContent={(page) => {
                    const content = all()[page]
                    return (
                        <div>
                            {
                                content.images.length > 0 ?
                                content.images.map((v,i) => <Imgs key={i} src={"data:image/png;base64,"+v}/>)
                                : null 
                            }
                            {
                                content.paragraphs.length > 0 ?
                                <NewsContent
                                    content={content.paragraphs.join(" ")}
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
    )
}

const Imgs = styled('img')`
    max-width: 100%;
    display: block;
`
