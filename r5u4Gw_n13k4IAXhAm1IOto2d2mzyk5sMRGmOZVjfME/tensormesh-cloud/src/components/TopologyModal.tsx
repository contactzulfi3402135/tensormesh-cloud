import { useMemo, useState } from 'react'
import { Modal } from './ui/Modal'
import { Icon, StatusDot } from './ui/Glyph'
import { REGION_MAP, type RegionKey } from '../data/regions'

type Tier = 'spine' | 'leaf' | 'node'
interface Hover {
  kind: Tier
  index: number
}

const SPINES = [0, 1, 2, 3]
const LEAVES = [0, 1, 2, 3, 4, 5, 6, 7]
const NODES = [0, 1, 2, 3, 4, 5, 6, 7]

const VB_W = 1000
const VB_H = 620

const spineX = (i: number) => 140 + i * 240
const SPINE_Y = 54
const SPINE_H = 46
const SPINE_W = 160

const LEAF_Y = 244
const LEAF_H = 46
const LEAF_W = 92
const leafX = (i: number) => 60 + i * 118

const NODE_Y = 476
const NODE_H = 62
const NODE_W = 92
const nodeX = (i: number) => 60 + i * 118

const RAIL_COLORS = [
  '#F59E0B',
  '#06B6D4',
  '#F59E0B',
  '#06B6D4',
  '#F59E0B',
  '#06B6D4',
  '#F59E0B',
  '#06B6D4',
]

