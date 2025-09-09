import {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import {
  useVocabularyConsole
} from "../hook/useVocabulary"

import {
  useNewsContent
} from "../hook/useTranslate"


import {
  FlexDiv,
  TextM
} from "../components"

import {
  Animations
} from "../components/mui"

import {
  NewsContent
} from "./News"

import { Divider } from '@mui/material';

const drawerWidth = 360;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    flexGrow: 1,
    // padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    /**
     * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
     * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
     * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
     * proper interaction with the underlying content.
     */
    position: 'relative',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginRight: 0,
        },
      },
    ],
  }),
);

export default function PersistentDrawerRight() {
  const {
    wordsList,
    word,
    PreWord,
    NextWord,
    SetWord
  } = useVocabularyConsole()

  const [open, setOpen] = useState(false)

  const switchOpen = () => {
    setOpen(v => !v)
  }

  const trans = useNewsContent()

  useEffect(() => {
    let _read;
    const init = async () => {
      if (word) {
        const {
          ReadedWord
        } = await trans.search(word)
        _read = ReadedWord
      }
    }
    init()
    return () => {
      if (_read) _read()
    }
  },[word, trans.search])

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Main open={open}>
        {
          trans.results === null ? 
          <Animations />:
          <NewsContent
            title={trans.results.title}
            content={trans.results.text}
          />
        }
        {
          trans.results === null ? 
          <Animations />:
          <NewsContent
            title={trans.results.title}
            content={trans.results.text}
          />
        }
      </Main>
      <Contraller
          open={open}
      >
        <ContrallerButton onClick={switchOpen}>
          {
            open ? <ArrowRightIcon  fontSize="inherit"/> : <ArrowLeftIcon fontSize="inherit"/>
          }
          
        </ContrallerButton>
        <Divider/>
        <ContrallerButton onClick={NextWord}>R</ContrallerButton>
        <Divider/>
        <ContrallerButton onClick={PreWord}>E</ContrallerButton>
        <Divider/>
        <ContrallerButton>
          <ArrowUpwardIcon  fontSize="inherit"/>
        </ContrallerButton>
        <Divider/>
        <ContrallerButton>
          <ArrowDownwardIcon  fontSize="inherit"/>
        </ContrallerButton>
      </Contraller>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <ListWarp>
          {
            wordsList ?
              wordsList.map((text) => (
                <ListDiv
                  key={text.word}
                  active={text.word === word}
                  onClick={() => {
                    SetWord(text.word)
                  }}
                >
                  <TextM>{text.word}</TextM>
                </ListDiv>
              )):null
          }
        </ListWarp>
      </Drawer>
    </Box>
  );
}


const ListDiv = styled(FlexDiv)`
    position: relative;
    padding: 6px;
    user-select: none;
    -webkit-user-select: none;
    background: ${p => p.active ? "#ffeb3b": "transparent"};
    width: 30%;
`

const ListWarp = styled(FlexDiv)`
    flex-wrap: wrap;
`

const Contraller = styled("div",{ shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    padding: "8px 4px",
    position: "fixed",
    background: "#fff",
    borderRadius: "8px 0px 0px 8px",
    top: "50%",
    right: "0",
    marginRight: open ? drawerWidth+"px" : 0,
    width: "36px",
    boxShadow: "-4px 0px 10px #0000003b",
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })
}))

const ContrallerButton = styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-size: 16px;
    user-select: none;
    -webkit-user-select: none;
`