# Build Log 🚀

A personal dashboard that tracks my projects. Every project's **name, description, and
tech stack are pulled automatically from GitHub** — I only set four dropdowns
(GitHub posted? · LinkedIn posted? · Status · What & Why). Create a new repo and it
shows up here on the next sync; nothing is typed in by hand.

> Light, colorful board. Color legend: 🟢 Done / Yes · 🔴 No / Yet to start ·
> 🟡 Pending · 🟣 In-progress.

> LeetCode practice lives in a separate repo (**DSA Dojo**), not here.

## How it works

```
GitHub repos ──(sync script, build time)──▶ public/projects.json ──▶ dashboard
                                                                       ▲
                          your dropdown choices (localStorage) ────────┘
                          exported to public/overrides.json to persist
```

- **Auto half** — `scripts/sync-projects.mjs` runs in GitHub Actions on every deploy,
  weekly, and on demand. It lists my public repos and, for each, derives the
  description (repo description → README intro fallback) and a categorized tech
  stack (GitHub languages + `package.json` / `requirements.txt` / etc. + a README
  keyword scan). Output: `public/projects.json`.
- **Manual half** — the four dropdowns. Changing one saves instantly in the
  browser (localStorage). Click **Export** to download `overrides.json`; commit it
  to make choices permanent and visible on other devices. (`public/overrides.json`
  is the committed baseline; the browser layers unsaved edits on top.)

## Tech detection

Mappings live in `scripts/tech-map.mjs`:

| Source | Used for |
| --- | --- |
| GitHub **languages** API | base languages + Frontend/Data buckets |
| **dependency manifests** | `package.json`, `requirements.txt`, `pyproject.toml`, … → exact tech |
| **README keyword scan** | catches tech mentioned but not in a manifest |
| **file signals** | `Dockerfile`, `docker-compose.yml`, `go.mod`, … |

Add a tech by editing the maps — no app code changes needed.

## Run locally

```bash
npm install
npm run sync     # generate public/projects.json from GitHub (set GITHUB_TOKEN for a full pass)
npm run dev      # open the dashboard
```

Without a token the sync uses the unauthenticated GitHub API (60 req/hr) and writes a
lighter dataset; Actions uses the repo token for the full pass. To run a full sync
locally, export a token first:

```bash
GITHUB_TOKEN=ghp_xxx npm run sync
```

## Deploy

Push to `main`. The `Build & Deploy` workflow runs the sync, builds, and publishes to
GitHub Pages at `https://shiva-shivanibokka.github.io/build-log/`. Use the
**Run workflow** button on the Actions tab to force a re-sync when you just pushed a
new repo and want it to appear immediately.

## Structure

```
scripts/
  sync-projects.mjs   # GitHub → public/projects.json
  tech-map.mjs        # detection dictionaries
public/
  projects.json       # generated (auto data)
  overrides.json      # committed dropdown baseline (manual data)
src/
  App.tsx             # layout + export bar
  components/         # ProjectsView, ProjectCard, Pill, TechStack
  lib/store.ts        # load + merge + localStorage + export
  lib/dropdowns.ts    # dropdown definitions + colors
```
