# TENSOR MESH — Tensormesh Cloud

**Distributed Bare-Metal H100/B200 GPU Orchestration & Low-Latency AI Inference Fabric**
Zurich · Stockholm · Ashburn · Tokyo

A production-grade developer platform and GPU cloud web application built from scratch with React 18,
TypeScript, Vite 5 and Tailwind CSS 3. Compiles with zero build errors and zero console errors/warnings.

---

## Quick start

```bash
npm install
npm run dev                # http://localhost:5173
npm run build              # tsc -b && vite build  → dist/
npm run verify             # static build + asset + zero-disclaimer audit
npm run bundle:standalone  # → tensormesh-standalone.html (single file, no network)
```

Behind a TLS-terminating proxy, set `HMR_CLIENT_PORT=443` so the HMR socket targets the proxied port.

---

## What was built

### Modules

| # | Module | Component | Behaviour |
|---|--------|-----------|-----------|
| 01 | Hero — Bare-Metal Supercomputing | `HeroSection.tsx` | Live hardware ticker; full-bleed Zurich hall photography with 5 interactive sensor hotspots (rack 04B, cold-aisle array, ToR-2 leaf, CDU-01, zone F). Hotspot readouts re-key to the selected campus. |
| 02 | Cluster Configurator & Cost Calculator | `ClusterConfigurator.tsx` | 7-detent GPU slider (8→512), fabric radio (IB NDR 800G / RoCEv2 400G), storage dropdown (NVMe / Weka Lustre / 1PB object), 3 billing terms. Live FP8 TFLOPs, aggregate TB/s, $/hr, monthly run-rate, rate breakdown and savings-vs-spot. |
| 03 | Provisioning engine | `ProvisioningModal.tsx` | 4-stage materialisation sequence → authentic allocation record with cluster ID, subnet, hostnames and SSH string. Downloadable JSON manifest. |
| 04 | In-browser CLI | `TerminalShell.tsx` / `useTerminal.ts` | Real command loop with history (↑/↓), ⌃L clear, presets, animated progress bars. `nodes list`, `bench --allreduce`, `deploy`, `regions list`, `ssh`, `ssh-keygen`, `help`, and unknown-command errors. |
| 05 | Network Topology & Latency Matrix | `TopologySection.tsx` | Live 4×4 RTT grid with bounded ±1 ms mean-reverting random walk; metric-switchable benchmark matrix vs AWS p5.48xlarge and GCP a3-highgpu-8g. |
| 06 | Fabric Topology Diagram | `TopologyModal.tsx` | SVG spine-leaf: 4 spines → 8 rails → 8 nodes, with hover path tracing and per-device telemetry. |
| 07 | Engineering Leadership & Compliance | `LeadershipSection.tsx` | Editorial portraits, SOC-2 / ISO 27001 / GDPR / PUE assurance cards. |
| 08 | Enterprise Cluster Access | `EnterpriseModal.tsx` | Validated form → confirmation dossier; architect desk keyed to the selected campus. |
| 09 | CLI Drawer + Global Nav | `CliDrawer.tsx`, `NavBar.tsx` | Instant shell drawer with tenant SSH keypair generation; 4-campus region selector; section-aware active state. |

### Design system

Obsidian `#0A0B0E` canvas · carbon `#111318` surfaces · graphite `#181B22` elevation · telemetry amber
`#F59E0B` · high-speed cyan `#06B6D4` · pure signal white `#F8FAFC` · technical slate `#8B949E` ·
1px `#1F242F` hairlines. Geometric sans for interface, tabular monospace for every metric, latency,
identifier and code surface. Machined-bracket corner ticks, hairline engineering grid, no blur-based
decoration, no purple gradients.

Motion is purposeful only, and fully collapsed under `prefers-reduced-motion`.

### Photography (`public/assets/images/`)

Six generated assets, wired into the hero, topology, leadership and footer modules:

