// A glowing summary strip at the top of the Projects board: overall % complete
// plus per-status counts, colour-matched to the status dropdown.
const TILES: { key: string; label: string; rgb: string }[] = [
  { key: 'done', label: 'Done', rgb: '52,211,153' },
  { key: 'in-progress', label: 'In progress', rgb: '192,132,252' },
  { key: 'pending', label: 'Pending', rgb: '251,191,36' },
  { key: 'revamp', label: 'Revamp', rgb: '96,165,250' },
  { key: 'yet-to-start', label: 'Yet to start', rgb: '251,113,133' },
]

export default function StatStrip({ total, counts }: { total: number; counts: Record<string, number> }) {
  const done = counts.done || 0
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md md:flex-row md:items-center">
      <div className="md:w-60 md:shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="bg-gradient-to-r from-accent-green to-accent-cyan bg-clip-text font-display text-[32px] font-black leading-none text-transparent [filter:drop-shadow(0_0_14px_rgba(52,211,153,0.35))]">
            {pct}%
          </span>
          <span className="text-[12.5px] text-faint">
            complete · {done}/{total} done
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-cyan transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-3 sm:grid-cols-5">
        {TILES.map((t) => (
          <div
            key={t.key}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-center transition hover:border-white/20"
          >
            <div
              className="font-display text-[22px] font-bold leading-none"
              style={{ color: `rgb(${t.rgb})`, textShadow: `0 0 16px rgba(${t.rgb},0.4)` }}
            >
              {counts[t.key] || 0}
            </div>
            <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-faint">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
