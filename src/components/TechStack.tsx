import { Fragment } from 'react'
import type { Project } from '../data/types'

// Preferred display order; anything else falls to the end alphabetically.
const ORDER = ['Frontend', 'Backend', 'Database', 'ML / AI', 'Data', 'DevOps', 'Cloud', 'Mobile', 'Language', 'Other']

const CAT_STYLE: Record<string, string> = {
  Frontend: 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
  Backend: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/25',
  Database: 'bg-teal-500/10 text-teal-300 ring-teal-500/25',
  'ML / AI': 'bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-500/25',
  Data: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  DevOps: 'bg-orange-500/10 text-orange-300 ring-orange-500/25',
  Cloud: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/25',
  Mobile: 'bg-rose-500/10 text-rose-300 ring-rose-500/25',
  Language: 'bg-white/[0.05] text-slate-300 ring-white/10',
  Other: 'bg-white/[0.05] text-slate-300 ring-white/10',
}

export default function TechStack({ tech }: { tech: Project['tech'] }) {
  const cats = Object.keys(tech || {})
    .filter((c) => (tech[c] || []).length > 0)
    .sort((a, b) => {
      const ia = ORDER.indexOf(a)
      const ib = ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
    })

  if (cats.length === 0) {
    return <p className="text-[12.5px] italic text-faint">No tech detected yet — will fill in on next sync.</p>
  }

  // Two aligned columns: category label (top-aligned) | its tags (wrap freely).
  return (
    <div className="grid grid-cols-[86px_1fr] items-start gap-x-3 gap-y-2">
      {cats.map((cat) => (
        <Fragment key={cat}>
          <span className="pt-1 text-[12px] font-bold uppercase leading-tight tracking-wide text-faint">
            {cat}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tech[cat].map((t) => (
              <span
                key={t}
                className={`rounded-md px-2 py-0.5 text-[12.5px] font-medium ring-1 ${
                  CAT_STYLE[cat] || CAT_STYLE.Other
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
