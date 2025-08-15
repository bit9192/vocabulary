

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