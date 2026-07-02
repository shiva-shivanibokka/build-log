import { useCallback, useEffect, useRef, useState } from 'react'

export type Pos = { top: number; left: number; width: number }

// Shared positioned-popover behavior for the custom dropdowns (Select, DomainSelect).
// Owns open state, the trigger/panel refs, the computed fixed position (flipping
// upward when there's no room below), and the outside-click/Escape/scroll/resize
// dismissal. Callers keep only their own trigger + option markup and render the
// portal themselves so their distinct styling is preserved.
export function usePopover({ estHeight, minWidth }: { estHeight: number; minWidth: number }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)

  const place = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // flip upward when there isn't room below (e.g. cards low in the viewport)
    const openUp = r.bottom + estHeight + 8 > window.innerHeight && r.top - estHeight - 8 > 0
    const width = Math.max(r.width, minWidth)
    let left = r.left
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
    setPos({ top: openUp ? r.top - estHeight - 6 : r.bottom + 6, left, width })
  }, [estHeight, minWidth])

  const close = useCallback(() => setOpen(false), [])

  const toggle = useCallback(() => {
    if (open) setOpen(false)
    else {
      place()
      setOpen(true)
    }
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
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

  return { open, pos, triggerRef, panelRef, toggle, close }
}
