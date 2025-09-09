

import { useCallback, useEffect, useRef, useState } from "react"

import {
    getUrlParams
} from '../tools'

import {
    GetBook
} from "../api/books"


const INIT = {
    next: () => {},
    pre: () => {},
}
export function useBooks() {
    const [page, setPage] = useState(null)
    const [currentPage, setCurrentPage] = useState(null)
    const [pages, setPages] = useState(null)
    const pageContrallerRef = useRef(INIT)

    const Book = useCallback(async (bookName) => {
        setPage(null)
        const book = await GetBook(bookName)
        let currentPage = 1
        let pages = book.length
        
        setPages(pages)
        const page = () => {
            const p = book[currentPage - 1]
            setCurrentPage(currentPage)
            setPage(p)
            return p
        }
        const next = () => {
            currentPage += 1
            if (currentPage > pages) {
                currentPage = pages
            }
            return page()
        }

        const pre = () => {
            currentPage -= 1
            if (currentPage <= 0) {
                currentPage = 1
            }
            return page()
        }
        const set = p => {
            if (p > 0 && p <= pages) {
                currentPage = p
            }
            page()
        }
        return {
            all : () => book,
            page,
            next,
            pre,
            set,
            currentPage: () => currentPage
        }
    }, [])


    useEffect(() => {
        let {n, p} = getUrlParams()
        let clickRef = {}
        function keydown(e) {
            if (clickRef[e.keyCode]) clickRef[e.keyCode]()
        }
        document.addEventListener('keydown', keydown, false);
        
        const init = async () => {
            const {
                all,
                next,
                pre,
                page,
                set
            } = await Book(n)
            document.title = n.replace(/_/g, " ")
            pageContrallerRef.current.next = next
            pageContrallerRef.current.pre = pre
            pageContrallerRef.current.set = set
            pageContrallerRef.current.all = all
            
            if (p) {
                set(p*1)
            } else {
                page()
            }
            clickRef = {
                69: () => pre(), // E
                82: () => {
                    next()
                }, // R
            }
        }
        init()
        return () => {
            document.removeEventListener('keydown', keydown)
        }
    }, [Book])

    return {
        page,
        currentPage,
        pages,
        Book,
        next: pageContrallerRef.current.next,
        pre: pageContrallerRef.current.pre,
        set: pageContrallerRef.current.set,
        all: pageContrallerRef.current.all
    }
}