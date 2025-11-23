

import { useEffect, useState } from "react";

// type = data type
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


export const GetBays = () => {
    const now = Date.now()
    const hours = timestamp => {
        const diffMs = now - timestamp;

        if (diffMs < 0) return "未来的时间"; // 防止传未来时间

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        return diffHours
    }
    const daysWithHours = diffHours => {
        const days = Math.floor(diffHours / 24);
        const hours = diffHours % 24;
        return [days, hours]
    }
    return {
        hours,
        daysWithHours
    }
}