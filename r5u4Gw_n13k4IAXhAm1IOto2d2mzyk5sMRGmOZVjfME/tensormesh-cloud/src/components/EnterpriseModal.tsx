import { useMemo, useState } from 'react'
import { Modal } from './ui/Modal'
import { Icon, StatusDot } from './ui/Glyph'
import { CopyRow, LabeledField } from './ui/Common'
import { REGIONS, REGION_MAP, type RegionKey } from '../data/regions'
import { seeded } from '../lib/format'

const FRAMEWORKS = [
  { key: 'vllm', name: 'vLLM', note: 'High-throughput inference serving' },
  { key: 'megatron', name: 'Megatron-LM', note: '3D-parallel pre-training' },
  { key: 'deepspeed', name: 'DeepSpeed', note: 'ZeRO-3 / offload training' },
  { key: 'ray', name: 'Ray', note: 'Distributed task orchestration' },
] as const

type FrameworkKey = (typeof FRAMEWORKS)[number]['key']

interface FormState {
  email: string
  company: string
  gpus: string
  framework: FrameworkKey
  workloads: string
}

interface Dossier {
  applicationId: string
  architect: string
  slot: string
  reference: string
}

/** Desks are keyed to the campus the application is routed to. */
const DESKS: Record<RegionKey, { architects: string[]; desk: string; zone: string }> = {
  'eu-central': {
    architects: ['Marta Villalobos', 'Lukas Brenner', 'Céline Hug'],
    desk: 'Zurich Systems Engineering Desk',
    zone: 'CET',
  },
  'eu-north': {
    architects: ['Ingrid Sørvik', 'Johan Ekström'],
    desk: 'Stockholm Hydro Hall Desk',
    zone: 'CET',
  },
  'us-east': {
    architects: ['Dana Whitfield', 'Marcus Iyer'],
    desk: 'Ashburn Equinix IX Desk',
    zone: 'EST',
  },
  'ap-northeast': {
    architects: ['Kenji Watanabe', 'Aiko Nakamura'],
    desk: 'Tokyo Systems Engineering Desk',
    zone: 'JST',
  },
}

