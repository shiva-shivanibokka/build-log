import { useMemo, useState } from 'react'
import type { Tracker } from '../lib/store'
import { DROPDOWNS, optionFor } from '../lib/dropdowns'
import ProjectCard from './ProjectCard'

const STATUS_DEF = DROPDOWNS.find((d) => d.key === 'status')!

type SortKey = 'recent' | 'name'

export default function ProjectsView({ tracker }: { tracker: Tracker }) {
  const { projects, get } = tracker
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('recent')

  // counts per status value (+ "unset") for the summary chips
  const counts = useMemo(() => {
    const c: Record<string, number> = { unset: 0 }
    for (const o of STATUS_DEF.options) c[o.value] = 0
    for (const p of projects) {
      const v = get(p.repo, 'status')
      c[v ?? 'unset'] = (c[v ?? 'unset'] ?? 0) + 1
    }
    return c
  }, [projects, get])

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = projects.filter((p) => {
      if (statusFilter !== 'all') {
        const v = get(p.repo, 'status')
        if (statusFilter === 'unset' ? v != null : v !== statusFilter) return false
      }
      if (!needle) return true
      const hay = [p.name, p.repo, p.description, ...Object.values(p.tech || {}).flat()]
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
    list = [...list].sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : (b.pushedAt || '').localeCompare(a.pushedAt || ''),
    )
    return list
  }, [projects, q, statusFilter, sort, get])

  return (
    <div>
      {/* summary chips */}
      <div className="flex flex-wrap gap-2">
        <Chip
          active={statusFilter === 'all'}
          label="All"
          count={projects.length}
          dot="bg-slate-400"
          onClick={() => setStatusFilter('all')}
        />
        {STATUS_DEF.options.map((o) => (
          <Chip
            key={o.value}
            active={statusFilter === o.value}
            label={o.label}
            count={counts[o.value] ?? 0}
            dot={
              o.tone === 'green'
                ? 'bg-emerald-500'
                : o.tone === 'purple'
                  ? 'bg-purple-500'
                  : o.tone === 'yellow'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
            }
            onClick={() => setStatusFilter(o.value)}
          />
        ))}
        <Chip
          active={statusFilter === 'unset'}
          label="Unset"
          count={counts.unset ?? 0}
          dot="bg-slate-300"
          onClick={() => setStatusFilter('unset')}
        />
      </div>

      {/* search + sort */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path d="m14 14 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, description, or tech…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[13.5px] text-ink outline-none transition placeholder:text-faint focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(['recent', 'name'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${
                sort === s ? 'bg-white/10 text-ink' : 'text-subtle hover:text-ink'
              }`}
            >
              {s === 'recent' ? 'Recently pushed' : 'A → Z'}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {visible.length === 0 ? (
        <p className="mt-12 text-center text-[14px] text-faint">No projects match.</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <ProjectCard key={p.repo} project={p} tracker={tracker} />
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-[12px] text-faint">
        Showing {visible.length} of {projects.length} repos
        {statusFilter !== 'all' && (
          <> · filtered by {optionFor(STATUS_DEF, statusFilter)?.label ?? 'Unset'}</>
        )}
      </p>
    </div>
  )
}

function Chip({
  active,
  label,
  count,
  dot,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  dot: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition ${
        active
          ? 'border-accent-cyan/50 bg-accent-cyan/15 text-ink shadow-[0_0_16px_rgba(34,211,238,0.2)]'
          : 'border-white/10 bg-white/[0.03] text-subtle hover:border-white/25 hover:text-ink'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
      <span className={`tabular-nums ${active ? 'text-ink/70' : 'text-faint'}`}>{count}</span>
    </button>
  )
}
