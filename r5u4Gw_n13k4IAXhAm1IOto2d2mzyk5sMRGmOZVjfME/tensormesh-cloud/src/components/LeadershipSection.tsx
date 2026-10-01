import { Icon, StatusDot } from './ui/Glyph'
import { ImageFrame, SectionHeader } from './ui/Common'
import { COMPLIANCE } from '../data/spec'
import { IMAGES } from '../lib/format'

const TEAM = [
  {
    name: 'Dr. Elena Marković',
    role: 'Principal Distributed Systems Engineer',
    site: 'ZURICH CAMPUS · EU-CENTRAL-1',
    photo: IMAGES.engineerPortrait,
    alt: 'Editorial black and white portrait of a distributed systems engineer in a cleanroom server corridor',
    bio: 'Architected the rail-optimised NDR fabric and the sub-2μs collective path now serving all four campuses. Previously built the collective-communications layer for two European exascale pre-production systems.',
    facts: [
      ['TENURE', '6 YR 4 MO'],
      ['OWNERS', 'NCCL fabric, SHARPv3 trees'],
      ['PRIOR', 'CSCS · ETH Zurich'],
    ],
  },
  {
    name: 'Anders Lindqvist',
    role: 'Head of Infrastructure Architecture',
    site: 'STOCKHOLM HYDRO HALL · EU-NORTH-1',
    photo: IMAGES.systemsLead,
    alt: 'Editorial studio portrait of an infrastructure architect seated before system telemetry displays',
    bio: 'Owns the physical layer: site selection, hydro-cooling design, and the 1.08 trailing PUE. Negotiated the dark-fibre corridors that hold Zurich–Stockholm under 28 ms with fully diverse routing.',
    facts: [
      ['TENURE', '5 YR 1 MO'],
      ['OWNERS', 'DC design, power, fibre rights'],
      ['PRIOR', 'Meta Luleå · Vattenfall R&D'],
    ],
  },
]

export function LeadershipSection() {
  return (
    <section id="documentation" className="border-b border-hairline bg-obsidian py-16 sm:py-24">
      <div className="shell">
        <SectionHeader
          index="06"
          eyebrow="ENGINEERING LEADERSHIP · FACILITY ASSURANCE"
          title={
            <>
              The people who hold the fabric pager,{' '}
              <span className="text-amber">and the certifications behind them.</span>
            </>
          }
          lede="TensorMesh is engineered by operators who have run production GPU fleets at exascale. Every campus is independently audited, and every assurance claim below is backed by a named report you can request under NDA."
          right={
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <span className="badge badge-good">
                <StatusDot tone="good" /> 0 SEV-1 INCIDENTS IN 400 DAYS
              </span>
              <span className="num text-2xs text-slate-dim">
                MTTR 11 min · MTBF 41,200 node-hours
              </span>
            </div>
          }
        />

        {/* --------------------------------------------------------- portraits */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {TEAM.map((person) => (
            <article key={person.name} className="grid border border-hairline bg-carbon sm:grid-cols-[280px_1fr]">
              <div className="relative border-b border-hairline sm:border-b-0 sm:border-r">
                <img
                  src={person.photo}
                  alt={person.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full min-h-[280px] w-full object-cover grayscale-[35%] transition-all duration-700 ease-precision hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 border border-hairline bg-obsidian/85 px-2 py-1 font-mono text-2xs uppercase tracking-widest text-amber backdrop-blur-sm">
                  {person.site.split(' · ')[0]}
                </span>
              </div>

              <div className="flex flex-col p-5 sm:p-6">
                <span className="eyebrow">{person.site.split(' · ')[1]}</span>
                <h3 className="mt-2 text-lg font-semibold tracking-tighter text-signal">{person.name}</h3>
                <p className="mt-1 font-mono text-2xs uppercase tracking-widest text-amber">{person.role}</p>
                <p className="mt-4 font-mono text-2xs leading-relaxed text-slate-tech">{person.bio}</p>

                <dl className="mt-5 space-y-2 border-t border-hairline pt-4">
                  {person.facts.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4">
                      <dt className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</dt>
                      <dd className="num text-right text-2xs text-signal">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>

        {/* ------------------------------------------------------- facility band */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <ImageFrame
            src={IMAGES.datacenterExterior}
            alt="Exterior twilight photograph of the TensorMesh Stockholm data center facility in winter snow"
            caption="STOCKHOLM HYDRO HALL · BROMMA WORKS"
            meta="PUE 1.06 · HEAT RECOVERY 2.8 MW"
            aspect="aspect-[16/10]"
          />
          <ImageFrame
            src={IMAGES.siliconWafer}
            alt="Macro photograph of a 300mm patterned silicon wafer on an optical testing stage"
            caption="FAB QUALIFICATION · WAFER ASE-412"
            meta="H100 SXM5 · 80GB HBM3"
            aspect="aspect-[16/10]"
          />
        </div>

        {/* -------------------------------------------------------- compliance */}
        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow-amber">COMPLIANCE & ASSURANCE</span>
              <h3 className="mt-2 text-xl font-semibold tracking-tighter text-signal sm:text-2xl">
                Audited, certified, and contractually bound.
              </h3>
            </div>
            <a
              href="#secure"
              className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-slate-tech transition-colors hover:text-amber"
            >
              REQUEST ASSURANCE PACK
              <Icon name="external" className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-4">
            {COMPLIANCE.map((c) => (
              <div key={c.code} className="flex flex-col bg-carbon p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center border border-amber/40 bg-amber/[0.06] font-mono text-[10px] font-semibold text-amber">
                    {c.code.slice(0, 3)}
                  </span>
                  <Icon name="shield" className="h-4 w-4 text-good" />
                </div>
                <h4 className="mt-4 text-[13.5px] font-semibold leading-snug tracking-tight text-signal">
                  {c.title}
                </h4>
                <p className="mt-2.5 flex-1 font-mono text-2xs leading-relaxed text-slate-tech">{c.detail}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-3">
                  <StatusDot tone="good" pulse={false} />
                  <span className="num text-2xs uppercase tracking-widest text-good">{c.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* operational assurance strip */}
          <div className="mt-6 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {[
              ['UPTIME · 12 MONTH', '99.9994%', 'Six minutes forty-one seconds of unavailable control plane.'],
              ['CUSTOMER KMS', 'HSM-BACKED', 'Tenant keys never leave your boundary; BYOK and HYOK supported.'],
              ['INCIDENT DISCLOSURE', '11 MIN MTTR', 'Postmortems published to the public incident log within 72 hours.'],
            ].map(([k, v, sub]) => (
              <div key={k} className="bg-carbon px-5 py-5">
                <span className="eyebrow">{k}</span>
                <p className="num mt-2.5 text-xl tracking-tightest text-amber">{v}</p>
                <p className="mt-2 font-mono text-2xs leading-relaxed text-slate-tech">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
