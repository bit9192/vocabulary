
let _book = {};
export async function GetBook(name) {
    if (!_book[name]) {
        _book[name] = (await import("/public/book/"+name+".json")).default

    }
    return _book[name]
}