// db.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const _INIT_ = {
  words: {},
  history: []
}

const _WORD_ = {
  learnTimes: 0,
  wrongTimes: 0,
  lastTimestamp: 0
}

const adapter = new JSONFile('./db.json')
const db = new Low(adapter, _INIT_)

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
  db.data.words[word].lastTimestamp = wordObject.endedAt
}

export function AddHistory(lesson) {
  lesson.list.forEach(v => {
    SetWord(v)
  })
  db.data.history.push(lesson)
}

export async function InitDB() {
  await db.read()
  await db.write()
  return db
}

let _inited;
export async function  InitDBOnce() {
  if (!_inited) {
    _inited = true
    await db.read()
    await db.write()
  }
  return db
}