import type { Project } from '../data/types'

// Preferred display order; anything else falls to the end alphabetically.
const ORDER = ['Frontend', 'Backend', 'Database', 'ML / AI', 'Data', 'DevOps', 'Cloud', 'Mobile', 'Language', 'Other']

const CAT_STYLE: Record<string, string> = {
  Frontend: 'bg-sky-50 text-sky-700 ring-sky-200',
  Backend: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Database: 'bg-teal-50 text-teal-700 ring-teal-200',
  'ML / AI': 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
  Data: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  DevOps: 'bg-orange-50 text-orange-700 ring-orange-200',
  Cloud: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  Mobile: 'bg-rose-50 text-rose-700 ring-rose-200',
  Language: 'bg-slate-50 text-slate-600 ring-slate-200',
  Other: 'bg-slate-50 text-slate-600 ring-slate-200',
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

  return (
    <div className="flex flex-col gap-2">
      {cats.map((cat) => (
        <div key={cat} className="flex flex-wrap items-center gap-1.5">
          <span className="w-[72px] shrink-0 text-[10.5px] font-bold uppercase tracking-wide text-faint">
            {cat}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tech[cat].map((t) => (
              <span
                key={t}
                className={`rounded-md px-1.5 py-0.5 text-[11.5px] font-medium ring-1 ${
                  CAT_STYLE[cat] || CAT_STYLE.Other
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
