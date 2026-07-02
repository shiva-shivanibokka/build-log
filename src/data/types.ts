// Shape of the auto-generated data (scripts/sync-projects.mjs → public/projects.json).
// Everything here is read from GitHub and is NOT user-editable.
export interface Project {
  repo: string // canonical key = GitHub repo name
  name: string // prettified display name
  description: string
  url: string
  pushedAt: string
  stars: number
  tech: Record<string, string[]> // category -> technologies, e.g. { Frontend: ['React'] }
}

export interface ProjectsFile {
  generatedAt: string
  projects: Project[]
}

// The manual fields the user controls. The first four are dropdowns whose values
// are the option `value` strings defined in lib/dropdowns.ts; `notes` is free
// text. All are optional (undefined when unset).
export interface Override {
  github?: string
  linkedin?: string
  status?: string
  whatWhy?: string
  notes?: string
}

export type Overrides = Record<string, Override>

export type DropdownKey = keyof Override
