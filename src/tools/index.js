export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getUrlParams() {
    const r = {}
    const ps1 = (window.location.href).split('?').splice(1)
    if (ps1.length === 0) return r
    ps1.map(v => v.replace('#/', '').split('&').map(v => {
        const [key, value] = v.split('=')
        r[key] = value
        return v
    }))
    return r
}