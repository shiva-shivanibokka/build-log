import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DOMAIN_COLOR, DOMAIN_ORDER } from '../lib/domains'

type Pos = { top: number; left: number; width: number }

// Colored domain picker for To Do ideas — same palette as the Projects cards.
export default function DomainSelect({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (v: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)
  const rgb = value ? DOMAIN_COLOR[value] ?? DOMAIN_COLOR.Other : null

  const place = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const estH = (DOMAIN_ORDER.length + 1) * 34 + 10
    const up = r.bottom + estH + 8 > window.innerHeight && r.top - estH - 8 > 0
    let left = r.left
    const width = Math.max(r.width, 170)
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
    setPos({ top: up ? r.top - estH - 6 : r.bottom + 6, left, width })
  }

  const toggle = () => {
    if (open) setOpen(false)
    else {
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
        onClick={toggle}
        aria-label="Domain"
        className="inline-flex w-full items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13.5px] font-semibold ring-1 transition"
        style={
          rgb
            ? { background: `rgba(${rgb},0.15)`, color: `rgb(${rgb})`, boxShadow: `inset 0 0 0 1px rgba(${rgb},0.35)` }
            : { background: 'rgba(255,255,255,0.04)', color: '#9297AE', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }
        }
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: rgb ? `rgb(${rgb})` : '#64748b' }} />
        <span className="truncate">{value ?? 'Domain'}</span>
        <svg className={`ml-auto h-3 w-3 shrink-0 opacity-70 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={panelRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width }}
            className="z-[999] max-h-[320px] overflow-auto rounded-xl border border-white/15 bg-[#12121e] p-1 shadow-2xl"
          >
            <li>
              <button
                onClick={() => choose(undefined)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13.5px] text-faint transition hover:bg-white/[0.07]"
              >
                <span className="h-2 w-2 rounded-full bg-slate-600" /> None
              </button>
            </li>
            {DOMAIN_ORDER.map((d) => (
              <li key={d}>
                <button
                  onClick={() => choose(d)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium transition hover:bg-white/[0.07] ${
                    value === d ? 'text-ink' : 'text-subtle'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: `rgb(${DOMAIN_COLOR[d]})` }} />
                  {d}
                  {value === d && <span className="ml-auto text-accent-cyan">✓</span>}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}
