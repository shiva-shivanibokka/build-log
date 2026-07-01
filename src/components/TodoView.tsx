import type { Tone } from '../lib/dropdowns'
import { toneClasses, toneDot } from '../lib/dropdowns'
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

export default function TodoView() {
  const { todos, add, update, remove, exportTodos } = useTodos()
  const doneCount = todos.filter((t) => t.implemented === 'yes').length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12.5px] text-subtle">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-ink">{todos.length} ideas</span>
          {todos.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
              {doneCount} implemented
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportTodos}
            className="rounded-xl border border-line bg-card px-3.5 py-2 text-[12.5px] font-semibold text-subtle shadow-sm transition hover:text-ink"
            title="Download todo.json and commit it to persist across devices"
          >
            ⬇ Export
          </button>
          <button
            onClick={add}
            className="rounded-xl bg-ink px-4 py-2 text-[12.5px] font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            + New idea
          </button>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card/60 px-6 py-16 text-center">
          <p className="text-[15px] font-semibold text-ink">No ideas yet</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] text-subtle">
            Jot down a project you want to build — mark whether it&apos;s implemented, set a priority, and note the
            tech you&apos;d reach for.
          </p>
          <button
            onClick={add}
            className="mt-4 rounded-xl bg-ink px-4 py-2 text-[12.5px] font-semibold text-white shadow-card transition hover:-translate-y-0.5"
          >
            + Add your first idea
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-card">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wide text-faint">
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
    <tr className="border-b border-line/70 align-top last:border-0 hover:bg-canvas/60">
      <td className="py-3 pl-5 pr-2">
        <input
          value={todo.title}
          onChange={(e) => update(todo.id, { title: e.target.value })}
          placeholder="What do you want to build?"
          className="w-full bg-transparent text-[13.5px] font-semibold text-ink placeholder:font-normal placeholder:text-faint focus:outline-none"
        />
      </td>
      <td className="px-2 py-3">
        <ColorSelect value={todo.implemented} options={IMPLEMENTED} onChange={(v) => update(todo.id, { implemented: v })} />
      </td>
      <td className="px-2 py-3">
        <ColorSelect value={todo.priority} options={PRIORITY} onChange={(v) => update(todo.id, { priority: v })} />
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
          className="rounded-lg px-2 py-1 text-[13px] text-faint transition hover:bg-rose-50 hover:text-rose-600"
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
      className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[12.5px] text-subtle transition placeholder:text-faint/70 hover:border-line focus:border-accent-purple focus:bg-white focus:text-ink focus:outline-none"
    />
  )
}

function ColorSelect({
  value,
  options,
  onChange,
}: {
  value: string | undefined
  options: Opt[]
  onChange: (v: string | undefined) => void
}) {
  const tone = options.find((o) => o.value === value)?.tone ?? 'neutral'
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${toneClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${toneDot[tone]}`} />
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="cursor-pointer appearance-none bg-transparent pr-3 font-semibold focus:outline-none"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-1.5 h-2.5 w-2.5 opacity-60" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
