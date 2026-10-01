import { useEffect, useRef, useState } from 'react'
import { ComputeMatrixGlyph, Icon, StatusDot } from './ui/Glyph'
import { REGIONS, REGION_MAP, type RegionKey } from '../data/regions'
import { group } from '../lib/format'

const NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: 'BARE-METAL CLUSTERS', href: '#clusters' },
  { label: 'INFERENCE RUNTIME', href: '#runtime' },
  { label: 'BENCHMARKS', href: '#benchmarks' },
  { label: 'NETWORK TOPOLOGY', href: '#topology' },
  { label: 'DOCUMENTATION', href: '#documentation' },
]

export function NavBar({
  region,
  onRegionChange,
  onOpenCli,
  onDeploy,
  activeSection,
}: {
  region: RegionKey
  onRegionChange: (r: RegionKey) => void
  onOpenCli: () => void
  onDeploy: () => void
  activeSection: string
}) {
  const [regionOpen, setRegionOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const active = REGION_MAP[region]

  useEffect(() => {
    if (!regionOpen) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setRegionOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setRegionOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [regionOpen])

  return (
    <header className="sticky top-0 z-[90] border-b border-hairline bg-obsidian/94 backdrop-blur-md supports-[backdrop-filter]:bg-obsidian/88">
      <div className="shell flex h-16 items-center justify-between gap-4">
        {/* ---------------------------------------------------------------- logo */}
        <a href="#top" className="group flex shrink-0 items-center gap-3" aria-label="TensorMesh home">
          <ComputeMatrixGlyph size={30} className="transition-opacity group-hover:opacity-80" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tightest text-signal">
              TENSOR<span className="text-amber">MESH</span>
            </span>
            <span className="mt-1 font-mono text-2xs uppercase tracking-widest text-slate-dim">
              v3.8.4-PROD
            </span>
          </span>
        </a>

        {/* -------------------------------------------------------- center links */}
        <nav className="hidden min-w-0 items-center gap-0.5 xl:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            const isActive = activeSection === l.href.slice(1)
            return (
              <a
                key={l.href}
                href={l.href}
                className={`relative whitespace-nowrap px-2.5 py-2 font-mono text-2xs uppercase tracking-widest transition-colors ${
                  isActive ? 'text-amber' : 'text-slate-tech hover:text-signal'
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-2.5 -bottom-[1px] h-[1px] transition-opacity ${
                    isActive ? 'bg-amber opacity-100' : 'opacity-0'
                  }`}
                />
              </a>
            )
          })}
        </nav>

        {/* -------------------------------------------------------------- right */}
        <div className="flex shrink-0 items-center gap-2">
          {/* region selector */}
          <div className="relative hidden md:block" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setRegionOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={regionOpen}
              className="flex h-10 items-center gap-2.5 whitespace-nowrap border border-hairline bg-carbon px-3 transition-colors hover:border-slate-faint"
            >
              <StatusDot tone="good" />
              <span className="flex flex-col items-start leading-none">
                <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">
                  ACTIVE REGION
                </span>
                <span className="num mt-1 text-[11px] text-signal">{active.label}</span>
              </span>
              <Icon
                name="chevron-down"
                className={`h-3.5 w-3.5 text-slate-dim transition-transform duration-200 ${
                  regionOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {regionOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-[calc(100%+8px)] w-[336px] animate-floatup border border-hairline bg-graphite shadow-panel"
              >
                <div className="border-b border-hairline px-3 py-2">
                  <span className="eyebrow">SELECT DEPLOYMENT CAMPUS</span>
                </div>
                {REGIONS.map((r) => {
                  const selected = r.key === region
                  return (
                    <button
                      key={r.key}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onRegionChange(r.key)
                        setRegionOpen(false)
                      }}
                      className={`flex w-full items-center justify-between gap-3 border-b border-hairline/70 px-3 py-3 text-left transition-colors last:border-b-0 ${
                        selected ? 'bg-amber/5' : 'hover:bg-carbon'
                      }`}
                    >
                      <span className="min-w-0">
                        <span
                          className={`block font-mono text-[11.5px] tracking-wide ${
                            selected ? 'text-amber' : 'text-signal'
                          }`}
                        >
                          {r.label}
                        </span>
                        <span className="mt-1 block font-mono text-2xs uppercase tracking-widest text-slate-dim">
                          {group(r.nodes)} NODES · PUE {r.pue.toFixed(2)} · COOLANT {r.coolantC}°C
                        </span>
                      </span>
                      {selected && <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-amber" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenCli}
            className="hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap border border-hairline bg-carbon px-3 font-mono text-2xs uppercase tracking-widest text-slate-tech transition-colors hover:border-rail/50 hover:text-rail sm:flex"
          >
            <Icon name="terminal" className="h-3.5 w-3.5" />
            CLI ACCESS
          </button>

          <button type="button" onClick={onDeploy} className="btn btn-primary h-10 shrink-0 whitespace-nowrap px-4 !py-0">
            <Icon name="bolt" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DEPLOY CLUSTER</span>
            <span className="sm:hidden">DEPLOY</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center border border-hairline bg-carbon text-slate-tech xl:hidden"
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------- mobile drawer */}
      {mobileOpen && (
        <div className="animate-floatup border-t border-hairline bg-graphite xl:hidden">
          <nav className="shell grid gap-px py-2" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-hairline/70 py-3 font-mono text-2xs uppercase tracking-widest text-slate-tech hover:text-amber"
              >
                {l.label}
                <Icon name="chevron-right" className="h-3.5 w-3.5" />
              </a>
            ))}
          </nav>
          <div className="shell grid grid-cols-2 gap-2 pb-4 md:hidden">
            {REGIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => {
                  onRegionChange(r.key)
                  setMobileOpen(false)
                }}
                className={`border px-3 py-2 text-left font-mono text-2xs uppercase tracking-widest ${
                  r.key === region ? 'border-amber bg-amber/5 text-amber' : 'border-hairline text-slate-tech'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="shell pb-4 sm:hidden">
            <button
              type="button"
              onClick={() => {
                onOpenCli()
                setMobileOpen(false)
              }}
              className="btn btn-ghost w-full"
            >
              <Icon name="terminal" className="h-3.5 w-3.5" />
              CLI ACCESS
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
