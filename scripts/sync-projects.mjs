// Build-time GitHub sync. Lists the owner's public repos and derives, for each:
//   - name + description (repo description, falling back to the README intro)
//   - a categorized tech stack (languages + dependency manifests + README scan)
// Writes public/projects.json, which the dashboard reads. The four status
// dropdowns are NOT touched here — those live in public/overrides.json.
//
// Runs two ways:
//   • With GITHUB_TOKEN (GitHub Actions): full enrichment, ~5000 req/hr.
//   • Without a token (local): lighter pass; degrades gracefully if the
//     unauthenticated 60 req/hr limit is hit (writes what it has).
//
// Usage: node scripts/sync-projects.mjs   [--owner <login>] [--basic]

import fs from 'node:fs'
import path from 'node:path'
import { LANG_MAP, PKG_MAP, README_KEYWORDS, FILE_SIGNALS } from './tech-map.mjs'

const args = process.argv.slice(2)
const OWNER = argVal('--owner') || process.env.GH_OWNER || 'shiva-shivanibokka'
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const BASIC = args.includes('--basic') // skip all per-repo enrichment
const FULL = !!TOKEN && !BASIC // readme + manifests (call-heavy)

// Repos to never show (profile readme repo, the tracker repos themselves).
const IGNORE = new Set(['shiva-shivanibokka', 'build-log', 'dsa-dojo', 'mission-control'])

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'mission-control-sync',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
}

let rateLimited = false

function argVal(flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : undefined
}

async function gh(pathOrUrl) {
  if (rateLimited) return null
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `https://api.github.com${pathOrUrl}`
  let res
  try {
    res = await fetch(url, { headers })
  } catch (e) {
    console.warn(`  ! network error ${url}: ${e.message}`)
    return null
  }
  if (res.status === 404) return null
  if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
    rateLimited = true
    console.warn('  ⚠ GitHub rate limit reached — writing partial data. Set GITHUB_TOKEN for a full sync.')
    return null
  }
  if (!res.ok) {
    console.warn(`  ! ${url} -> ${res.status}`)
    return null
  }
  return res.json()
}

