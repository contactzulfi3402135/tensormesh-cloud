/**
 * TENSOR MESH — hardware + commercial specification constants
 * Source of truth for the configurator, calculator and benchmark matrix.
 */

/** Dense FP8 Tensor Core throughput, TFLOPs, per NVIDIA H100 SXM5 */
export const H100_FP8_DENSE_TFLOPS = 1979

/** HBM3 capacity per H100 SXM5, GB */
export const H100_HBM_GB = 80

/** Per-node bisection bandwidth contributing to the aggregate fabric, TB/s */
export const NODE_BISECTION_TBS = 3.2

/** GPUs per physical HGX SXM5 node */
export const GPUS_PER_NODE = 8

/** Hours in a billing month (365 × 24 / 12) */
export const HOURS_PER_MONTH = 730

export interface GpuTierOption {
  gpus: number
  /** Descriptive label rendered under the slider detent */
  tag: string
}

/** Selectable dedicated-GPU allocation granularity */
export const GPU_TIERS: GpuTierOption[] = [
  { gpus: 8, tag: '1 NODE' },
  { gpus: 16, tag: '2 NODES' },
  { gpus: 32, tag: '4 NODES' },
  { gpus: 64, tag: '8 NODES' },
  { gpus: 128, tag: '16 NODES' },
  { gpus: 256, tag: '32 NODES' },
  { gpus: 512, tag: '64 NODES' },
]

export type FabricKey = 'ib-ndr' | 'rocev2'

export interface FabricOption {
  key: FabricKey
  name: string
  spec: string
  /** Effective fraction of per-node bisection bandwidth presented to the tenant */
  bandwidthFactor: number
  /** Per-GPU/hr fabric surcharge, USD */
  surcharge: number
  /** All-reduce efficiency retained at 512 GPUs */
  collectiveEfficiency: number
  note: string
}

export const FABRICS: FabricOption[] = [
  {
    key: 'ib-ndr',
    name: 'InfiniBand NDR',
    spec: '800Gbps / port · NVIDIA Quantum-2',
    bandwidthFactor: 1,
    surcharge: 0.31,
    collectiveEfficiency: 0.94,
    note: 'Adaptive routing, SHARPv3 in-network reduction, 1.84μs hop latency.',
  },
  {
    key: 'rocev2',
    name: 'RoCEv2 Ethernet',
    spec: '400Gbps / port · Spectrum-4',
    bandwidthFactor: 0.5,
    surcharge: 0.14,
    collectiveEfficiency: 0.81,
    note: 'DCQCN congestion control, drop-in for K8s-native scheduler fleets.',
  },
]

export type StorageKey = 'nvme' | 'weka' | 'object'

export interface StorageOption {
  key: StorageKey
  name: string
  spec: string
  /** Per-GPU/hr storage surcharge, USD */
  surcharge: number
  throughput: string
  note: string
}

export const STORAGE: StorageOption[] = [
  {
    key: 'nvme',
    name: '20TB NVMe Scratch Array',
    spec: 'PCIe 5.0 ×4 · node-local, striped',
    surcharge: 0.06,
    throughput: '7.4 GB/s per node',
    note: 'Checkpoint staging for jobs under 4 hours. Not replicated.',
  },
  {
    key: 'weka',
    name: '100TB Weka Lustre Tier',
    spec: 'WekaFS cluster · RDMA-attached',
    surcharge: 0.34,
    throughput: '212 GB/s aggregate',
    note: 'Training-grade parallel FS. POSIX, snapshots, 3× erasure coding.',
  },
  {
    key: 'object',
    name: '1PB Enterprise Object Store',
    spec: 'S3-compatible · 11×9 durability',
    surcharge: 0.12,
    throughput: '48 GB/s ingress',
    note: 'Dataset lake + artifact registry. Lifecycle tiering to cold.',
  },
]

export type TermKey = 'spot' | 'reserved' | 'annual'

export interface TermOption {
  key: TermKey
  name: string
  /** Base USD per GPU/hour */
  rate: number
  discountLabel: string
  /** Preemption exposure, 0–1 */
  preemption: number
  note: string
}

