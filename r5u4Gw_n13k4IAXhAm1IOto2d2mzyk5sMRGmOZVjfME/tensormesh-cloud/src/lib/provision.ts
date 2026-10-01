/**
 * TENSOR MESH — allocation payload generation
 * Produces the exact record surface returned by POST /v1/allocations.
 */

import { REGION_MAP, type RegionKey } from '../data/regions'
import {
  FABRICS,
  GPUS_PER_NODE,
  H100_FP8_DENSE_TFLOPS,
  H100_HBM_GB,
  HOURS_PER_MONTH,
  NODE_BISECTION_TBS,
  STORAGE,
  TERMS,
  type FabricKey,
  type StorageKey,
  type TermKey,
} from '../data/spec'
import { seeded } from './format'

export interface ClusterSpec {
  gpus: number
  fabric: FabricKey
  storage: StorageKey
  term: TermKey
  region: RegionKey
}

export interface ClusterMetrics {
  nodes: number
  tflops: number
  bandwidthTbs: number
  costPerHour: number
  monthly: number
  vramTb: number
  storageThroughput: string
  collectiveEfficiency: number
}

export interface ClusterAllocation {
  allocationId: string
  clusterName: string
  region: RegionKey
  regionLabel: string
  zone: string
  siteCode: string
  fabricName: string
  fabricSpec: string
  storageName: string
  storageSpec: string
  termName: string
  gpus: number
  nodes: number
  racks: number
  tflops: number
  vramTb: number
  bandwidthTbs: number
  costPerHour: number
  monthly: number
  subnet: string
  hostnames: string[]
  sshCommand: string
  ingressHost: string
  image: string
  requestedAt: string
  slaTier: string
}

/* ------------------------------- calculations ------------------------------ */

export function computeMetrics(spec: ClusterSpec): ClusterMetrics {
  const fabric = FABRICS.find((f) => f.key === spec.fabric)!
  const storage = STORAGE.find((s) => s.key === spec.storage)!
  const term = TERMS.find((t) => t.key === spec.term)!

  const nodes = spec.gpus / GPUS_PER_NODE
  const tflops = spec.gpus * H100_FP8_DENSE_TFLOPS
  const vramTb = (spec.gpus * H100_HBM_GB) / 1024
  const bandwidthTbs = nodes * NODE_BISECTION_TBS * fabric.bandwidthFactor

  const perGpu = term.rate + fabric.surcharge + storage.surcharge
  const costPerHour = spec.gpus * perGpu
  const monthly = costPerHour * HOURS_PER_MONTH

  return {
    nodes,
    tflops,
    vramTb,
    bandwidthTbs,
    costPerHour,
    monthly,
    storageThroughput: storage.throughput,
    collectiveEfficiency: fabric.collectiveEfficiency,
  }
}

/* ------------------------------- identifiers ------------------------------- */

/** 9428 -> "#CL-9428-H100" */
export function allocationId(seed: number): string {
  const r = seeded(seed + 17)
  const serial = Math.floor(3100 + r * 6899)
  return `CL-${serial}-H100`
}

export function clusterShortName(id: string): string {
  return id.toLowerCase().replace('#', '')
}

function ipv4Block(seed: number): { cidr: string; third: number } {
  const third = 200 + Math.floor(seeded(seed + 91) * 40) // 10.240.200.0/16 .. 10.240.239.0/16
  return { cidr: `10.240.${third}.0/16`, third }
}

/* ------------------------------- full payload ------------------------------ */

export function buildAllocation(spec: ClusterSpec, seed = Math.floor(Math.random() * 100000)): ClusterAllocation {
  const region = REGION_MAP[spec.region]
  const fabric = FABRICS.find((f) => f.key === spec.fabric)!
  const storage = STORAGE.find((s) => s.key === spec.storage)!
  const term = TERMS.find((t) => t.key === spec.term)!
  const metrics = computeMetrics(spec)

  const id = allocationId(seed)
  const short = clusterShortName(id)
  const clusterName = `cl-${region.siteCode}-${String(Math.floor(seeded(seed + 3) * 89) + 10)}`
  const racks = Math.max(1, Math.ceil(metrics.nodes / 8))
  const { cidr, third } = ipv4Block(seed)

  // Hostnames follow the fabric's naming law:
  //   tm-<site>-h100-<rack letter><rack idx>-node-<node idx>
  const hostnames: string[] = []
  const previewCount = Math.min(metrics.nodes, 6)
  for (let i = 0; i < previewCount; i++) {
    const rackIndex = Math.floor(i / 8) + 1
    const rackLetter = String.fromCharCode(64 + rackIndex)
    const nodeIndex = (i % 8) + 1
    hostnames.push(
      `tm-${region.siteCode}-h100-${rackLetter}${String(rackIndex).padStart(2, '0')}-node-${String(
        nodeIndex,
      ).padStart(2, '0')}`,
    )
  }

  const ingressHost = `${short}.ingress.${region.zone}.tensormesh.cloud`
  const sshCommand = `ssh -i ~/.ssh/tensormesh_ed25519 -p 2222 ops@${ingressHost}`

  return {
    allocationId: id,
    clusterName,
    region: spec.region,
    regionLabel: region.label,
    zone: region.zone,
    siteCode: region.siteCode,
    fabricName: fabric.name,
    fabricSpec: fabric.spec,
    storageName: storage.name,
    storageSpec: storage.spec,
    termName: term.name,
    gpus: spec.gpus,
    nodes: metrics.nodes,
    racks,
    tflops: metrics.tflops,
    vramTb: metrics.vramTb,
    bandwidthTbs: metrics.bandwidthTbs,
    costPerHour: metrics.costPerHour,
    monthly: metrics.monthly,
    subnet: cidr,
    hostnames,
    sshCommand,
    ingressHost,
    image: `registry.tensormesh.cloud/cuda-12.6-pytorch-2.4:latest`,
    requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    slaTier: term.key === 'annual' ? 'Enterprise 99.995%' : 'Standard 99.999%',
  }
}

/** Deterministic vmid-style identifier used in deployment logs */
export function machineToken(seed: number): string {
  const alphabet = 'abcdef0123456789'
  let out = ''
  for (let i = 0; i < 12; i++) {
    out += alphabet[Math.floor(seeded(seed * 7 + i * 13) * alphabet.length)]
  }
  return out
}

export { GPUS_PER_NODE }
