import Store from 'electron-store'
import { randomUUID } from 'node:crypto'
import type { Task, TaskInput, TaskPatch, TaskSection } from '../src/types/task'
import type { Tag } from '../src/types/tag'
import { BUILTIN_TAGS } from '../src/types/tag'

interface Settings {
  autoLaunch: boolean
  alwaysOnTop: boolean
  expanded: boolean
  expandedBounds: { width: number; height: number }
  collapsedBounds: { width: number; height: number }
  supabaseUserId: string | null
}

interface Schema {
  tasks: Task[]
  settings: Settings
  tags: Tag[]
}

const defaultSettings: Settings = {
  autoLaunch: true,
  alwaysOnTop: true,
  expanded: true,
  expandedBounds: { width: 380, height: 560 },
  collapsedBounds: { width: 220, height: 64 },
  supabaseUserId: null
}

const store = new Store<Schema>({
  name: 'schedule-data',
  defaults: {
    tasks: [],
    settings: defaultSettings,
    tags: BUILTIN_TAGS
  }
})

function now(): string {
  return new Date().toISOString()
}

/** 兼容旧版本数据：为缺失 section/order 字段的任务按创建时间先后补齐板块内顺序 */
function migrateLegacyTasks(): void {
  const tasks = store.get('tasks')
  let changed = false
  const counters: Record<TaskSection, number> = { schedule: 0, longterm: 0 }
  const sorted = [...tasks].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
  for (const t of sorted) {
    if (!t.section) {
      t.section = 'schedule'
      changed = true
    }
    if (typeof t.order !== 'number') {
      t.order = counters[t.section]
      changed = true
    }
    if (typeof t.tagId === 'undefined') {
      t.tagId = null
      changed = true
    }
    if (!Array.isArray(t.titleMarks)) {
      t.titleMarks = []
      changed = true
    }
    if (typeof t.parentId === 'undefined') {
      t.parentId = null
      changed = true
    }
    if (typeof t.bgColor === 'undefined') {
      t.bgColor = null
      changed = true
    }
    counters[t.section] = Math.max(counters[t.section], t.order + 1)
  }
  if (changed) store.set('tasks', tasks)
}
migrateLegacyTasks()

export function listTasks(): Task[] {
  return store.get('tasks').filter((t) => !t.deletedAt)
}

export function createTask(input: TaskInput): Task {
  const section = input.section ?? 'schedule'
  const parentId = input.parentId ?? null
  const tasks = store.get('tasks')
  // 顶级任务按板块计数；子行程按同 parentId 的兄弟任务计数
  const siblingCount = tasks.filter(
    (t) => !t.deletedAt && t.parentId === parentId && (parentId !== null || t.section === section)
  ).length
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    titleMarks: [],
    parentId,
    dueAt: input.dueAt,
    color: input.color,
    bgColor: null,
    section,
    order: siblingCount,
    tagId: input.tagId ?? null,
    completed: false,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    dirty: true,
    notifiedAt: null
  }
  tasks.push(task)
  store.set('tasks', tasks)
  return task
}

export function updateTask(id: string, patch: TaskPatch): Task | null {
  const tasks = store.get('tasks')
  const idx = tasks.findIndex((t) => t.id === id)
  if (idx === -1) return null
  tasks[idx] = { ...tasks[idx], ...patch, updatedAt: now(), dirty: true }
  store.set('tasks', tasks)
  return tasks[idx]
}

export function deleteTask(id: string): Task[] {
  const tasks = store.get('tasks')
  const affected: Task[] = []
  const toDelete = new Set<string>([id])

  // 级联收集子孙任务
  let added = true
  while (added) {
    added = false
    for (const t of tasks) {
      if (t.parentId && toDelete.has(t.parentId) && !toDelete.has(t.id)) {
        toDelete.add(t.id)
        added = true
      }
    }
  }

  for (const t of tasks) {
    if (toDelete.has(t.id) && !t.deletedAt) {
      t.deletedAt = now()
      t.updatedAt = now()
      t.dirty = true
      affected.push(t)
    }
  }

  if (affected.length > 0) store.set('tasks', tasks)
  return affected
}

export function listDeletedTasks(): Task[] {
  return store
    .get('tasks')
    .filter((t) => !!t.deletedAt)
    .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''))
}

