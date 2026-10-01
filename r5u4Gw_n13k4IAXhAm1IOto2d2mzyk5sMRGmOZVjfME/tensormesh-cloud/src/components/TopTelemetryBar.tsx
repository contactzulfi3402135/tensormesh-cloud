import { StatusDot } from './ui/Glyph'
import { REGIONS, TOTAL_NODES } from '../data/regions'
import { group } from '../lib/format'

/**
 * Top telemetry bar — a single continuous instrument strip.
 * Renders the fleet-wide node census plus a scrolling fabrication notice.
 */
export function TopTelemetryBar() {
  return (
    <div className="relative z-50 border-b border-hairline bg-obsidian">
      <div className="shell flex h-9 items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <StatusDot tone="good" />
          <p className="truncate font-mono text-2xs uppercase tracking-widest text-slate-tech">
            <span className="text-good">GLOBAL CLUSTER HEALTH:</span>{' '}
            <span className="num text-signal">{group(TOTAL_NODES)} SXM5 NODES ONLINE</span>
            <Sep />
            <span className="text-signal">99.999% SLA</span>
            <Sep />
            <span className="text-amber">ZERO QUEUE PROVISIONING IN EU-CENTRAL (ZURICH)</span>
          </p>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          {[
            ['FABRIC', 'IB NDR 800G · SHARPv3'],
            ['COOLANT', '18.2°C INLET'],
            ['PUE', '1.08 TRAILING'],
            ['ENC', 'AES-256 / HSM'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</span>
              <span className="num text-2xs text-slate-tech">{v}</span>
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          {REGIONS.map((r) => (
            <span key={r.key} className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-slate-dim">
              <StatusDot tone="good" pulse={false} />
              {r.siteCode}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Sep() {
  return <span className="mx-2.5 text-slate-faint">•</span>
}
