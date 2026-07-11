import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Tone } from '../lib/dropdowns'
import Select from './Select'
import DomainSelect from './DomainSelect'
import { SyncBadge } from './SettingsModal'
import { useTodos } from '../lib/todos'
import type { Todo } from '../lib/todos'

interface Opt {
  value: string
  label: string
  tone: Tone
}

const IMPLEMENTED: Opt[] = [
  { value: 'yes', label: 'Yes', tone: 'green' },
  { value: 'no', label: 'No', tone: 'red' },
]
const PRIORITY: Opt[] = [
  { value: 'high', label: 'High', tone: 'red' },
  { value: 'medium', label: 'Medium', tone: 'yellow' },
  { value: 'low', label: 'Low', tone: 'neutral' },
]
const OWNER = 'shiva-shivanibokka'

const primaryBtn =
  'rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue px-4 py-2 text-[13px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-pop'

const prank = (p?: string) => (p === 'high' ? 0 : p === 'medium' ? 1 : p === 'low' ? 2 : 3)
const todayStr = new Date().toISOString().slice(0, 10)

export default function TodoView({ tokenOn }: { tokenOn: boolean }) {
  const { todos, add, update, remove, exportTodos, syncState, syncNow } = useTodos()
  const [q, setQ] = useState('')
  const [implFilter, setImplFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [prioFilter, setPrioFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [sort, setSort] = useState<'priority' | 'newest'>('priority')
  const badgeState = syncState === 'off' && tokenOn ? 'idle' : syncState

  const doneCount = todos.filter((t) => t.implemented === 'yes').length
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0
  const prio = {
    high: todos.filter((t) => t.priority === 'high').length,
    medium: todos.filter((t) => t.priority === 'medium').length,
    low: todos.filter((t) => t.priority === 'low').length,
  }

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = todos.filter((t) => {
      if (implFilter === 'yes' && t.implemented !== 'yes') return false
      if (implFilter === 'no' && t.implemented === 'yes') return false
      if (prioFilter !== 'all' && t.priority !== prioFilter) return false
      if (needle) {
        const hay = [t.title, t.tech, t.notes, t.domain, t.repo].join(' ').toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      const ai = a.implemented === 'yes' ? 1 : 0
      const bi = b.implemented === 'yes' ? 1 : 0
      if (ai !== bi) return ai - bi // implemented sink to the bottom
      if (sort === 'priority') return prank(a.priority) - prank(b.priority)
      return (b.createdAt || '').localeCompare(a.createdAt || '')
    })
    return list
  }, [todos, q, implFilter, prioFilter, sort])

  return (
    <div>
      {/* 1 · summary strip */}
      <div className="mb-5 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md md:flex-row md:items-center">
        <div className="md:w-60 md:shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="bg-gradient-to-r from-accent-green to-accent-cyan bg-clip-text font-display text-[32px] font-black leading-none text-transparent [filter:drop-shadow(0_0_14px_rgba(52,211,153,0.35))]">
              {pct}%
            </span>
            <span className="text-[13px] text-faint">
              built · {doneCount}/{todos.length}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-cyan transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="grid flex-1 grid-cols-4 gap-3">
          <Tile label="Ideas" value={todos.length} rgb="148,163,184" />
          <Tile label="High" value={prio.high} rgb="251,113,133" />
          <Tile label="Medium" value={prio.medium} rgb="250,204,21" />
          <Tile label="Low" value={prio.low} rgb="148,163,184" />
        </div>
      </div>

      {/* 2 · toolbar: search + filters + sort + actions */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path d="m14 14 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ideas…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-[13.5px] text-ink outline-none transition placeholder:text-faint focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
          />
        </div>
        <FilterGroup
          value={implFilter}
          onChange={(v) => setImplFilter(v as typeof implFilter)}
          options={[
            ['all', 'All'],
            ['no', 'To build'],
            ['yes', 'Built'],
          ]}
        />
        <FilterGroup
          value={prioFilter}
          onChange={(v) => setPrioFilter(v as typeof prioFilter)}
          options={[
            ['all', 'Any'],
            ['high', 'High'],
            ['medium', 'Med'],
            ['low', 'Low'],
          ]}
        />
        <FilterGroup
          value={sort}
          onChange={(v) => setSort(v as typeof sort)}
          options={[
            ['priority', 'By priority'],
            ['newest', 'Newest'],
          ]}
        />
        <div className="ml-auto flex items-center gap-3">
          <SyncBadge state={badgeState} onManual={syncNow} />
          <button
            onClick={tokenOn ? syncNow : exportTodos}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12.5px] font-semibold text-subtle transition hover:text-ink"
            title={tokenOn ? 'Commit your ideas to GitHub now' : 'Download a backup (todo.json), or enable auto-sync in ⚙.'}
          >
            {tokenOn ? '⬆ Save now' : '⬇ Back up'}
          </button>
          <button onClick={add} className={primaryBtn}>
            + New idea
          </button>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-16 text-center backdrop-blur-sm">
          <p className="text-[15px] font-semibold text-ink">No ideas yet</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] text-subtle">
            Jot down a project you want to build — set a domain, priority, a target date, and mark it built once it ships.
          </p>
          <button onClick={add} className={`mt-4 ${primaryBtn}`}>
            + Add your first idea
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] shadow-card backdrop-blur-md">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[12px] font-bold uppercase tracking-wide text-faint">
                <Th className="w-[34%] pl-5">Idea</Th>
                <Th>Domain</Th>
                <Th>Priority</Th>
                <Th>Built?</Th>
                <Th>Target</Th>
                <Th className="pr-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <Row key={t.id} todo={t} update={update} remove={remove} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-center text-[13.5px] text-faint">
        {tokenOn
          ? 'Auto-syncing to GitHub as you edit.'
          : 'Saved in this browser · enable auto-sync in ⚙, or Back up + commit todo.json.'}
      </p>
    </div>
  )
}

