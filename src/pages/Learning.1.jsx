import styled from 'styled-components'
import {
    TextS,
    TextM,
    TextL,
    TextXL,
    TextMax,
    Container,
    FlexDiv,
    WhiteSpace
} from '../../components'

import {
    shuffleArray
} from '../tools'

import {
    useYoug
} from '../hook/useYoug'

import {
    getVocabularyByIndex
} from '../hook/useVocabulary'

import {
    useSearchParams
} from "react-router-dom";

import { useMemo, useState, useEffect, useRef } from 'react';

function WordsLearning() {
    const [searchParams] = useSearchParams()

    const {
        word,
        loading,
        getWords,
        isPause,
        play,
        replay,
        next,
        prev,
        pause
    } = useYoug("widget-1")

    const [showWord, switchWord] = useState(false)

    const showOrHide = () => switchWord(v => !v)
    // useEffect(() => {
    //     setKeyDown(87,() => switchWord(v => !v))
    // },[])
    const {
        wordsList,
        defaultWord
    } = useMemo(() => {
        // default index
        let defaultIndex = 0
        const list = shuffleArray(
            getVocabularyByIndex(
                searchParams.get('r').split('_')
            )
        )
        // const list = (
        //     getVocabularyByIndex(34,33,2)
        // )
        return {
            wordsList: list,
            defaultWord: list[defaultIndex]
        }
    }, [])

    const [wordIndex, setIndex] = useState(0)
    // next word
    const nextWordIndex = () => {
        if ( wordIndex + 1 >= wordsList.length ) return
        setIndex(wordIndex + 1)
    }
    const previousWordIndex = () => {
        if ( wordIndex <= 0 ) return
        setIndex(wordIndex - 1)
    }
    
    useEffect(() => {
        if (!loading)
            getWords(wordsList[wordIndex])
    }, [wordIndex])

    const clickRef = useRef()

    clickRef.current = {
        49: () => pause(), // 1
        50: () => play(), // 2
        51: () => replay(), // 3
        52: () => next(), // 4
        53: () => prev(), // 5
        
        69: () => previousWordIndex(),
        82: () => nextWordIndex(),
        87: () => showOrHide()
        // 192: randomWord // ~
    }

    useEffect(() => {
        function keydown(e) {
            // console.log(e.keyCode)
            if (clickRef.current[e.keyCode]) clickRef.current[e.keyCode]()
        }
        document.addEventListener('keydown', keydown, false);
        return () => {
            document.removeEventListener('keydown', keydown)
        }
    }, [])

    return (
        <Container>
            <WhiteSpace size='1.2' />
            <Curtain show={showWord}>
                <Widget id='widget-1'>
                    --
                </Widget>
            </Curtain>
            <WhiteSpace />
            <TextM>{wordsList.length || 0} - {wordsList.findIndex(v => v === word) + 1}</TextM>
            {
                !word ? 
                <WordsBlock style={{pointerEvents: !loading ? 'all' : 'none'}} onClick={() => getWords(wordsList[wordIndex])}>
                    <TextMax>{loading ? "loading":"GO!"}</TextMax>
                </WordsBlock>:
                <WordsBlock onClick={showOrHide}>
                    <TextMax>{showWord ? word : '--' }</TextMax>
                </WordsBlock>
            }
            <WhiteSpace />
            <div style={{opacity: loading ? 0.5 : 1}}>
                <FlexDiv>
                    <ControlButton onClick={prev}>
                        {'<'}
                    </ControlButton>
                    <ControlButton onClick={replay}>
                        replay
                    </ControlButton>
                    <ControlButton onClick={next}>
                        {'>'}
                    </ControlButton>
                </FlexDiv>
                <WhiteSpace />
                
                {/* <WhiteSpace /> */}
                <FlexDiv>
                    <ControlButton onClick={previousWordIndex}>
                        pre word
                    </ControlButton>
                    {/* <ControlButton onClick={showOrHide}>
                        {showWord ? 'hide' : 'show'}
                    </ControlButton> */}
                    <ControlButton onClick={play}>
                        {isPause ? 'play' : 'pause'}
                    </ControlButton>
                    <ControlButton onClick={nextWordIndex}>
                        next word 
                    </ControlButton>
                </FlexDiv>
            </div>
            <WhiteSpace size='14' />

            <FlexDiv style={{flexWrap: 'wrap', display: showWord ? 'flex' : 'none'}}>
                {
                    wordsList.map(v =>
                        <WordBlock
                            key={v}
                            onClick={()=> getWords(v)}
                            active={v === word}
                        >{v}</WordBlock>
                    )
                }
            </FlexDiv>
            <WhiteSpace size='3' />
        </Container>
    )

}

export default WordsLearning


const WordsBlock = styled('div')`
    padding: 2rem;
    border: 1px solid gray;
    width: min-content;
    min-width: 200px;
    margin: 1rem auto;
    box-sizing: border-box;
`

const ControlButton = styled('div')`
    border: 1px solid gray;
    padding: .6rem 0;
    /* margin: 0 .4rem; */
    min-width: 60px;
    width: 100%;
    box-sizing: border-box;
`

const Widget = styled('div')`
    width: 640px;
    max-width: 100%;
    height: 40vh;
    margin: 0 auto;
    /* border: 1px solid #ccc; */
    /* border-radius: 4px; */
    overflow: hidden;
    position: relative;
`;

const Curtain = styled('div')`
    position: relative;
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: white;
        pointer-events: none;
        opacity: ${p => p.show ? 0:1};
    }
`;

const WordBlock = styled('div')`
    min-width: 50px;
    padding: .4rem 0;
    text-align: center;

    cursor: pointer;
    border: 1px solid #ccc;
    font-size: 15px;
    font-weight: bold;
    width: 32%;
    background: ${p => p.active ? "none" : "white"};
`