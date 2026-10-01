import { useMemo, useState } from 'react'
import { Icon, StatusDot } from './ui/Glyph'
import { SectionHeader } from './ui/Common'
import {
  FABRICS,
  GPU_TIERS,
  HOURS_PER_MONTH,
  STORAGE,
  TERMS,
  type FabricKey,
  type StorageKey,
  type TermKey,
} from '../data/spec'
import { REGIONS, REGION_MAP, type RegionKey } from '../data/regions'
import { buildAllocation, computeMetrics, type ClusterSpec } from '../lib/provision'
import { compact, group, usd } from '../lib/format'
import type { ClusterAllocation } from '../lib/provision'

export function ClusterConfigurator({
  region,
  onRegionChange,
  onProvision,
}: {
  region: RegionKey
  onRegionChange: (r: RegionKey) => void
  onProvision: (allocation: ClusterAllocation) => void
}) {
  const [tierIndex, setTierIndex] = useState(3) // 64 GPUs — the training sweet spot
  const [fabric, setFabric] = useState<FabricKey>('ib-ndr')
  const [storage, setStorage] = useState<StorageKey>('weka')
  const [term, setTerm] = useState<TermKey>('reserved')
  const [submitting, setSubmitting] = useState(false)

  const spec: ClusterSpec = useMemo(
    () => ({ gpus: GPU_TIERS[tierIndex].gpus, fabric, storage, term, region }),
    [tierIndex, fabric, storage, term, region],
  )

  const m = useMemo(() => computeMetrics(spec), [spec])
  const fabricOpt = FABRICS.find((f) => f.key === fabric)!
  const storageOpt = STORAGE.find((s) => s.key === storage)!
  const termOpt = TERMS.find((t) => t.key === term)!
  const r = REGION_MAP[region]

  const perGpu = termOpt.rate + fabricOpt.surcharge + storageOpt.surcharge
  const listHourly = spec.gpus * (TERMS[0].rate + fabricOpt.surcharge + storageOpt.surcharge)
  const saving = listHourly - m.costPerHour

  /* Derived operator metrics */
  const inferenceTokS = Math.round(spec.gpus * 180 * m.collectiveEfficiency)
  const mfu = (0.612 * m.collectiveEfficiency) / fabricOpt.collectiveEfficiency
  const effMfu = 0.612 * (fabricOpt.key === 'ib-ndr' ? 1 : 0.86)

  const submit = () => {
    setSubmitting(true)
    // Control-plane round trip: the allocation record is materialised, then
    // handed to the provisioning modal for the operator to acknowledge.
    window.setTimeout(() => {
      const alloc = buildAllocation(spec)
      setSubmitting(false)
      onProvision(alloc)
    }, 900)
  }

  return (
    <section id="clusters" className="border-b border-hairline bg-obsidian py-16 sm:py-24">
      <div className="shell">
        <SectionHeader
          index="02"
          eyebrow="BARE-METAL CLUSTERS · ALLOCATION BUILDER"
          title={
            <>
              Size the fabric. <span className="text-amber">See the exact run-rate</span> before you commit a
              single GPU-hour.
            </>
          }
          lede="Every allocation is a dedicated, uninterruptible slice of physical silicon. Rates below are the live contract surface for the selected campus — no reserved-instance arithmetic, no egress traps."
          right={
            <div className="border border-hairline bg-carbon px-4 py-3">
              <span className="eyebrow">CAMPUS QUEUE</span>
              <p className="mt-1.5 flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-good">
                <StatusDot tone="good" /> ZERO QUEUE · {r.city.toUpperCase()}
              </p>
              <p className="num mt-1 text-2xs text-slate-dim">
                {group(r.nodes)} nodes online · {r.tz}
              </p>
            </div>
          }
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_460px]">
          {/* ==================================================== control column */}
          <div className="flex flex-col gap-5">
            {/* ------------------------------------------------------- gpu count */}
            <div className="border border-hairline bg-carbon p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="field-label !mb-0">DEDICATED GPU NODE COUNT</span>
                  <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-slate-dim">
                    {GPU_TIERS[tierIndex].tag} · {m.nodes} × HGX H100 SXM5
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="num text-[34px] leading-none tracking-tightest text-amber">
                    {group(spec.gpus)}
                  </span>
                  <span className="num text-2sm text-slate-dim">GPUs</span>
                </div>
              </div>

              <div className="mt-6">
                <input
                  type="range"
                  min={0}
                  max={GPU_TIERS.length - 1}
                  step={1}
                  value={tierIndex}
                  onChange={(e) => setTierIndex(Number(e.target.value))}
                  className="range-precision"
                  aria-label="Dedicated GPU node count"
                />
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {GPU_TIERS.map((t, i) => (
                    <button
                      key={t.gpus}
                      type="button"
                      onClick={() => setTierIndex(i)}
                      className={`border py-2 text-center font-mono text-2xs transition-colors ${
                        i === tierIndex
                          ? 'border-amber bg-amber/10 text-amber'
                          : 'border-hairline text-slate-dim hover:border-slate-faint hover:text-slate-tech'
                      }`}
                    >
                      <span className="block num">{t.gpus}</span>
                      <span className="mt-0.5 block text-[9px] opacity-70">{t.tag.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
                {[
                  ['NODES', `${m.nodes}`],
                  ['HBM3 TOTAL', `${m.vramTb.toFixed(1)} TB`],
                  ['RACKS', `${Math.ceil(m.nodes / 8)}`],
                  ['NVSWITCH', '4.2 TB/s / node'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-obsidian px-3 py-2.5">
                    <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</span>
                    <p className="num mt-1 text-[12.5px] text-signal">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ----------------------------------------------------------- fabric */}
            <div className="border border-hairline bg-carbon p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="field-label !mb-0">INTERCONNECT FABRIC</span>
                <span className="num text-2xs text-slate-dim">
                  ε {fabricOpt.collectiveEfficiency.toFixed(2)} collective efficiency
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {FABRICS.map((f) => {
                  const on = f.key === fabric
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFabric(f.key)}
                      className={`radio-card text-left ${on ? 'radio-card-on' : 'radio-card-off'}`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span
                            className={`block font-mono text-[12px] tracking-wide ${
                              on ? 'text-amber' : 'text-signal'
                            }`}
                          >
                            {f.name}
                          </span>
                          <span className="mt-1 block font-mono text-2xs text-slate-dim">{f.spec}</span>
                        </span>
                        <span
                          className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
                            on ? 'border-amber bg-amber' : 'border-slate-faint'
                          }`}
                        >
                          {on && <Icon name="check" className="h-2.5 w-2.5 text-obsidian" strokeWidth={3} />}
                        </span>
                      </span>
                      <span className="mt-3 block font-mono text-2xs leading-relaxed text-slate-tech">
                        {f.note}
                      </span>
                      <span className="mt-2 block num text-2xs text-rail">+ ${f.surcharge.toFixed(2)} / GPU / hr</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ------------------------------------ storage + term + region grid */}
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="border border-hairline bg-carbon p-5 sm:p-6">
                <span className="field-label">STORAGE TIER</span>
                <div className="relative">
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value as StorageKey)}
                    className="field !py-3 pr-10"
                    aria-label="Storage tier"
                  >
                    {STORAGE.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="chevron-down"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-dim"
                  />
                </div>
                <div className="mt-4 border border-hairline bg-obsidian p-3">
                  <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">
                    {storageOpt.spec}
                  </span>
                  <p className="mt-1.5 font-mono text-2xs leading-relaxed text-slate-tech">{storageOpt.note}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2.5">
                    <span className="num text-2xs text-rail">{storageOpt.throughput}</span>
                    <span className="num text-2xs text-signal">+ ${storageOpt.surcharge.toFixed(2)} / GPU / hr</span>
                  </div>
                </div>

                <div className="mt-5">
                  <span className="field-label">DEPLOYMENT CAMPUS</span>
                  <div className="relative">
                    <select
                      value={region}
                      onChange={(e) => onRegionChange(e.target.value as RegionKey)}
                      className="field !py-3 pr-10"
                      aria-label="Deployment campus"
                    >
                      {REGIONS.map((x) => (
                        <option key={x.key} value={x.key}>
                          {x.label} — {x.zone}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="chevron-down"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-dim"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                    {[
                      ['PUE', r.pue.toFixed(2)],
                      ['COOLANT', `${r.coolantC}°C`],
                      ['SPOT FLOOR', `$${r.spotFloor.toFixed(2)}`],
                    ].map(([k, v]) => (
                      <span key={k} className="flex items-center gap-2">
                        <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</span>
                        <span className="num text-2xs text-signal">{v}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------- billing */}
              <div className="border border-hairline bg-carbon p-5 sm:p-6">
                <span className="field-label">BILLING TERM</span>
                <div className="flex flex-col gap-2">
                  {TERMS.map((t) => {
                    const on = t.key === term
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTerm(t.key)}
                        className={`radio-card flex items-center justify-between gap-3 ${
                          on ? 'radio-card-on' : 'radio-card-off'
                        }`}
                      >
                        <span className="min-w-0 text-left">
                          <span
                            className={`block font-mono text-[12px] tracking-wide ${
                              on ? 'text-amber' : 'text-signal'
                            }`}
                          >
                            {t.name}
                          </span>
                          <span className="num mt-1 block text-2xs text-slate-dim">
                            ${t.rate.toFixed(2)} / GPU / hr
                          </span>
                        </span>
                        <span
                          className={`shrink-0 border px-2 py-1 font-mono text-2xs tracking-widest ${
                            on ? 'border-amber/50 text-amber' : 'border-hairline text-slate-dim'
                          }`}
                        >
                          {t.discountLabel}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-4 border-t border-hairline pt-3 font-mono text-2xs leading-relaxed text-slate-tech">
                  {termOpt.note}
                </p>
                {termOpt.preemption > 0 && (
                  <p className="mt-2 font-mono text-2xs text-amber">
                    Preemption exposure {(termOpt.preemption * 100).toFixed(0)}% · 90 s drain window
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================== readout column */}
          <aside className="flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start">
            <div className="corner-ticks border border-hairline bg-graphite">
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3.5">
                <span className="eyebrow-amber">LIVE ALLOCATION READOUT</span>
                <StatusDot tone="amber" />
              </div>

              <div className="grid grid-cols-2 gap-px bg-hairline">
                {[
                  {
                    label: 'TOTAL CLUSTER TFLOPs',
                    value: compact(m.tflops, 1),
                    unit: 'FP8 TENSOR CORE',
                    tone: 'text-amber',
                  },
                  {
                    label: 'AGGREGATE FABRIC',
                    value: m.bandwidthTbs.toFixed(1),
                    unit: 'TB/s BISECTION',
                    tone: 'text-rail',
                  },
                  {
                    label: 'COST PER HOUR',
                    value: usd(m.costPerHour, 2),
                    unit: `${usd(perGpu, 2)} / GPU·HR`,
                    tone: 'text-signal',
                  },
                  {
                    label: 'MONTHLY RUN-RATE',
                    value: usd(m.monthly, 0),
                    unit: `${HOURS_PER_MONTH} HOURS`,
                    tone: 'text-signal',
                  },
                ].map((k) => (
                  <div key={k.label} className="bg-graphite px-5 py-5">
                    <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">{k.label}</span>
                    <p className={`num mt-3 text-[26px] leading-none tracking-tightest ${k.tone}`}>{k.value}</p>
                    <p className="mt-2 font-mono text-2xs text-slate-dim">{k.unit}</p>
                  </div>
                ))}
              </div>

              {/* ------------------------------------------------------ breakdown */}
              <div className="border-t border-hairline px-5 py-4">
                <span className="eyebrow">RATE BREAKDOWN · PER GPU / HOUR</span>
                <dl className="mt-3 divide-y divide-hairline/70">
                  {[
                    [termOpt.name, `$${termOpt.rate.toFixed(2)}`],
                    [`${fabricOpt.name} fabric`, `+ $${fabricOpt.surcharge.toFixed(2)}`],
                    [`${storageOpt.name}`, `+ $${storageOpt.surcharge.toFixed(2)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-2">
                      <dt className="truncate font-mono text-2xs text-slate-tech">{k}</dt>
                      <dd className="num shrink-0 text-2xs text-signal">{v}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="font-mono text-2xs uppercase tracking-widest text-amber">EFFECTIVE RATE</dt>
                    <dd className="num text-2xs text-amber">{usd(perGpu, 2)}</dd>
                  </div>
                </dl>
                {saving > 0 && (
                  <div className="mt-3 flex items-center justify-between gap-3 border border-good/25 bg-good/[0.05] px-3 py-2">
                    <span className="font-mono text-2xs uppercase tracking-widest text-good">
                      SAVED VS HOURLY SPOT
                    </span>
                    <span className="num text-2xs text-good">
                      {usd(saving, 2)} / hr · {usd(saving * HOURS_PER_MONTH, 0)} / mo
                    </span>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------ derived metrics */}
              <div className="grid grid-cols-2 gap-px border-t border-hairline bg-hairline">
                {[
                  ['EST. MFU', `${(effMfu * 100).toFixed(1)}%`, 'GPT-3 6.7B · 64 ranks'],
                  [
                    'INFERENCE',
                    `${compact(inferenceTokS, 1)} tok/s`,
                    'Llama-3.1-70B · vLLM TP=8',
                  ],
                ].map(([k, v, sub]) => (
                  <div key={k} className="bg-graphite px-5 py-4">
                    <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</span>
                    <p className="num mt-2 text-[15px] text-signal">{v}</p>
                    <p className="mt-1 font-mono text-2xs text-slate-dim">{sub}</p>
                  </div>
                ))}
              </div>

              {/* ------------------------------------------------------- provision */}
              <div className="border-t border-hairline px-5 py-5">
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="btn btn-primary w-full !py-3.5 text-[12px]"
                >
                  {submitting ? (
                    <>
                      <span className="h-2 w-2 animate-blink bg-obsidian" />
                      ALLOCATING PHYSICAL SILICON
                    </>
                  ) : (
                    <>
                      <Icon name="bolt" className="h-4 w-4" />
                      PROVISION CLUSTER ALLOCATION
                    </>
                  )}
                </button>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-mono text-2xs text-slate-dim">
                    <StatusDot tone="good" pulse={false} />
                    {spec.gpus} GPUs AVAILABLE IN {r.siteCode.toUpperCase()}
                  </span>
                  <span className="num text-2xs text-slate-dim">42 s median cold-start</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 border border-hairline bg-carbon p-4">
              <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-good" />
              <p className="font-mono text-2xs leading-relaxed text-slate-tech">
                Allocations are physically dedicated. No oversubscribed vCPU ratio, no noisy-neighbour steal —
                your tenancy owns the spine port, the NIC and the HBM stack for the full term.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
