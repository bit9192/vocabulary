// server.js
import fs from 'fs';
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'

import { InitDBOnce, AddHistory, asyncDB } from './db.js'

import { CallLLM, Prompts } from './llamaCall.js'

// import ecdict from './ecdict/ecdict.json' assert { type: 'json' }
// const ecdict = JSON.parse(fs.readFileSync('./data/ecdict.json', 'utf-8'));

const app = new Hono()
app.use('*', cors())  // 允许跨域

app.get('/wordList', async (c) => {
  const db = await asyncDB()
  return c.json(db.data.words)
})

app.get('/recent', async (c) => {
  let wordsCount = c.req.query('n')
  const db = await asyncDB()
  let len = db.data.history.length
  let words = {}
  for(let i = len - 1; i >= 0; i--) {
    const {list} = db.data.history[i]
    for(let i1 = 0; i1 < list.length; i1++) {
      const v = list[i1]
      const word = v.word
      if (!words[word]) {
        const wrongTimes = v.studyState !== 1 ? 1 : 0
        const rightTimes = wrongTimes === 1 ? 0 : 1
        words[word] = {
          word,
          learnTimes: v.passTime,
          wrongTimes,
          rightTimes,
          lastTimestamp: v.beginAt
        }
        wordsCount--
        if (wordsCount === 0) break
      }
      else {
        const wrongTimes = v.studyState !== 1 ? 1 : 0
        const rightTimes = wrongTimes === 1 ? 0 : 1
        words[word].learnTimes += v.passTime
        words[word].wrongTimes += wrongTimes
        words[word].learnTimes += rightTimes
      }
    }
    if (wordsCount === 0) break
  }
  return c.json(
    Object.keys(words).map(k => words[k])
  )
})

app.post('/add', async (c) => {
  const body = await c.req.json()
  const newItem = { id: Date.now(), ...body }
  const db = await asyncDB()
  const [err] = AddHistory(newItem)
  if (err) {
    return c.json({result: ['repeat', null]})
  }
  await db.write()
  return c.json({result: [null, 0]})
})


// text.replace(/[^\w\s\u4e00-\u9fa5]/g, '').toLocaleLowerCase().trim()
//         console.log(wor)
let _words = {}
app.get('/translate', async (c) => {
  let word = c.req.query('n')
  // console.log('translate', word)
  if (!_words[word]) {
    const result = await CallLLM(
      Prompts.translateWord(word),
      { 
        "temperature": 0.4,
        "top_p": 0.9,
        "max_tokens": 400,
        "presence_penalty": 0.0,
        "frequency_penalty": 0.0,
        post: 8081
      }
    )
    _words[word] = ExtractJSON(result)
  }
  return c.json({ result: _words[word] })
})

serve(app, (info) => {
  console.log(`✅ Hono API running at http://localhost:${info.port}`)
})


export async function translateProxy(text, direction) {
  try {
    const response = await fetch("http://localhost:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, direction }),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("代理请求出错:", err);
    return { error: err.message };
  }
}

app.post('/translate', async (c) => {
  const { text, target = '中文；篇学术语气' } = await c.req.json()
  const result = await CallLLM(
    Prompts.translate(target, text),
    { 
      "temperature": 0.4,
      "top_p": 0.9,
      "max_tokens": 400,
      "presence_penalty": 0.0,
      "frequency_penalty": 0.0
    }
  )
  console.log(result)

  return c.json({ result })
})


function ExtractJSON(text) {
  const stack = [];
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (c === '{') {
      if (stack.length === 0) start = i;
      stack.push(c);
    } else if (c === '}') {
      stack.pop();
      if (stack.length === 0 && start !== -1) {
        const jsonStr = text.slice(start, i + 1);
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          // 继续找下一个
          start = -1;
        }
      }
    }
  }
  throw new Error('No valid JSON found');
}
