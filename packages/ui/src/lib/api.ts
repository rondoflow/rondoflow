import { NETWORK } from '@rondoflow/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? NETWORK.DEFAULT_API_URL

interface ResponseEnvelope<T> {
  readonly success?: boolean
  readonly data?: T
  readonly error?: string
  readonly meta?: unknown
}

// Parse the `{ success, data?, error?, meta? }` envelope, checking `res.ok`
// first so non-JSON failures (proxy/gateway error pages, server crashes) throw
// a meaningful HTTP error instead of a cryptic JSON-parse error. A non-2xx
// response that still carries an envelope keeps its `error` message.
async function readEnvelope<T>(
  res: Response,
  fallbackError = 'API request failed',
): Promise<ResponseEnvelope<T>> {
  let json: ResponseEnvelope<T> | null = null
  try {
    json = (await res.json()) as ResponseEnvelope<T>
  } catch {
    json = null
  }
  if (!res.ok) {
    throw new Error(json?.error ?? `${fallbackError} (HTTP ${res.status})`)
  }
  if (!json?.success) {
    throw new Error(json?.error ?? fallbackError)
  }
  return json
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return (await readEnvelope<T>(res)).data as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' })
  return (await readEnvelope<T>(res)).data as T
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return (await readEnvelope<T>(res)).data as T
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return (await readEnvelope<T>(res)).data as T
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', credentials: 'include' })
  await readEnvelope(res)
}

export async function apiUpload<T>(
  path: string,
  file: File,
  extraFields?: Record<string, string>,
): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)
  if (extraFields) {
    for (const [k, v] of Object.entries(extraFields)) {
      formData.append(k, v)
    }
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // No Content-Type header — browser sets it with boundary for multipart
  })
  return (await readEnvelope<T>(res, 'Upload failed')).data as T
}

/** GET that also returns the response envelope's `meta` (e.g. pagination). */
export async function apiGetWithMeta<T, M = unknown>(
  path: string,
): Promise<{ data: T; meta?: M }> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' })
  const json = await readEnvelope<T>(res)
  return { data: json.data as T, meta: json.meta as M | undefined }
}

/** GET that returns the raw response body as a Blob (e.g. file/CSV downloads). */
export async function apiGetBlob(path: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`Download failed (${res.status})`)
  return res.blob()
}