export const TERMS: TermOption[] = [
  {
    key: 'spot',
    name: 'Hourly Spot',
    rate: 2.15,
    discountLabel: 'LIST RATE',
    preemption: 0.08,
    note: 'Interruptible with 90-second drain window. Best for sweep + ablation fleets.',
  },
  {
    key: 'reserved',
    name: 'Monthly Reserved',
    rate: 1.85,
    discountLabel: '−14%',
    preemption: 0,
    note: 'Dedicated allocation, 30-day commit. Rolling extensions, no re-provisioning.',
  },
  {
    key: 'annual',
    name: 'Annual Dedicated',
    rate: 1.62,
    discountLabel: '−25%',
    preemption: 0,
    note: 'Whole-rack dedication, 12-month commit. Includes private VPC + BGP handoff.',
  },
]

/* -------------------------------------------------------------------------- */
/* Comparative benchmark matrix — TensorMesh vs hyperscaler GPU instances      */
/* -------------------------------------------------------------------------- */

export interface BenchmarkMetric {
  key: string
  label: string
  unit: string
  /** false = lower is better */
  higherIsBetter: boolean
  values: { tensormesh: number; aws: number; gcp: number }
  footnote: string
}

export const BENCHMARKS: BenchmarkMetric[] = [
  {
    key: 'cold-start',
    label: 'Cold-start to first CUDA kernel',
    unit: 'seconds',
    higherIsBetter: false,
    values: { tensormesh: 42, aws: 214, gcp: 187 },
    footnote: 'Median across 240 provision events, 64-node H100 fabric, no cached image.',
  },
  {
    key: 'throughput',
    label: 'Inter-node training throughput',
    unit: '% of linear scaling',
    higherIsBetter: true,
    values: { tensormesh: 94, aws: 81, gcp: 78 },
    footnote: 'GPT-3 6.7B, 64× H100, Megatron-LM 3D parallel, 200 steps post-warmup.',
  },
  {
    key: 'cost-token',
    label: 'Effective cost per 1M output tokens',
    unit: 'USD',
    higherIsBetter: false,
    values: { tensormesh: 0.42, aws: 0.79, gcp: 0.86 },
    footnote: 'vLLM 0.6.2, Llama-3.1-70B, 4× H100 TP, 2048-token prompts, sustained load.',
  },
]

export interface BenchmarkProvider {
  key: 'tensormesh' | 'aws' | 'gcp'
  label: string
  sub: string
  accent: string
}

export const BENCHMARK_PROVIDERS: BenchmarkProvider[] = [
  { key: 'tensormesh', label: 'TensorMesh', sub: 'H100 SXM5 · IB NDR 800G', accent: '#F59E0B' },
  { key: 'aws', label: 'AWS', sub: 'p5.48xlarge · EFA', accent: '#8B949E' },
  { key: 'gcp', label: 'Google Cloud', sub: 'a3-highgpu-8g · GPUDirect', accent: '#5A6472' },
]

/* -------------------------------------------------------------------------- */
/* Compliance + physical footprint                                             */
/* -------------------------------------------------------------------------- */

export interface ComplianceBadge {
  code: string
  title: string
  detail: string
  status: string
}

export const COMPLIANCE: ComplianceBadge[] = [
  {
    code: 'SOC-2',
    title: 'SOC-2 Type II Certified Data Centers',
    detail:
      'Report covering Security, Availability and Confidentiality. Continuous control monitoring across all four campuses.',
    status: 'AUDITED 2026-02-28',
  },
  {
    code: 'ISO-27001',
    title: 'ISO/IEC 27001:2022',
    detail:
      'Information security management system certified end-to-end, including bare-metal handoff and customer KMS boundary.',
    status: 'CERT 1042-ISMS-ZRH',
  },
  {
    code: 'GDPR',
    title: 'EU Data Sovereignty & GDPR Guaranteed',
    detail:
      'Zurich and Stockholm tenancies are contractually pinned to EU/CH jurisdiction. No control-plane egress outside the region.',
    status: 'DPA v4 · SCC ANNEX',
  },
  {
    code: 'PUE',
    title: 'Direct Hydro-Cooling / 1.08 PUE Efficiency',
    detail:
      'Warm-water direct-to-chip loops at 18.2°C inlet with heat recovery into municipal district networks.',
    status: '12-MO TRAILING AVG',
  },
]
