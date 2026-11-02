import { ref } from 'vue'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { Task, TaskSection, TextMark } from '../types/task'

interface RemoteTaskRow {
  id: string
  user_id: string
  title: string
  due_at: string | null
  color: string
  bg_color: string | null
  section: TaskSection
  /** 数据库列名避开 order 保留字 */
  sort_order: number
  completed: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  tag_id: string | null
  /** 标题文字标注，序列化为 JSON 字符串存储 */
  title_marks: string | null
  parent_id: string | null
}

export const userEmail = ref<string | null>(null)
export const syncing = ref(false)
export const syncError = ref<string | null>(null)

function toRemoteRow(task: Task, userId: string): RemoteTaskRow {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    due_at: task.dueAt,
    color: task.color,
    bg_color: task.bgColor,
    section: task.section,
    sort_order: task.order,
    completed: task.completed,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted_at: task.deletedAt,
    tag_id: task.tagId,
    title_marks: JSON.stringify(task.titleMarks ?? []),
    parent_id: task.parentId
  }
}

function toLocalTask(row: RemoteTaskRow, existing?: Task): Task {
  return {
    id: row.id,
    title: row.title,
    dueAt: row.due_at,
    color: row.color,
    bgColor: row.bg_color ?? null,
    section: row.section ?? 'schedule',
    order: row.sort_order ?? 0,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    dirty: false,
    notifiedAt: existing?.notifiedAt ?? null,
    tagId: row.tag_id ?? null,
    titleMarks: parseTitleMarks(row.title_marks),
    parentId: row.parent_id ?? null
  }
}

function parseTitleMarks(raw: string | null): TextMark[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function initAuth() {
  if (!supabaseConfigured) return
  const { data } = await supabase.auth.getSession()
  userEmail.value = data.session?.user.email ?? null
  supabase.auth.onAuthStateChange((_event, session) => {
    userEmail.value = session?.user.email ?? null
  })
}

export async function signInWithMagicLink(email: string) {
  if (!supabaseConfigured) throw new Error('尚未配置 Supabase，请先在 .env 中填写 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

/** 将本地未同步的改动推送到云端，并拉取云端全量数据与本地合并（以 updatedAt 较新者为准） */
export async function syncNow() {
  if (!supabaseConfigured || syncing.value) return
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return

  syncing.value = true
  syncError.value = null
  try {
    const dirty = await window.api.tasks.getDirty()
    if (dirty.length > 0) {
      const rows = dirty.map((t) => toRemoteRow(t, userId))
      const { error } = await supabase.from('tasks').upsert(rows)
      if (error) throw error
      await window.api.tasks.clearDirty(dirty.map((t) => t.id))
    }

    const { data: remoteRows, error: pullError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
    if (pullError) throw pullError

    const localTasks = await window.api.tasks.list()
    const localById = new Map(localTasks.map((t) => [t.id, t]))
    const merged = new Map<string, Task>(localTasks.map((t) => [t.id, t]))

    for (const row of (remoteRows ?? []) as RemoteTaskRow[]) {
      const local = localById.get(row.id)
      if (!local || new Date(row.updated_at) > new Date(local.updatedAt)) {
        merged.set(row.id, toLocalTask(row, local))
      }
    }

    await window.api.tasks.replaceAll(Array.from(merged.values()))
  } catch (err) {
    syncError.value = err instanceof Error ? err.message : String(err)
  } finally {
    syncing.value = false
  }
}

export function subscribeRealtime(onRemoteChange: () => void) {
  if (!supabaseConfigured) return () => {}
  const channel = supabase
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      onRemoteChange()
    })
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
