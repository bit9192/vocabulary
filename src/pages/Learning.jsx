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
} from '../components'

import {
    useWordExecute
} from '../hook/useYoug'

import {
    useAllList
} from '../context/WordList'


import { useMemo, useState, useEffect, useRef } from 'react';

function WordsLearning() {
    
   const {
        loading,
        word,
        wordList,
        widgetRef,
        doneWords
    } = useWordExecute()

    const [showWord, switchWord] = useState(false)
    const showOrHide = () => switchWord(v => !v)

    useEffect(() => {
        const clickRef = {
            49: () => widgetRef.current.act.pause(), // 1
            50: () => widgetRef.current.act.play(), // 2
            51: () => widgetRef.current.act.replay(), // 3
            52: () => widgetRef.current.act.next(), // 4
            53: () => widgetRef.current.act.prev(), // 5
            69: () => widgetRef.current.act.previousWord(), // E
            82: () => {
                switchWord(false)
                widgetRef.current.act.nextWord(1)
            }, // R
            84: () => {
                switchWord(false)
                widgetRef.current.act.nextWord(0)
            }, // T
            87: () => switchWord(v => !v), // W,
            81: () => widgetRef.current.act.done() // Q
        }

        function keydown(e) {
            // console.log(e.keyCode)
            if (clickRef[e.keyCode]) clickRef[e.keyCode]()
        }
        document.addEventListener('keydown', keydown, false);
        return () => {
            document.removeEventListener('keydown', keydown)
        }
    }, [])

    // console.log(
    //     widgetRef.current, ' word'
    // )
    return (
        <Container>
            <WhiteSpace size='1.2' />
            <Curtain show={showWord}>
                <Widget id='widget-1'>
                    --
                </Widget>
            </Curtain>
            <WhiteSpace />
            <TextM>{wordList.length || 0} - done {doneWords[0]} - fails {doneWords[1]}</TextM>
            {/* 0 loading | -1 pause | 1 done */}
            {
                !word ? 
                <WordsBlock
                    style={{pointerEvents: loading !== 0 ? 'all' : 'none'}}
                    onClick={() => {
                        widgetRef.current.act.go()
                    }}
                >
                    <TextMax>{loading === 0 ? "loading":"GO!"}</TextMax>
                </WordsBlock>:
                <WordsBlock onClick={showOrHide}>
                    <TextMax>{showWord ? word : '--' }</TextMax>
                </WordsBlock>
            }
            <WhiteSpace />
            <div style={{opacity: loading === 0 || word === null ? 0.5 : 1}}>
                <FlexDiv>
                    <ControlButton onClick={() => widgetRef.current.act.prev()}>
                        {'<'}
                    </ControlButton>
                    <ControlButton onClick={() => widgetRef.current.act.replay()}>
                        replay
                    </ControlButton>
                    <ControlButton onClick={() => {
                        if (loading === -1) {
                            widgetRef.current.act.play()
                        }
                        else if (loading === 1) {
                            widgetRef.current.act.pause()
                        }
                    }}>
                        {loading === -1 ? 'play' : 'pause'}
                    </ControlButton>
                    <ControlButton onClick={() => widgetRef.current.act.next()}>
                        {'>'}
                    </ControlButton>
                </FlexDiv>
                <WhiteSpace />
                
                {/* <WhiteSpace /> */}
                <FlexDiv>
                    <ControlButton onClick={() => widgetRef.current.act.previousWord()}>
                        pre word
                    </ControlButton>
                    {/* <ControlButton onClick={showOrHide}>
                        {showWord ? 'hide' : 'show'}
                    </ControlButton> */}
                    
                    <ControlButton onClick={() => widgetRef.current.act.nextWord(1)}>
                        next word 1
                    </ControlButton>
                    <ControlButton onClick={() => widgetRef.current.act.nextWord(0)}>
                        next word 0 
                    </ControlButton>
                    <ControlButton onClick={() => widgetRef.current.act.done(0)}>
                        Done
                    </ControlButton>
                </FlexDiv>
            </div>
            <WhiteSpace size='14' />

            <FlexDiv style={{flexWrap: 'wrap', display: showWord ? 'flex' : 'none'}}>
                {
                    wordList.map(v =>
                        <WordBlock
                            key={v.word}
                            onClick={()=> widgetRef.current.act.getWords(v.word)}
                            active={v.word === word}
                        >{v.word}</WordBlock>
                    )
                }
            </FlexDiv>
            <WhiteSpace size='3' />
        </Container>
    )

}

function WordsWrap() {
    const {loading} = useAllList()
    return loading ? <div>loading</div> : <WordsLearning />
}

export default WordsWrap


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
    background: ${p => p.active ? "#ccc" : "white"};
`