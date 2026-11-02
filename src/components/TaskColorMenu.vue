<script setup lang="ts">
import { ref } from 'vue'
import { TASK_COLORS } from '../types/task'
import { useClickOutside } from '../composables/useClickOutside'

defineProps<{ x: number; y: number }>()
const emit = defineEmits<{
  (e: 'pick', c: string): void
  (e: 'clear'): void
  (e: 'pickBg', c: string): void
  (e: 'clearBg'): void
  (e: 'close'): void
}>()

const menuRoot = ref<HTMLElement | null>(null)
useClickOutside(menuRoot, () => emit('close'))
</script>

<template>
  <Teleport to="body">
    <div
      ref="menuRoot"
      class="no-drag fixed z-50 flex w-max flex-col gap-1.5 rounded-2xl border border-white/10 bg-neutral-900/95 p-2 shadow-[var(--shadow-soft)] backdrop-blur-xl"
      :style="{ left: x + 'px', top: y + 'px' }"
    >
      <div class="flex items-center gap-1 px-0.5">
        <span class="w-10 shrink-0 text-[10px] text-white/40">文字色</span>
        <button
          v-for="c in TASK_COLORS"
          :key="'t' + c"
          class="h-4 w-4 shrink-0 rounded-full transition-transform hover:scale-110"
          :style="{ backgroundColor: c, boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none' }"
          @click="emit('pick', c)"
        />
      </div>
      <div class="flex items-center gap-1 px-0.5">
        <span class="w-10 shrink-0 text-[10px] text-white/40">填充色</span>
        <button
          v-for="c in TASK_COLORS"
          :key="'b' + c"
          class="h-4 w-4 shrink-0 rounded-full transition-transform hover:scale-110"
          :style="{ backgroundColor: c, boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none' }"
          @click="emit('pickBg', c)"
        />
      </div>
      <div class="flex items-center gap-1.5 border-t border-white/10 pt-1.5">
        <button
          class="flex-1 rounded-lg py-1 text-[11px] text-white/45 transition-colors hover:bg-white/10 hover:text-white/75"
          @click="emit('clear')"
        >
          默认文字色
        </button>
        <button
          class="flex-1 rounded-lg py-1 text-[11px] text-white/45 transition-colors hover:bg-white/10 hover:text-white/75"
          @click="emit('clearBg')"
        >
          清除填充色
        </button>
      </div>
    </div>
  </Teleport>
</template>
