import { InitDBOnce, AddHistory, SetWord } from './db.js'


async function main(params) {
    const db = await InitDBOnce()

    console.log(db.data.words)
    const words = {}
    db.data.history.forEach(v => {
        v.list.forEach(v => {
            console.log(v)
            // SetWord(v)
            words[v.word] = v.studyState
        })
    })

    console.log(
        words
    )
    Object.keys(words).forEach(k => {
        db.data.words[k].lastStatus = words[k]
    })

    console.log(db.data.words)
    await db.write()

}

main()