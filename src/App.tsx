import { useState } from 'react'
import { useTracker } from './lib/store'
import { hasToken } from './lib/github'
import ProjectsView from './components/ProjectsView'
import TodoView from './components/TodoView'
import CircuitBackground from './components/CircuitBackground'
import SettingsModal, { SyncBadge } from './components/SettingsModal'

type Tab = 'projects' | 'todo'

export default function App() {
  const tracker = useTracker()
  const [tab, setTab] = useState<Tab>('projects')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tokenOn, setTokenOn] = useState(hasToken())

  const synced = tracker.generatedAt
    ? new Date(tracker.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  // reflect "auto-sync on" as soon as a token exists, before the first commit
  const badgeState = tracker.syncState === 'off' && tokenOn ? 'idle' : tracker.syncState

  return (
    <div className="min-h-screen">
      <CircuitBackground />

      <header className="mx-auto max-w-7xl px-5 pt-9 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="inline-block bg-gradient-to-r from-accent-purple via-accent-blue to-accent-green bg-clip-text pb-1.5 font-display text-[clamp(26px,4vw,44px)] font-black leading-[1.2] tracking-wide text-transparent [filter:drop-shadow(0_0_18px_rgba(129,140,248,0.45))]">
              Build Log <span className="[-webkit-text-fill-color:initial] [filter:none]">🚀</span>
            </h1>
            <p className="mt-1.5 font-mono text-[13px] tracking-wide text-accent-cyan/80">Build. Ship. Log.</p>
          </div>

          <div className="flex items-center gap-3">
            {tab === 'projects' && (
              <div className="text-right text-[11.5px] leading-tight text-faint">
                {synced ? <>Synced {synced}</> : 'Loading…'}
                <br />
                <span className="text-faint/80">{tracker.projects.length || ''} repos</span>
              </div>
            )}
            {tab === 'projects' && <SyncBadge state={badgeState} onManual={tracker.syncNow} />}
            <button
              onClick={() => setSettingsOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-[15px] text-subtle transition hover:border-white/25 hover:text-ink"
              title="Auto-sync settings"
              aria-label="Settings"
            >
              ⚙
            </button>
            {tab === 'projects' && (
              <button
                onClick={tokenOn ? tracker.syncNow : tracker.exportOverrides}
                className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue px-4 py-2.5 text-[13px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-pop"
                title={
                  tokenOn
                    ? 'Commit your changes to GitHub now'
                    : 'Your picks auto-save in this browser. Download a backup you can commit — or enable auto-sync in ⚙ settings.'
                }
              >
                {tokenOn ? '⬆ Save now' : '⬇ Back up'}
                {tracker.dirtyCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-pink px-1 text-[10.5px] font-bold text-white">
                    {tracker.dirtyCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* tabs — segmented pill control */}
        <nav className="mt-7 inline-flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md">
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
                  {tokenOn
                    ? 'auto-saving to GitHub…'
                    : 'saved in this browser. Enable auto-sync in ⚙, or Back up + commit to keep them / see them on other devices.'}
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
          <TodoView tokenOn={tokenOn} />
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-5 pb-10 pt-4 text-center text-[11.5px] text-faint sm:px-8">
        {tab === 'projects'
          ? 'New repo on GitHub? It appears here automatically on the next sync (each deploy, weekly, or a manual run).'
          : 'Project ideas you want to build.'}
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onChange={() => setTokenOn(hasToken())} />
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
      className={`rounded-xl px-7 py-2.5 font-display text-[15px] font-bold transition ${
        active
          ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-glow'
          : 'text-subtle hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
