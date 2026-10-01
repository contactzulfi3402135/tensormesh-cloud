import type { ReactNode } from 'react'
import { Icon, StatusDot } from './Glyph'
import { useCopy } from '../../hooks/useTelemetry'
import { asset } from '../../lib/format'

/* ------------------------------ section header ----------------------------- */

export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  right,
  align = 'left',
}: {
  index: string
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  right?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={`flex flex-col gap-6 ${
        align === 'center'
          ? 'items-center text-center'
          : 'lg:flex-row lg:items-end lg:justify-between'
      }`}
    >
      <div className={align === 'center' ? 'max-w-3xl' : 'max-w-3xl'}>
        <div
          className={`mb-4 flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}
        >
          <span className="num text-2xs text-amber">{index}</span>
          <span className="h-px w-8 bg-hairline" />
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h2 className="text-balance text-2xl font-semibold leading-[1.1] tracking-tightest text-signal sm:text-3xl lg:text-[38px]">
          {title}
        </h2>
        {lede && (
          <p className="mt-4 max-w-prose2 text-pretty text-[14px] leading-relaxed text-slate-tech sm:text-[15px]">
            {lede}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

/* ---------------------------------- eyebrow -------------------------------- */

export function ModuleTag({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'amber' | 'rail' | 'good' }) {
  const map = {
    muted: 'text-slate-tech',
    amber: 'text-amber',
    rail: 'text-rail',
    good: 'text-good',
  }
  return (
    <span
      className={`inline-flex items-center gap-2 border border-hairline bg-badgefill px-2 py-1 font-mono text-2xs uppercase tracking-widest ${map[tone]}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------- metric readout ---------------------------- */

export function MetricReadout({
  label,
  value,
  unit,
  hint,
  tone = 'signal',
  live = false,
}: {
  label: string
  value: string
  unit?: string
  hint?: string
  tone?: 'signal' | 'amber' | 'rail' | 'good'
  live?: boolean
}) {
  const color =
    tone === 'amber'
      ? 'text-amber'
      : tone === 'rail'
        ? 'text-rail'
        : tone === 'good'
          ? 'text-good'
          : 'text-signal'
  return (
    <div className="border border-hairline bg-obsidian p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">{label}</span>
        {live && <StatusDot tone="good" />}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`num text-xl leading-none sm:text-2xl ${color}`}>{value}</span>
        {unit && <span className="num text-2sm text-slate-dim">{unit}</span>}
      </div>
      {hint && <div className="mt-2 font-mono text-2xs leading-relaxed text-slate-dim">{hint}</div>}
    </div>
  )
}

/* --------------------------------- copy row -------------------------------- */

export function CopyRow({
  label,
  value,
  id,
  mono = true,
  tone = 'surface',
}: {
  label: string
  value: string
  id: string
  mono?: boolean
  tone?: 'surface' | 'obsidian'
}) {
  const { copied, copy } = useCopy()
  const isCopied = copied === id
  return (
    <div
      className={`flex items-center gap-3 border border-hairline px-3 py-2.5 ${
        tone === 'obsidian' ? 'bg-obsidian' : 'bg-carbon'
      }`}
    >
      <span className="hidden w-28 shrink-0 font-mono text-2xs uppercase tracking-widest text-slate-dim sm:block">
        {label}
      </span>
      <code
        className={`min-w-0 flex-1 truncate text-[12px] text-signal/90 ${
          mono ? 'font-mono' : 'font-sans'
        }`}
        title={value}
      >
        {value}
      </code>
      <button
        type="button"
        onClick={() => copy(value, id)}
        aria-label={`Copy ${label}`}
        className={`shrink-0 border px-2 py-1 font-mono text-2xs uppercase tracking-widest transition-colors ${
          isCopied
            ? 'border-good/50 bg-good/10 text-good'
            : 'border-hairline bg-graphite text-slate-tech hover:border-amber hover:text-amber'
        }`}
      >
        {isCopied ? 'COPIED' : <Icon name="copy" className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

/* ------------------------------- data table -------------------------------- */

export function DataTable({
  columns,
  rows,
  dense = false,
}: {
  columns: string[]
  rows: ReactNode[][]
  dense?: boolean
}) {
  return (
    <div className="overflow-x-auto border border-hairline">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="bg-graphite">
            {columns.map((c) => (
              <th
                key={c}
                className="border-b border-hairline px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-widest text-slate-tech"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-hairline/70 transition-colors last:border-b-0 hover:bg-graphite/60"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 text-[12.5px] ${
                    dense ? 'py-2' : 'py-3'
                  } ${j === 0 ? 'text-signal' : 'font-mono tabular-nums text-slate-tech'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------ field / inputs ----------------------------- */

export function LabeledField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block font-mono text-2xs text-crit">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block font-mono text-2xs text-slate-dim">{hint}</span>
      ) : null}
    </label>
  )
}

/* ------------------------------ image frame -------------------------------- */

export function ImageFrame({
  src,
  alt,
  caption,
  meta,
  className = '',
  aspect = 'aspect-[16/10]',
  priority = false,
}: {
  src: string
  alt: string
  caption?: string
  meta?: string
  className?: string
  aspect?: string
  priority?: boolean
}) {
  return (
    <figure className={`group relative overflow-hidden border border-hairline bg-carbon ${className}`}>
      <div className={`relative ${aspect} overflow-hidden`}>
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-precision group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
      </div>
      {(caption || meta) && (
        <figcaption className="flex items-center justify-between gap-4 border-t border-hairline bg-obsidian px-4 py-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">{caption}</span>
          {meta && <span className="num text-2xs text-amber">{meta}</span>}
        </figcaption>
      )}
    </figure>
  )
}

export { asset }
