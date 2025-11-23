import Guardian from 'guardian-js';

const apiKey = import.meta.env.VITE_NEWS_KEY
const guardian = new Guardian(apiKey, false);


export function Search(word, page = 1, section = "science") {
    const news = guardian.content.search(
        word,
        {
            showFields: "bodyText",
            section,
            page,
            orderBy: "newest"
            
        }
    )
    console.log(news," news")
    return news
} 

let _list = {}
async function AddNews(word, section = "science") {
    if (!_list[word]) {
        _list[word] = {
            currentPage: null,
            pageSize: null,
            pages: null,
            list: []
        }
    }

    const {pages, currentPage} = _list[word]
    if ( pages === null || currentPage < pages ) {
        const {
            currentPage,
            pageSize,
            pages,
            results
        } = await Search(word, 1, section)
        _list[word].currentPage = currentPage
        _list[word].pageSize = pageSize
        _list[word].pages = pages
        _list[word].list.push(...results)
    }
    return _list[word]
}