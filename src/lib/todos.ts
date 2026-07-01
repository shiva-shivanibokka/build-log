import { useCallback, useEffect, useState } from 'react'

// A manual "To Do" board: project ideas/tasks you want to build. Fully
// user-entered (unlike the synced Projects board). Stored in localStorage;
// Export writes public/todo.json, which seeds a fresh browser.
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
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 't_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useTodos(): TodosApi {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const local = localStorage.getItem(LS)
    if (local) {
      try {
        setTodos(JSON.parse(local))
        setLoading(false)
        return
      } catch {
        /* fall through to seed */
      }
    }
    fetch(`${base}todo.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTodos(Array.isArray(d) ? d : []))
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

  const exportTodos = useCallback(() => {
    const blob = new Blob([JSON.stringify(todos, null, 2) + '\n'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'todo.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [todos])

  return { todos, loading, add, update, remove, exportTodos }
}
