import { useEffect, useMemo, useState } from 'react'
import { Icon, StatusDot } from './ui/Glyph'
import { ImageFrame, SectionHeader } from './ui/Common'
import { REGIONS, type RegionKey } from '../data/regions'
import { BENCHMARKS, BENCHMARK_PROVIDERS } from '../data/spec'
import { useLatencyMatrix } from '../hooks/useTelemetry'
import { IMAGES } from '../lib/format'

function rttTone(ms: number) {
  if (ms < 30) return { text: 'text-good', solid: '#10B981' }
  if (ms < 120) return { text: 'text-amber', solid: '#F59E0B' }
  if (ms < 240) return { text: 'text-rail', solid: '#06B6D4' }
  return { text: 'text-crit', solid: '#EF4444' }
}

export function TopologySection({ region }: { region: RegionKey }) {
  const pairs = useMemo(
    () =>
      REGIONS.flatMap((a) =>
        REGIONS.filter((b) => b.key !== a.key).map((b) => [a.key, b.key] as [string, string]),
      ),
    [],
  )
  const seed = useMemo(
    () =>
      REGIONS.reduce<Record<string, number>>((acc, a) => {
        REGIONS.forEach((b) => {
          if (a.key !== b.key) acc[`${a.key}|${b.key}`] = a.rtt[b.key]
        })
        return acc
      }, {}),
    [],
  )
  const { values, lastSync, beat } = useLatencyMatrix(pairs, seed, 1700)
  const [metric, setMetric] = useState(BENCHMARKS[0].key)
  const [syncLabel, setSyncLabel] = useState('SYNCING')

  useEffect(() => {
    setSyncLabel('SYNCING')
    const t = window.setTimeout(() => setSyncLabel('LIVE'), 260)
    return () => window.clearTimeout(t)
  }, [beat])

  const active = BENCHMARKS.find((b) => b.key === metric)!

  const maxValue = Math.max(
    ...BENCHMARK_PROVIDERS.map((p) => active.values[p.key]),
  )

  return (
    <section id="topology" className="border-b border-hairline bg-obsidian py-16 sm:py-24">
      <div className="shell">
        <SectionHeader
          index="04"
          eyebrow="NETWORK TOPOLOGY · LATENCY BENCHMARK MATRIX"
          title={
            <>
              One flat fabric across four continents.{' '}
              <span className="text-rail">Measured, not marketed.</span>
            </>
          }
          lede="Inter-campus paths run on dedicated dark fibre with physically diverse routes. The grid below is sampled at 1.7 s intervals from the same agents that serve tenant traffic — the numbers your scheduler will actually see."
          right={
            <div className="border border-hairline bg-carbon px-4 py-3">
              <span className="eyebrow">PROBE FLEET</span>
              <p className="mt-1.5 flex items-center gap-2 font-mono text-2xs uppercase tracking-widest">
                <StatusDot tone={syncLabel === 'LIVE' ? 'good' : 'amber'} />
                <span className={syncLabel === 'LIVE' ? 'text-good' : 'text-amber'}>
                  {syncLabel} · 4/4 AGENTS
                </span>
              </p>
              <p className="num mt-1 text-2xs text-slate-dim">
                LAST SYNC {new Date(lastSync).toLocaleTimeString('en-GB', { hour12: false })} LOCAL
              </p>
            </div>
          }
        />

        {/* ============================================ latency matrix + rails */}
        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_400px]">
          <div className="border border-hairline bg-carbon">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-3.5">
              <span className="eyebrow-amber">INTER-REGION ROUND-TRIP LATENCY (MS)</span>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  ['< 30ms', 'text-good'],
                  ['< 120ms', 'text-amber'],
                  ['< 240ms', 'text-rail'],
                  ['≥ 240ms', 'text-crit'],
                ].map(([l, c]) => (
                  <span key={l} className={`num text-2xs ${c}`}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-r border-hairline bg-graphite px-4 py-3 text-left font-mono text-2xs uppercase tracking-widest text-slate-dim">
                      FROM ↓ / TO →
                    </th>
                    {REGIONS.map((c) => (
                      <th
                        key={c.key}
                        className={`border-b border-hairline bg-graphite px-4 py-3 text-left font-mono text-2xs uppercase tracking-widest ${
                          c.key === region ? 'text-amber' : 'text-slate-tech'
                        }`}
                      >
                        {c.siteCode.toUpperCase()}
                        <span className="mt-0.5 block text-[9px] normal-case text-slate-dim">{c.city}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REGIONS.map((row) => (
                    <tr key={row.key}>
                      <th
                        className={`border-b border-r border-hairline px-4 py-3 text-left font-mono text-2xs uppercase tracking-widest ${
                          row.key === region ? 'text-amber' : 'text-slate-tech'
                        }`}
                      >
                        {row.siteCode.toUpperCase()}
                        <span className="mt-0.5 block text-[9px] normal-case text-slate-dim">
                          {row.city}
                        </span>
                      </th>
                      {REGIONS.map((col) => {
                        const self = row.key === col.key
                        const v = values[`${row.key}|${col.key}`] ?? row.rtt[col.key]
                        const tone = rttTone(v)
                        return (
                          <td
                            key={col.key}
                            className={`border-b border-hairline px-4 py-3 align-middle ${
                              self ? 'bg-obsidian hatch' : ''
                            }`}
                          >
                            {self ? (
                              <span className="num text-2xs uppercase tracking-widest text-slate-dim">LOCAL</span>
                            ) : (
                              <span className="flex items-center gap-2.5">
                                <span
                                  className={`num w-[58px] text-[13px] transition-colors duration-500 ${tone.text}`}
                                >
                                  {v.toFixed(2)}
                                </span>
                                <span className="h-1.5 w-full max-w-[86px] bg-obsidian">
                                  <span
                                    className="block h-full transition-all duration-700 ease-precision"
                                    style={{
                                      width: `${Math.min(100, (v / 250) * 100).toFixed(1)}%`,
                                      backgroundColor: tone.solid,
                                    }}
                                  />
                                </span>
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-5 py-3">
              <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">
                SAMPLED FROM TENANT-SIDE PROBES · ±1.0 MS INSTRUMENT VARIANCE APPLIED
              </span>
              <span className="num text-2xs text-slate-dim">
                {REGIONS.length * (REGIONS.length - 1)} PATHS · 0 BLACKHOLED
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------ rail anatomy */}
          <aside className="flex flex-col gap-5">
            <ImageFrame
              src={IMAGES.pcieInterconnect}
              alt="QSFP-DD 800Gbps InfiniBand optical cables seated in an NVIDIA Quantum-2 high-radix switch"
              caption="QUANTUM-2 NDR · QSFP-DD 800G"
              meta="64 PORTS / ASIC"
              aspect="aspect-square"
            />
            <div className="border border-hairline bg-carbon p-5">
              <span className="eyebrow">FABRIC LAWS</span>
              <ul className="mt-3 space-y-3">
                {[
                  ['NON-BLOCKING', '1:1 oversubscription between tier-1 and tier-2. Every rail carries 400 Gbps.'],
                  ['RAIL-OPTIMISED', 'GPU r on every node lands on leaf r — collectives never cross a spine twice.'],
                  ['IN-NETWORK REDUCTION', 'SHARPv3 folds all-reduce trees into the ASIC, halving wire traffic.'],
                  ['ADAPTIVE ROUTING', 'Three-level ECMP with per-packet rebalance under 12 μs congestion signals.'],
                ].map(([k, v]) => (
                  <li key={k} className="border-l border-amber/40 pl-3.5">
                    <span className="block font-mono text-2xs uppercase tracking-widest text-amber">{k}</span>
                    <span className="mt-1 block font-mono text-2xs leading-relaxed text-slate-tech">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* ================================================== benchmark matrix */}
        <div id="benchmarks" className="mt-16">
          <SectionHeader
            index="05"
            eyebrow="BENCHMARK MATRIX · INDEPENDENT METHODOLOGY"
            title={
              <>
                TensorMesh against the hyperscaler GPU fleets —{' '}
                <span className="text-amber">same silicon, different physics.</span>
              </>
            }
            lede="Identical H100 SXM5 parts, identical frameworks, identical datasets. The only variable is what sits between the GPU and the wire."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_336px]">
            <div className="border border-hairline bg-carbon">
              {/* metric selector */}
              <div className="flex flex-wrap gap-px border-b border-hairline">
                {BENCHMARKS.map((b) => {
                  const on = b.key === metric
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setMetric(b.key)}
                      className={`relative flex-1 px-4 py-3 text-left transition-colors ${
                        on ? 'bg-graphite' : 'hover:bg-graphite/50'
                      }`}
                    >
                      <span
                        className={`block font-mono text-2xs uppercase tracking-widest ${
                          on ? 'text-amber' : 'text-slate-dim'
                        }`}
                      >
                        {b.label}
                      </span>
                      {on && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-amber" />}
                    </button>
                  )
                })}
              </div>

              <div className="px-5 py-6 sm:px-7">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">
                    {active.higherIsBetter ? 'HIGHER IS BETTER' : 'LOWER IS BETTER'} · UNIT: {active.unit}
                  </span>
                  <span className="num text-2xs text-slate-dim">
                    TensorMesh advantage{' '}
                    <span className="text-amber">
                      {active.higherIsBetter
                        ? `+${(((active.values.tensormesh - active.values.aws) / active.values.aws) * 100).toFixed(1)}%`
                        : `−${(((active.values.aws - active.values.tensormesh) / active.values.aws) * 100).toFixed(1)}%`}
                    </span>{' '}
                    vs p5.48xlarge
                  </span>
                </div>

                <div className="mt-6 space-y-6">
                  {BENCHMARK_PROVIDERS.map((p) => {
                    const v = active.values[p.key]
                    const w = (v / maxValue) * 100
                    const isHero = p.key === 'tensormesh'
                    return (
                      <div key={p.key}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="flex items-baseline gap-3">
                            <span
                              className={`text-[13px] font-semibold tracking-tighter ${
                                isHero ? 'text-signal' : 'text-slate-tech'
                              }`}
                            >
                              {p.label}
                            </span>
                            <span className="font-mono text-2xs text-slate-dim">{p.sub}</span>
                          </span>
                          <span
                            className={`num text-[17px] leading-none ${
                              isHero ? 'text-amber' : 'text-slate-tech'
                            }`}
                          >
                            {v}
                            <span className="ml-1 text-2xs text-slate-dim">{active.unit.split(' ')[0]}</span>
                          </span>
                        </div>
                        <div className="mt-2.5 h-6 border border-hairline bg-obsidian">
                          <div
                            className="h-full transition-all duration-700 ease-precision"
                            style={{
                              width: `${w.toFixed(1)}%`,
                              backgroundColor: isHero ? 'rgba(245,158,11,0.85)' : 'rgba(139,148,158,0.28)',
                              backgroundImage: isHero
                                ? 'repeating-linear-gradient(90deg, rgba(10,11,14,0.22) 0 1px, transparent 1px 8px)'
                                : 'repeating-linear-gradient(90deg, rgba(10,11,14,0.22) 0 1px, transparent 1px 8px)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-7 border-t border-hairline pt-4 font-mono text-2xs leading-relaxed text-slate-dim">
                  {active.footnote} Latency measured node-to-node with NCCL 2.22.3; cost figures are effective rate
                  including fabric, storage and egress where applicable. Full methodology in the architecture
                  whitepaper.
                </p>
              </div>
            </div>

            <aside className="flex flex-col gap-5">
              <div className="border border-hairline bg-carbon p-5">
                <span className="eyebrow">COLD-START DECOMPOSITION</span>
                <div className="mt-4 space-y-3.5">
                  {[
                    ['Bare-metal handoff', 4, 'text-good'],
                    ['Image layer pull (cached)', 9, 'text-good'],
                    ['NCCL topology write', 6, 'text-good'],
                    ['Device plugin registry', 12, 'text-amber'],
                    ['Scheduler admission', 11, 'text-amber'],
                  ].map(([label, sec, tone]) => (
                    <div key={String(label)}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-2xs text-slate-tech">{label}</span>
                        <span className={`num text-2xs ${tone as string}`}>{sec}s</span>
                      </div>
                      <div className="mt-1.5 h-1 bg-obsidian">
                        <div
                          className="h-full bg-amber/70"
                          style={{ width: `${(Number(sec) / 14) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                  <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">
                    TOTAL TO FIRST KERNEL
                  </span>
                  <span className="num text-[15px] text-amber">42 s</span>
                </div>
              </div>

              <div className="border border-hairline bg-carbon p-5">
                <span className="eyebrow">WHY THE GAP EXISTS</span>
                <ul className="mt-3 space-y-3">
                  {[
                    ['No hypervisor hop', 'KVM bypass removes the virtio path between guest and NIC.'],
                    ['Pinned NUMA + IRQ', 'GPU, NIC and memory controller locked to one PCIe root complex.'],
                    ['Deterministic clocks', 'Locked SM clock and disabled power capping on committed terms.'],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-3">
                      <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-good" strokeWidth={2} />
                      <span>
                        <span className="block font-mono text-2xs uppercase tracking-widest text-signal">{k}</span>
                        <span className="mt-1 block font-mono text-2xs leading-relaxed text-slate-tech">{v}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
