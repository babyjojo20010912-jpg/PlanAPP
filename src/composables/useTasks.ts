import { reactive, readonly } from 'vue'
import type { Task, TaskInput, TaskPatch, TaskSection } from '../types/task'

const tasks = reactive<Task[]>([])
const deletedTasks = reactive<Task[]>([])
let loaded = false

function sortTasks() {
  tasks.sort((a, b) => {
    if (a.section !== b.section) return a.section === 'schedule' ? -1 : 1
    return a.order - b.order
  })
}

async function load() {
  const [list, deleted] = await Promise.all([window.api.tasks.list(), window.api.tasks.listDeleted()])
  tasks.splice(0, tasks.length, ...list)
  sortTasks()
  deletedTasks.splice(0, deletedTasks.length, ...deleted)
  loaded = true
}

export function useTasks() {
  if (!loaded) {
    void load()
  }

  async function add(input: TaskInput) {
    const task = await window.api.tasks.create(input)
    tasks.push(task)
    sortTasks()
    return task
  }

  async function edit(id: string, patch: TaskPatch) {
    const updated = await window.api.tasks.update(id, patch)
    if (!updated) return
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx !== -1) tasks[idx] = updated
    sortTasks()
  }

  async function toggleCompleted(id: string, completed: boolean) {
    await edit(id, { completed })
  }

  async function remove(id: string) {
    const affected = await window.api.tasks.remove(id)
    const affectedIds = new Set(affected.map((t) => t.id))
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (affectedIds.has(tasks[i].id)) tasks.splice(i, 1)
    }
    deletedTasks.unshift(...affected)
  }

  async function purge(id: string) {
    await window.api.tasks.purge(id)
    const idx = deletedTasks.findIndex((t) => t.id === id)
    if (idx !== -1) deletedTasks.splice(idx, 1)
  }

  async function restore(id: string) {
    const affected = await window.api.tasks.restore(id)
    if (affected.length === 0) return
    const affectedIds = new Set(affected.map((t) => t.id))
    for (let i = deletedTasks.length - 1; i >= 0; i--) {
      if (affectedIds.has(deletedTasks[i].id)) deletedTasks.splice(i, 1)
    }
    tasks.push(...affected)
    sortTasks()
  }

  /** 拖拽排序/跨板块移动：targetIndex 是目标板块内（不含被拖拽任务自身）的插入位置 */
  async function move(taskId: string, targetSection: TaskSection, targetIndex: number) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const sourceSection = task.section

    const sectionList = (section: TaskSection) =>
      tasks
        .filter((t) => t.section === section && !t.parentId && t.id !== taskId)
        .sort((a, b) => a.order - b.order)

    const sourceList = sourceSection === targetSection ? [] : sectionList(sourceSection)
    const targetList = sectionList(targetSection)
    const clampedIndex = Math.max(0, Math.min(targetIndex, targetList.length))
    targetList.splice(clampedIndex, 0, task)

    const updates: { id: string; section: TaskSection; order: number }[] = []
    sourceList.forEach((t, i) => updates.push({ id: t.id, section: sourceSection, order: i }))
    targetList.forEach((t, i) => updates.push({ id: t.id, section: targetSection, order: i }))

    for (const u of updates) {
      const idx = tasks.findIndex((t) => t.id === u.id)
      if (idx !== -1) tasks[idx] = { ...tasks[idx], section: u.section, order: u.order }
    }
    sortTasks()

    await window.api.tasks.reorder(updates)
  }

  return {
    tasks: readonly(tasks),
    deletedTasks: readonly(deletedTasks),
    reload: load,
    add,
    edit,
    toggleCompleted,
    remove,
    purge,
    restore,
    move
  }

}
