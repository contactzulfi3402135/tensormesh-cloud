import { ComputeMatrixGlyph, Icon, StatusDot } from './ui/Glyph'
import { REGIONS } from '../data/regions'
import { group } from '../lib/format'

const LINK_GROUPS: Array<{ title: string; links: string[] }> = [
  {
    title: 'INFRASTRUCTURE',
    links: [
      'Architecture Whitepaper',
      'InfiniBand Matrix Specs',
      'GPU Fleet Inventory',
      'Hydro-Cooling Design',
      'Maintenance Windows',
    ],
  },
  {
    title: 'PLATFORM',
    links: [
      'Bare-Metal Clusters',
      'Inference Runtime',
      'Network Topology',
      'Benchmark Matrix',
      'Documentation',
    ],
  },
  {
    title: 'OPERATIONS',
    links: ['Status Page', 'Incident Logs', 'Capacity Roadmap', 'Service Credits', 'Contact NOC'],
  },
  {
    title: 'GOVERNANCE',
    links: [
      'Terms of Infrastructure Service',
      'Data Processing Addendum',
      'Sub-Processor Register',
      'Security Whitepaper',
      'Acceptable Use Policy',
    ],
  },
]

export function Footer({ onEnterprise }: { onEnterprise: () => void }) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline bg-obsidian">
      {/* ------------------------------------------------------ closing CTA band */}
      <div className="border-b border-hairline">
        <div className="shell flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
          <div>
            <span className="eyebrow-amber">CAPACITY AVAILABLE · ZERO QUEUE</span>
            <h2 className="mt-3 max-w-2xl text-balance text-2xl font-semibold leading-tight tracking-tightest text-signal sm:text-[32px]">
              Bring your frontier workload onto bare metal —{' '}
              <span className="text-amber">provisioning inside 42 seconds.</span>
            </h2>
            <p className="mt-3 max-w-prose2 font-mono text-2xs leading-relaxed text-slate-tech">
              {group(REGIONS.reduce((s, r) => s + r.nodes, 0))} SXM5 nodes across Zurich, Stockholm, Ashburn and
              Tokyo. Enterprise allocations are reviewed by a systems engineer within one business day.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button type="button" onClick={onEnterprise} className="btn btn-primary !px-5 !py-3">
              <Icon name="arrow-right" className="h-3.5 w-3.5" />
              REQUEST ENTERPRISE ACCESS
            </button>
            <a href="#clusters" className="btn btn-ghost !px-5 !py-3">
              OPEN CLUSTER BUILDER
            </a>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- facility grid */}
      <div className="border-b border-hairline">
        <div className="shell grid gap-px py-10 sm:grid-cols-2 xl:grid-cols-4">
          {REGIONS.map((r) => (
            <div key={r.key} className="border border-hairline bg-carbon p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow-amber">{r.city.toUpperCase()} CAMPUS</span>
                <StatusDot tone="good" pulse={false} />
              </div>
              <p className="mt-3 text-[13px] font-medium leading-snug tracking-tight text-signal">{r.address}</p>
              <dl className="mt-4 space-y-2 border-t border-hairline pt-3.5">
                {[
                  ['ZONE', r.zone],
                  ['NODES', group(r.nodes)],
                  ['PUE', r.pue.toFixed(2)],
                  ['LIVE SINCE', r.live],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3">
                    <dt className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</dt>
                    <dd className="num text-2xs text-slate-tech">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- link matrix */}
      <div className="shell grid gap-10 py-12 lg:grid-cols-[1.2fr_2.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <ComputeMatrixGlyph size={30} />
            <span className="text-[15px] font-semibold tracking-tightest text-signal">
              TENSOR<span className="text-amber">MESH</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm font-mono text-2xs leading-relaxed text-slate-tech">
            Distributed bare-metal H100/B200 GPU orchestration and low-latency inference fabric. Operated from
            Zurich, Switzerland under Swiss data-protection law.
          </p>
          <dl className="mt-6 space-y-2.5 border-t border-hairline pt-5">
            {[
              ['PLATFORM BUILD', 'v3.8.4-PROD · 20260928.4'],
              ['CONTROL PLANE', 'eu-central-1 primaries'],
              ['NOC ESCALATION', 'noc@tensormesh.cloud'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</dt>
                <dd className="num text-right text-2xs text-slate-tech">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {LINK_GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <span className="eyebrow">{g.title}</span>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="group flex items-start gap-2 font-mono text-2xs leading-relaxed text-slate-tech transition-colors hover:text-amber"
                    >
                      <span className="mt-[7px] h-px w-2 shrink-0 bg-slate-faint transition-colors group-hover:bg-amber" />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------- bottom bar */}
      <div className="border-t border-hairline">
        <div className="shell flex flex-col items-start justify-between gap-4 py-6 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">
              © {year} TENSOR MESH AG · CHE-419.882.107 · ZÜRICH
            </span>
            <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-good">
              <StatusDot tone="good" /> ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="num text-2xs text-slate-dim">99.9994% 12-MONTH UPTIME</span>
            <span className="num text-2xs text-slate-dim">PUE 1.08</span>
            <span className="num text-2xs text-slate-dim">SOC-2 · ISO 27001 · GDPR</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