export function TopologyModal({
  open,
  onClose,
  region,
}: {
  open: boolean
  onClose: () => void
  region: RegionKey
}) {
  const [hover, setHover] = useState<Hover | null>(null)
  const r = REGION_MAP[region]

  const isLinkActive = useMemo(
    () =>
      (kind: 'spine-leaf' | 'leaf-node', a: number, b: number): boolean => {
        if (!hover) return false
        if (hover.kind === 'spine') return kind === 'spine-leaf' ? a === hover.index : true
        if (hover.kind === 'leaf') return kind === 'spine-leaf' ? b === hover.index : a === hover.index
        // node hover: its 8 rails up to every leaf, plus the leaf→spine uplinks
        return kind === 'leaf-node' ? b === hover.index : true
      },
    [hover],
  )

  const detail = useMemo(() => {
    if (!hover) {
      return {
        title: 'FABRIC OVERVIEW',
        tone: 'amber' as const,
        rows: [
          ['Tier', 'Spine (4) → Leaf (8) → Node (8)'],
          ['Oversubscription', '1 : 1 non-blocking'],
          ['Per-GPU egress', '400 Gbps × 8 rails = 3.2 Tbps'],
          ['Node bisection', '3.2 TB/s aggregate'],
          ['Adaptive routing', 'Quantum-2 AR, 3-level ECMP'],
          ['In-network reduction', 'SHARPv3, 512 MiB trees'],
        ],
      }
    }
    if (hover.kind === 'spine') {
      return {
        title: `SPINE-0${hover.index + 1} · QUANTUM-2 NDR`,
        tone: 'amber' as const,
        rows: [
          ['Model', 'MQM9700-NS2F · 64 × 800Gbps'],
          ['Role', 'Spine / core, fully meshed to 8 leaves'],
          ['Fabric latency', '1.84 μs (hop-optimised)'],
          ['Buffer', '128 GB shared packet buffer'],
          ['Ports utilised', '32 / 64 (N+1 headroom)'],
          ['Firmware', 'MLNX-OS 3.12.4012'],
        ],
      }
    }
    if (hover.kind === 'leaf') {
      return {
        title: `RAIL-0${hover.index + 1} · TOP-OF-RACK LEAF`,
        tone: 'rail' as const,
        rows: [
          ['Rail', `Rail ${hover.index + 1} of 8 — GPU ${hover.index + 1} on every node`],
          ['Uplinks', '4 × 800G to spines (1.6 Tbps)'],
          ['Downlinks', '8 × 400G to node NICs'],
          ['Symbol errors', '0.00e+00'],
          ['Congestion', '0 DCQCN PFC pause frames'],
          ['Peer leaves', '7 (full mesh within pod)'],
        ],
      }
    }
    return {
      title: `NODE-0${hover.index + 1} · HGX H100 SXM5`,
      tone: 'good' as const,
      rows: [
        ['Hostname', `tm-${r.siteCode}-h100-A01-node-0${hover.index + 1}`],
        ['GPUs', '8 × H100 SXM5 80GB (640 GiB HBM3)'],
        ['NVLink', 'NVSwitch 4th gen · 4.2 TB/s/node'],
        ['PCIe', 'Gen5 ×16 per GPU, 32.0 GT/s'],
        ['NICs', '8 × ConnectX-7 400G (rail-optimised)'],
        ['Inlet temp', `${r.coolantC}°C liquid · 61°C die`],
      ],
    }
  }, [hover, r.siteCode, r.coolantC])

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      tag={`${r.zone} · RAIL-OPTIMISED`}
      title="InfiniBand NDR Fabric Topology"
      subtitle="Spine-leaf topology with one dedicated rail per GPU. Hover any tier to trace the active forwarding path and its per-device telemetry."
      footer={
        <>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              ['#F59E0B', 'SPINE UPLINK 800G'],
              ['#06B6D4', 'RAIL PAIR A'],
              ['#F59E0B', 'RAIL PAIR B'],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-slate-dim">
                <span className="h-2 w-2" style={{ backgroundColor: c }} />
                {l}
              </span>
            ))}
          </div>
          <button type="button" onClick={onClose} className="btn btn-primary">
            CLOSE TOPOLOGY
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* ------------------------------------------------------------- diagram */}
        <div className="border border-hairline bg-obsidian">
          <div className="relative">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="w-full"
              role="img"
              aria-label="Rail-optimised InfiniBand fabric topology diagram"
            >
              <defs>
                <pattern id="tm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M24 0H0V24" fill="none" stroke="#1F242F" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width={VB_W} height={VB_H} fill="url(#tm-grid)" opacity="0.65" />

              {/* ------------------------------------------- spine → leaf links */}
              {SPINES.map((s) =>
                LEAVES.map((l) => {
                  const active = isLinkActive('spine-leaf', s, l)
                  return (
                    <path
                      key={`sl-${s}-${l}`}
                      d={`M ${spineX(s) + SPINE_W / 2} ${SPINE_Y + SPINE_H} C ${spineX(s) + SPINE_W / 2} ${
                        SPINE_Y + SPINE_H + 96
                      }, ${leafX(l) + LEAF_W / 2} ${LEAF_Y - 96}, ${leafX(l) + LEAF_W / 2} ${LEAF_Y}`}
                      fill="none"
                      stroke={active ? '#F59E0B' : '#2A3140'}
                      strokeWidth={active ? 1.5 : 0.7}
                      strokeOpacity={hover && !active ? 0.22 : active ? 0.95 : 0.75}
                      className="transition-all duration-200"
                    />
                  )
                }),
              )}

              {/* ------------------------------------------- leaf → node rails */}
              {LEAVES.map((l) =>
                NODES.map((n) => {
                  const active = isLinkActive('leaf-node', l, n)
                  const stroke = RAIL_COLORS[l]
                  return (
                    <path
                      key={`ln-${l}-${n}`}
                      d={`M ${leafX(l) + LEAF_W / 2} ${LEAF_Y + LEAF_H} C ${leafX(l) + LEAF_W / 2} ${
                        LEAF_Y + LEAF_H + 70
                      }, ${nodeX(n) + NODE_W / 2} ${NODE_Y - 70}, ${nodeX(n) + NODE_W / 2} ${NODE_Y}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={active ? 1.4 : 0.6}
                      strokeOpacity={hover ? (active ? 0.9 : 0.13) : 0.4}
                      className="transition-all duration-200"
                    />
                  )
                }),
              )}

              {/* ------------------------------------------------------- spines */}
              {SPINES.map((i) => {
                const active = hover?.kind === 'spine' && hover.index === i
                const related = hover?.kind === 'leaf' || hover?.kind === 'node'
                return (
                  <g
                    key={`sp-${i}`}
                    onMouseEnter={() => setHover({ kind: 'spine', index: i })}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={spineX(i)}
                      y={SPINE_Y}
                      width={SPINE_W}
                      height={SPINE_H}
                      fill={active ? 'rgba(245,158,11,0.14)' : '#111318'}
                      stroke={active ? '#F59E0B' : related ? '#3A4252' : '#1F242F'}
                      strokeWidth={active ? 1.4 : 1}
                    />
                    <text
                      x={spineX(i) + 12}
                      y={SPINE_Y + 20}
                      fill={active ? '#F59E0B' : '#8B949E'}
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fontSize="10.5"
                      letterSpacing="1.2"
                    >
                      SPINE-0{i + 1}
                    </text>
                    <text
                      x={spineX(i) + 12}
                      y={SPINE_Y + 35}
                      fill="#5A6472"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fontSize="9"
                    >
                      64 × 800G NDR
                    </text>
                    <circle cx={spineX(i) + SPINE_W - 14} cy={SPINE_Y + 14} r="3" fill="#10B981" />
                  </g>
                )
              })}

              {/* -------------------------------------------------------- leaves */}
              {LEAVES.map((i) => {
                const active = hover?.kind === 'leaf' && hover.index === i
                return (
                  <g
                    key={`lf-${i}`}
                    onMouseEnter={() => setHover({ kind: 'leaf', index: i })}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={leafX(i)}
                      y={LEAF_Y}
                      width={LEAF_W}
                      height={LEAF_H}
                      fill={active ? 'rgba(6,182,212,0.14)' : '#111318'}
                      stroke={active ? '#06B6D4' : '#1F242F'}
                      strokeWidth={active ? 1.4 : 1}
                    />
                    <text
                      x={leafX(i) + 10}
                      y={LEAF_Y + 20}
                      fill={active ? '#06B6D4' : '#8B949E'}
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fontSize="10"
                      letterSpacing="1"
                    >
                      RAIL-0{i + 1}
                    </text>
                    <rect x={leafX(i) + 10} y={LEAF_Y + 28} width={LEAF_W - 20} height="3" fill="#1F242F" />
                    <rect
                      x={leafX(i) + 10}
                      y={LEAF_Y + 28}
                      width={(LEAF_W - 20) * (0.72 + (i % 3) * 0.08)}
                      height="3"
                      fill={RAIL_COLORS[i]}
                      opacity="0.8"
                    />
                  </g>
                )
              })}

              {/* --------------------------------------------------------- nodes */}
              {NODES.map((i) => {
                const active = hover?.kind === 'node' && hover.index === i
                return (
                  <g
                    key={`nd-${i}`}
                    onMouseEnter={() => setHover({ kind: 'node', index: i })}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={nodeX(i)}
                      y={NODE_Y}
                      width={NODE_W}
                      height={NODE_H}
                      fill={active ? 'rgba(16,185,129,0.12)' : '#181B22'}
                      stroke={active ? '#10B981' : '#1F242F'}
                      strokeWidth={active ? 1.4 : 1}
                    />
                    <text
                      x={nodeX(i) + 10}
                      y={NODE_Y + 18}
                      fill={active ? '#10B981' : '#8B949E'}
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fontSize="10"
                      letterSpacing="1"
                    >
                      NODE-0{i + 1}
                    </text>
                    <text
                      x={nodeX(i) + 10}
                      y={NODE_Y + 31}
                      fill="#5A6472"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fontSize="8.5"
                    >
                      8 × H100 SXM5
                    </text>
                    {/* 8 GPU ticks — one per rail */}
                    {LEAVES.map((g) => (
                      <rect
                        key={g}
                        x={nodeX(i) + 10 + g * 9}
                        y={NODE_Y + 40}
                        width="6"
                        height="9"
                        fill={
                          hover?.kind === 'leaf' && hover.index === g
                            ? RAIL_COLORS[g]
                            : active
                              ? '#10B981'
                              : '#2A3140'
                        }
                        opacity={hover && !active && !(hover.kind === 'leaf' && hover.index === g) ? 0.4 : 1}
                        className="transition-all duration-200"
                      />
                    ))}
                  </g>
                )
              })}

              {/* ---------------------------------------------- tier annotations */}
              <g fontFamily="ui-monospace, SFMono-Regular, monospace" fontSize="9" letterSpacing="1.4">
                <text x="14" y={SPINE_Y + 24} fill="#3A414D">
                  TIER-0
                </text>
                <text x="14" y={LEAF_Y + 24} fill="#3A414D">
                  TIER-1
                </text>
                <text x="14" y={NODE_Y + 30} fill="#3A414D">
                  TIER-2
                </text>
              </g>
              <text
                x={VB_W - 16}
                y={SPINE_Y - 18}
                textAnchor="end"
                fill="#3A414D"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fontSize="9"
                letterSpacing="1.4"
              >
                4 SPINES · 8 LEAVES · 64 NODES · 512 GPUs · 0.4μs HOP
              </text>
            </svg>
          </div>
          <div className="border-t border-hairline px-4 py-3">
            <p className="font-mono text-2xs uppercase tracking-widest text-slate-dim">
              HOVER A TIER TO TRACE FORWARDING · CLICK NOT REQUIRED
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- detail panel */}
        <aside className="flex flex-col gap-4">
          <div className="border border-hairline bg-carbon">
            <div className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-3">
              <span
                className={`font-mono text-2xs uppercase tracking-widest ${
                  detail.tone === 'rail' ? 'text-rail' : detail.tone === 'good' ? 'text-good' : 'text-amber'
                }`}
              >
                {detail.title}
              </span>
              <StatusDot tone={detail.tone === 'rail' ? 'rail' : detail.tone === 'good' ? 'good' : 'amber'} />
            </div>
            <dl className="divide-y divide-hairline">
              {detail.rows.map(([k, v]) => (
                <div key={k} className="px-4 py-2.5">
                  <dt className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</dt>
                  <dd className="num mt-1 text-[12px] leading-snug text-signal">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-hairline bg-carbon p-4">
            <span className="eyebrow">ACTIVE PATH ENVELOPE</span>
            <div className="mt-3 space-y-3">
              {[
                ['HOP 1', 'NIC → leaf', '0.42 μs'],
                ['HOP 2', 'leaf → spine', '0.68 μs'],
                ['HOP 3', 'spine → leaf', '0.68 μs'],
                ['HOP 4', 'leaf → NIC', '0.06 μs'],
              ].map(([h, desc, v]) => (
                <div key={h} className="flex items-center gap-3">
                  <span className="num w-[42px] shrink-0 text-2xs text-slate-dim">{h}</span>
                  <span className="flex-1 font-mono text-2xs text-slate-tech">{desc}</span>
                  <span className="num text-2xs text-rail">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
              <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">TOTAL — 4 HOPS</span>
              <span className="num text-[13px] text-amber">1.84 μs</span>
            </div>
          </div>

          <div className="flex items-start gap-3 border border-hairline bg-carbon p-4">
            <Icon name="network" className="mt-0.5 h-4 w-4 shrink-0 text-rail" />
            <p className="font-mono text-2xs leading-relaxed text-slate-tech">
              Telemetry sampled from the {r.city} fabric at 2 Hz and mirrored into your tenant's Prometheus
              endpoint under the <span className="text-signal">tensormesh_fabric_*</span> namespace.
            </p>
          </div>
        </aside>
      </div>
    </Modal>
  )
}