export function purgeTask(id: string): void {
  const tasks = store.get('tasks')
  const idx = tasks.findIndex((t) => t.id === id)
  if (idx === -1) return
  tasks.splice(idx, 1)
  store.set('tasks', tasks)
}

/** 恢复已删除的任务；若其父任务也处于已删除状态则一并恢复，避免子行程恢复后因父级缺失而不可见 */
export function restoreTask(id: string): Task[] {
  const tasks = store.get('tasks')
  const target = tasks.find((t) => t.id === id)
  if (!target) return []

  const restoreIds = new Set<string>([id])
  let cursor = target
  while (cursor.parentId) {
    const parent = tasks.find((t) => t.id === cursor.parentId)
    if (!parent || !parent.deletedAt) break
    restoreIds.add(parent.id)
    cursor = parent
  }

  const affected: Task[] = []
  for (const t of tasks) {
    if (restoreIds.has(t.id) && t.deletedAt) {
      t.deletedAt = null
      t.updatedAt = now()
      t.dirty = true
      affected.push(t)
    }
  }

  if (affected.length > 0) store.set('tasks', tasks)
  return affected
}

/** 云同步使用：整表替换为服务端合并后的结果，并清除 dirty 标记 */
export function replaceAllTasks(tasks: Task[]): void {
  store.set('tasks', tasks)
}

export function getDirtyTasks(): Task[] {
  return store.get('tasks').filter((t) => t.dirty)
}

/** 返回已到期但尚未提醒、未完成、未删除的任务，并立刻标记为已提醒 */
export function pullDueTasksAndMarkNotified(nowIso: string): Task[] {
  const tasks = store.get('tasks')
  const due = tasks.filter(
    (t) => !t.deletedAt && !t.completed && !t.notifiedAt && t.dueAt && t.dueAt <= nowIso
  )
  for (const t of due) {
    t.notifiedAt = nowIso
  }
  if (due.length > 0) store.set('tasks', tasks)
  return due
}

export function clearDirty(ids: string[]): void {
  const tasks = store.get('tasks')
  const idSet = new Set(ids)
  for (const t of tasks) {
    if (idSet.has(t.id)) t.dirty = false
  }
  store.set('tasks', tasks)
}

/** 批量持久化拖拽排序结果：更新受影响任务的板块归属与板块内顺序 */
export function reorderTasks(updates: { id: string; section: TaskSection; order: number }[]): void {
  const tasks = store.get('tasks')
  const updateMap = new Map(updates.map((u) => [u.id, u]))
  for (const t of tasks) {
    const u = updateMap.get(t.id)
    if (!u) continue
    t.section = u.section
    t.order = u.order
    t.updatedAt = now()
    t.dirty = true
  }
  store.set('tasks', tasks)
}

export function getSettings(): Settings {
  return store.get('settings')
}

export function setSettings(patch: Partial<Settings>): Settings {
  const merged = { ...store.get('settings'), ...patch }
  store.set('settings', merged)
  return merged
}

export function listTags(): Tag[] {
  return store.get('tags')
}

export function createTag(input: { name: string; color: string }): Tag {
  const tags = store.get('tags')
  const tag: Tag = { id: randomUUID(), name: input.name, color: input.color }
  tags.push(tag)
  store.set('tags', tags)
  return tag
}

export function updateTag(id: string, patch: Partial<Pick<Tag, 'name' | 'color'>>): Tag | null {
  const tags = store.get('tags')
  const idx = tags.findIndex((t) => t.id === id)
  if (idx === -1) return null
  tags[idx] = { ...tags[idx], ...patch }
  store.set('tags', tags)
  return tags[idx]
}

/** 删除标签时，同步清除引用它的任务的 tagId ，避免残留无效引用 */
export function deleteTag(id: string): void {
  const tags = store.get('tags')
  const idx = tags.findIndex((t) => t.id === id)
  if (idx === -1) return
  tags.splice(idx, 1)
  store.set('tags', tags)

  const tasks = store.get('tasks')
  let changed = false
  for (const t of tasks) {
    if (t.tagId === id) {
      t.tagId = null
      t.updatedAt = now()
      t.dirty = true
      changed = true
    }
  }
  if (changed) store.set('tasks', tasks)
}

export type { Settings }
