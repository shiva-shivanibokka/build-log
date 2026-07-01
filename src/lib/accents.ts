// Maps a project's dominant tech category to a visual accent used for the card's
// top stripe and its (colorful) title. Purely derived from the detected tech, so
// cards colour-code themselves with no manual tagging.
export interface Accent {
  rgb: string // for inline glow/stripe
  grad: string // tailwind gradient for the title text
}

export const CATEGORY_ACCENT: Record<string, Accent> = {
  'ML / AI': { rgb: '232,121,249', grad: 'from-fuchsia-300 to-pink-400' },
  Frontend: { rgb: '56,189,248', grad: 'from-sky-300 to-cyan-300' },
  Backend: { rgb: '129,140,248', grad: 'from-indigo-300 to-violet-300' },
  Database: { rgb: '45,212,191', grad: 'from-teal-300 to-emerald-300' },
  Data: { rgb: '52,211,153', grad: 'from-emerald-300 to-green-300' },
  DevOps: { rgb: '251,146,60', grad: 'from-orange-300 to-amber-300' },
  Cloud: { rgb: '34,211,238', grad: 'from-cyan-300 to-sky-300' },
  Mobile: { rgb: '244,114,182', grad: 'from-rose-300 to-pink-300' },
  Language: { rgb: '148,163,184', grad: 'from-slate-200 to-slate-400' },
  Other: { rgb: '148,163,184', grad: 'from-slate-200 to-slate-400' },
}

const DEFAULT: Accent = CATEGORY_ACCENT.Other

// Dominant = category with the most techs (ignoring bare Language/Other unless
// that's all there is).
export function dominantCategory(tech: Record<string, string[]>): string {
  const all = Object.entries(tech || {}).filter(([, v]) => v.length > 0)
  const meaningful = all.filter(([c]) => c !== 'Language' && c !== 'Other')
  const pool = meaningful.length ? meaningful : all
  if (!pool.length) return 'Other'
  return [...pool].sort((a, b) => b[1].length - a[1].length)[0][0]
}

export function accentFor(tech: Record<string, string[]>): Accent {
  return CATEGORY_ACCENT[dominantCategory(tech)] ?? DEFAULT
}
