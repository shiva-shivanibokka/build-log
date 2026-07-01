import type { DropdownDef } from '../lib/dropdowns'
import Select from './Select'

// A labeled status dropdown for a project card. The control itself is the custom
// themed <Select> (no native <select>).
export default function Pill({
  def,
  value,
  onChange,
}: {
  def: DropdownDef
  value: string | undefined
  onChange: (value: string | undefined) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="px-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-faint">
        {def.label}
      </span>
      <Select value={value} options={def.options} onChange={onChange} ariaLabel={def.label} placeholder="—" />
    </label>
  )
}
