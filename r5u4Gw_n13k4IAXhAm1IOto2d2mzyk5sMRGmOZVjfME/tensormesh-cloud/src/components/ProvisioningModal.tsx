import { useEffect, useMemo, useState } from 'react'
import { Modal } from './ui/Modal'
import { Icon, StatusDot } from './ui/Glyph'
import { CopyRow } from './ui/Common'
import { REGION_MAP } from '../data/regions'
import type { ClusterAllocation } from '../lib/provision'
import { group, usd } from '../lib/format'

const STAGES = [
  { label: 'RESOLVING ALLOCATION LEASE', detail: 'control-plane/eu-central-1 · token verified' },
  { label: 'BINDING PRIVATE VPC SUBNET', detail: 'annealing route tables · no cross-tenant path' },
  { label: 'MAPPING INFINIBAND TOPOLOGY', detail: 'rail-optimised, SHARPv3 trees armed' },
  { label: 'GENERATING SSH CONNECTION STRING', detail: 'ed25519 host key pinned to tenant acct-4471' },
]

export function ProvisioningModal({
  open,
  onClose,
  allocation,
  onSwitchRegionTab,
}: {
  open: boolean
  onClose: () => void
  allocation: ClusterAllocation | null
  onSwitchRegionTab?: () => void
}) {
  const [stage, setStage] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) {
      setStage(0)
      setDone(false)
      return
    }
    setStage(0)
    setDone(false)
    const timers: number[] = []
    STAGES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStage(i + 1), 380 + i * 420))
    })
    timers.push(window.setTimeout(() => setDone(true), 380 + STAGES.length * 420))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [open])

  const regionLabel = allocation ? REGION_MAP[allocation.region].label : ''

  const manifest = useMemo(() => {
    if (!allocation) return ''
    return JSON.stringify(
      {
        allocation_id: allocation.allocationId,
        cluster: allocation.clusterName,
        region: allocation.regionLabel,
        zone: allocation.zone,
        node_count: allocation.nodes,
        gpu_count: allocation.gpus,
        racks: allocation.racks,
        fabric: `${allocation.fabricName} — ${allocation.fabricSpec}`,
        storage: `${allocation.storageName} — ${allocation.storageSpec}`,
        billing_term: allocation.termName,
        private_subnet: allocation.subnet,
        tflops_fp8_dense: allocation.tflops,
        aggregate_bandwidth_tbs: Number(allocation.bandwidthTbs.toFixed(2)),
        cost_per_hour_usd: Number(allocation.costPerHour.toFixed(2)),
        monthly_run_rate_usd: Number(allocation.monthly.toFixed(2)),
        ssh: allocation.sshCommand,
        ingress: allocation.ingressHost,
        image: allocation.image,
        requested_at: allocation.requestedAt,
      },
      null,
      2,
    )
  }, [allocation])

  if (!open || !allocation) return null

  const downloadManifest = () => {
    const blob = new Blob([manifest], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${allocation.allocationId}-manifest.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      tag={`${allocation.zone} · ${allocation.termName.toUpperCase()}`}
      title={`Cluster allocation ${allocation.allocationId}`}
      subtitle="Lease materialised against the regional control plane. Credentials and connection strings below are bound to tenant acct-4471 and expire with the billing term."
      footer={
        <>
          <div className="flex flex-wrap items-center gap-4">
            <span className="badge badge-good">
              <StatusDot tone="good" /> LEASE ACTIVE
            </span>
            <span className="num text-2xs text-slate-dim">SLA {allocation.slaTier}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadManifest} className="btn btn-ghost">
              <Icon name="arrow-down" className="h-3.5 w-3.5" />
              DOWNLOAD MANIFEST
            </button>
            {onSwitchRegionTab && (
              <button type="button" onClick={onSwitchRegionTab} className="btn btn-ghost">
                <Icon name="network" className="h-3.5 w-3.5" />
                VIEW IN TOPOLOGY
              </button>
            )}
            <button type="button" onClick={onClose} className="btn btn-primary">
              <Icon name="check" className="h-3.5 w-3.5" />
              ACKNOWLEDGE
            </button>
          </div>
        </>
      }
    >
      {/* ------------------------------------------------------ stage progress */}
      <div className="border border-hairline bg-obsidian">
        {STAGES.map((s, i) => {
          const complete = stage > i
          const running = stage === i
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 border-b border-hairline/70 px-4 py-3 last:border-b-0 ${
                complete ? 'opacity-100' : running ? 'opacity-100' : 'opacity-45'
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {complete ? (
                  <Icon name="check" className="h-3.5 w-3.5 text-good" strokeWidth={2.2} />
                ) : running ? (
                  <span className="h-2 w-2 animate-blink bg-amber" />
                ) : (
                  <span className="h-2 w-2 border border-hairline bg-graphite" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className={`block font-mono text-2xs uppercase tracking-widest ${
                    complete ? 'text-signal' : running ? 'text-amber' : 'text-slate-dim'
                  }`}
                >
                  {s.label}
                </span>
                <span className="mt-0.5 block font-mono text-2xs text-slate-dim">{s.detail}</span>
              </div>
              <span className="num shrink-0 text-2xs text-slate-dim">
                {complete ? 'OK' : running ? '···' : 'QUEUED'}
              </span>
            </div>
          )
        })}
      </div>

      {/* --------------------------------------------------------------- record */}
      <div
        className={`transition-opacity duration-500 ${done ? 'opacity-100' : 'pointer-events-none opacity-30'}`}
      >
        <div className="mt-6 border border-good/30 bg-good/[0.04] px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Icon name="check" className="h-4 w-4 shrink-0 text-good" strokeWidth={2.2} />
              <p className="font-mono text-[12px] leading-relaxed text-signal">
                <span className="text-good">Cluster Allocation #{allocation.allocationId}</span> provisioned in
                Region {regionLabel.replace(/\s*\(.*\)/, '')}. Private VPC Subnet{' '}
                <span className="text-amber">{allocation.subnet}</span> assigned. Root SSH connection string
                generated.
              </p>
            </div>
            <span className="num text-2xs text-slate-dim">{allocation.requestedAt}</span>
          </div>
        </div>

        {/* headline numbers */}
        <div className="mt-5 grid grid-cols-2 gap-px border border-hairline bg-hairline lg:grid-cols-4">
          {[
            ['GPUs', `${group(allocation.gpus)}`, 'H100 SXM5 80GB'],
            ['NODES', `${allocation.nodes}`, `${allocation.racks} racks · HGX SXM5`],
            ['FP8 TENSOR', `${(allocation.tflops / 1000).toFixed(1)} PFLOPs`, 'dense, no sparsity'],
            ['RUN RATE', `${usd(allocation.monthly, 0)}`, 'per 730-hour month'],
          ].map(([k, v, sub]) => (
            <div key={k} className="bg-carbon px-4 py-4">
              <span className="eyebrow">{k}</span>
              <p className="num mt-2 text-lg text-signal">{v}</p>
              <p className="mt-1 font-mono text-2xs text-slate-dim">{sub}</p>
            </div>
          ))}
        </div>

        {/* connection surface */}
        <div className="mt-5 flex flex-col gap-2">
          <span className="eyebrow-amber">CONNECTION SURFACE</span>
          <CopyRow label="CLUSTER" value={allocation.clusterName} id="cluster" />
          <CopyRow label="INGRESS" value={allocation.ingressHost} id="ingress" />
          <CopyRow label="SSH" value={allocation.sshCommand} id="ssh" />
          <CopyRow label="IMAGE" value={allocation.image} id="image" />
          <CopyRow
            label="FABRIC"
            value={`${allocation.fabricName} — ${allocation.fabricSpec}`}
            id="fabric"
          />
          <CopyRow label="STORAGE" value={`${allocation.storageName} — ${allocation.storageSpec}`} id="storage" />
        </div>

        {/* assigned hosts */}
        <div className="mt-5 border border-hairline">
          <div className="flex items-center justify-between border-b border-hairline bg-graphite px-4 py-2.5">
            <span className="eyebrow">ASSIGNED HOSTS · FIRST {allocation.hostnames.length} OF {allocation.nodes}</span>
            <span className="num text-2xs text-slate-dim">READY</span>
          </div>
          <div className="divide-y divide-hairline/70">
            {allocation.hostnames.map((h) => (
              <div key={h} className="flex items-center justify-between gap-4 px-4 py-2">
                <code className="truncate font-mono text-[12px] text-signal">{h}</code>
                <span className="flex shrink-0 items-center gap-2 font-mono text-2xs uppercase tracking-widest text-good">
                  <StatusDot tone="good" pulse={false} />
                  RESERVED
                </span>
              </div>
            ))}
          </div>
          {allocation.nodes > allocation.hostnames.length && (
            <div className="border-t border-hairline bg-obsidian px-4 py-2.5">
              <span className="font-mono text-2xs text-slate-dim">
                + {allocation.nodes - allocation.hostnames.length} further hosts in the same rail group — full
                inventory in the downloaded manifest
              </span>
            </div>
          )}
        </div>

        <p className="mt-4 font-mono text-2xs leading-relaxed text-slate-dim">
          Aggregate fabric bandwidth {allocation.bandwidthTbs.toFixed(1)} TB/s across{' '}
          {allocation.nodes * 8} × 400G NICs. Billing begins at first CUDA kernel; the lease holds the physical
          allocation for the full term.
        </p>
      </div>
    </Modal>
  )
}
