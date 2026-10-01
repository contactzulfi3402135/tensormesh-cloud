# Deploying TENSOR MESH to Vercel

**Zero environment variables. Zero configuration required.** `vercel.json` is already committed —
Vercel will detect Vite, run `npm run build`, and serve `dist/`.

---

## Option A — Vercel CLI (fastest)

```bash
unzip tensormesh-cloud-vercel.zip -d tensormesh-cloud
cd tensormesh-cloud

npx vercel          # preview deployment → follow the prompts, accept the detected defaults
npx vercel --prod   # promote to your production domain
```

Accept every detected default: Framework `Vite`, Build Command `npm run build`, Output Directory `dist`,
Install Command `npm install`. Do **not** add environment variables.

## Option B — Git + Vercel dashboard

```bash
cd tensormesh-cloud
git init && git add -A && git commit -m "TENSOR MESH v3.8.4-PROD"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then in the Vercel dashboard: **Add New → Project → Import** your repository. The settings are read from
`vercel.json` — click **Deploy** without changing anything.

## Option C — Vercel dashboard drag & drop

Run `npm install && npm run build` locally first, then drag the resulting **`dist/`** folder onto the
Vercel dashboard's *Upload* drop zone.

> Note: dragging the *source* zip onto the dashboard does not build it. Vercel's upload flow serves
> static files as-is, so either upload `dist/` (Option C) or use the CLI / Git paths above (A/B), which
> run the real build.

---

## Deploy settings reference

| Setting | Value |
|---|---|
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Node version | **20** (pinned via `.nvmrc`; `engines` requires `>=20.0.0`) |
| Environment variables | **none** |

`vercel.json` additionally applies:

- **Immutable caching** — `Cache-Control: public, max-age=31536000, immutable` on `/assets/*`, which is
  correct because every filename is content-hashed by Vite.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`.
- **SPA fallback** — a catch-all rewrite to `/index.html`. Vercel evaluates the filesystem before
  rewrites, so `/assets/*` still resolves to the real hashed files.

---

## Environment variables

There are none, and none are needed. The application reads exactly one environment value, and it is
injected by Vite automatically:

```ts
// src/lib/format.ts
const base = import.meta.env.BASE_URL || '/'   // provided by Vite, not by you
```

`vite.config.ts` accepts one **optional** dev-server variable, `HMR_CLIENT_PORT`, used only when running
`npm run dev` behind a TLS-terminating proxy. It is `undefined` during a Vercel build and the build does
not consult it. Nothing needs to be set in the Vercel dashboard.

---

## Post-deploy verification

```bash
curl -sI https://<your-deployment>.vercel.app/ | head -8      # 200, security headers present
curl -sI https://<your-deployment>.vercel.app/assets/images/cluster-rack-h100.jpg  # 200, immutable
```

Then open the site and confirm:

1. Hero renders the Zurich compute hall and the five hotspots respond on hover.
2. **LAUNCH CLUSTER BUILDER** moves the GPU slider and updates TFLOPs / TB/s / $ run-rate live.
3. **PROVISION CLUSTER ALLOCATION** returns an allocation record with cluster ID, subnet and SSH string.
4. The terminal accepts `tensormesh nodes list`, `tensormesh bench --allreduce` and
   `tensormesh deploy --cluster cl-zurich-01 --image pytorch-2.4`.
5. The region selector switches campus across the hero, configurator, latency grid and CLI.

---

## Local parity check

Reproduce exactly what Vercel serves before you deploy:

```bash
npm install
npm run build
npx vite preview --port 4173    # serves dist/ from the domain root, as Vercel does
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Build fails on `tsc -b` | Node < 20 | Vercel → Settings → Node.js Version → **20.x**, or keep the included `.nvmrc` |
| Blank page after deploy | Assets fetched from a sub-path | Ensure `base: '/'` in `vite.config.ts` (already set) |
| 404 on a deep link | Rewrite missing | Confirm `vercel.json` is at the repository root and committed |
| Images 404 | `public/` not committed | `git check-ignore -v public/assets/images/cluster-rack-h100.jpg` should print nothing |

---

## Files in this package

```
vercel.json                 deploy config (framework, headers, rewrites)
package.json                dependencies + scripts + engines
package-lock.json           exact dependency tree — `npm ci` reproducible
.nvmrc                      Node 20
tsconfig.json               strict TypeScript
vite.config.ts              base '/', react plugin, dev/preview server
tailwind.config.js          design tokens (palette, type, motion)
postcss.config.js           tailwind + autoprefixer
index.html                  shell, meta, hero preload
src/                        application source (19 modules)
public/assets/images/       6 photography assets
scripts/                    standalone bundler + build verification
README.md                   architecture and verification notes
DEPLOY.md                   this file
```

Excluded from the package: `node_modules/`, `dist/`, and the working screenshot set — all regenerable
via `npm install`, `npm run build`, and a browser.
