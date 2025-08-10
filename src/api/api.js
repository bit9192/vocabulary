
import {get, post} from './index'


export function AddLesson(_lesson) {
    return post('/api/add', _lesson)
}


export function GetRecent(num) {
    return get('/api/recent?n='+num)
}

export function GetAll() {
    return get('/api/wordList')
}
