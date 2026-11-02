<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../types/task'
import { useTags } from '../composables/useTags'
import { getContrastTextColor } from '../lib/color'

const props = defineProps<{ tasks: readonly Task[] }>()
const emit = defineEmits<{ (e: 'edit', task: Task): void }>()

const { tags } = useTags()
function tagFor(task: Task) {
  return tags.find((t) => t.id === task.tagId) ?? null
}

const hours = Array.from({ length: 24 }, (_, i) => i)
const currentHour = new Date().getHours()

const tasksByHour = computed(() => {
  const map = new Map<number, Task[]>()
  const today = new Date().toDateString()
  for (const task of props.tasks) {
    if (!task.dueAt) continue
    const d = new Date(task.dueAt)
    if (d.toDateString() !== today) continue
    const hour = d.getHours()
    if (!map.has(hour)) map.set(hour, [])
    map.get(hour)!.push(task)
  }
  return map
})
</script>

<template>
  <div class="flex-1 overflow-y-auto px-1">
    <div
      v-for="h in hours"
      :key="h"
      class="flex gap-2 border-b border-white/5 py-1.5"
      :class="{ 'bg-white/5 rounded-lg': h === currentHour }"
    >
      <span class="w-10 shrink-0 pt-0.5 text-[11px] text-white/40">{{ String(h).padStart(2, '0') }}:00</span>
      <div class="flex-1 space-y-1">
        <button
          v-for="t in tasksByHour.get(h) ?? []"
          :key="t.id"
          class="flex w-full items-center gap-1 truncate rounded-lg px-2 py-1 text-left text-[12px] text-white/90"
          :style="{ backgroundColor: t.color + '33', borderLeft: `3px solid ${t.color}` }"
          @click="emit('edit', t)"
        >
          <span
            v-if="tagFor(t)"
            class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none"
            :style="{ backgroundColor: tagFor(t)!.color, color: getContrastTextColor(tagFor(t)!.color) }"
          >
            {{ tagFor(t)!.name }}
          </span>
          <span class="min-w-0 truncate">{{ t.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
