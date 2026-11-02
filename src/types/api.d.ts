import type { Task, TaskInput, TaskPatch, TaskSection } from './task'
import type { Tag } from './tag'

export interface Settings {
  autoLaunch: boolean
  alwaysOnTop: boolean
  expanded: boolean
  expandedBounds: { width: number; height: number }
  collapsedBounds: { width: number; height: number }
  supabaseUserId: string | null
}

export interface ExposedApi {
  tasks: {
    list: () => Promise<Task[]>
    create: (input: TaskInput) => Promise<Task>
    update: (id: string, patch: TaskPatch) => Promise<Task | null>
    remove: (id: string) => Promise<Task[]>
    listDeleted: () => Promise<Task[]>
    purge: (id: string) => Promise<void>
    restore: (id: string) => Promise<Task[]>
    getDirty: () => Promise<Task[]>
    clearDirty: (ids: string[]) => Promise<void>
    replaceAll: (tasks: Task[]) => Promise<void>
    reorder: (updates: { id: string; section: TaskSection; order: number }[]) => Promise<void>
    onDue: (callback: (tasks: Task[]) => void) => () => void
  }
  tags: {
    list: () => Promise<Tag[]>
    create: (input: { name: string; color: string }) => Promise<Tag>
    update: (id: string, patch: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<Tag | null>
    remove: (id: string) => Promise<void>
  }
  settings: {
    get: () => Promise<Settings>
    set: (patch: Partial<Settings>) => Promise<Settings>
  }
  window: {
    toggleCollapse: (expanded: boolean) => Promise<void>
    setIgnoreMouseEvents: (ignore: boolean, forward: boolean) => Promise<void>
    hide: () => Promise<void>
    quit: () => Promise<void>
  }
}

declare global {
  interface Window {
    api: ExposedApi
  }
}
