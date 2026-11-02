import { reactive, onMounted } from 'vue'
import type { Settings } from '../types/api'

const state = reactive<Settings>({
  autoLaunch: true,
  alwaysOnTop: true,
  expanded: true,
  expandedBounds: { width: 380, height: 560 },
  collapsedBounds: { width: 220, height: 64 },
  supabaseUserId: null
})

let initialized = false

export function useSettings() {
  onMounted(async () => {
    if (initialized) return
    initialized = true
    const current = await window.api.settings.get()
    Object.assign(state, current)
  })

  async function update(patch: Partial<Settings>) {
    const merged = await window.api.settings.set(patch)
    Object.assign(state, merged)
  }

  return { settings: state, update }
}
