import { useCallback, useEffect, useMemo, useState } from 'react'
import { TopTelemetryBar } from './components/TopTelemetryBar'
import { NavBar } from './components/NavBar'
import { HeroSection } from './components/HeroSection'
import { ClusterConfigurator } from './components/ClusterConfigurator'
import { TerminalModule } from './components/terminal/TerminalModule'
import { TopologySection } from './components/TopologySection'
import { LeadershipSection } from './components/LeadershipSection'
import { Footer } from './components/Footer'
import { TopologyModal } from './components/TopologyModal'
import { ProvisioningModal } from './components/ProvisioningModal'
import { EnterpriseModal } from './components/EnterpriseModal'
import { CliDrawer } from './components/CliDrawer'
import { REGION_MAP, TOTAL_NODES, type RegionKey } from './data/regions'
import { type ClusterAllocation } from './lib/provision'
import { NODE_BISECTION_TBS } from './data/spec'

const SECTION_IDS = ['clusters', 'runtime', 'benchmarks', 'topology', 'documentation']

export default function App() {
  const [region, setRegion] = useState<RegionKey>('eu-central')
  const [topologyOpen, setTopologyOpen] = useState(false)
  const [enterpriseOpen, setEnterpriseOpen] = useState(false)
  const [cliOpen, setCliOpen] = useState(false)
  const [allocation, setAllocation] = useState<ClusterAllocation | null>(null)
  const [provisionOpen, setProvisionOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [ribbonVisible, setRibbonVisible] = useState(true)

  /* ---------------------------------------------------- section spy for nav */
  useEffect(() => {
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => Boolean(n),
    )
    if (nodes.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] },
    )
    nodes.forEach((n) => obs.observe(n))
    return () => obs.disconnect()
  }, [])

  const scrollToBuilder = useCallback(() => {
    const el = document.getElementById('clusters')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleProvision = useCallback((alloc: ClusterAllocation) => {
    setAllocation(alloc)
    setProvisionOpen(true)
  }, [])

  /** Fleet-wide bisection bandwidth, TB/s — used in the announcement rail. */
  const fleetBisectionTbs = useMemo(() => TOTAL_NODES * NODE_BISECTION_TBS, [])

  const r = REGION_MAP[region]

  return (
    <div className="min-h-screen bg-obsidian">
      <a
        href="#clusters"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:border focus:border-amber focus:bg-carbon focus:px-4 focus:py-2 focus:font-mono focus:text-2xs focus:uppercase focus:tracking-widest focus:text-amber"
      >
        SKIP TO CLUSTER BUILDER
      </a>

      {/* ------------------------------------------------------ announcement rail */}
      {ribbonVisible && (
        <div className="relative z-[95] border-b border-hairline bg-carbon">
          <div className="shell flex flex-wrap items-center justify-between gap-3 py-2">
            <p className="font-mono text-2xs uppercase tracking-widest text-slate-tech">
              <span className="text-amber">NEW ·</span> NVIDIA B200 SXM allocations now generally available in
              eu-north (Stockholm) and us-east (Ashburn)
              <span className="mx-2.5 text-slate-faint">•</span>
              <span className="num text-slate-dim">
                SUSTAINED {fleetBisectionTbs.toFixed(0)} TB/S FLEET BISECTION · {r.siteCode.toUpperCase()} ACCEPTING ALLOCATIONS
              </span>
            </p>
            <button
              type="button"
              onClick={() => setRibbonVisible(false)}
              aria-label="Dismiss announcement"
              className="font-mono text-2xs uppercase tracking-widest text-slate-dim transition-colors hover:text-amber"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      <TopTelemetryBar />

      <NavBar
        region={region}
        onRegionChange={setRegion}
        onOpenCli={() => setCliOpen(true)}
        onDeploy={scrollToBuilder}
        activeSection={activeSection}
      />

      <main>
        <HeroSection
          region={region}
          onInspectTopology={() => setTopologyOpen(true)}
          onLaunchBuilder={scrollToBuilder}
        />

        <ClusterConfigurator
          region={region}
          onRegionChange={setRegion}
          onProvision={handleProvision}
        />

        <TerminalModule region={region} />

        <TopologySection region={region} />

        <LeadershipSection />

        {/* ------------------------------------------------- enterprise band */}
        <section id="secure" className="border-b border-hairline bg-graphite py-16 sm:py-20">
          <div className="shell grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <span className="eyebrow-amber">ENTERPRISE CLUSTER ACCESS</span>
              <h2 className="mt-3 max-w-xl text-balance text-2xl font-semibold leading-tight tracking-tightest text-signal sm:text-[34px]">
                Reserved capacity, private VPC, and an architect who answers the pager with you.
              </h2>
              <p className="mt-4 max-w-prose2 font-mono text-2xs leading-relaxed text-slate-tech">
                Enterprise agreements include physical rack dedication, BGP handoff into your own ASN, BYOK key
                custody, and a named solutions architect on the {r.city} systems engineering desk. Applications
                are answered by engineers, within one business day.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEnterpriseOpen(true)}
                  className="btn btn-primary !px-5 !py-3"
                >
                  REQUEST ENTERPRISE CLUSTER ACCESS
                </button>
                <button type="button" onClick={() => setCliOpen(true)} className="btn btn-ghost !px-5 !py-3">
                  OPEN CLI DRAWER
                </button>
              </div>
            </div>

            <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
              {[
                ['DEDICATED RACKS', 'Whole-rack dedication with your own PDU and CDU branch.'],
                ['PRIVATE VPC', 'No shared tenant path. RFC1918 allocation, optional BGP handoff.'],
                ['BYOK / HYOK', 'Customer-managed keys held in your HSM, never ours.'],
                ['NAMED ARCHITECT', 'One engineer, on the pager, for the life of the term.'],
              ].map(([k, v]) => (
                <div key={k} className="bg-carbon px-5 py-5">
                  <span className="font-mono text-2xs uppercase tracking-widest text-amber">{k}</span>
                  <p className="mt-2.5 font-mono text-2xs leading-relaxed text-slate-tech">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer onEnterprise={() => setEnterpriseOpen(true)} />

      {/* --------------------------------------------------------------- modals */}
      <TopologyModal open={topologyOpen} onClose={() => setTopologyOpen(false)} region={region} />
      <ProvisioningModal
        open={provisionOpen}
        onClose={() => setProvisionOpen(false)}
        allocation={allocation}
        onSwitchRegionTab={() => {
          setProvisionOpen(false)
          setTopologyOpen(true)
        }}
      />
      <EnterpriseModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} region={region} />
      <CliDrawer open={cliOpen} onClose={() => setCliOpen(false)} region={region} />
    </div>
  )
}
