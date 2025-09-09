// import styled from "styled-components";
import { styled } from '@mui/material/styles';


const defaultTheme = {
    fontSize: {
        small: 10,
        medium: 16,
        large: 20,
        larger: 24,
        max: 32,
    }
}

// container alway in the middle of the page
export const Container = styled('div')`
    margin: auto;
    max-width: 1180px;
    width: 100%;
    position: relative;
`

export const FlexDiv = styled('div')`
    display: flex;
    align-items: center;
    justify-content: ${p => p.justify || 'space-between'};

    flex-flow: ${p => p.flow || 'unset'};
`

export const WhiteSpace = styled('div')`
    width: 100%;
    text-align: center;
    height: ${p => p.size || .8}rem;
`

const Test = styled('span')`
    color: block;
`
export const TextS = styled(Test)`
    font-size: ${defaultTheme.fontSize.small}px;
`
export const TextM = styled(Test)`
    font-size: ${defaultTheme.fontSize.medium}px;
`
export const TextL = styled(Test)`
    font-size: ${defaultTheme.fontSize.large}px;
`
export const TextXL = styled(Test)`
    font-size: ${defaultTheme.fontSize.larger}px;
`
export const TextMax = styled(Test)`
    font-size: ${defaultTheme.fontSize.max}px;
`