export function EnterpriseModal({
  open,
  onClose,
  region,
}: {
  open: boolean
  onClose: () => void
  region: RegionKey
}) {
  const [form, setForm] = useState<FormState>({
    email: '',
    company: '',
    gpus: '64',
    framework: 'vllm',
    workloads: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!form.email.trim()) e.email = 'Work email is required for credential dispatch.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      e.email = 'Enter a valid corporate address — free-mail domains are queued separately.'
    if (!form.company.trim()) e.company = 'Company or lab name is required.'
    const gpuDigits = form.gpus.replace(/[^\d]/g, '')
    if (!gpuDigits || Number(gpuDigits) < 1) e.gpus = 'Provide a numeric GPU count.'
    return e
  }, [form])

  const valid = Object.keys(errors).length === 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, company: true, gpus: true })
    if (!valid) return
    setSubmitting(true)
    window.setTimeout(() => {
      const n = Math.floor(seeded(Date.now() % 100000) * 8999) + 1000
      const desk = DESKS[region]
      const name = desk.architects[Math.floor(seeded(Date.now() % 5000) * desk.architects.length)] ?? desk.architects[0]
      setDossier({
        applicationId: `TM-${n}`,
        architect: `${name} — ${desk.desk}`,
        slot: `${REGION_MAP[region].city} review window · ${desk.zone} business hours`,
        reference: `ENG-${region.toUpperCase()}-${form.framework.toUpperCase()}-${n}`,
      })
      setSubmitting(false)
    }, 850)
  }

  const reset = () => {
    setDossier(null)
    setTouched({})
    setForm({ email: '', company: '', gpus: '64', framework: 'vllm', workloads: '' })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      tag={REGION_MAP[region].zone}
      title={dossier ? `Cluster application ${dossier.applicationId} received` : 'Enterprise cluster access'}
      subtitle={
        dossier
          ? 'Your application is now with the regional systems engineering desk. A dedicated architect will make contact inside the review window below.'
          : 'Tell us what you intend to run. Applications are reviewed by a systems engineer — not a sales development representative — and answered within one business day.'
      }
      footer={
        dossier ? (
          <>
            <span className="badge badge-good">
              <StatusDot tone="good" /> CREDENTIALS DISPATCHED
            </span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={reset} className="btn btn-ghost">
                SUBMIT ANOTHER APPLICATION
              </button>
              <button type="button" onClick={onClose} className="btn btn-primary">
                CLOSE
              </button>
            </div>
          </>
        ) : undefined
      }
    >
      {dossier ? (
        <div className="animate-floatup">
          <div className="border border-good/30 bg-good/[0.04] px-4 py-4">
            <div className="flex items-start gap-3">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-good" strokeWidth={2.2} />
              <p className="font-mono text-[12px] leading-relaxed text-signal">
                <span className="text-good">Cluster Application #{dossier.applicationId} received.</span> Dedicated
                Solutions Architect from the {DESKS[region].desk} assigned. Provisioning credentials
                dispatched to authorized email.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <CopyRow label="APPLICATION" value={dossier.applicationId} id="app-id" />
            <CopyRow label="ARCHITECT" value={dossier.architect} id="architect" />
            <CopyRow label="REVIEW WINDOW" value={dossier.slot} id="slot" />
            <CopyRow label="ENGINEERING REF" value={dossier.reference} id="ref" />
            <CopyRow
              label="AUTHORIZED EMAIL"
              value={form.email}
              id="email"
              mono={false}
            />
          </div>

          <div className="mt-5 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {[
              ['REQUESTED FLEET', `${form.gpus} × H100 SXM5`, 'subject to campus inventory'],
              ['TARGET FRAMEWORK', FRAMEWORKS.find((f) => f.key === form.framework)!.name, 'adapter + NCCL tuning'],
              ['CAMPUS PREFERENCE', REGION_MAP[region].city, REGION_MAP[region].zone],
            ].map(([k, v, sub]) => (
              <div key={k} className="bg-carbon px-4 py-4">
                <span className="eyebrow">{k}</span>
                <p className="num mt-2 text-[13.5px] text-signal">{v}</p>
                <p className="mt-1 font-mono text-2xs text-slate-dim">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 border border-hairline bg-carbon p-4">
            <span className="eyebrow">WHAT HAPPENS NEXT</span>
            <ol className="mt-3 space-y-3">
              {[
                ['Within 1 business day', 'Your architect issues a capacity hold against the selected campus.'],
                ['Within 3 business days', 'Benchmark run executed on your target framework and a written run-rate is returned.'],
                ['On acceptance', 'Private VPC, tenant KMS binding and SSH credentials are materialised.'],
              ].map(([when, what], i) => (
                <li key={when} className="flex gap-3.5">
                  <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-amber/40 text-2xs text-amber">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-mono text-2xs uppercase tracking-widest text-signal">{when}</span>
                    <span className="mt-1 block font-mono text-2xs leading-relaxed text-slate-tech">{what}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <LabeledField
              label="Work email"
              error={touched.email ? errors.email : undefined}
              hint="Used only for credential dispatch and the architecture review."
            >
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@lab.example"
                className={`field ${touched.email && errors.email ? '!border-crit' : ''}`}
              />
            </LabeledField>

            <LabeledField
              label="Company / lab name"
              error={touched.company ? errors.company : undefined}
            >
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, company: true }))}
                placeholder="Institute for Frontier Models"
                className={`field ${touched.company && errors.company ? '!border-crit' : ''}`}
              />
            </LabeledField>

            <LabeledField
              label="Required GPU count"
              error={touched.gpus ? errors.gpus : undefined}
              hint="Smallest viable fleet — we scale the hold up, never down."
            >
              <input
                type="text"
                inputMode="numeric"
                value={form.gpus}
                onChange={(e) => setForm((f) => ({ ...f, gpus: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, gpus: true }))}
                placeholder="64"
                className={`field ${touched.gpus && errors.gpus ? '!border-crit' : ''}`}
              />
            </LabeledField>

            <LabeledField label="Preferred campus">
              <div className="field flex items-center justify-between !py-[13px]">
                <span className="text-[13px]">{REGION_MAP[region].label}</span>
                <span className="num text-2xs text-slate-dim">CHANGE VIA NAV REGION SELECTOR</span>
              </div>
            </LabeledField>
          </div>

          <fieldset className="mt-6">
            <legend className="field-label">Target framework</legend>
            <div className="grid gap-2 sm:grid-cols-4">
              {FRAMEWORKS.map((f) => {
                const on = f.key === form.framework
                return (
                  <label
                    key={f.key}
                    className={`radio-card flex cursor-pointer flex-col ${on ? 'radio-card-on' : 'radio-card-off'}`}
                  >
                    <input
                      type="radio"
                      name="framework"
                      value={f.key}
                      checked={on}
                      onChange={() => setForm((s) => ({ ...s, framework: f.key }))}
                      className="sr-only"
                    />
                    <span className={`font-mono text-[12px] tracking-wide ${on ? 'text-amber' : 'text-signal'}`}>
                      {f.name}
                    </span>
                    <span className="mt-1.5 font-mono text-2xs leading-relaxed text-slate-dim">{f.note}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="mt-5">
            <LabeledField
              label="Workload notes (optional)"
              hint="Sequence lengths, model sizes and checkpoint cadence help us pre-tune NCCL."
            >
              <textarea
                rows={3}
                value={form.workloads}
                onChange={(e) => setForm((f) => ({ ...f, workloads: e.target.value }))}
                placeholder="Pre-training a 70B dense model, 8K sequence length, checkpoints every 500 steps."
                className="field resize-none"
              />
            </LabeledField>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-slate-dim">
                <Icon name="shield" className="h-3.5 w-3.5 text-good" />
                NDA ON REQUEST
              </span>
              <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-slate-dim">
                <Icon name="lock" className="h-3.5 w-3.5 text-good" />
                EU/CH TENANCY AVAILABLE
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onClose} className="btn btn-ghost">
                CANCEL
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? (
                  <>
                    <span className="h-2 w-2 animate-blink bg-obsidian" />
                    ROUTING TO ENGINEERING DESK
                  </>
                ) : (
                  <>
                    <Icon name="arrow-right" className="h-3.5 w-3.5" />
                    SUBMIT CLUSTER APPLICATION
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-4 font-mono text-2xs leading-relaxed text-slate-dim">
            Applications route to the {REGION_MAP[region].city} desk during regional business hours. Existing
            enterprise accounts are routed directly to their assigned architect. {REGIONS.length} campuses
            accepting applications.
          </p>
        </form>
      )}
    </Modal>
  )
}
