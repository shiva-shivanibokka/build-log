import { useLayoutEffect, useRef, useState } from 'react'
import type { Project } from '../data/types'
import type { Tracker } from '../lib/store'
import { DROPDOWNS } from '../lib/dropdowns'
import { domainsFor, DOMAIN_COLOR } from '../lib/domains'
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

// Description with a real "more / less" toggle when it overflows 3 lines.
function Description({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 2)
  }, [text])

  return (
    <div className="mt-1.5">
      <p ref={ref} className={`text-[14px] leading-relaxed text-subtle ${expanded ? '' : 'line-clamp-3 min-h-[4.3rem]'}`}>
        {text}
      </p>
      {/* toggle row height is reserved on every card so collapsed cards stay even
          whether or not the description overflows */}
      <div className="mt-0.5 min-h-[1.1rem]">
        {overflowing && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[12px] font-semibold text-accent-cyan transition hover:text-accent-blue"
          >
            {expanded ? 'less ▲' : 'more ▾'}
          </button>
        )}
      </div>
    </div>
  )
}

// Collapsible free-text notes. The textarea soft-wraps so text always stays
// within the card width, and auto-grows downward as you type. Starts open only
// when notes already exist, so empty cards stay compact.
function Notes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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

  return (
    <div className="border-t border-white/10 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-cyan transition hover:text-accent-blue"
        aria-expanded={open}
      >
        <span>📝 Notes{!open && value ? ` · ${value.trim().split(/\s+/).length}w` : ''}</span>
        <span className="text-[11px]">{open ? '▲' : '▾'}</span>
      </button>
      {open && (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            grow()
          }}
          onInput={grow}
          placeholder="Jot notes, next steps, ideas…"
          rows={2}
          className="mt-2 block w-full resize-none overflow-hidden whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] leading-relaxed text-subtle outline-none transition focus:border-accent-cyan/50 focus:bg-white/[0.06]"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        />
      )}
    </div>
  )
}

// Collapsible tech-stack section. Collapsed by default so every card starts at
// the same height (the tech grid is the biggest source of height variance);
// expanding it grows only this card because the grid uses items-start.
function TechSection({ tech }: { tech: Project['tech'] }) {
  const count = Object.values(tech || {}).flat().length
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-white/10 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-cyan transition hover:text-accent-blue"
        aria-expanded={open}
      >
        <span>🧩 Tech stack{count ? ` · ${count}` : ''}</span>
        <span className="text-[11px]">{open ? '▲' : '▾'}</span>
      </button>
      {open && (
        <div className="mt-2.5">
          <TechStack tech={tech} />
        </div>
      )}
    </div>
  )
}

export default function ProjectCard({ project, tracker }: { project: Project; tracker: Tracker }) {
  const domains = domainsFor(project.tech)
  const rgb = DOMAIN_COLOR[domains[0]] ?? DOMAIN_COLOR.Other
  const badges = domains.filter((d) => d !== 'Other')

  return (
    <article className="group/card relative flex animate-fade-up flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 pt-6 shadow-card backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-pop">
      {/* primary-domain accent stripe */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, rgba(${rgb},0.95), rgba(${rgb},0.2) 55%, transparent)` }}
      />

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a href={project.url} target="_blank" rel="noreferrer" className="group inline-flex items-start gap-1.5">
            <span
              className="line-clamp-2 min-h-[2.6rem] font-display text-[15px] font-bold leading-snug"
              style={{
                backgroundImage: `linear-gradient(90deg, rgb(${rgb}), rgba(${rgb},0.55))`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {project.name}
            </span>
            <span className="mt-0.5 shrink-0 text-accent-cyan opacity-0 transition group-hover:opacity-100">↗</span>
          </a>
          {/* badges row height is reserved (min-h) so cards stay even even when a project has none */}
          <div className="mt-2 flex min-h-[1.25rem] flex-wrap gap-1.5">
            {badges.slice(0, 4).map((d) => (
              <span
                key={d}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `rgba(${DOMAIN_COLOR[d]},0.14)`,
                  color: `rgb(${DOMAIN_COLOR[d]})`,
                  boxShadow: `inset 0 0 0 1px rgba(${DOMAIN_COLOR[d]},0.3)`,
                }}
              >
                {d}
              </span>
            ))}
            {badges.length > 4 && <span className="px-1 text-[10px] font-semibold text-faint">+{badges.length - 4}</span>}
          </div>
          <Description text={project.description || 'No description on GitHub yet.'} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {project.stars > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11.5px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
              ★ {project.stars}
            </span>
          )}
          {project.pushedAt && <span className="font-mono text-[10.5px] text-faint">{ago(project.pushedAt)}</span>}
        </div>
      </header>

      <TechSection tech={project.tech} />

      <div className="grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-4">
        {DROPDOWNS.map((def) => (
          <Pill
            key={def.key}
            def={def}
            value={tracker.get(project.repo, def.key)}
            onChange={(v) => tracker.set(project.repo, def.key, v)}
          />
        ))}
      </div>

      <Notes
        value={tracker.get(project.repo, 'notes') || ''}
        onChange={(v) => tracker.set(project.repo, 'notes', v.trim() ? v : undefined)}
      />
    </article>
  )
}
