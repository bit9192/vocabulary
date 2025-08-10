
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

    let _word = {};

    function _add(word) {
        if (!word) throw new Error("add word invalid")
        let _word_ = _LESSON_.list.find(v => v.word === word)
        if (!_word_){
            const timestamp = new Date()  * 1
            _word_ = {
                word,
                beginAt: timestamp,
                endedAt: -1,
                passTime: 0,
                studyState: -1 // -1 learing , 0 didn't recognize, 1 recognized  
            }
            _LESSON_.list.push(_word_)
        }
        return _word_
    }
    
    function passOne(word = _word.word) {
        _word = _add(word)
        _word.passTime += 1
    }

    // override
    function done(state, word = _word.word) {
        _word = _add(word)
        _word.studyState = state
        _word.endedAt = new Date()  * 1
    }
    
    function show() {
        return _LESSON_
    }

    function word() {
        return _word
    }

    return {
        passOne,
        done,
        show,
        word
    }
}