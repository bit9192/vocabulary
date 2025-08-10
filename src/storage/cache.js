
export function CreateWordHistory(word) {
    const timestamp = new Date()  * 1
    let _word = {
        word,
        beginAt: timestamp,
        endedAt: -1,
        passTime: 0,
        studyState: -1 // -1 learing , 0 didn't recognize, 1 recognized  
    }
    function passOne() {
        _word.passTime += 1
    }
    function done(state) {
        _word.studyState = state
        _word.endedAt = new Date()  * 1
    }
    function show() {
        return _word
    }
    return {
        passOne,
        done,
        show
    }
}


export function CreateLesson(title) {
    const timestamp = new Date()  * 1
    let _LESSON_ = {
        beginAt: timestamp,
        title,
        list:[]
    }
    
    function add(word) {
        if (_LESSON_.list.findIndex(v => v.word === word) >= 0) return
        _LESSON_.list.push(word)

    }
    
    function show() {
        return _LESSON_
    }

    return {
        add,
        show
    }
}