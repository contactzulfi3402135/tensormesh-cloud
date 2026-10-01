import { useState } from 'react'
import { Icon, StatusDot } from './ui/Glyph'
import { CopyRow } from './ui/Common'
import { TerminalShell } from './terminal/TerminalShell'
import { useBodyLock, useEscape } from '../hooks/useTelemetry'
import { REGION_MAP, type RegionKey } from '../data/regions'
import { group } from '../lib/format'

const DRAWER_PRESETS = [
  { label: 'nodes list', cmd: 'tensormesh nodes list' },
  { label: 'regions list', cmd: 'tensormesh regions list' },
  { label: 'generate ssh key', cmd: 'ssh-keygen -t ed25519 -f ~/.ssh/tensormesh_ed25519' },
  { label: 'bench --allreduce', cmd: 'tensormesh bench --allreduce' },
]

/**
 * CLI ACCESS drawer — a right-hand operator pane for immediate shell access
 * without leaving the current surface.
 */
export function CliDrawer({
  open,
  onClose,
  region,
}: {
  open: boolean
  onClose: () => void
  region: RegionKey
}) {
  const [keyGenerated, setKeyGenerated] = useState(false)
  useBodyLock(open)
  useEscape(onClose, open)
  const r = REGION_MAP[region]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[130]" role="dialog" aria-modal="true" aria-label="CLI access">
      <div className="absolute inset-0 bg-obsidian/85 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[720px] animate-floatup flex-col border-l border-hairline bg-graphite">
        {/* -------------------------------------------------------------- header */}
        <header className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-3">
              <span className="eyebrow-amber">INSTANT SHELL ACCESS</span>
              <span className="badge badge-good">
                <StatusDot tone="good" /> EDGE 41MS
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tighter text-signal">TensorMesh CLI Drawer</h2>
            <p className="mt-1 font-mono text-2xs uppercase tracking-widest text-slate-dim">
              {r.label} · {r.zone} · {group(r.nodes)} NODES IN REGION
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close CLI drawer"
            className="shrink-0 border border-hairline bg-carbon p-2 text-slate-tech transition-colors hover:border-amber hover:text-amber"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <TerminalShell region={region} presets={DRAWER_PRESETS} height="h-[360px]" autoBanner />

          {/* --------------------------------------------------- ssh key panel */}
          <section className="mt-6 border border-hairline bg-carbon">
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Icon name="lock" className="h-4 w-4 text-amber" />
                <span className="eyebrow">TENANT SSH KEYPAIR</span>
              </div>
              <span className={`badge ${keyGenerated ? 'badge-good' : 'badge-muted'}`}>
                {keyGenerated ? 'REGISTERED' : 'NOT PRESENT'}
              </span>
            </div>

            {!keyGenerated ? (
              <div className="px-4 py-4">
                <p className="font-mono text-2xs leading-relaxed text-slate-tech">
                  No ed25519 keypair is bound to tenant <span className="text-signal">acct-4471</span>. Generate one
                  to enable direct node access; the public half is propagated to every node's authorized_keys within
                  300 ms.
                </p>
                <button
                  type="button"
                  onClick={() => setKeyGenerated(true)}
                  className="btn btn-primary mt-4"
                >
                  <Icon name="bolt" className="h-3.5 w-3.5" />
                  GENERATE ED25519 KEYPAIR
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-4">
                <CopyRow
                  label="PRIVATE"
                  value="~/.ssh/tensormesh_ed25519 (chmod 600)"
                  id="priv"
                  tone="obsidian"
                />
                <CopyRow
                  label="PUBLIC"
                  value="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILQwZk3nR7vBt4XmH9pYd2KsE1oJfN8aTzVbU6ChG0Y ops@tensormesh"
                  id="pub"
                  tone="obsidian"
                />
                <CopyRow
                  label="FINGERPRINT"
                  value="SHA256:9K4pRUq2nXhVwbz8mLdT7cQf3sAy6JvN1eWgH0oZi4M"
                  id="fp"
                  tone="obsidian"
                />
                <div className="mt-1 flex items-center justify-between border border-hairline bg-obsidian px-3 py-2.5">
                  <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-good">
                    <Icon name="check" className="h-3 w-3" strokeWidth={2} />
                    AUTHORIZED_KEYS WRITTEN · 8/8 NODES
                  </span>
                  <span className="num text-2xs text-slate-dim">300 MS PROPAGATION</span>
                </div>
              </div>
            )}
          </section>

          {/* ---------------------------------------------------- install strip */}
          <section className="mt-5 border border-hairline bg-carbon p-4">
            <span className="eyebrow">INSTALL THE CLI</span>
            <div className="mt-3">
              <CopyRow label="BREW" value="brew install tensormesh" id="drawer-brew" tone="obsidian" />
            </div>
            <p className="mt-3 font-mono text-2xs text-slate-dim">
              v3.8.4-prod · static binary · signature verified on install
            </p>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-obsidian px-5 py-3">
          <span className="font-mono text-2xs uppercase tracking-widest text-slate-dim">
            SESSION AUDITED · SOC-2 CC7.2 · 400-DAY RETENTION
          </span>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            CLOSE DRAWER
          </button>
        </footer>
      </aside>
    </div>
  )
}
