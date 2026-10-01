/**
 * TENSOR MESH — regional fabric definition
 * Four physical campuses, one flat 800Gbps InfiniBand NDR fabric.
 */

export type RegionKey = 'eu-central' | 'eu-north' | 'us-east' | 'ap-northeast'

export interface Region {
  key: RegionKey
  /** Display label, e.g. "eu-central (Zurich)" */
  label: string
  city: string
  /** IATA-ish site code used in hostnames */
  siteCode: string
  zone: string
  address: string
  country: string
  /** NVIDIA SXM5 nodes online at this campus */
  nodes: number
  /** Facility power usage effectiveness */
  pue: number
  /** Liquid loop inlet temperature, °C */
  coolantC: number
  /** Operational since */
  live: string
  /** Peer round-trip latencies in ms, keyed by peer region */
  rtt: Record<RegionKey, number>
  /** Spot floor for a dedicated H100 SXM5, USD/GPU/hr */
  spotFloor: number
  /** UTC offset label */
  tz: string
}

export const REGIONS: Region[] = [
  {
    key: 'eu-central',
    label: 'eu-central (Zurich)',
    city: 'Zurich',
    siteCode: 'zrh',
    zone: 'eu-central-1',
    address: 'Technoparkstrasse 1, 8005 Zürich',
    country: 'Switzerland',
    nodes: 5240,
    pue: 1.08,
    coolantC: 18.2,
    live: '2021-04-12',
    tz: 'UTC+01:00',
    spotFloor: 1.98,
    rtt: { 'eu-central': 0.2, 'eu-north': 27.4, 'us-east': 91.6, 'ap-northeast': 228.4 },
  },
  {
    key: 'eu-north',
    label: 'eu-north (Stockholm)',
    city: 'Stockholm',
    siteCode: 'sto',
    zone: 'eu-north-1',
    address: 'Hydro Hall, Bromma Works, 168 67 Bromma',
    country: 'Sweden',
    nodes: 4120,
    pue: 1.06,
    coolantC: 16.4,
    live: '2022-09-01',
    tz: 'UTC+01:00',
    spotFloor: 1.94,
    rtt: { 'eu-central': 27.4, 'eu-north': 0.2, 'us-east': 104.8, 'ap-northeast': 206.2 },
  },
  {
    key: 'us-east',
    label: 'us-east (Ashburn)',
    city: 'Ashburn',
    siteCode: 'ash',
    zone: 'us-east-1',
    address: 'Equinix DC2 / IX Campus, 21715 Filigree Ct, VA 20147',
    country: 'United States',
    nodes: 3860,
    pue: 1.19,
    coolantC: 21.6,
    live: '2022-02-18',
    tz: 'UTC−05:00',
    spotFloor: 2.04,
    rtt: { 'eu-central': 91.6, 'eu-north': 104.8, 'us-east': 0.2, 'ap-northeast': 147.9 },
  },
  {
    key: 'ap-northeast',
    label: 'ap-northeast (Tokyo)',
    city: 'Tokyo',
    siteCode: 'tyo',
    zone: 'ap-northeast-1',
    address: 'Shinagawa Intercity Hall B, Minato-ku, Tokyo 108-0075',
    country: 'Japan',
    nodes: 1620,
    pue: 1.14,
    coolantC: 19.8,
    live: '2023-11-06',
    tz: 'UTC+09:00',
    spotFloor: 2.22,
    rtt: { 'eu-central': 228.4, 'eu-north': 206.2, 'us-east': 147.9, 'ap-northeast': 0.2 },
  },
]

export const REGION_MAP: Record<RegionKey, Region> = REGIONS.reduce(
  (acc, r) => {
    acc[r.key] = r
    return acc
  },
  {} as Record<RegionKey, Region>,
)

export const TOTAL_NODES = REGIONS.reduce((sum, r) => sum + r.nodes, 0)

/** Ordered peer pair keys for the latency matrix (upper triangle, excludes self) */
export const LATENCY_PAIRS: Array<[RegionKey, RegionKey]> = [
  ['eu-central', 'eu-north'],
  ['eu-central', 'us-east'],
  ['eu-central', 'ap-northeast'],
  ['eu-north', 'us-east'],
  ['eu-north', 'ap-northeast'],
  ['us-east', 'ap-northeast'],
]
