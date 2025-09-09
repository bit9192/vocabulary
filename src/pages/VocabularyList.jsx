import {
    // VOCABULARY_LIST,
    useWordsList,
    getRandomIndex
} from '../hook/useVocabulary'

import styled from 'styled-components'
import {
    TextM,
    TextL,
    Container,
    FlexDiv,
    WhiteSpace
} from '../components'

import {
    useNavigate
} from "react-router-dom"



    
function List() {
    const go = useNavigate()
    // console.log(go)
    const {
        // loading,
        res
    } = useWordsList()
    const list = {all:res}
    return (
        <Container>
            <TextL>Choose one group then the system will randomly combined anther group to give you a study plan.</TextL>
            <WhiteSpace />
            <FlexDiv flow='wrap' justify='start'>
                {
                    list.all.map((v,i) =>
                        <VocabularyBlock key={v[0].word} onClick={() => {
                            go('/learn?r='+getRandomIndex(i).join('_'))
                        }}>
                            <TextM>{i+1}. {v[0].word.slice(0,5)} ...</TextM>
                            <br />
                            <TextM style={{color: 'rgb(143 143 143)'}}>w: {v.length}</TextM>
                        </VocabularyBlock>
                    )
                }
                
            </FlexDiv>
        </Container>
    )
}

export default List

const VocabularyBlock = styled('div')`
    border: 1px solid gray;
    box-sizing: border-box;
    width: 25%;
    padding: 6px 4px;
    text-align: left;
`
