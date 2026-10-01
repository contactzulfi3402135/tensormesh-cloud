import { useState } from 'react'
import { Icon, StatusDot } from '../ui/Glyph'
import { SectionHeader, CopyRow } from '../ui/Common'
import { TerminalShell } from './TerminalShell'
import { PYTHON_SDK } from '../../data/terminal'
import type { RegionKey } from '../../data/regions'
import { REGION_MAP } from '../../data/regions'

type TabKey = 'shell' | 'install' | 'sdk'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'shell', label: 'RUN INTERACTIVE SHELL' },
  { key: 'install', label: 'DOWNLOAD CLI' },
  { key: 'sdk', label: 'PYTHON SDK' },
]

const PRESETS = [
  { label: 'nodes list', cmd: 'tensormesh nodes list' },
  { label: 'bench --allreduce', cmd: 'tensormesh bench --allreduce' },
  { label: 'deploy --cluster cl-zurich-01 --image pytorch-2.4', cmd: 'tensormesh deploy --cluster cl-zurich-01 --image pytorch-2.4' },
  { label: 'regions list', cmd: 'tensormesh regions list' },
  { label: 'help', cmd: 'help' },
]

const PLATFORMS: Array<[string, string, string]> = [
  ['darwin-arm64', 'macOS 13+ · Apple Silicon', 'brew install tensormesh'],
  ['linux-x86_64', 'Debian 12 / Ubuntu 22.04+', 'apt install tensormesh'],
  ['linux-aarch64', 'RHEL 9 / Ampere', 'dnf install tensormesh'],
  ['windows-x86_64', 'Windows Server 2022 · WSL2', 'winget install TensorMesh.CLI'],
]

