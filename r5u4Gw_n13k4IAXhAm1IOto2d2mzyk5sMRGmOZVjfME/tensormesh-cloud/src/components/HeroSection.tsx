import { useEffect, useState } from 'react'
import { Icon, StatusDot } from './ui/Glyph'
import { IMAGES, group } from '../lib/format'
import { useLatencyMatrix } from '../hooks/useTelemetry'
import { REGION_MAP, REGIONS, type RegionKey } from '../data/regions'

interface Hotspot {
  id: string
  /** percentage position on the image */
  x: number
  y: number
  label: string
  /** value lines shown in the hover tooltip */
  readouts: Array<[string, string]>
  tone: 'amber' | 'rail' | 'good'
}

function hotspotsFor(region: RegionKey): Hotspot[] {
  const r = REGION_MAP[region]
  return [
    {
      id: 'rack-04b',
      x: 22,
      y: 54,
      label: 'RACK 04B',
      tone: 'amber',
      readouts: [
        ['LIQUID INLET TEMP', `${r.coolantC}°C`],
        ['PDU BALANCE', '100% BALANCED'],
        ['NODES', '8 × HGX H100 SXM5'],
        ['LOOP PRESSURE', '2.41 bar'],
      ],
    },
    {
      id: 'cold-aisle',
      x: 48,
      y: 78,
      label: 'COLD AISLE SENSOR ARRAY',
      tone: 'rail',
      readouts: [
        ['RETURN AIR', `${(r.coolantC + 12.4).toFixed(1)}°C`],
        ['HUMIDITY', '41% RH'],
        ['DELTA-T', 'Δ 12.4°C'],
        ['AIRFLOW', '6.2 m³/s'],
      ],
    },
    {
      id: 'tor-2',
      x: 76,
      y: 34,
      label: 'TOR-2 INFINIBAND LEAF',
      tone: 'good',
      readouts: [
        ['PORT STATE', '64/64 UP · 800G'],
        ['FABRIC LATENCY', '1.84 μs'],
        ['SHARPv3', 'ENABLED'],
        ['SYMBOL ERRORS', '0'],
      ],
    },
    {
      id: 'cdc-01',
      x: 62,
      y: 62,
      label: 'CDU-01 DISTRIBUTION',
      tone: 'amber',
      readouts: [
        ['PRIMARY FLOW', '412 L/min'],
        ['SECONDARY', '398 L/min'],
        ['HEAT RECOVERY', '2.8 MW → DISTRICT'],
        ['REDUNDANCY', 'N+1 ACTIVE'],
      ],
    },
    {
      id: 'zone-f',
      x: 35,
      y: 20,
      label: 'ZONE F · HALL TELEMETRY',
      tone: 'rail',
      readouts: [
        ['NODES ONLINE', `${group(r.nodes)}`],
        ['PUE', `${r.pue.toFixed(2)}`],
        ['ZONE', r.zone],
        ['SINCE', r.live],
      ],
    },
  ]
}

