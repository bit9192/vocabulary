// server.js
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { InitDBOnce, AddHistory } from './db.js'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('*', cors())  // 允许跨域

// app.get('/api/records', async (c) => {
//   const db = await initDB()
//   return c.json(db.data.records)
// })

app.post('/api/add', async (c) => {
  const body = await c.req.json()
  console.log(body)
  const newItem = { id: Date.now(), ...body }
  const db = await InitDBOnce()
  AddHistory(newItem)
  await db.write()
  return c.json({result: [null, 0]})
})

serve(app, (info) => {
  console.log(`✅ Hono API running at http://localhost:${info.port}`)
})
