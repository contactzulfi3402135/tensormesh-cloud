/**
 * TENSOR MESH — build verification
 *
 * Static checks that run without a browser:
 *   1. every required photography asset exists in public/assets/images/
 *   2. the production build emitted them into dist/assets/images/
 *   3. the compiled bundle contains the expected interactive surfaces
 *   4. no disclaimer / demo language leaked into the shipped markup or bundle
 *
 * Usage:  npm run build && npm run verify
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
let failures = 0
const ok = (label, pass, detail = '') => {
  if (!pass) failures++
  console.log(`  ${pass ? '✔' : '✘'} ${label}${detail ? `  — ${detail}` : ''}`)
}

const walkFiles = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walkFiles(full) : [full]
  })

const REQUIRED_IMAGES = [
  'cluster-rack-h100.jpg',
  'silicon-wafer-macro.jpg',
  'datacenter-exterior.jpg',
  'pcie-interconnect.jpg',
  'engineer-portrait.jpg',
  'systems-lead.jpg',
]

console.log('\nTENSOR MESH — BUILD VERIFICATION\n')

/* 1 ── source photography ------------------------------------------------- */
console.log('1) Photography assets (public/assets/images)')
for (const name of REQUIRED_IMAGES) {
  const p = join(ROOT, 'public', 'assets', 'images', name)
  const exists = existsSync(p)
  const kb = exists ? (statSync(p).size / 1024).toFixed(0) : 0
  ok(name, exists && statSync(p).size > 20_000, exists ? `${kb} KiB` : 'MISSING')
}

/* 2 ── dist output -------------------------------------------------------- */
console.log('\n2) Production output (dist)')
const distIndex = join(ROOT, 'dist', 'index.html')
ok('dist/index.html emitted', existsSync(distIndex))
for (const name of REQUIRED_IMAGES) {
  const p = join(ROOT, 'dist', 'assets', 'images', name)
  ok(`dist/assets/images/${name}`, existsSync(p))
}
const assetsDir = join(ROOT, 'dist', 'assets')
const bundles = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((f) => f.endsWith('.js') || f.endsWith('.css'))
  : []
ok('hashed JS + CSS bundles emitted', bundles.length >= 2, bundles.join(', '))

/* 3 ── interactive surfaces present in the compiled bundle ----------------- */
console.log('\n3) Compiled interactive surfaces')
const js = bundles
  .filter((f) => f.endsWith('.js'))
  .map((f) => readFileSync(join(assetsDir, f), 'utf8'))
  .join('\n')
const SURFACES = [
  ['CLI terminal emulator', /tensormesh nodes list/],
  ['All-reduce benchmark', /Average Ring Latency/],
  ['Cluster configurator', /Dedicated GPU node count|DEDICATED GPU NODE COUNT/i],
  ['Provisioning payload', /allocations|Private VPC Subnet/i],
  ['Latency matrix', /INTER-REGION ROUND-TRIP LATENCY/i],
  ['Benchmark matrix', /p5\.48xlarge/],
  ['Enterprise dossier', /Cluster Application #|Solutions Architect/],
  ['Topology diagram', /RAIL-0|SPINE-0/],
  ['Compliance badges', /SOC-2 Type II/],
  ['Region fabric table', /eu-central-1/],
]
for (const [label, re] of SURFACES) ok(label, re.test(js))

/* 4 ── zero-disclaimer audit --------------------------------------------- */
console.log('\n4) Zero-disclaimer production audit')

// Authored copy: every source module plus the shipped markup and stylesheet.
// Third-party library internals (e.g. Object.prototype in the React runtime)
// are excluded by scanning src/ rather than the minified vendor code.
const authored = walkFiles(join(ROOT, 'src'))
  .filter((f) => /\.(ts|tsx|css)$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .concat([
    readFileSync(join(ROOT, 'index.html'), 'utf8'),
    readFileSync(distIndex, 'utf8'),
    ...readdirSync(assetsDir)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(assetsDir, f), 'utf8')),
  ])
  .join('\n')

// Library-free phrases: these can only originate from our own copy, so they are
// also asserted against the shipped JS bundle.
const FORBIDDEN_AUTHORED = [
  /\bdemo\b/i,
  /test\s*mode/i,
  /\bsimulated\b/i,
  /\bsimulation\b/i,
  /no data transmitted/i,
  /form-demo-note/i,
  /not\s+(yet\s+)?live/i,
  /\bmock\s+data\b/i,
  /\bsample\s+data\b/i,
  /\bplaceholder data\b/i,
  /\bfake\b/i,
  /\bdummy\b/i,
  /coming\s+soon/i,
]
const FORBIDDEN_ANYWHERE = FORBIDDEN_AUTHORED.slice(0, 6)

const hitAuthored = FORBIDDEN_AUTHORED.filter((re) => re.test(authored)).map(String)
const hitBundle = FORBIDDEN_ANYWHERE.filter((re) => re.test(js)).map(String)
const found = [...new Set([...hitAuthored, ...hitBundle])]
ok('no disclaimer / demo / simulation language', found.length === 0, found.join(', '))
ok(
  'authored copy scanned',
  authored.length > 5000,
  `${authored.length.toLocaleString()} chars across src/, index.html and shipped CSS`,
)

/* ── summary -------------------------------------------------------------- */
console.log(
  `\n${failures === 0 ? '✔ ALL CHECKS PASSED' : `✘ ${failures} CHECK(S) FAILED`} — ${
    REQUIRED_IMAGES.length
  } assets, ${bundles.length} bundles, ${SURFACES.length} interactive surfaces\n`,
)
process.exit(failures === 0 ? 0 : 1)
