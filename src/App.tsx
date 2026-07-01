import { useState } from 'react'
import { useTracker } from './lib/store'
import ProjectsView from './components/ProjectsView'
import TodoView from './components/TodoView'
import CircuitBackground from './components/CircuitBackground'

type Tab = 'projects' | 'todo'

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
      <CircuitBackground />

      <header className="mx-auto max-w-7xl px-5 pt-9 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="inline-block bg-gradient-to-r from-accent-purple via-accent-blue to-accent-green bg-clip-text pb-1.5 font-display text-[clamp(26px,4vw,44px)] font-black leading-[1.2] tracking-wide text-transparent [filter:drop-shadow(0_0_18px_rgba(129,140,248,0.45))]">
              Build Log{' '}
              <span className="[-webkit-text-fill-color:initial] [filter:none]">🚀</span>
            </h1>
            <p className="mt-1.5 font-mono text-[13px] tracking-wide text-accent-cyan/80">Build. Ship. Log.</p>
          </div>

          <div className="flex items-center gap-3">
            {tab === 'projects' && (
              <>
                <div className="text-right text-[11.5px] leading-tight text-faint">
                  {synced ? <>Synced {synced}</> : 'Loading…'}
                  <br />
                  <span className="text-faint/80">{tracker.projects.length || ''} repos</span>
                </div>
                <button
                  onClick={tracker.exportOverrides}
                  className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue px-4 py-2.5 text-[13px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-pop"
                  title="Your dropdown picks auto-save in this browser. Click to download a backup (overrides.json) you can commit to the repo so they're permanent and show on other devices."
                >
                  ⬇ Back up
                  {tracker.dirtyCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-pink px-1 text-[10.5px] font-bold text-white">
                      {tracker.dirtyCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* tabs */}
        <nav className="mt-6 flex items-center gap-1 border-b border-white/10">
          <TabButton active={tab === 'projects'} onClick={() => setTab('projects')}>
            Projects
          </TabButton>
          <TabButton active={tab === 'todo'} onClick={() => setTab('todo')}>
            To Do
          </TabButton>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
        {tab === 'projects' ? (
          <>
            {tracker.dirtyCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-[12.5px] text-purple-200">
                <span className="font-semibold">
                  {tracker.dirtyCount} unsaved change{tracker.dirtyCount > 1 ? 's' : ''}
                </span>
                <span className="text-purple-200/70">
                  saved in this browser. Hit <b>Export</b> and commit the file to keep them permanently / see them on
                  other devices.
                </span>
              </div>
            )}

            {tracker.loading && <p className="py-20 text-center text-[14px] text-faint">Loading projects…</p>}

            {tracker.error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">
                Couldn’t load <code>projects.json</code> ({tracker.error}). Run <code>npm run sync</code> to generate it.
              </div>
            )}

            {!tracker.loading && !tracker.error && <ProjectsView tracker={tracker} />}
          </>
        ) : (
          <TodoView />
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-5 pb-10 pt-4 text-center text-[11.5px] text-faint sm:px-8">
        {tab === 'projects'
          ? 'New repo on GitHub? It appears here automatically on the next sync (each deploy, weekly, or a manual run).'
          : 'Ideas live only in your browser until you Export and commit todo.json.'}
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
        active ? 'border-accent-cyan text-ink' : 'border-transparent text-subtle hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