async function listRepos() {
  const all = []
  for (let page = 1; page <= 10; page++) {
    const batch = await gh(`/users/${OWNER}/repos?per_page=100&page=${page}&sort=pushed`)
    if (!batch || batch.length === 0) break
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}

function pretty(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (/^[A-Z0-9.]+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

function readmeIntro(md) {
  const lines = md.split('\n')
  // Skip a leading YAML frontmatter block (--- ... ---) so its keys don't leak.
  let startedFront = false
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim()
    if (i === 0 && l === '---') startedFront = true
    else if (startedFront && l === '---') {
      lines.splice(0, i + 1)
      break
    } else if (!startedFront) break
  }
  for (let line of lines) {
    line = line.trim()
    if (!line || line.startsWith('#') || line.startsWith('<') || line.startsWith('![') || line.startsWith('[!')) continue
    // skip leftover frontmatter-style "key: value" lines
    if (/^[a-z][\w -]{0,24}:\s/i.test(line) && !/\s\w+\s/.test(line.split(':')[1] || '')) continue
    line = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`>#]/g, '')
      .trim()
    if (line.length > 20) return line.slice(0, 220)
  }
  return ''
}

// --- tech accumulation -------------------------------------------------------
function makeTech() {
  const map = new Map() // category -> Set<displayName>
  const add = (entry) => {
    if (!entry) return
    const [name, cat] = entry
    if (!map.has(cat)) map.set(cat, new Set())
    map.get(cat).add(name)
  }
  const out = () => {
    const o = {}
    for (const [cat, set] of map) o[cat] = [...set].slice(0, 10)
    return o
  }
  return { add, out }
}

function normPkg(raw) {
  // "psycopg2-binary[extra]>=2.9 ; python_version" -> "psycopg2-binary"
  return raw
    .split(/[<>=!~;\[ ]/)[0]
    .trim()
    .toLowerCase()
}

function parsePackageJson(text, tech) {
  try {
    const pkg = JSON.parse(text)
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
    for (const dep of Object.keys(deps)) tech.add(PKG_MAP[dep.toLowerCase()])
  } catch {
    /* ignore malformed */
  }
}

function parseRequirements(text, tech) {
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue
    tech.add(PKG_MAP[normPkg(trimmed)])
  }
}

function scanKeywords(text, tech) {
  const lc = text.toLowerCase()
  for (const [kw, entry] of Object.entries(README_KEYWORDS)) {
    // whole-token match so "rag" doesn't fire on "fragment", "aws" on "flaws", etc.
    const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`(?:^|[^a-z0-9])${esc}(?:[^a-z0-9]|$)`).test(lc)) tech.add(entry)
  }
}

async function enrich(repo, project, tech) {
  // languages (cheap, attempted even without a token)
  const langs = await gh(`/repos/${OWNER}/${repo.name}/languages`)
  if (langs) {
    for (const lang of Object.keys(langs)) {
      tech.add(LANG_MAP[lang] || [lang, 'Language'])
    }
  } else if (repo.language) {
    tech.add(LANG_MAP[repo.language] || [repo.language, 'Language'])
  }

  if (!FULL) return

  // README: description fallback + keyword scan
  const readme = await gh(`/repos/${OWNER}/${repo.name}/readme`)
  if (readme?.content) {
    const md = Buffer.from(readme.content, 'base64').toString('utf8')
    if (!project.description) project.description = readmeIntro(md)
    scanKeywords(md, tech)
  }

  // root file listing: file signals + which manifests to fetch
  const root = await gh(`/repos/${OWNER}/${repo.name}/contents`)
  if (Array.isArray(root)) {
    const names = root.filter((f) => f.type === 'file').map((f) => f.name.toLowerCase())
    for (const n of names) if (FILE_SIGNALS[n]) tech.add(FILE_SIGNALS[n])

    const manifests = ['package.json', 'requirements.txt', 'pyproject.toml', 'environment.yml', 'pipfile', 'setup.py']
    for (const m of manifests) {
      if (!names.includes(m)) continue
      const file = await gh(`/repos/${OWNER}/${repo.name}/contents/${m}`)
      if (!file?.content) continue
      const text = Buffer.from(file.content, 'base64').toString('utf8')
      if (m === 'package.json') parsePackageJson(text, tech)
      else if (m === 'requirements.txt') parseRequirements(text, tech)
      else scanKeywords(text, tech) // pyproject / env.yml / pipfile / setup.py
    }
  }
}

async function main() {
  console.log(`Syncing repos for @${OWNER} (mode: ${FULL ? 'full' : BASIC ? 'basic' : 'light'}${TOKEN ? ', authenticated' : ', unauthenticated'})`)
  const repos = (await listRepos()).filter(
    (r) => !r.fork && !r.archived && !r.private && !IGNORE.has(r.name),
  )
  console.log(`Found ${repos.length} repos to track.`)

  const projects = []
  for (const repo of repos) {
    const project = {
      repo: repo.name,
      name: pretty(repo.name),
      description: repo.description || '',
      url: repo.html_url,
      homepage: repo.homepage || undefined,
      pushedAt: repo.pushed_at,
      stars: repo.stargazers_count || 0,
      primaryLanguage: repo.language || null,
      tech: {},
    }
    if (!BASIC) {
      const tech = makeTech()
      await enrich(repo, project, tech)
      project.tech = tech.out()
    }
    projects.push(project)
    process.stdout.write('.')
  }
  process.stdout.write('\n')

  projects.sort((a, b) => (b.pushedAt || '').localeCompare(a.pushedAt || ''))

  const outDir = path.join(process.cwd(), 'public')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'projects.json')
  const payload = {
    generatedAt: new Date().toISOString(),
    owner: OWNER,
    projects,
  }
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n')
  console.log(`Wrote ${projects.length} projects -> public/projects.json`)
  if (rateLimited) console.log('Note: data is partial due to rate limiting.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
