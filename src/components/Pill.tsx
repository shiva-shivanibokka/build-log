import type { DropdownDef } from '../lib/dropdowns'
import { toneClasses, toneDot, toneFor } from '../lib/dropdowns'

// A single colored dropdown. Native <select> under the hood (accessible,
// keyboard-friendly) styled to look like a status pill that recolors live.
export default function Pill({
  def,
  value,
  onChange,
}: {
  def: DropdownDef
  value: string | undefined
  onChange: (value: string | undefined) => void
}) {
  const tone = toneFor(def, value)
  return (
    <label className="flex flex-col gap-1">
      <span className="px-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-faint">
        {def.label}
      </span>
      <span
        className={`group relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold ring-1 transition ${toneClasses[tone]}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot[tone]}`} />
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="cursor-pointer appearance-none bg-transparent pr-3 font-semibold focus:outline-none"
          aria-label={def.label}
        >
          <option value="">—</option>
          {def.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2 h-3 w-3 opacity-60"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  )
}
