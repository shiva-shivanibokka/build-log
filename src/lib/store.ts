import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DropdownKey, Override, Overrides, Project, ProjectsFile } from '../data/types'

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

export interface Tracker {
  loading: boolean
  error: string | null
  generatedAt: string | null
  projects: Project[]
  get: (repo: string, key: DropdownKey) => string | undefined
  set: (repo: string, key: DropdownKey, value: string | undefined) => void
  dirtyCount: number
  exportOverrides: () => void
}

export function useTracker(): Tracker {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [baseline, setBaseline] = useState<Overrides>({})
  const [local, setLocal] = useState<Overrides>(() => readLocal())

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
    (repo: string, key: DropdownKey) => effective[repo]?.[key],
    [effective],
  )

  const set = useCallback((repo: string, key: DropdownKey, value: string | undefined) => {
    setLocal((prev) => {
      const next: Overrides = { ...prev, [repo]: { ...(prev[repo] || {}) } }
      if (value === undefined) delete (next[repo] as Override)[key]
      else (next[repo] as Override)[key] = value
      if (Object.keys(next[repo]).length === 0) delete next[repo]
      writeLocal(next)
      return next
    })
  }, [])

  // how many fields differ from the committed baseline (i.e. not yet exported)
  const dirtyCount = useMemo(() => {
    let n = 0
    for (const repo of Object.keys(local)) {
      const l = local[repo] || {}
      const b = baseline[repo] || {}
      for (const k of Object.keys(l) as DropdownKey[]) if (l[k] !== b[k]) n++
    }
    return n
  }, [local, baseline])

  const exportOverrides = useCallback(() => {
    // strip empty repo entries so the committed file stays tidy
    const clean: Overrides = {}
    for (const [repo, ov] of Object.entries(effective)) {
      const entries = Object.entries(ov).filter(([, v]) => v != null && v !== '')
      if (entries.length) clean[repo] = Object.fromEntries(entries)
    }
    const blob = new Blob([JSON.stringify(clean, null, 2) + '\n'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'overrides.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [effective])

  return { loading, error, generatedAt, projects, get, set, dirtyCount, exportOverrides }
}
