import { useState, useEffect } from 'react';
// import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';

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


export function PopoverTranslator({target, text}) {
    
    // const [open, setOpen] = useState(false)
    // useEffect(() => {
    //     const open = target !== null &&  text !== ""
    //     setOpen(open)
    // }, [target, text])
    const open = target !== null && text !== ""
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

const withCard = IsMobile() ? window.innerWidth - 10 : 460
export function TranslatorCard({text}) {
    // results is asynchronously cause popper unable to calculated correctly size
    const {
        results,
        type,
        trans,
        // speak
    } = useTranslate()
    useEffect(() => {
        if (text) {
            trans(text)
        }
    }, [text, trans])

    // console.log(results)
    return (
        <Card sx={{
            padding: "2px 12px",
            width:  withCard + "px"
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
  // 按换行分块
  const lines = entry.split("\n");

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "10px 0" }}>
      {lines.map((line, index) => {
        let style = {};
        let onClick = null;

        if (line.startsWith("*[")) {
          style = { color: "#0066cc", fontWeight: "bold", cursor: "pointer" };
          // 点击播放音标
        //   onClick = () => playPronunciation(line.replace(/^\*\[|\].*$/g, ""), "en-US");
        } else if (/^[a-z]\./.test(line)) {
          style = { fontWeight: "bold" }; // 词性
        } else if (line.startsWith("[")) {
          style = { color: "green" }; // 专业领域
        } else if (line.startsWith("(")) {
          style = { color: "gray", fontSize: "0.9em" }; // 注释
        }

        return (
          <div key={index} style={style}>
            {line}
          </div>
        );
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