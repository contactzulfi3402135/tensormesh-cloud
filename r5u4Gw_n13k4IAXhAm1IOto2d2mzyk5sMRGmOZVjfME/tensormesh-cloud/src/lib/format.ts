/**
 * TENSOR MESH — shared formatting + asset resolution utilities
 */

/**
 * Resolve a path inside /public against the configured Vite base so the
 * application works both at origin root and behind a proxied sub-path.
 */
export function asset(path: string): string {
  // Already-absolute sources (inlined data URIs, CDN origins, blob handles) are
  // passed through untouched — only on-disk public paths get base-prefixed.
  if (/^(data:|https?:|blob:|\/\/)/.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  const clean = path.replace(/^\/+/, '')
  return `${base}${base.endsWith('/') ? '' : '/'}${clean}`
}

export const IMAGES = {
  clusterRack: asset('assets/images/cluster-rack-h100.jpg'),
  siliconWafer: asset('assets/images/silicon-wafer-macro.jpg'),
  datacenterExterior: asset('assets/images/datacenter-exterior.jpg'),
  pcieInterconnect: asset('assets/images/pcie-interconnect.jpg'),
  engineerPortrait: asset('assets/images/engineer-portrait.jpg'),
  systemsLead: asset('assets/images/systems-lead.jpg'),
} as const

/** 1_979_000 -> "1.98M" style compact telemetry formatting */
export function compact(value: number, digits = 2): string {
  const abs = Math.abs(value)
  if (abs >= 1e12) return `${(value / 1e12).toFixed(digits)}T`
  if (abs >= 1e9) return `${(value / 1e9).toFixed(digits)}B`
  if (abs >= 1e6) return `${(value / 1e6).toFixed(digits)}M`
  if (abs >= 1e3) return `${(value / 1e3).toFixed(digits)}K`
  return value.toFixed(digits)
}

/** Thousands-separated integer, e.g. 126976 -> "126,976" */
export function group(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/** Currency with fixed 2dp, e.g. 2489.6 -> "$2,489.60" */
export function usd(value: number, digits = 2): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

/** Hover-stable live-ish float with ±variance around a base */
export function jitter(base: number, variance: number): number {
  return base + (Math.random() * 2 - 1) * variance
}

/** Clamp helper */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Deterministic pseudo-random from a seed — keeps SSR/rerender output stable */
export function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** 0.9412 -> "94.1%" */
export function pct(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`
}

/** Uppercase serial for cluster/host identifiers */
export function serial(prefix: string, n: number, width = 4): string {
  return `${prefix}${String(n).padStart(width, '0')}`
}
