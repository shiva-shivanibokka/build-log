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
  green: 'bg-emerald-100 text-emerald-700 ring-emerald-200 hover:bg-emerald-200/70',
  red: 'bg-rose-100 text-rose-700 ring-rose-200 hover:bg-rose-200/70',
  yellow: 'bg-amber-100 text-amber-700 ring-amber-200 hover:bg-amber-200/70',
  purple: 'bg-purple-100 text-purple-700 ring-purple-200 hover:bg-purple-200/70',
  neutral: 'bg-slate-100 text-slate-500 ring-slate-200 hover:bg-slate-200/70',
}

export const toneDot: Record<Tone, string> = {
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
  yellow: 'bg-amber-500',
  purple: 'bg-purple-500',
  neutral: 'bg-slate-300',
}

export function optionFor(def: DropdownDef, value: string | undefined): Option | null {
  if (!value) return null
  return def.options.find((o) => o.value === value) ?? null
}

export function toneFor(def: DropdownDef, value: string | undefined): Tone {
  return optionFor(def, value)?.tone ?? 'neutral'
}
