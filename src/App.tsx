import { useState } from 'react'
import { useTracker } from './lib/store'
import ProjectsView from './components/ProjectsView'

type Tab = 'projects' | 'leetcode'

export default function App() {
  const tracker = useTracker()
  const [tab, setTab] = useState<Tab>('projects')

  const synced = tracker.generatedAt
    ? new Date(tracker.generatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-accent-purple via-accent-blue to-accent-green bg-clip-text text-[clamp(26px,4vw,40px)] font-extrabold leading-none tracking-tight text-transparent">
              Mission Control 🚀
            </h1>
            <p className="mt-2 text-[13.5px] text-subtle">
              Auto-synced from GitHub — descriptions & tech fill themselves; you just set the dropdowns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-[11.5px] leading-tight text-faint">
              {synced ? <>Synced {synced}</> : 'Loading…'}
              <br />
              <span className="text-faint/80">{tracker.projects.length || ''} repos</span>
            </div>
            <button
              onClick={tracker.exportOverrides}
              className="relative inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
              title="Download overrides.json, then commit it to the repo so your choices persist across devices"
            >
              ⬇ Export
              {tracker.dirtyCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-purple px-1 text-[10.5px] font-bold text-white">
                  {tracker.dirtyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* tabs */}
        <nav className="mt-6 flex items-center gap-1 border-b border-line">
          <TabButton active={tab === 'projects'} onClick={() => setTab('projects')}>
            Projects
          </TabButton>
          <button
            disabled
            className="cursor-not-allowed px-4 py-2.5 text-[14px] font-semibold text-faint/70"
            title="Coming next"
          >
            LeetCode <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-faint">soon</span>
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        {tracker.dirtyCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-[12.5px] text-purple-800">
            <span className="font-semibold">{tracker.dirtyCount} unsaved change{tracker.dirtyCount > 1 ? 's' : ''}</span>
            <span className="text-purple-700/80">
              saved in this browser. Hit <b>Export</b> and commit the file to keep them permanently / see them on other devices.
            </span>
          </div>
        )}

        {tracker.loading && <p className="py-20 text-center text-[14px] text-faint">Loading projects…</p>}

        {tracker.error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
            Couldn’t load <code>projects.json</code> ({tracker.error}). Run <code>npm run sync</code> to generate it.
          </div>
        )}

        {!tracker.loading && !tracker.error && tab === 'projects' && <ProjectsView tracker={tracker} />}
      </main>

      <footer className="mx-auto max-w-7xl px-5 pb-10 pt-4 text-center text-[11.5px] text-faint sm:px-8">
        New repo on GitHub? It appears here automatically on the next sync (each deploy, weekly, or a manual run).
      </footer>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2.5 text-[14px] font-semibold transition ${
        active ? 'border-accent-purple text-ink' : 'border-transparent text-subtle hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
