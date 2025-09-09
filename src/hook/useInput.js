import { useState, useCallback} from "react";

function useInput(initValue, position = {}) {
    const [value, setValue] = useState(initValue)
    const onChange = useCallback(value => {
        if ( value.target ) {
            setValue(value.target.value)
        } else {
            setValue(value)
        }
    },[])
    return {
        value,
        onChange,
        ...position
    }
}

export default useInput

export function useInputs(obj) {
    const [value, setValue] = useState(obj)
    return {
        value,
        set: key => ({
            value: value[key],
            onChange: value => setValue( v => ({
                ...v,
                [key]: value
            })),
            name: key
        })
    }
}

export function useSwitchInput(initOpen = false) {
    const [value, setValue] = useState(initOpen)

    const switchOpen = () => {
        setValue(v => !v)
    }
    return {
        value,
        onChange: switchOpen
    }
}