function Tile({ label, value, rgb }: { label: string; value: number; rgb: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-center">
      <div className="font-display text-[22px] font-bold leading-none" style={{ color: `rgb(${rgb})`, textShadow: `0 0 16px rgba(${rgb},0.4)` }}>
        {value}
      </div>
      <div className="mt-1.5 text-[12px] font-semibold uppercase tracking-wide text-faint">{label}</div>
    </div>
  )
}

function FilterGroup({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition ${
            value === v ? 'bg-white/10 text-ink' : 'text-subtle hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Row({
  todo,
  update,
  remove,
}: {
  todo: Todo
  update: (id: string, patch: Partial<Todo>) => void
  remove: (id: string) => void
}) {
  const built = todo.implemented === 'yes'
  const overdue = !!todo.target && !built && todo.target < todayStr
  const rowTint = built ? 'opacity-55' : ''

  return (
    <>
      {/* main row: idea, domain, priority, built, target */}
      <tr className={`align-top hover:bg-white/[0.03] ${rowTint}`}>
        <td className="py-3 pl-5 pr-2">
          <div className="flex items-center gap-1.5">
            <input
              value={todo.title}
              onChange={(e) => update(todo.id, { title: e.target.value })}
              placeholder="What do you want to build?"
              className={`w-full bg-transparent text-[14.5px] font-semibold text-ink placeholder:font-normal placeholder:text-faint focus:outline-none ${built ? 'line-through' : ''}`}
            />
            {todo.repo && (
              <a
                href={`https://github.com/${OWNER}/${todo.repo}`}
                target="_blank"
                rel="noreferrer"
                title={`Open ${todo.repo} on GitHub`}
                className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-semibold text-accent-cyan ring-1 ring-white/10 transition hover:bg-white/10"
              >
                ↗ repo
              </a>
            )}
          </div>
          <input
            value={todo.repo ?? ''}
            onChange={(e) => update(todo.id, { repo: e.target.value })}
            placeholder="+ link built repo (name)"
            className="mt-1 w-full rounded bg-transparent px-0 text-[12.5px] text-faint outline-none placeholder:text-faint/60 focus:text-subtle"
          />
        </td>
        <td className="px-2 py-3">
          <DomainSelect value={todo.domain} onChange={(v) => update(todo.id, { domain: v })} />
        </td>
        <td className="px-2 py-3">
          <Select value={todo.priority} options={PRIORITY} onChange={(v) => update(todo.id, { priority: v })} ariaLabel="Priority" placeholder="—" />
        </td>
        <td className="px-2 py-3">
          <Select value={todo.implemented} options={IMPLEMENTED} onChange={(v) => update(todo.id, { implemented: v })} ariaLabel="Built" placeholder="—" />
        </td>
        <td className="px-2 py-3">
          <input
            type="date"
            value={todo.target ?? ''}
            onChange={(e) => update(todo.id, { target: e.target.value })}
            className={`rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13.5px] outline-none transition [color-scheme:dark] hover:border-white/15 focus:border-accent-cyan ${
              overdue ? 'text-rose-300' : 'text-subtle'
            }`}
            title={overdue ? 'Overdue' : undefined}
          />
        </td>
        <td className="py-3 pr-3 text-right">
          <button
            onClick={() => remove(todo.id)}
            className="rounded-lg px-2 py-1 text-[13px] text-faint transition hover:bg-rose-500/15 hover:text-rose-300"
            title="Delete idea"
            aria-label="Delete idea"
          >
            ✕
          </button>
        </td>
      </tr>
      {/* detail row: full-width collapsible tech + notes, text wraps and stays visible */}
      <tr className={`border-b border-white/5 last:border-0 hover:bg-white/[0.03] ${rowTint}`}>
        <td colSpan={6} className="px-5 pb-4 pt-0">
          <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <Foldable
              icon="🧩"
              label="Proposed tech"
              value={todo.tech}
              onChange={(v) => update(todo.id, { tech: v })}
              placeholder="React, FastAPI, Postgres…"
            />
            <div className="border-t border-white/[0.06] pt-3">
              <Foldable
                icon="📝"
                label="Notes"
                value={todo.notes}
                onChange={(v) => update(todo.id, { notes: v })}
                placeholder="Jot notes, next steps, ideas…"
              />
            </div>
          </div>
        </td>
      </tr>
    </>
  )
}

// Collapsible free-text field. Mirrors the Projects-tab notes: soft-wrapping,
// auto-growing textarea so the whole entry is visible at once — no horizontal
// scroll. Starts open when it already has content, so empty ideas stay compact.
function Foldable({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: string
  label: string
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(!!value)
  const ref = useRef<HTMLTextAreaElement>(null)

  const grow = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
  useLayoutEffect(() => {
    if (open) grow()
  }, [open, value])

  const words = value?.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-accent-cyan transition hover:text-accent-blue"
        aria-expanded={open}
      >
        <span>
          {icon} {label}
          {!open && words ? ` · ${words}w` : ''}
        </span>
        <span className="text-[11px]">{open ? '▲' : '▾'}</span>
      </button>
      {open && (
        <textarea
          ref={ref}
          value={value ?? ''}
          onChange={(e) => {
            onChange(e.target.value)
            grow()
          }}
          onInput={grow}
          placeholder={placeholder}
          rows={2}
          className="mt-2 block w-full resize-none overflow-hidden whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] leading-relaxed text-subtle outline-none transition focus:border-accent-cyan/50 focus:bg-white/[0.06]"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        />
      )}
    </div>
  )
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-2 py-3 font-bold ${className}`}>{children}</th>
}
