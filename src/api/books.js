
let _book = {};
export async function GetBook(name) {
    if (!_book[name]) {
         const res = await fetch("/book/"+name+".json")
        _book[name] = await res.json() // (await import("/public/book/"+name+".json")).default

    }
    return _book[name]
}