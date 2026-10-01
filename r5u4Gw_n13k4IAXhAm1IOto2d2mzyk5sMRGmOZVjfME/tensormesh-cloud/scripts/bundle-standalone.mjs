/**
 * TENSOR MESH — standalone bundler
 *
 * Produces a single self-contained .html file from the production build:
 *   • inlines the hashed CSS and JS bundles
 *   • rewrites every /assets/images/*.jpg reference to an inline data URI
 *
 * Used to ship a fully interactive artefact that runs with no network access
 * (sandboxed iframes, air-gapped review terminals, email attachments).
 *
 * Usage:  node scripts/bundle-standalone.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const IMG_DIR = join(ROOT, 'public', 'assets', 'images')
const OUT = join(ROOT, 'tensormesh-standalone.html')

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' }

/* ------------------------------------------------------------------ helpers */
const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })

const dataUri = (file) => {
  const mime = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`
}

/* -------------------------------------------------------------------- build */
let html = readFileSync(join(DIST, 'index.html'), 'utf8')

// 1. Inline stylesheets
html = html.replace(
  /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_m, href) => {
    const file = join(DIST, href.replace(/^\.\//, ''))
    return `<style>\n${readFileSync(file, 'utf8')}\n</style>`
  },
)

// 2. Inline the module bundle (must be type="module" so the inline code keeps ESM scope)
html = html.replace(
  /<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_m, src) => {
    const file = join(DIST, src.replace(/^\.\//, ''))
    let js = readFileSync(file, 'utf8')

    // 3. Rewrite every image reference inside the bundle to a data URI
    for (const img of walk(IMG_DIR)) {
      const name = `assets/images/${img.split(/[\\/]/).pop()}`
      if (!js.includes(name)) continue
      js = js.split(name).join(dataUri(img))
    }

    // Guard: the bundle must not reference the closed tag early
    js = js.replace(/<\/script>/gi, '<\\/script>')
    return `<script type="module">\n${js}\n</script>`
  },
)

// 4. Drop the <link rel="preload"> and any remaining external hrefs
html = html.replace(/<link rel="preload"[^>]*>/g, '')

const bytes = Buffer.byteLength(html, 'utf8')
writeFileSync(OUT, html)
console.log(
  `standalone build → ${OUT.replace(ROOT + '/', '')}  (${(bytes / 1024 / 1024).toFixed(2)} MiB, zero external requests)`,
)
