import { InitDBOnce, AddHistory, SetWord } from './db.js'


async function main(params) {
    const db = await InitDBOnce()

    console.log(db.data.words)

    db.data.history.forEach(v => {
        v.list.forEach(v => {
            console.log(v)
            SetWord(v)
        })
    })

    await db.write()
}

main()