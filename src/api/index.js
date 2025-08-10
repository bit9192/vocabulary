// request.js

const BASE_URL = 'http://localhost:3000' // 你后端的地址

export async function get(url, params = {}) {
  const query = new URLSearchParams(params).toString()
  const fullUrl = `${BASE_URL}${url}${query ? '?' + query : ''}`

  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return await res.json()
}

export async function post(url, data = {}) {
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
