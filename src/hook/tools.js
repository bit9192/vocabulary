

import { useEffect, useState } from "react";

export function useReq({
    type,
    call = () => type,
    initLoading = false,
    initReq = false
}) {
    const [loading, setLoading] = useState(initLoading)
    const [data, setData] = useState(type)

    const req = async () => {
        setLoading(true)
        setData(await call())
        setLoading(false)
    }

    useEffect(() => {
        if (initReq) {
            req()
        }
    }, [initReq])

    return {
        loading,
        res: data,
        req
    }

}

export function IsMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Phone/i.test(navigator.userAgent);
}

export function SetPageOfUrl(currentPage) {
    const params = new URLSearchParams(window.location.search);
    params.set('p', currentPage);
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl);
}