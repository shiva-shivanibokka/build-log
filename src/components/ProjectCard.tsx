import { useLayoutEffect, useRef, useState } from 'react'
import type { Project } from '../data/types'
import type { Tracker } from '../lib/store'
import { DROPDOWNS } from '../lib/dropdowns'
import Pill from './Pill'
import TechStack from './TechStack'

function ago(iso: string): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86_400_000
  if (diff < day) return 'today'
  const days = Math.floor(diff / day)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

// Description with a real "more / less" toggle when the text overflows 3 lines.
function Description({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 2)
  }, [text])

  return (
    <div className="mt-1">
      <p ref={ref} className={`text-[13px] leading-relaxed text-subtle ${expanded ? '' : 'line-clamp-3'}`}>
        {text}
      </p>
      {overflowing && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-0.5 text-[11.5px] font-semibold text-accent-cyan transition hover:text-accent-blue"
        >
          {expanded ? 'less ▲' : 'more ▾'}
        </button>
      )}
    </div>
  )
}

export default function ProjectCard({ project, tracker }: { project: Project; tracker: Tracker }) {
  return (
    <article className="group/card flex animate-fade-up flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-md transition hover:-translate-y-0.5 hover:border-accent-cyan/40 hover:shadow-pop">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-[16px] font-bold text-ink transition hover:text-accent-cyan"
          >
            <span className="truncate">{project.name}</span>
            <span className="opacity-0 transition group-hover:opacity-100">↗</span>
          </a>
          <Description text={project.description || 'No description on GitHub yet.'} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {project.stars > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11.5px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
              ★ {project.stars}
            </span>
          )}
          {project.pushedAt && <span className="font-mono text-[10px] text-faint">{ago(project.pushedAt)}</span>}
        </div>
      </header>

      <TechStack tech={project.tech} />

      <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-4">
        {DROPDOWNS.map((def) => (
          <Pill
            key={def.key}
            def={def}
            value={tracker.get(project.repo, def.key)}
            onChange={(v) => tracker.set(project.repo, def.key, v)}
          />
        ))}
      </div>
    </article>
  )
}
