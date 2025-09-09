// server.js
import fs from 'fs';
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { InitDBOnce, AddHistory, asyncDB } from './db.js'
import { cors } from 'hono/cors'

// import ecdict from './ecdict/ecdict.json' assert { type: 'json' }
const ecdict = JSON.parse(fs.readFileSync('./ecdict/ecdict.json', 'utf-8'));

const app = new Hono()
app.use('*', cors())  // 允许跨域

app.get('/api/wordList', async (c) => {
  const db = await asyncDB()
  return c.json(db.data.words)
})

app.get('/api/recent', async (c) => {
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

app.post('/api/add', async (c) => {
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


app.get('/api/translate', (c) => {
  // console.log(c, " c")
  let word = c.req.query('n')
  return c.json(ecdict[word] || null)
})

serve(app, (info) => {
  console.log(`✅ Hono API running at http://localhost:${info.port}`)
})


