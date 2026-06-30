// Shape of the auto-generated data (scripts/sync-projects.mjs → public/projects.json).
// Everything here is read from GitHub and is NOT user-editable.
export interface Project {
  repo: string // canonical key = GitHub repo name
  name: string // prettified display name
  description: string
  url: string
  homepage?: string
  pushedAt: string
  stars: number
  primaryLanguage: string | null
  tech: Record<string, string[]> // category -> technologies, e.g. { Frontend: ['React'] }
}

export interface ProjectsFile {
  generatedAt: string
  owner: string
  projects: Project[]
}

// The four manual dropdowns the user controls. Keys are stable; values are the
// option `value` strings defined in lib/dropdowns.ts (or undefined when unset).
export interface Override {
  github?: string
  linkedin?: string
  status?: string
  whatWhy?: string
}

export type Overrides = Record<string, Override>

export type DropdownKey = keyof Override
