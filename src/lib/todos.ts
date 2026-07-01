import { useCallback, useEffect, useRef, useState } from 'react'
import { commitJson, hasToken, type SyncState } from './github'

// A manual "To Do" board: project ideas/tasks you want to build. Fully
// user-entered (unlike the synced Projects board). Stored in localStorage;
// auto-commits to public/todo.json when a GitHub token is configured, else the
// Export button downloads it.
export interface Todo {
  id: string
  title: string
  implemented?: string // 'yes' | 'no'
  priority?: string // 'high' | 'medium' | 'low'
  domain?: string
  tech?: string
  notes?: string
  createdAt: string
}

const LS = 'bl-todo-v1'
const base = import.meta.env.BASE_URL

export interface TodosApi {
  todos: Todo[]
  loading: boolean
  add: () => void
  update: (id: string, patch: Partial<Todo>) => void
  remove: (id: string) => void
  exportTodos: () => void
  syncState: SyncState
  syncNow: () => void
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 't_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useTodos(): TodosApi {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [syncState, setSyncState] = useState<SyncState>(hasToken() ? 'idle' : 'off')
  const lastSynced = useRef<string>('')
  const timer = useRef<number>()

  useEffect(() => {
    const local = localStorage.getItem(LS)
    if (local) {
      try {
        const parsed = JSON.parse(local)
        setTodos(parsed)
        lastSynced.current = JSON.stringify(parsed)
        setLoading(false)
        return
      } catch {
        /* fall through to seed */
      }
    }
    fetch(`${base}todo.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const arr = Array.isArray(d) ? d : []
        setTodos(arr)
        lastSynced.current = JSON.stringify(arr)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const mutate = useCallback((fn: (prev: Todo[]) => Todo[]) => {
    setTodos((prev) => {
      const next = fn(prev)
      localStorage.setItem(LS, JSON.stringify(next))
      return next
    })
  }, [])

  const add = useCallback(
    () =>
      mutate((prev) => [
        { id: newId(), title: '', implemented: 'no', priority: 'medium', createdAt: new Date().toISOString() },
        ...prev,
      ]),
    [mutate],
  )

  const update = useCallback(
    (id: string, patch: Partial<Todo>) => mutate((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [mutate],
  )

  const remove = useCallback((id: string) => mutate((prev) => prev.filter((t) => t.id !== id)), [mutate])

  const syncNow = useCallback(() => {
    if (!hasToken()) return
    const snapshot = JSON.stringify(todos)
    setSyncState('saving')
    commitJson('public/todo.json', todos, 'Update To Do board (Build Log)')
      .then(() => {
        lastSynced.current = snapshot
        setSyncState('saved')
      })
      .catch(() => setSyncState('error'))
  }, [todos])

  // Debounced auto-commit when todos change and a token is set.
  useEffect(() => {
    if (loading || !hasToken()) return
    if (JSON.stringify(todos) === lastSynced.current) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(syncNow, 3500)
    return () => window.clearTimeout(timer.current)
  }, [todos, loading, syncNow])

  const exportTodos = useCallback(() => {
    const blob = new Blob([JSON.stringify(todos, null, 2) + '\n'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'todo.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [todos])

  return { todos, loading, add, update, remove, exportTodos, syncState, syncNow }
}
