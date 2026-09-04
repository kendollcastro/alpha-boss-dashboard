export const BASE_URL = import.meta.env.VITE_API_BASE ?? "/api"

export async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("HTTP " + res.status)
  return res.json()
}

export async function apiPost(path: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error("HTTP " + res.status)
  return res.json()
}
