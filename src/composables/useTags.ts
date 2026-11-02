import { reactive, readonly } from 'vue'
import type { Tag } from '../types/tag'

const tags = reactive<Tag[]>([])
let loaded = false

async function load() {
  const list = await window.api.tags.list()
  tags.splice(0, tags.length, ...list)
  loaded = true
}

export function useTags() {
  if (!loaded) {
    void load()
  }

  async function add(name: string, color: string) {
    const tag = await window.api.tags.create({ name, color })
    tags.push(tag)
    return tag
  }

  async function edit(id: string, patch: Partial<Pick<Tag, 'name' | 'color'>>) {
    const updated = await window.api.tags.update(id, patch)
    if (!updated) return
    const idx = tags.findIndex((t) => t.id === id)
    if (idx !== -1) tags[idx] = updated
  }

  async function remove(id: string) {
    await window.api.tags.remove(id)
    const idx = tags.findIndex((t) => t.id === id)
    if (idx !== -1) tags.splice(idx, 1)
  }

  return {
    tags: readonly(tags),
    reload: load,
    add,
    edit,
    remove
  }
}