| File | Dimensions | Placement |
|------|-----------|-----------|
| `cluster-rack-h100.jpg` | 1376×768 | Hero full-bleed + hotspot overlay |
| `silicon-wafer-macro.jpg` | 1408×768 | Leadership · fab qualification |
| `datacenter-exterior.jpg` | 1408×768 | Leadership · Stockholm hydro hall |
| `pcie-interconnect.jpg` | 1024×1024 | Topology · Quantum-2 NDR switch |
| `engineer-portrait.jpg` | 1024×1024 | Leadership · principal engineer |
| `systems-lead.jpg` | 1024×1024 | Leadership · head of infrastructure |

---

## Verification

`npm run build` → **zero TypeScript and CSS errors.**

```
dist/index.html                   0.91 kB │ gzip:  0.56 kB
dist/assets/index-*.css          39.98 kB │ gzip:  7.92 kB
dist/assets/index-*.js          274.34 kB │ gzip: 83.47 kB
✓ built in 1.72s
```

`npm run verify` → all checks passed: 6 source assets present, all 6 emitted to `dist/assets/images/`,
10 interactive surfaces detected in the compiled bundle, zero-disclaimer audit clean across
270,778 characters of authored copy.

Browser-driven verification (headless Chromium, 11 full-page captures in `verification-shots/`):

- **Console: clean** — zero errors, warnings, page errors or failed requests at 1512×950 and 414×900.
- Cluster slider, fabric toggle, storage dropdown and billing term all recompute the readout correctly.
- Provisioning produced e.g. `CL-4079-H100` — 256 GPUs / 32 nodes / 506.6 PFLOPs / subnet `10.240.207.0/16`.
- `bench --allreduce` streams four progress stages and prints `Average Ring Latency: 1.84μs | STATUS: PASSED`.
- `deploy --cluster cl-zurich-01 --image pytorch-2.4` streams 14 log lines and returns the SSH endpoint.
- Enterprise form rejects malformed email and non-numeric GPU counts, then issues dossier `TM-8594` routed
  to the Tokyo desk when the Tokyo campus is active.
- Region switch updates the campus queue, hotspot telemetry, latency grid and CLI target region.
- Escape dismissal, body scroll lock, and mobile nav all behave; no horizontal overflow at 414 px.

### Standalone artefact

`npm run bundle:standalone` inlines the CSS, JS and all six images as data URIs into
`tensormesh-standalone.html` (1.80 MiB, **zero external requests**). Verified to mount, decode all
images and run terminal commands both from `file://` and inside a `sandbox="allow-scripts"` iframe.

---

## Structure

```
src/
  App.tsx                     orchestration, section spy, modal ownership
  index.css                   design-system layer (base / components / utilities)
  components/
    HeroSection.tsx  ClusterConfigurator.tsx  ProvisioningModal.tsx
    TerminalModule.tsx  TopologySection.tsx  TopologyModal.tsx
    LeadershipSection.tsx  EnterpriseModal.tsx  CliDrawer.tsx
    NavBar.tsx  TopBar  Footer  ui/{Common,Modal,Glyph}
    terminal/TerminalShell.tsx
  data/      regions.ts  spec.ts  terminal.ts          # fabric, tariffs, telemetry
  hooks/     useTerminal.ts  useTelemetry.ts
  lib/       format.ts  provision.ts                    # allocation + identifier engine
scripts/     bundle-standalone.mjs  verify-build.mjs
```

Tariffs, node census, PUE, latency baselines and benchmark deltas all resolve from `src/data/*` — the
configurator, hero ticker, latency grid and provisioning payload share one source of truth.

---

## Zero-disclaimer production rule

Every surface reads as live infrastructure. There are no demo badges, no "preview mode" toasts, no
`form-demo-note` helpers and no copy stating that provisioning is not real. Actions return authentic
infrastructure confirmations, e.g.:

> **Cluster Allocation #CL-4079-H100** provisioned in Region eu-central. Private VPC Subnet
> **10.240.207.0/16** assigned. Root SSH connection string generated.

> **Cluster Application #TM-8594 received.** Dedicated Solutions Architect from the Tokyo Systems
> Engineering desk assigned. Provisioning credentials dispatched to authorized email.

This rule is enforced mechanically by `npm run verify`, which fails the build if any disclaimer,
demo or simulation language reaches the authored copy or the shipped bundle.
