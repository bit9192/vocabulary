// server.js
import fs from 'fs';
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { InitDBOnce, AddHistory, asyncDB } from './db.js'
import { cors } from 'hono/cors'

// import ecdict from './ecdict/ecdict.json' assert { type: 'json' }
const ecdict = JSON.parse(fs.readFileSync('./data/ecdict.json', 'utf-8'));
const rootsLookup = JSON.parse(fs.readFileSync('./rootsLookup.json', 'utf-8'));
const rootsList = JSON.parse(fs.readFileSync('./rootsList.json', 'utf-8'));

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
app.get('/translate', (c) => {
  // console.log(c, " c")
  let word = c.req.query('n')
  // const roots = SplitWord(word)
  return c.json(ecdict[word] || null)
})

app.post('/translate', async (c) => {
  const {text} = await c.req.json()
  const word = text.replace(/[^\w\s\u4e00-\u9fa5]/g, '').toLocaleLowerCase().trim()
  const ecdictDetail = ecdict[word]
  if (ecdictDetail) {
    const res = rootsLookup[word]
    if (!res) {
      return c.json({
        detail: ecdictDetail,
        roots: []
      })
    }
    const roots = res.split(" ")
    return c.json({
      detail: ecdictDetail,
      roots: roots.map(v => {
        const k = v.replaceAll("#", "")
        return {
          v,
          k: rootsList[k]
        }
      })
    })
  }
  else {
    const res = await translateProxy(text, "en-zh")
    return c.json({
      trans: res
    })
  }
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