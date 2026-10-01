import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon, StatusDot } from '../ui/Glyph'
import { useTerminal, type TermLine, type Tone } from '../../hooks/useTerminal'
import type { RegionKey } from '../../data/regions'
import { REGION_MAP } from '../../data/regions'

const TONE_CLASS: Record<Tone, string> = {
  signal: 'text-signal',
  muted: 'text-slate-tech',
  good: 'text-good',
  amber: 'text-amber',
  rail: 'text-rail',
  crit: 'text-crit',
  prompt: 'text-rail',
}

export interface TerminalShellHandle {
  run: (cmd: string) => void
}

export function TerminalShell({
  region,
  clusterId = 'cl-zurich-01',
  presets,
  height = 'h-[420px]',
  autoBanner = true,
  onReady,
}: {
  region: RegionKey
  clusterId?: string
  presets?: Array<{ label: string; cmd: string }>
  height?: string
  autoBanner?: boolean
  onReady?: (handle: TerminalShellHandle) => void
}) {
  const regionLabel = REGION_MAP[region].label
  const { lines, busy, run, clear, history, banner, push } = useTerminal(regionLabel, clusterId)
  const [value, setValue] = useState('')
  const [histIndex, setHistIndex] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)
  const bufferRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const booted = useRef(false)

  /* Boot banner once — never re-printed on region change. */
  useEffect(() => {
    if (booted.current || !autoBanner) return
    booted.current = true
    banner()
  }, [autoBanner, banner])

  useEffect(() => {
    onReady?.({ run })
  }, [onReady, run])

  /* Keep the viewport pinned to the newest output. */
  useEffect(() => {
    const el = bufferRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const submit = useCallback(
    (cmd?: string) => {
      const payload = (cmd ?? value).trim()
      if (!payload) return
      void run(payload)
      setValue('')
      setHistIndex(null)
      inputRef.current?.focus()
    },
    [run, value],
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const idx = histIndex === null ? history.length - 1 : Math.max(0, histIndex - 1)
      setHistIndex(idx)
      setValue(history[idx])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIndex === null) return
      const idx = histIndex + 1
      if (idx >= history.length) {
        setHistIndex(null)
        setValue('')
      } else {
        setHistIndex(idx)
        setValue(history[idx])
      }
      return
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      clear()
    }
  }

  const stats = useMemo(
    () => [
      { k: 'SESSION', v: 'mTLS PINNED' },
      { k: 'REGION', v: REGION_MAP[region].zone },
      { k: 'LATENCY', v: '1.84μs' },
      { k: 'PTY', v: 'xterm-256color' },
    ],
    [region],
  )

  return (
    <div className="border border-hairline bg-obsidian">
      {/* ------------------------------------------------------- window chrome */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-carbon px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 border border-hairline bg-graphite" />
            <span className="h-2.5 w-2.5 border border-hairline bg-graphite" />
            <span className="h-2.5 w-2.5 border border-hairline bg-amber/70" />
          </span>
          <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">
            ops@tensormesh — interactive shell
          </span>
          <StatusDot tone={busy ? 'amber' : 'good'} />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {stats.map((s) => (
            <span key={s.k} className="hidden items-center gap-2 md:flex">
              <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{s.k}</span>
              <span className="num text-2xs text-slate-tech">{s.v}</span>
            </span>
          ))}
          <button
            type="button"
            onClick={clear}
            className="font-mono text-2xs uppercase tracking-widest text-slate-dim transition-colors hover:text-amber"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- buffer */}
      <div
        ref={bufferRef}
        onClick={() => inputRef.current?.focus()}
        className={`${height} overflow-y-auto overflow-x-hidden px-4 py-3 font-mono text-[12.5px] leading-[1.65]`}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {lines.length === 0 && !busy && (
          <p className="text-slate-dim">
            TensorMesh Shell ready. Select a preset command below or type{" "}
            <span className="text-amber">help</span>.
          </p>
        )}
        {lines.map((line: TermLine) => (
          <pre
            key={line.id}
            className={`whitespace-pre ${TONE_CLASS[line.tone]} ${
              line.tone === 'prompt' ? 'mt-2' : ''
            }`}
          >
            {line.text === '' ? '\u00A0' : line.text}
          </pre>
        ))}
        {busy && (
          <div className="mt-1 flex items-center gap-2 text-amber">
            <span className="inline-block h-3 w-1.5 animate-blink bg-amber" />
            <span className="text-2xs uppercase tracking-widest">executing</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ input */}
      <div className="border-t border-hairline bg-carbon px-4 py-3">
        <div
          className={`flex items-center gap-2 border bg-obsidian px-3 py-2 transition-colors ${
            focused ? 'border-rail/50' : 'border-hairline'
          }`}
        >
          <span className="shrink-0 font-mono text-[12.5px] text-good">
            ops@tensormesh:{clusterId}$
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminal command input"
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-signal caret-transparent outline-none"
          />
          {/* blinking block cursor — tracks end-of-line while focused */}
          <span
            aria-hidden="true"
            className={`h-[15px] w-[7px] shrink-0 bg-amber ${focused ? 'animate-blink' : 'opacity-30'}`}
          />
          <button
            type="button"
            onClick={() => submit()}
            disabled={busy || !value.trim()}
            className="shrink-0 border border-hairline bg-graphite px-2.5 py-1 font-mono text-2xs uppercase tracking-widest text-slate-tech transition-colors hover:border-amber hover:text-amber disabled:opacity-40"
          >
            EXEC
          </button>
        </div>

        {presets && presets.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.cmd}
                type="button"
                disabled={busy}
                onClick={() => submit(p.cmd)}
                className="group flex items-center gap-2 border border-hairline bg-obsidian px-2.5 py-1.5 font-mono text-2xs uppercase tracking-widest text-slate-tech transition-colors hover:border-rail/50 hover:text-rail disabled:opacity-40"
              >
                <Icon name="play" className="h-2.5 w-2.5 text-slate-dim group-hover:text-rail" strokeWidth={2} />
                {p.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="font-mono text-2xs text-slate-dim">
            ↑ / ↓ command history · ⌃L clear
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-tick bg-good" />
            <span className="font-mono text-2xs text-slate-dim">
              stdout streamed over encrypted channel
            </span>
          </span>
          <span className="num ml-auto text-2xs text-slate-dim">{lines.length} lines buffered</span>
        </div>
      </div>
    </div>
  )
}
