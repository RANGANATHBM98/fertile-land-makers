const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
export const API_BASE_URL = configuredApiUrl.replace(/\/$/, "")
export const API_ORIGIN = new URL(API_BASE_URL).origin

export function getAccessToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem("agri_access_token")
}

export function storeAccessToken(token: string): void {
  window.localStorage.setItem("agri_access_token", token)
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return ""
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getAccessToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = payload?.detail
    throw new Error(typeof detail === "string" ? detail : "The request could not be completed")
  }
  return payload as T
}