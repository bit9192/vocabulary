// request.js

const BASE_URL = '/db' // 你后端的地址

export async function get(url, params = {}, _BASE_URL = BASE_URL) {
  const query = new URLSearchParams(params).toString()
  const fullUrl = `${_BASE_URL}${url}${query ? '?' + query : ''}`

  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return await res.json()
}

export async function post(url, data = {}, _BASE_URL = BASE_URL) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
  return await res.json()
}
