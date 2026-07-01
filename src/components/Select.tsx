import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Tone } from '../lib/dropdowns'
import { toneClasses, toneDot } from '../lib/dropdowns'

export interface SelectOption {
  value: string
  label: string
  tone: Tone
}

type Pos = { top: number; left: number; width: number }

// Custom dropdown replacing the native <select>. The option panel is rendered
// in a portal with fixed positioning so it floats above the glass cards (which
// otherwise clip/cover it due to their backdrop-blur stacking contexts).
export default function Select({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = 'Set',
  includeClear = true,
}: {
  value: string | undefined
  options: SelectOption[]
  onChange: (value: string | undefined) => void
  ariaLabel: string
  placeholder?: string
  includeClear?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)
  const cur = options.find((o) => o.value === value) ?? null
  const tone: Tone = cur?.tone ?? 'neutral'

  const place = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const rows = options.length + (includeClear ? 1 : 0)
    const estH = rows * 36 + 10
    // flip upward when there isn't room below (e.g. cards low in the viewport)
    const openUp = r.bottom + estH + 8 > window.innerHeight && r.top - estH - 8 > 0
    const width = Math.max(r.width, 160)
    let left = r.left
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
    setPos({ top: openUp ? r.top - estH - 6 : r.bottom + 6, left, width })
  }

  const toggle = () => {
    if (open) {
      setOpen(false)
    } else {
      place()
      setOpen(true)
    }
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  const choose = (v: string | undefined) => {
    onChange(v)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className={`inline-flex w-full items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold ring-1 transition ${toneClasses[tone]}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot[tone]}`} />
        <span className="truncate">{cur ? cur.label : placeholder}</span>
        <svg className={`ml-auto h-3 w-3 shrink-0 opacity-70 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={panelRef}
            role="listbox"
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width }}
            className="z-[999] overflow-hidden rounded-xl border border-white/15 bg-[#12121e] p-1 shadow-2xl ring-1 ring-black/40"
          >
            {includeClear && (
              <li>
                <button
                  onClick={() => choose(undefined)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-faint transition hover:bg-white/[0.07]"
                >
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  <span>None</span>
                  {value == null && <span className="ml-auto text-accent-cyan">✓</span>}
                </button>
              </li>
            )}
            {options.map((o) => (
              <li key={o.value}>
                <button
                  onClick={() => choose(o.value)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition hover:bg-white/[0.07] ${
                    value === o.value ? 'text-ink' : 'text-subtle'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${toneDot[o.tone]}`} />
                  <span>{o.label}</span>
                  {value === o.value && <span className="ml-auto text-accent-cyan">✓</span>}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}
