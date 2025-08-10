import {
    // VOCABULARY_LIST,
    useList,
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

//   
function List() {
    const go = useNavigate()
    // console.log(go)
    const list = useList()
    return (
        <Container>
            <TextL>Choose one group then the system will randomly combined anther group to give you a study plan.</TextL>
            <WhiteSpace />
            <FlexDiv flow='wrap' justify='start'>
                {
                    list.map((v,i) =>
                        <VocabularyBlock key={v[0]} onClick={() => {
                            go('/learn?r='+getRandomIndex(i).join('_'))
                        }}>
                            <TextM>{i+1}. {v[0].slice(0,5)} ...</TextM>
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
