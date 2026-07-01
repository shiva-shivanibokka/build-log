// Optional auto-sync: commit the tracker's JSON data straight to the repo using
// a user-provided fine-grained PAT (stored ONLY in this browser's localStorage,
// never in the repo). Lets dropdown/idea changes persist without downloading a
// file. Token needs Contents: read & write on the build-log repo only.

const OWNER = 'shiva-shivanibokka'
const REPO = 'build-log'
const TOKEN_KEY = 'bl-gh-token'
const API = 'https://api.github.com'

export const getToken = (): string => {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}
export const setToken = (t: string) => {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}
export const hasToken = (): boolean => !!getToken()

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// UTF-8 safe base64
function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

// Verify the token can see the repo (used by the settings dialog).
export async function verifyToken(token: string): Promise<{ ok: boolean; message: string }> {
  try {
    const r = await fetch(`${API}/repos/${OWNER}/${REPO}`, { headers: authHeaders(token) })
    if (r.ok) return { ok: true, message: 'Connected' }
    if (r.status === 401) return { ok: false, message: 'Invalid token' }
    if (r.status === 404) return { ok: false, message: 'Token can’t see the build-log repo (check repo access)' }
    return { ok: false, message: `GitHub error ${r.status}` }
  } catch (e) {
    return { ok: false, message: `Network error: ${(e as Error).message}` }
  }
}

async function currentSha(path: string, token: string): Promise<string | undefined> {
  const r = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}?ref=main`, { headers: authHeaders(token) })
  if (r.status === 404) return undefined
  if (!r.ok) throw new Error(`read ${r.status}`)
  const j = await r.json()
  return j.sha as string
}

// Commit `data` as pretty JSON to `path` (e.g. "public/overrides.json").
export async function commitJson(path: string, data: unknown, message: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error('No GitHub token set')
  const content = toBase64(JSON.stringify(data, null, 2) + '\n')

  let sha = await currentSha(path, token)
  const put = () =>
    fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ message, content, sha, branch: 'main' }),
    })

  let res = await put()
  if (res.status === 409) {
    // sha race — refetch and retry once
    sha = await currentSha(path, token)
    res = await put()
  }
  if (!res.ok) throw new Error(`commit ${res.status}`)
}

export type SyncState = 'idle' | 'saving' | 'saved' | 'error' | 'off'