export function HeroSection({
  region,
  onInspectTopology,
  onLaunchBuilder,
}: {
  region: RegionKey
  onInspectTopology: () => void
  onLaunchBuilder: () => void
}) {
  const [active, setActive] = useState<string | null>(null)
  const hotspots = hotspotsFor(region)

  /* Live inter-region RTT bank — the hero's own fabric pulse readout. */
  const seed = REGIONS.reduce<Record<string, number>>((acc, a) => {
    REGIONS.forEach((b) => {
      if (a.key !== b.key) acc[`${a.key}|${b.key}`] = a.rtt[b.key]
    })
    return acc
  }, {})
  const pairs = REGIONS.flatMap((a) =>
    REGIONS.filter((b) => b.key !== a.key).map((b) => [a.key, b.key] as [string, string]),
  )
  const { values } = useLatencyMatrix(pairs, seed, 2100)

  const r = REGION_MAP[region]
  const peer = REGIONS.find((x) => x.key !== region)!

  const ticker: Array<{ value: string; unit: string; label: string; tone: string; live?: boolean }> = [
    { value: '1.8', unit: 'ms', label: 'ALL-REDUCE LATENCY', tone: 'text-amber', live: true },
    { value: '3.2', unit: 'TB/s', label: 'BISECTION BANDWIDTH / NODE', tone: 'text-amber' },
    { value: `$${r.spotFloor.toFixed(2)}`, unit: '/ hr', label: 'H100 SXM5 SPOT FLOOR', tone: 'text-rail' },
    { value: '0', unit: '%', label: 'HYPERVISOR OVERHEAD · KVM BYPASS', tone: 'text-good' },
  ]

  return (
    <section id="top" className="relative overflow-hidden border-b border-hairline bg-obsidian">
      {/* backdrop: hairline engineering grid + a single amber sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-hairline bg-grid opacity-[0.5]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[720px] bg-amber-sheen"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-24 h-[420px] w-[560px] bg-rail-sheen"
      />

      <div className="relative shell pt-14 pb-0 sm:pt-20">
        {/* ------------------------------------------------------------ eyebrow */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2.5 border border-amber/30 bg-amber/5 px-3 py-1.5 font-mono text-2xs uppercase tracking-widest3 text-amber">
            <StatusDot tone="amber" pulse={false} />
            ENTERPRISE INFRASTRUCTURE · 800GBPS INFINIBAND NDR
          </span>
          <span className="hidden font-mono text-2xs uppercase tracking-widest text-slate-dim sm:inline">
            {r.address}
          </span>
        </div>

        {/* ------------------------------------------------------------- copy */}
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="text-balance text-[34px] font-semibold leading-[1.04] tracking-tightest text-signal sm:text-[46px] lg:text-[56px]">
              Sub-millisecond GPU compute fabric for{' '}
              <span className="relative inline-block text-amber">
                frontier AI labs
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[2px] w-full bg-amber/35"
                />
              </span>
              .
            </h1>
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            <p className="max-w-prose2 text-pretty text-[15px] leading-relaxed text-slate-tech">
              Direct bare-metal access to dedicated NVIDIA H100 and B200 clusters. No hypervisor
              virtualization penalty, zero shared-tenant jitter, and automated InfiniBand topology
              mapping in under 90 seconds.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={onLaunchBuilder} className="btn btn-primary">
                <Icon name="bolt" className="h-3.5 w-3.5" />
                LAUNCH CLUSTER BUILDER
              </button>
              <button type="button" onClick={onInspectTopology} className="btn btn-ghost">
                <Icon name="network" className="h-3.5 w-3.5" />
                INSPECT TOPOLOGY MAP
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-slate-dim">
                <Icon name="check" className="h-3 w-3 text-good" strokeWidth={2} />
                NO CREDIT CARD FOR QUOTES
              </span>
              <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-slate-dim">
                <Icon name="check" className="h-3 w-3 text-good" strokeWidth={2} />
                PROVISION IN 42 S MEDIAN
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ hardware ticker */}
        <dl className="mt-12 grid grid-cols-2 border border-hairline bg-carbon lg:grid-cols-4">
          {ticker.map((t, i) => (
            <div
              key={t.label}
              className={`relative px-5 py-6 ${
                i % 2 === 0 ? 'border-r border-hairline' : 'lg:border-r lg:border-hairline'
              } ${i < 2 ? 'border-b border-hairline lg:border-b-0' : ''} ${
                i === 3 ? 'lg:border-r-0' : ''
              }`}
            >
              {t.live && (
                <span className="absolute right-4 top-4">
                  <StatusDot tone="good" />
                </span>
              )}
              <dd className={`num flex items-baseline gap-1.5 text-[30px] leading-none tracking-tightest ${t.tone}`}>
                {t.value}
                <span className="text-[13px] text-slate-dim">{t.unit}</span>
              </dd>
              <dt className="mt-3 font-mono text-2xs uppercase tracking-widest text-slate-tech">
                {t.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      {/* ---------------------------------------------------------- hero visual */}
      <div className="relative mt-12 border-t border-hairline">
        <div className="relative">
          <img
            src={IMAGES.clusterRack}
            alt="TensorMesh Zurich compute hall — liquid-cooled NVIDIA H100 SXM5 nodes in matte black racks"
            className="h-[380px] w-full object-cover sm:h-[520px] lg:h-[644px]"
            decoding="async"
          />
          {/* cinematic grade so photography sits inside the obsidian canvas */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/25 to-obsidian/55"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,transparent_25%,rgba(10,11,14,0.82)_100%)]"
          />

          {/* ------------------------------------------------------- hotspots */}
          {hotspots.map((h) => {
            const on = active === h.id
            const flip = h.x > 58
            return (
              <div
                key={h.id}
                className="absolute"
                style={{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setActive(h.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(h.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive((cur) => (cur === h.id ? null : h.id))}
                  aria-label={`${h.label} sensor telemetry`}
                  className="group relative flex h-7 w-7 items-center justify-center"
                >
                  <span
                    className={`absolute h-7 w-7 border transition-all duration-200 ${
                      on ? 'scale-100 border-amber bg-amber/15' : 'scale-90 border-signal/35 bg-obsidian/45'
                    }`}
                  />
                  <span
                    className={`relative h-1.5 w-1.5 ${
                      h.tone === 'rail' ? 'bg-rail' : h.tone === 'good' ? 'bg-good' : 'bg-amber'
                    }`}
                  />
                  {!on && (
                    <span
                      aria-hidden="true"
                      className={`absolute h-7 w-7 animate-pulsering border ${
                        h.tone === 'rail' ? 'border-rail/50' : 'border-amber/50'
                      }`}
                    />
                  )}
                </button>

                {on && (
                  <div
                    className={`pointer-events-none absolute top-9 z-20 w-[268px] animate-floatup border border-amber/30 bg-[#12141a] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.95)] ${
                      flip ? 'right-0' : 'left-0'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-hairline bg-graphite px-3 py-2">
                      <span className="font-mono text-2xs uppercase tracking-widest text-amber">
                        {h.label}
                      </span>
                      <StatusDot tone={h.tone === 'rail' ? 'rail' : h.tone === 'good' ? 'good' : 'amber'} />
                    </div>
                    <dl className="divide-y divide-hairline">
                      {h.readouts.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 px-3 py-1.5">
                          <dt className="font-mono text-2xs uppercase tracking-widest text-slate-tech">{k}</dt>
                          <dd className="num text-2xs text-signal">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )
          })}

          {/* --------------------------------------------------- overlay chrome */}
          <div className="pointer-events-none absolute left-0 top-0 hidden w-full items-start justify-between p-6 lg:flex">
            <div className="pointer-events-auto border border-hairline bg-obsidian/86 px-4 py-3 backdrop-blur-sm">
              <span className="eyebrow-amber">FACILITY · {r.siteCode.toUpperCase()}</span>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-slate-tech">
                {r.city}, {r.country} · Zone {r.zone} · live since {r.live}
              </p>
            </div>
            <div className="pointer-events-auto border border-hairline bg-obsidian/86 px-4 py-3 text-right backdrop-blur-sm">
              <span className="eyebrow">PEER PATH · {peer.siteCode.toUpperCase()}</span>
              <p className="num mt-1.5 text-[11px] text-rail">
                {(values[`${region}|${peer.key}`] ?? peer.rtt[region]).toFixed(2)} ms RTT
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="shell flex flex-wrap items-end justify-between gap-4 pb-6">
              <p className="pointer-events-auto max-w-xl font-mono text-2xs uppercase leading-relaxed tracking-widest text-slate-tech">
                HOVER THE HOTSPOTS — live sensor envelope for racks 04A–04H, CDU loop, and the ToR leaf fabric
              </p>
              <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                <span className="badge badge-good">
                  <StatusDot tone="good" /> 100% PDU BALANCED
                </span>
                <span className="badge badge-rail">LIQUID INLET {r.coolantC}°C</span>
                <span className="badge">PUE {r.pue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ caption rail */}
        <div className="border-t border-hairline bg-carbon">
          <div className="shell grid grid-cols-2 divide-hairline md:grid-cols-4 md:divide-x">
            {[
              ['CAPTURE', 'Phase One IQ4 150MP · 35mm'],
              ['SUBJECT', `${r.city} hall · aisles 04A–04H`],
              ['COOLING', 'Direct-to-chip, 18.2°C inlet'],
              ['FABRIC', '64 × Quantum-2 NDR leaves'],
            ].map(([k, v], i) => (
              <div key={k} className={`px-5 py-4 ${i < 2 ? 'border-b border-hairline md:border-b-0' : ''}`}>
                <span className="eyebrow">{k}</span>
                <p className="mt-1.5 font-mono text-2xs text-slate-tech">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