export function TerminalModule({ region }: { region: RegionKey }) {
  const [tab, setTab] = useState<TabKey>('shell')
  const r = REGION_MAP[region]

  return (
    <section id="runtime" className="border-b border-hairline bg-obsidian py-16 sm:py-24">
      <div className="shell">
        <SectionHeader
          index="03"
          eyebrow="INFERENCE RUNTIME · OPERATOR SURFACE"
          title={
            <>
              Drive the fabric from your terminal — <span className="text-amber">no console archaeology.</span>
            </>
          }
          lede="The TensorMesh CLI is a single static binary that speaks directly to the regional control plane over mTLS. Enumerate allocated nodes, run collective benchmarks, and materialise cluster images without leaving your shell."
          right={
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <span className="badge badge-good">
                <StatusDot tone="good" /> CONTROL PLANE OPERATIONAL
              </span>
              <span className="num text-2xs text-slate-dim">
                p50 latency 41ms · {r.zone} · build 20260928.4
              </span>
            </div>
          }
        />

        {/* -------------------------------------------------------------- tabs */}
        <div className="mt-10 border-b border-hairline">
          <div className="flex flex-wrap gap-px" role="tablist" aria-label="Terminal surfaces">
            {TABS.map((t) => {
              const on = t.key === tab
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`relative px-4 py-3 font-mono text-2xs uppercase tracking-widest transition-colors ${
                    on ? 'text-amber' : 'text-slate-tech hover:text-signal'
                  }`}
                >
                  {t.label}
                  {on && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-amber" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-8">
          {tab === 'shell' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <TerminalShell region={region} presets={PRESETS} height="h-[560px]" />

              {/* operator rail */}
              <aside className="flex flex-col gap-4">
                <div className="border border-hairline bg-carbon">
                  <div className="border-b border-hairline px-4 py-3">
                    <span className="eyebrow">SESSION CONTEXT</span>
                  </div>
                  <dl className="divide-y divide-hairline">
                    {[
                      ['TENANT', 'acct-4471'],
                      ['ALLOCATION', 'cl-zurich-01'],
                      ['REGION', r.label],
                      ['NODES', '8 × HGX SXM5'],
                      ['FABRIC', 'IB NDR 800G · 8 RAILS'],
                      ['IMAGE', 'cuda-12.6-pytorch-2.4'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <dt className="font-mono text-2xs uppercase tracking-widest text-slate-dim">{k}</dt>
                        <dd className="num text-right text-2xs text-signal">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="border border-hairline bg-carbon p-4">
                  <span className="eyebrow">GPU HEALTH · LIVE</span>
                  <div className="mt-3 space-y-2.5">
                    {[
                      ['SXM5-00', '61°C', 0.31],
                      ['SXM5-01', '58°C', 0.28],
                      ['SXM5-02', '63°C', 0.36],
                      ['SXM5-03', '60°C', 0.24],
                      ['SXM5-04', '62°C', 0.41],
                      ['SXM5-05', '59°C', 0.19],
                      ['SXM5-06', '64°C', 0.33],
                      ['SXM5-07', '61°C', 0.27],
                    ].map(([gpu, temp, load]) => (
                      <div key={String(gpu)} className="flex items-center gap-3">
                        <span className="num w-[62px] shrink-0 text-2xs text-slate-tech">{gpu}</span>
                        <span className="h-1 flex-1 bg-obsidian">
                          <span
                            className="block h-full bg-rail/70"
                            style={{ width: `${(Number(load) * 100).toFixed(0)}%` }}
                          />
                        </span>
                        <span className="num w-[38px] shrink-0 text-right text-2xs text-slate-dim">{temp}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-hairline pt-3 font-mono text-2xs leading-relaxed text-slate-dim">
                    ECC correctable 0 · XID 0 · NVLink 4.2 TB/s per node · idle draw 118 W
                  </p>
                </div>

                <div className="flex items-start gap-3 border border-hairline bg-carbon p-4">
                  <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-good" />
                  <p className="font-mono text-2xs leading-relaxed text-slate-tech">
                    Commands are signed with your tenant keypair and audited in the regional incident log for 400
                    days. <span className="text-signal">SOC-2 CC7.2</span>.
                  </p>
                </div>
              </aside>
            </div>
          )}

          {tab === 'install' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-5">
                <div className="border border-hairline bg-carbon p-5">
                  <span className="eyebrow-amber">RECOMMENDED · HOMEBREW</span>
                  <div className="mt-3">
                    <CopyRow label="BREW" value="brew install tensormesh" id="brew" />
                  </div>
                  <p className="mt-3 font-mono text-2xs leading-relaxed text-slate-dim">
                    Formula verified against the TensorMesh release signature. Installs the static binary at
                    /opt/homebrew/bin/tensormesh.
                  </p>
                </div>

                <div className="border border-hairline bg-carbon p-5">
                  <span className="eyebrow-amber">UNIVERSAL · SIGNED INSTALL SCRIPT</span>
                  <div className="mt-3">
                    <CopyRow
                      label="CURL"
                      value="curl -fsSL https://get.tensormesh.cloud/cli | sh"
                      id="curl"
                    />
                  </div>
                  <p className="mt-3 font-mono text-2xs leading-relaxed text-slate-dim">
                    Downloads the pinned release for your architecture and verifies the detached signature before
                    writing to /usr/local/bin.
                  </p>
                </div>

                <div className="border border-hairline bg-carbon">
                  <div className="border-b border-hairline px-5 py-3">
                    <span className="eyebrow">RELEASE 3.8.4-PROD · PLATFORM MATRIX</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse">
                      <thead>
                        <tr className="bg-graphite">
                          {['TARGET', 'MINIMUM OS', 'INSTALL'].map((h) => (
                            <th
                              key={h}
                              className="border-b border-hairline px-4 py-2.5 text-left font-mono text-2xs uppercase tracking-widest text-slate-tech"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {PLATFORMS.map(([target, os, install]) => (
                          <tr key={target} className="border-b border-hairline/70 last:border-b-0">
                            <td className="px-4 py-3 font-mono text-[12.5px] text-signal">{target}</td>
                            <td className="px-4 py-3 font-mono text-[12.5px] text-slate-tech">{os}</td>
                            <td className="px-4 py-3 font-mono text-[12.5px] text-rail">{install}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <aside className="flex flex-col gap-4">
                <div className="border border-hairline bg-carbon p-5">
                  <span className="eyebrow">VERIFY THE BINARY</span>
                  <div className="mt-3 flex flex-col gap-2">
                    <CopyRow label="SHA256" value="9f2c41ad7b8e016f3d5c9a0e7f4b28c1d63e8a05b9f7c2e4d1a8b3f6c0e97425" id="sha" />
                    <CopyRow label="SIGNER" value="TensorMesh Release Signing (EU) <releng@tensormesh.cloud>" id="signer" />
                  </div>
                </div>
                <div className="border border-hairline bg-carbon p-5">
                  <span className="eyebrow">RELEASE NOTES · 3.8.4</span>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      'SHARPv3 in-network reduction exposed via --sharpen-allreduce',
                      'B200 allocation surface promoted to general availability',
                      'streaming image layer cache cuts cold-start by 11.4 s',
                      'tensormesh nodes list now reports PCIe bus link width',
                    ].map((n) => (
                      <li key={n} className="flex gap-2.5 font-mono text-2xs leading-relaxed text-slate-tech">
                        <Icon name="check" className="mt-0.5 h-3 w-3 shrink-0 text-good" strokeWidth={2} />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          )}

          {tab === 'sdk' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="border border-hairline bg-obsidian">
                <div className="flex items-center justify-between border-b border-hairline bg-carbon px-4 py-2.5">
                  <span className="font-mono text-2xs uppercase tracking-widest text-slate-tech">
                    provision_cluster.py — Python 3.10+
                  </span>
                  <span className="badge badge-rail">tensormesh 3.8.4</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.7]">
                  <code>
                    {PYTHON_SDK.split('\n').map((line, i) => (
                      <span key={i} className="block">
                        <span className="mr-4 inline-block w-6 select-none text-right text-slate-faint">
                          {i + 1}
                        </span>
                        <span className={commentClass(line)}>{line || ' '}</span>
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
              <aside className="flex flex-col gap-4">
                <div className="border border-hairline bg-carbon p-5">
                  <span className="eyebrow">INSTALL</span>
                  <div className="mt-3 flex flex-col gap-2">
                    <CopyRow label="PIP" value="pip install tensormesh==3.8.4" id="pip" />
                    <CopyRow label="UV" value="uv add tensormesh" id="uv" />
                  </div>
                </div>
                <div className="border border-hairline bg-carbon p-5">
                  <span className="eyebrow">FRAMEWORK ADAPTERS</span>
                  <ul className="mt-3 space-y-2">
                    {[
                      ['vLLM 0.6.2', 'tensormesh.integrations.vllm'],
                      ['Megatron-LM', 'tensormesh.integrations.megatron'],
                      ['DeepSpeed', 'tensormesh.integrations.deepspeed'],
                      ['Ray 2.39', 'tensormesh.integrations.ray'],
                    ].map(([fw, mod]) => (
                      <li key={fw} className="border border-hairline bg-obsidian px-3 py-2">
                        <span className="block font-mono text-[11.5px] text-signal">{fw}</span>
                        <span className="mt-0.5 block font-mono text-2xs text-slate-dim">{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-hairline bg-carbon p-5">
                  <span className="eyebrow">TYPED SURFACE</span>
                  <p className="mt-3 font-mono text-2xs leading-relaxed text-slate-tech">
                    Every call returns a frozen dataclass with the full allocation record. Mypy-clean, ships
                    py.typed, zero runtime dependencies outside httpx.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function commentClass(line: string) {
  const trimmed = line.trimStart()
  if (trimmed.startsWith('#')) return 'text-slate-dim'
  if (trimmed.startsWith('# ')) return 'text-slate-dim'
  if (/^(from|import)\b/.test(trimmed)) return 'text-rail'
  if (/^(print|fabric|spec|cluster)\./.test(trimmed)) return 'text-signal'
  return 'text-slate-tech'
}
