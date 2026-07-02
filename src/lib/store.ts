import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DropdownKey, Override, Overrides, Project, ProjectsFile } from '../data/types'
import { commitJson, hasToken, type SyncState } from './github'

const LS_KEY = 'mc-overrides-v1'
const base = import.meta.env.BASE_URL

function readLocal(): Overrides {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeLocal(o: Overrides) {
  localStorage.setItem(LS_KEY, JSON.stringify(o))
}

// committed baseline (overrides.json) with the browser's unsynced edits layered on top
function merge(baseline: Overrides, local: Overrides): Overrides {
  const out: Overrides = {}
  const repos = new Set([...Object.keys(baseline), ...Object.keys(local)])
  for (const r of repos) out[r] = { ...(baseline[r] || {}), ...(local[r] || {}) }
  return out
}

function clean(effective: Overrides): Overrides {
  const out: Overrides = {}
  for (const [repo, ov] of Object.entries(effective)) {
    const entries = Object.entries(ov).filter(([, v]) => v != null && v !== '')
    if (entries.length) out[repo] = Object.fromEntries(entries)
  }
  return out
}

export interface Tracker {
  loading: boolean
  error: string | null
  generatedAt: string | null
  projects: Project[]
  get: (repo: string, key: DropdownKey) => string | undefined
  set: (repo: string, key: DropdownKey, value: string | undefined) => void
  dirtyCount: number
  exportOverrides: () => void
  syncState: SyncState
  syncNow: () => void
}

export function useTracker(): Tracker {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [baseline, setBaseline] = useState<Overrides>({})
  const [local, setLocal] = useState<Overrides>(() => readLocal())
  const [syncState, setSyncState] = useState<SyncState>(hasToken() ? 'idle' : 'off')
  const timer = useRef<number>()

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`${base}projects.json`).then((r) => {
        if (!r.ok) throw new Error(`projects.json ${r.status}`)
        return r.json() as Promise<ProjectsFile>
      }),
      fetch(`${base}overrides.json`)
        .then((r) => (r.ok ? (r.json() as Promise<Overrides>) : {}))
        .catch(() => ({}) as Overrides),
    ])
      .then(([pf, ov]) => {
        if (cancelled) return
        setProjects(pf.projects || [])
        setGeneratedAt(pf.generatedAt || null)
        setBaseline(ov || {})
      })
      .catch((e) => !cancelled && setError(String(e?.message || e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const effective = useMemo(() => merge(baseline, local), [baseline, local])

  const get = useCallback(
    (repo: string, key: DropdownKey) => {
      const v = effective[repo]?.[key]
      return v === '' ? undefined : v
    },
    [effective],
  )

  const set = useCallback(
    (repo: string, key: DropdownKey, value: string | undefined) => {
      setLocal((prev) => {
        const next: Overrides = { ...prev, [repo]: { ...(prev[repo] || {}) } }
        if (value === undefined) {
          // Tombstone hides a value already committed to baseline; otherwise just drop the local edit.
          if (baseline[repo]?.[key] !== undefined) (next[repo] as Override)[key] = ''
          else delete (next[repo] as Override)[key]
        } else {
          (next[repo] as Override)[key] = value
        }
        if (Object.keys(next[repo]).length === 0) delete next[repo]
        writeLocal(next)
        return next
      })
    },
    [baseline],
  )

  const dirtyCount = useMemo(() => {
    let n = 0
    for (const repo of Object.keys(local)) {
      const l = local[repo] || {}
      const b = baseline[repo] || {}
      for (const k of Object.keys(l) as DropdownKey[]) if (l[k] !== b[k]) n++
    }
    return n
  }, [local, baseline])

  const syncNow = useCallback(() => {
    if (!hasToken()) return
    const payload = clean(effective)
    setSyncState('saving')
    commitJson('public/overrides.json', payload, 'Update project statuses (Build Log)')
      .then(() => {
        setBaseline(payload)
        setLocal({})
        writeLocal({})
        setSyncState('saved')
      })
      .catch(() => setSyncState('error'))
  }, [effective])

  // Debounced auto-commit whenever there are unsaved edits and a token is set.
  useEffect(() => {
    if (loading || !hasToken() || dirtyCount === 0) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(syncNow, 3500)
    return () => window.clearTimeout(timer.current)
  }, [local, dirtyCount, loading, syncNow])

  const exportOverrides = useCallback(() => {
    const blob = new Blob([JSON.stringify(clean(effective), null, 2) + '\n'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'overrides.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [effective])

  return { loading, error, generatedAt, projects, get, set, dirtyCount, exportOverrides, syncState, syncNow }
}
