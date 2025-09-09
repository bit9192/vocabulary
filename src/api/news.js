import Guardian from 'guardian-js';

const apiKey = import.meta.env.VITE_NEWS_KEY
const guardian = new Guardian(apiKey, false);


export function Search(word, page = 1) {
    return guardian.content.search(
        word,
        {
            showFields: "bodyText",
            section:"science",
            page
        }
    )
}


let _list = {}
async function _GetNews(word, page = 1, section = "science") {
    if (!_list[word]) {
        _list[word] = await guardian.content.search(
            word,
            {
                showFields: "bodyText",
                section,
                page
            }
        )
    }
}