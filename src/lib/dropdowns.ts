import type { DropdownKey } from '../data/types'

export type Tone = 'green' | 'red' | 'yellow' | 'purple' | 'neutral'

export interface Option {
  value: string
  label: string
  tone: Tone
}

export interface DropdownDef {
  key: DropdownKey
  label: string
  options: Option[]
}

const YESNO: Option[] = [
  { value: 'yes', label: 'Yes', tone: 'green' },
  { value: 'no', label: 'No', tone: 'red' },
]

const PROGRESS: Option[] = [
  { value: 'done', label: 'Done', tone: 'green' },
  { value: 'in-progress', label: 'In-progress', tone: 'purple' },
  { value: 'pending', label: 'Pending', tone: 'yellow' },
  { value: 'yet-to-start', label: 'Yet to start', tone: 'red' },
]

// Order here is the order the pills render in each card.
export const DROPDOWNS: DropdownDef[] = [
  { key: 'status', label: 'Status', options: PROGRESS },
  { key: 'whatWhy', label: 'What & Why', options: PROGRESS },
  { key: 'github', label: 'GitHub', options: YESNO },
  { key: 'linkedin', label: 'LinkedIn', options: YESNO },
]

export const toneClasses: Record<Tone, string> = {
  green: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40 hover:bg-emerald-500/25',
  red: 'bg-rose-500/15 text-rose-300 ring-rose-500/40 hover:bg-rose-500/25',
  yellow: 'bg-amber-500/15 text-amber-300 ring-amber-500/40 hover:bg-amber-500/25',
  purple: 'bg-purple-500/20 text-purple-300 ring-purple-500/40 hover:bg-purple-500/30',
  neutral: 'bg-white/[0.06] text-slate-400 ring-white/10 hover:bg-white/10',
}

export const toneDot: Record<Tone, string> = {
  green: 'bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/70',
  red: 'bg-rose-400 shadow-[0_0_8px] shadow-rose-400/70',
  yellow: 'bg-amber-400 shadow-[0_0_8px] shadow-amber-400/70',
  purple: 'bg-purple-400 shadow-[0_0_8px] shadow-purple-400/70',
  neutral: 'bg-slate-500',
}

export function optionFor(def: DropdownDef, value: string | undefined): Option | null {
  if (!value) return null
  return def.options.find((o) => o.value === value) ?? null
}

export function toneFor(def: DropdownDef, value: string | undefined): Tone {
  return optionFor(def, value)?.tone ?? 'neutral'
}
