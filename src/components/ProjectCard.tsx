import type { Project } from '../data/types'
import type { Tracker } from '../lib/store'
import { DROPDOWNS } from '../lib/dropdowns'
import Pill from './Pill'
import TechStack from './TechStack'

export default function ProjectCard({ project, tracker }: { project: Project; tracker: Tracker }) {
  return (
    <article className="flex animate-fade-up flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-[16px] font-bold text-ink hover:text-accent-purple"
          >
            <span className="truncate">{project.name}</span>
            <span className="opacity-0 transition group-hover:opacity-100">↗</span>
          </a>
          <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-subtle">
            {project.description || 'No description on GitHub yet.'}
          </p>
        </div>
        {project.stars > 0 && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11.5px] font-semibold text-amber-600 ring-1 ring-amber-200">
            ★ {project.stars}
          </span>
        )}
      </header>

      <TechStack tech={project.tech} />

      <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-line pt-4 sm:grid-cols-4">
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
