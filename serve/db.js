// db.js
import { Low } from 'lowdb'
import { JSONFile, JSONFilePreset } from 'lowdb/node'

const _INIT_ = {
  words: {},
  history: []
}

const _WORD_ = {
  learnTimes: 0,
  wrongTimes: 0,
  rightTimes: 0,
  lastTimestamp: 0,
  lastStatus: -1
}

// const adapter = new JSONFile('./db.json', {})
// const db = new Low(adapter, _INIT_)
const db = await JSONFilePreset('./db.json', _INIT_)
// await db.read()

function InitWord(word) {
  if (!db.data.words[word]) {
    db.data.words[word] = {..._WORD_}
  }
}

export function SetWord(wordObject) {
  const word = wordObject.word
  InitWord(word)
  db.data.words[word].learnTimes += wordObject.passTime
  if (wordObject.studyState < 1) {
    db.data.words[word].wrongTimes += 1
  }
  else {
    db.data.words[word].rightTimes += 1
  }
  // db.data.words[word].lastTimestamp = wordObject.endedAt === -1 ? new Date() * 1 : wordObject.endedAt
  db.data.words[word].lastTimestamp = wordObject.endedAt
  db.data.words[word].lastStatus = wordObject.studyState
}

export function AddHistory(lesson) {
  const beginAt = lesson.beginAt
  if (db.data.history.findIndex(v => v.beginAt === beginAt) >= 0) return ["repeat", null]
  lesson.list.forEach(v => {
    SetWord(v)
  })
  db.data.history.push(lesson)
  return [null, 0]
}

export async function InitDB() {
  await db.read()
  await db.write()
  return db
}

let _inited;
export async function InitDBOnce() {
  if (!_inited) {
    _inited = true
    await db.read()
    await db.write()
  }
  return db
}