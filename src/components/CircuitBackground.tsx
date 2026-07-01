import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// Full-viewport animated circuit board behind everything: glowing cyan traces
// connecting chip nodes, with little pulses gliding along the wires. Kept faint
// so content stays readable. Static single frame under prefers-reduced-motion.
type Pt = { x: number; y: number }
type Edge = [Pt, Pt]
type Pulse = { e: Edge; t: number; sp: number }

const STEP = 46

export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let nodes: Pt[] = []
    let edges: Edge[] = []
    let pulses: Pulse[] = []

    const spawn = (): Pulse => {
      const e = edges.length ? edges[Math.floor(Math.random() * edges.length)] : ([{ x: 0, y: 0 }, { x: 0, y: 0 }] as Edge)
      return { e, t: Math.random(), sp: 0.004 + Math.random() * 0.012 }
    }

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.ceil(w / STEP)
      const rows = Math.ceil(h / STEP)
      const set = new Set<string>()
      nodes = []
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          if (Math.random() < 0.6) {
            nodes.push({ x: i * STEP, y: j * STEP })
            set.add(i + '_' + j)
          }
        }
      }
      edges = []
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          if (!set.has(i + '_' + j)) continue
          const x = i * STEP
          const y = j * STEP
          if (set.has(i + 1 + '_' + j) && Math.random() < 0.55) edges.push([{ x, y }, { x: x + STEP, y }])
          if (set.has(i + '_' + (j + 1)) && Math.random() < 0.55) edges.push([{ x, y }, { x, y: y + STEP }])
        }
      }
      const count = Math.min(60, Math.max(8, Math.round(edges.length * 0.12)))
      pulses = Array.from({ length: count }, spawn)
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(56,189,248,0.13)'
      ctx.lineWidth = 1
      for (const [a, b] of edges) {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(56,189,248,0.4)'
      for (const n of nodes) ctx.fillRect(n.x - 1.4, n.y - 1.4, 2.8, 2.8)
    }

    const loop = () => {
      drawStatic()
      for (const p of pulses) {
        p.t += p.sp
        if (p.t > 1) Object.assign(p, spawn())
        const [a, b] = p.e
        const x = a.x + (b.x - a.x) * p.t
        const y = a.y + (b.y - a.y) * p.t
        ctx.fillStyle = '#67e8f9'
        ctx.shadowBlur = 12
        ctx.shadowColor = '#22d3ee'
        ctx.beginPath()
        ctx.arc(x, y, 2.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      raf = requestAnimationFrame(loop)
    }

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        build()
        if (reduced) drawStatic()
      }, 150)
    }

    build()
    if (reduced) {
      drawStatic()
    } else {
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" aria-hidden />
}
