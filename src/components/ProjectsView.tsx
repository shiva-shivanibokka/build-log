import { useMemo, useState } from 'react'
import type { Tracker } from '../lib/store'
import { DROPDOWNS, optionFor, toneDot } from '../lib/dropdowns'
import { domainsFor, DOMAIN_COLOR } from '../lib/domains'
import ProjectCard from './ProjectCard'
import StatStrip from './StatStrip'

const STATUS_DEF = DROPDOWNS.find((d) => d.key === 'status')!

type SortKey = 'recent' | 'name'

export default function ProjectsView({ tracker }: { tracker: Tracker }) {
  const { projects, get } = tracker
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
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

  // each project's domains (multi-label) + counts for the filter
  const domainsOf = useMemo(() => {
    const m: Record<string, string[]> = {}
    for (const p of projects) m[p.repo] = domainsFor(p.tech)
    return m
  }, [projects])

  const domains = useMemo(() => {
    const c: Record<string, number> = {}
    for (const p of projects) for (const d of domainsOf[p.repo]) c[d] = (c[d] || 0) + 1
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [projects, domainsOf])

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = projects.filter((p) => {
      if (statusFilter !== 'all') {
        const v = get(p.repo, 'status')
        if (statusFilter === 'unset' ? v != null : v !== statusFilter) return false
      }
      if (domainFilter !== 'all' && !domainsOf[p.repo].includes(domainFilter)) return false
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
  }, [projects, q, statusFilter, domainFilter, domainsOf, sort, get])

  return (
    <div>
      <StatStrip total={projects.length} counts={counts} />

      {/* status filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[12px] font-bold uppercase tracking-wide text-faint">Status</span>
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
            dot={toneDot[o.tone]}
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

      {/* domain filter (colours match each card's stripe/title) */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[12px] font-bold uppercase tracking-wide text-faint">Domain</span>
        <DomainChip active={domainFilter === 'all'} label="All" count={projects.length} rgb="148,163,184" onClick={() => setDomainFilter('all')} />
        {domains.map(([d, n]) => (
          <DomainChip
            key={d}
            active={domainFilter === d}
            label={d}
            count={n}
            rgb={DOMAIN_COLOR[d] ?? '148,163,184'}
            onClick={() => setDomainFilter(d)}
          />
        ))}
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

      <p className="mt-6 text-center text-[13px] text-faint">
        Showing {visible.length} of {projects.length} repos
        {statusFilter !== 'all' && <> · {optionFor(STATUS_DEF, statusFilter)?.label ?? 'Unset'}</>}
        {domainFilter !== 'all' && <> · {domainFilter}</>}
      </p>
    </div>
  )
}

function DomainChip({
  active,
  label,
  count,
  rgb,
  onClick,
}: {
  active: boolean
  label: string
  count?: number
  rgb: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-semibold transition ${
        active ? 'text-ink' : 'border-white/10 bg-white/[0.03] text-subtle hover:border-white/25 hover:text-ink'
      }`}
      style={
        active
          ? { borderColor: `rgba(${rgb},0.55)`, background: `rgba(${rgb},0.15)`, boxShadow: `0 0 14px rgba(${rgb},0.18)` }
          : undefined
      }
    >
      <span className="h-2 w-2 rounded-full" style={{ background: `rgb(${rgb})`, boxShadow: `0 0 8px rgba(${rgb},0.7)` }} />
      {label}
      {count != null && <span className="tabular-nums opacity-70">{count}</span>}
    </button>
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
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
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
