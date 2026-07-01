import type { Project } from '../data/types'
import type { Tracker } from '../lib/store'
import { DROPDOWNS } from '../lib/dropdowns'
import Pill from './Pill'
import TechStack from './TechStack'

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
          <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-subtle">
            {project.description || 'No description on GitHub yet.'}
          </p>
        </div>
        {project.stars > 0 && (
          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11.5px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
            ★ {project.stars}
          </span>
        )}
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
