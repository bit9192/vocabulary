import { useState, useEffect } from 'react';
// import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import Divider from '@mui/material/Divider';

import CampaignIcon from '@mui/icons-material/Campaign';
import { styled } from '@mui/material/styles';


import { useRef } from 'react';

import {useTranslate} from '../hook/useTranslate'
import copyFun from 'copy-to-clipboard'

import {IsMobile} from '../hook/tools'

import {
    TextL,
    TextM,
    TextS,
    FlexDiv
} from "../components"


const isMobile = IsMobile()
export function PopoverCard({value = false, children}) {
    const xtRef = useRef(null)
    const popperRef = useRef(null)
    const [open, setOpen] = useState(value)
    useEffect(() => {
        const move = (e) => {
            xtRef.current = e.target
        }
        const event = IsMobile() ? "touchend" : "mouseup"
        document.addEventListener(event, move);
        return () => {
            document.removeEventListener(event, move)
        }
    },[])

    useEffect(() => {
        if (value) {
            requestAnimationFrame(() => setOpen(true))
        }
        else {
            setOpen(false)
        }
    }, [value])

    return (
        <Popper
            ref={popperRef}
            open={open}
            anchorEl={xtRef.current}
            // onClose={onClose}
            popperOptions="auto"   // 初始位置
            // modifiers={[
            //     {
            //         name: 'flip',           // 遇到边界自动翻转
            //         enabled: true,
            //     },
            //     {
            //         name: 'preventOverflow', // 避免浮层超出屏幕
            //         options: {
            //             // padding: 8,
            //         },
            //     },
            // ]}
            // anchorOrigin={{
            //     vertical: 'bottom',
            //     horizontal: 'left',
            // }}
            // disableScrollLock={true}
            // hideBackdrop
            // disableRestoreFocus
            // hideBackdrop
            // PaperProps={{ sx: { pointerEvents: 'none', bgcolor: 'transparent', boxShadow: 'none' } }}
        >
            {children}
            {/* <PopperFame>
                {children}
            </PopperFame> */}
        </Popper>
    );
}

export function PopoverTranslator({target, text, moveEnd}) {
    const open = target !== null &&  text !== "" && moveEnd

    return (
        <Popper
            open={open}
            anchorEl={target}
            // onClose={onClose}
            popperOptions="auto"
        >
            <TranslatorCard text={text} />
        </Popper>
    )
}

const withCard = isMobile ? window.innerWidth - 24 : 460
export function TranslatorCard({text}) {
    const refTime = useRef(null)
    // results is asynchronously cause popper unable to calculated correctly size
    const {
        results,
        roots,
        type,
        trans,
        // speak
    } = useTranslate()
    useEffect(() => {
        if (text) {
            clearTimeout(refTime.current)
            refTime.current = setTimeout(() => {
                trans(text)
                refTime.current = null
            }, 50)
            
        }
    }, [text, trans])

    // console.log(roots, type," ds", type === 1 && roots && roots?.length)
    console.log(results, " results.trans.")
//     {mean: '连接；关联', n: '/kəˈnek.ʃən/', roots: Array(3)}
// mean
// : 
// "连接；关联"
// n
// : 
// "/kəˈnek.ʃən/"
// roots
// : 
// (3) [Array(2), Array(2), Array(2)]
    return (
        <Card sx={{
            padding: "2px 12px",
            width:  withCard + "px",
        }}>
            <div>
                <TextM
                    onClick={() => copyFun(text)}
                    style={{
                        padding: "6px 0 6px",
                        display: "block",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    {text}
                </TextM>
                <CampaignIcon fontSize="inherit" onClick={() => PlayPronunciation(text)}/>
            </div>
            
            {
                results ?
                type === 0 ?
                    <DictionaryEntry entry={results}/>:
                    <TextM
                        style={{
                            maxWidth: "100%",
                            display: "block",
                            color: "#4e4e4e"
                        }}
                    >
                        {results}
                    </TextM>
                :
                <TextM>
                    loading...
                </TextM>
            }
        </Card>
    )
}

// 词典条目组件
function DictionaryEntry({ entry }) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "10px 0" }}>
      <TextM style={{display:'block', color:'#404040'}}>/{entry.n}/</TextM> 
      <TextM style={{display:'block'}}>{entry.mean}</TextM>
      {entry.roots.map((root, index) => {
        return <TextM key={index} style={{display:'block', color: "#606060" }}>{root[0]} : {root[1]}</TextM>;
      })}
    </div>
  );
}

// Web Speech API 播放音标
const PlayPronunciation = (text, lang = "en-US") => {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  window.speechSynthesis.speak(utter);
};


const PopperFame = styled('div')`
    /* width: 660px; */
`