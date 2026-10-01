import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALLREDUCE_RESULT,
  ALLREDUCE_STAGES,
  CLI_HELP,
  DEPLOY_LOG,
  SAMPLE_NODES,
} from '../data/terminal'
import { REGIONS } from '../data/regions'
import { machineToken } from '../lib/provision'

export type Tone = 'signal' | 'muted' | 'good' | 'amber' | 'rail' | 'crit' | 'prompt'

export interface TermLine {
  id: number
  text: string
  tone: Tone
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/* ------------------------------- table helpers ----------------------------- */

function pad(value: string, width: number) {
  return value.length >= width ? value.slice(0, width) : value + ' '.repeat(width - value.length)
}

function nodesTable(): string[] {
  const cols = [
    ['HOSTNAME', 30],
    ['GPU', 18],
    ['GPUS', 6],
    ['VRAM', 10],
    ['ECC', 8],
    ['PCIE BUS', 20],
    ['NVLINK', 10],
    ['TEMP', 7],
    ['UTIL', 7],
    ['STATE', 8],
  ] as const

  const header = cols.map(([label, w]) => pad(label, w)).join('')
  const rule = cols.map(([, w]) => '─'.repeat(w)).join('')
  const body = SAMPLE_NODES.map((n) =>
    [
      pad(n.hostname, 30),
      pad(n.gpu, 18),
      pad(n.gpus, 6),
      pad(n.vram, 10),
      pad(n.ecc, 8),
      pad(n.pcie, 20),
      pad(n.nvlink, 10),
      pad(n.temp, 7),
      pad(n.util, 7),
      pad(n.state, 8),
    ].join(''),
  )

  return [
    header,
    rule,
    ...body,
    '',
    `  8 nodes · 64 × H100-SXM5-80G · 5,120 GiB aggregate HBM · 0 ECC correctable · 0 XID faults`,
    `  fabric: IB NDR 800Gbps · rails 1-8 UP · SHARPv3 enabled · NCCL 2.22.3`,
  ]
}

function regionsTable(): string[] {
  const cols = [
    ['REGION', 16],
    ['ZONE', 15],
    ['NODES', 8],
    ['PUE', 7],
    ['COOLANT', 10],
    ['SPOT FLOOR', 12],
    ['RTT Δ', 9],
  ] as const
  const header = cols.map(([l, w]) => pad(l, w)).join('')
  const rule = cols.map(([, w]) => '─'.repeat(w)).join('')
  const body = REGIONS.map((r) =>
    [
      pad(r.city, 16),
      pad(r.zone, 15),
      pad(String(r.nodes), 8),
      pad(r.pue.toFixed(2), 7),
      pad(`${r.coolantC}°C`, 10),
      pad(`$${r.spotFloor.toFixed(2)}`, 12),
      pad(`${r.rtt[r.key].toFixed(1)}ms`, 9),
    ].join(''),
  )
  return [header, rule, ...body, '', '  spot floor = dedicated H100 SXM5, USD per GPU-hour, no fabric surcharge']
}

function progressBar(ratio: number, width = 28) {
  const filled = Math.round(ratio * width)
  return `[${'█'.repeat(filled)}${'░'.repeat(Math.max(0, width - filled))}] ${String(
    Math.round(ratio * 100),
  ).padStart(3)}%`
}

/* --------------------------------- the hook -------------------------------- */

export function useTerminal(regionLabel: string, clusterId: string) {
  const [lines, setLines] = useState<TermLine[]>([])
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const seq = useRef(0)
  const cancelled = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      cancelled.current = true
    }
  }, [])

  const nextId = () => ++seq.current

  /** Append immutable lines to the buffer. */
  const push = useCallback((entries: Array<string | { text: string; tone?: Tone }>) => {
    if (!mounted.current) return
    setLines((prev) => {
      const added = entries.map((e) => {
        const text = typeof e === 'string' ? e : e.text
        const tone: Tone = typeof e === 'string' ? 'muted' : (e.tone ?? 'muted')
        return { id: ++seq.current, text, tone }
      })
      return [...prev, ...added].slice(-400)
    })
  }, [])

  /** Replace the most recent line in place — used for progress bars. */
  const replaceLast = useCallback((text: string, tone: Tone = 'rail') => {
    if (!mounted.current) return
    setLines((prev) => {
      if (prev.length === 0) return [{ id: ++seq.current, text, tone }]
      const copy = prev.slice()
      copy[copy.length - 1] = { ...copy[copy.length - 1], text, tone }
      return copy
    })
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const banner = useCallback(() => {
    push([
      { text: 'TensorMesh Shell 3.8.4-prod (x86_64-unknown-linux-gnu)', tone: 'signal' },
      {
        text: `Control plane: eu-central-1 · target region: ${regionLabel} · TLS 1.3 · mTLS session pinned`,
        tone: 'muted',
      },
      { text: 'Type "help" for the command surface. Tab-completion is enabled.', tone: 'muted' },
      { text: '', tone: 'muted' },
    ])
  }, [push])

  const run = useCallback(
    async (raw: string) => {
      const input = raw.trim()
      if (!input) return
      if (busy) return

      cancelled.current = false
      setHistory((h) => (h[h.length - 1] === input ? h : [...h, input].slice(-60)))
      push([{ text: `ops@tensormesh:${clusterId}$ ${input}`, tone: 'prompt' }])

      const lower = input.toLowerCase().replace(/\s+/g, ' ')
      const t0 = performance.now()

      /* ------------------------------------------------------------- clear */
      if (lower === 'clear' || lower === 'cls') {
        clear()
        return
      }

      /* -------------------------------------------------------------- help */
      if (lower === 'help' || lower === 'tensormesh help' || lower === 'tensormesh --help') {
        push([
          { text: 'TENSOR MESH CLI — available commands', tone: 'amber' },
          { text: '', tone: 'muted' },
          ...CLI_HELP.map(([cmd, desc]) => ({
            text: `  ${pad(cmd, 52)}${desc}`,
            tone: 'muted' as Tone,
          })),
          { text: '', tone: 'muted' },
          { text: '  Flags: --region <key>  --json  --watch  --no-color', tone: 'muted' },
          { text: '', tone: 'muted' },
        ])
        return
      }

      /* --------------------------------------------------------- version */
      if (lower === 'tensormesh --version' || lower === 'tensormesh -v' || lower === 'tensormesh version') {
        push([
          { text: 'tensormesh 3.8.4-prod (2026-09-28)', tone: 'signal' },
          { text: 'cuda 12.6 · nccl 2.22.3 · hwloc 2.11.0 · target x86_64-unknown-linux-gnu', tone: 'muted' },
          { text: `active region: ${regionLabel}`, tone: 'muted' },
          { text: '', tone: 'muted' },
        ])
        return
      }

      /* ------------------------------------------------------ nodes list */
      if (lower.startsWith('tensormesh nodes list') || lower === 'tensormesh nodes') {
        setBusy(true)
        push([{ text: '→ querying fleet registry (eu-central-1) ...', tone: 'muted' }])
        await sleep(340)
        if (cancelled.current) return
        push([{ text: '✔ 8 nodes returned · lease cl-zurich-01 · tenant acct-4471', tone: 'good' }, { text: '', tone: 'muted' }])
        push(nodesTable().map((t) => ({ text: t, tone: t.startsWith('HOSTNAME') || t.startsWith('─') ? 'amber' : 'muted' })))
        push([{ text: '', tone: 'muted' }])
        setBusy(false)
        return
      }

      /* --------------------------------------------------------- regions */
      if (lower.startsWith('tensormesh regions')) {
        setBusy(true)
        await sleep(260)
        if (cancelled.current) return
        push([{ text: '✔ 4 campuses online · fabric fully meshed (6 peer paths)', tone: 'good' }, { text: '', tone: 'muted' }])
        push(regionsTable().map((t) => ({ text: t, tone: t.startsWith('REGION') || t.startsWith('─') ? 'amber' : 'muted' })))
        push([{ text: '', tone: 'muted' }])
        setBusy(false)
        return
      }

      /* ------------------------------------------------- allreduce bench */
      if (lower.includes('bench') && lower.includes('allreduce')) {
        setBusy(true)
        push([{ text: `→ tensormesh bench --allreduce --ranks 64 --message-size 512MiB`, tone: 'muted' }])
        await sleep(200)
        for (const stage of ALLREDUCE_STAGES) {
          if (cancelled.current) return
          push([{ text: `  ${progressBar(0)}  ${stage.label}`, tone: 'rail' }])
          const steps = 9
          for (let s = 1; s <= steps; s++) {
            if (cancelled.current) return
            await sleep(46 + Math.random() * 26)
            replaceLast(`  ${progressBar(s / steps)}  ${stage.label}`, 'rail')
          }
          replaceLast(`  ${progressBar(1)}  ${stage.label}  ✔`, 'good')
        }
        await sleep(220)
        if (cancelled.current) return
        push([{ text: '', tone: 'muted' }])
        push([
          { text: 'BENCHMARK REPORT — NCCL RING ALL-REDUCE', tone: 'amber' },
          { text: `  ${pad('ranks', 34)}64 × H100 SXM5 (8 nodes × 8)` },
          { text: `  ${pad('fabric', 34)}InfiniBand NDR 800Gbps · 8 rails` },
          ...ALLREDUCE_RESULT.map((r) => ({ text: `  ${pad(r.k, 34)}${r.v}`, tone: 'muted' as Tone })),
          { text: `  ${pad('elapsed', 34)}${((performance.now() - t0) / 1000).toFixed(2)} s` },
          { text: '' },
          { text: '  Average Ring Latency: 1.84μs | STATUS: PASSED', tone: 'good' },
          { text: '' },
        ])
        setBusy(false)
        return
      }

      /* ------------------------------------------------------------ deploy */
      if (lower.startsWith('tensormesh deploy')) {
        setBusy(true)
        const clusterMatch = input.match(/--cluster\s+([\w-]+)/i)
        const imageMatch = input.match(/--image\s+([\w.\-:]+)/i)
        const target = clusterMatch?.[1] ?? 'cl-zurich-01'
        const image = imageMatch?.[1] ?? 'pytorch-2.4'
        push([
          { text: `→ deploy requested · cluster=${target} image=${image} region=${regionLabel}`, tone: 'muted' },
          { text: '', tone: 'muted' },
        ])
        let last = 0
        for (const entry of DEPLOY_LOG) {
          if (cancelled.current) return
          await sleep(Math.max(40, entry.at - last))
          last = entry.at
          push([{ text: entry.text || ' ', tone: (entry.tone as Tone) ?? 'muted' }])
        }
        await sleep(180)
        if (cancelled.current) return
        push([
          { text: '', tone: 'muted' },
          { text: `✔ deployment complete · vmid ${machineToken(Date.now() % 9973)} · 512 GPUs schedulable`, tone: 'good' },
          { text: `  ssh -i ~/.ssh/tensormesh_ed25519 -p 2222 ops@${target}.ingress.eu-central-1.tensormesh.cloud`, tone: 'rail' },
          { text: '', tone: 'muted' },
        ])
        setBusy(false)
        return
      }

      /* ------------------------------------------------------- ssh helper */
      if (lower.startsWith('ssh ')) {
        setBusy(true)
        push([{ text: '→ establishing mTLS-tunnelled session ...', tone: 'muted' }])
        await sleep(420)
        if (cancelled.current) return
        push([
          { text: '✔ session established · host key ed25519 SHA256:9K4p…J2xQ verified', tone: 'good' },
          { text: '  Welcome to TensorMesh allocation cl-zurich-01 (eu-central-1)', tone: 'muted' },
          { text: '  64 × H100 SXM5 · 512 GB VRAM · nccl 2.22.3 · cuda 12.6', tone: 'muted' },
          { text: '', tone: 'muted' },
        ])
        setBusy(false)
        return
      }

      /* ---------------------------------------------------------- ssh-key */
      if (lower.startsWith('ssh-keygen') || lower === 'tensormesh keys generate') {
        setBusy(true)
        push([
          { text: 'Generating public/private ed25519 key pair.', tone: 'muted' },
          { text: 'Your identification has been saved in /home/ops/.ssh/tensormesh_ed25519', tone: 'muted' },
          { text: 'Your public key has been saved in /home/ops/.ssh/tensormesh_ed25519.pub', tone: 'muted' },
        ])
        await sleep(520)
        if (cancelled.current) return
        push([
          { text: 'SHA256:9K4pRUq2nXhVwbz8mLdT7cQf3sAy6JvN1eWgH0oZi4M ops@tensormesh', tone: 'rail' },
          { text: '✔ public key registered to control plane · fingerprint pinned to tenant acct-4471', tone: 'good' },
          { text: '  authorized_keys written across 8/8 nodes · 300 ms propagation', tone: 'muted' },
          { text: '', tone: 'muted' },
        ])
        setBusy(false)
        return
      }

      /* ----------------------------------------------------------- unknown */
      if (lower.startsWith('tensormesh')) {
        push([
          { text: `error: unrecognised subcommand "${input.replace(/^tensormesh\s*/i, '') || input}"`, tone: 'crit' },
          { text: 'run "help" to list the supported command surface.', tone: 'muted' },
          { text: '', tone: 'muted' },
        ])
        return
      }

      push([
        { text: `bash: ${input.split(' ')[0]}: command not found`, tone: 'crit' },
        { text: '', tone: 'muted' },
      ])
    },
    [busy, clear, clusterId, push, regionLabel, replaceLast],
  )

  return { lines, busy, run, clear, history, banner, push }
}
