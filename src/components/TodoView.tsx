import type { Tone } from '../lib/dropdowns'
import Select from './Select'
import { useTodos } from '../lib/todos'
import type { Todo } from '../lib/todos'

interface Opt {
  value: string
  label: string
  tone: Tone
}

const IMPLEMENTED: Opt[] = [
  { value: 'yes', label: 'Yes', tone: 'green' },
  { value: 'no', label: 'No', tone: 'red' },
]
const PRIORITY: Opt[] = [
  { value: 'high', label: 'High', tone: 'red' },
  { value: 'medium', label: 'Medium', tone: 'yellow' },
  { value: 'low', label: 'Low', tone: 'neutral' },
]

const primaryBtn =
  'rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue px-4 py-2 text-[12.5px] font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-pop'

export default function TodoView() {
  const { todos, add, update, remove, exportTodos } = useTodos()
  const doneCount = todos.filter((t) => t.implemented === 'yes').length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12.5px]">
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 font-semibold text-ink ring-1 ring-white/10">
            {todos.length} ideas
          </span>
          {todos.length > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              {doneCount} implemented
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportTodos}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12.5px] font-semibold text-subtle transition hover:text-ink"
            title="Your ideas auto-save in this browser. Click to download a backup (todo.json) you can commit to keep them permanently / sync across devices."
          >
            ⬇ Back up
          </button>
          <button onClick={add} className={primaryBtn}>
            + New idea
          </button>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-16 text-center backdrop-blur-sm">
          <p className="text-[15px] font-semibold text-ink">No ideas yet</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] text-subtle">
            Jot down a project you want to build — mark whether it&apos;s implemented, set a priority, and note the
            tech you&apos;d reach for.
          </p>
          <button onClick={add} className={`mt-4 ${primaryBtn}`}>
            + Add your first idea
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] shadow-card backdrop-blur-md">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[10.5px] font-bold uppercase tracking-wide text-faint">
                <Th className="w-[26%] pl-5">Idea</Th>
                <Th>Implemented</Th>
                <Th>Priority</Th>
                <Th className="w-[13%]">Domain</Th>
                <Th className="w-[20%]">Proposed tech</Th>
                <Th className="w-[18%]">Notes</Th>
                <Th className="pr-3" />
              </tr>
            </thead>
            <tbody>
              {todos.map((t) => (
                <Row key={t.id} todo={t} update={update} remove={remove} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-center text-[11.5px] text-faint">
        Saved in this browser · <b>Export</b> and commit <code>todo.json</code> to keep them / sync across devices.
      </p>
    </div>
  )
}

function Row({
  todo,
  update,
  remove,
}: {
  todo: Todo
  update: (id: string, patch: Partial<Todo>) => void
  remove: (id: string) => void
}) {
  return (
    <tr className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.03]">
      <td className="py-3 pl-5 pr-2">
        <input
          value={todo.title}
          onChange={(e) => update(todo.id, { title: e.target.value })}
          placeholder="What do you want to build?"
          className="w-full bg-transparent text-[13.5px] font-semibold text-ink placeholder:font-normal placeholder:text-faint focus:outline-none"
        />
      </td>
      <td className="px-2 py-3">
        <Select value={todo.implemented} options={IMPLEMENTED} onChange={(v) => update(todo.id, { implemented: v })} ariaLabel="Implemented" placeholder="—" />
      </td>
      <td className="px-2 py-3">
        <Select value={todo.priority} options={PRIORITY} onChange={(v) => update(todo.id, { priority: v })} ariaLabel="Priority" placeholder="—" />
      </td>
      <td className="px-2 py-3">
        <CellInput value={todo.domain} onChange={(v) => update(todo.id, { domain: v })} placeholder="e.g. Agentic" />
      </td>
      <td className="px-2 py-3">
        <CellInput value={todo.tech} onChange={(v) => update(todo.id, { tech: v })} placeholder="React, FastAPI…" />
      </td>
      <td className="px-2 py-3">
        <CellInput value={todo.notes} onChange={(v) => update(todo.id, { notes: v })} placeholder="—" />
      </td>
      <td className="py-3 pr-3 text-right">
        <button
          onClick={() => remove(todo.id)}
          className="rounded-lg px-2 py-1 text-[13px] text-faint transition hover:bg-rose-500/15 hover:text-rose-300"
          title="Delete idea"
          aria-label="Delete idea"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-2 py-3 font-bold ${className}`}>{children}</th>
}

function CellInput({
  value,
  onChange,
  placeholder,
}: {
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[12.5px] text-subtle transition placeholder:text-faint/70 hover:border-white/15 focus:border-accent-cyan focus:bg-white/5 focus:text-ink focus:outline-none"
    />
  )
}
