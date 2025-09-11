

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

export function ShallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
}