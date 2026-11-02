<script setup lang="ts">
import { ref } from 'vue'
import { useClickOutside } from '../composables/useClickOutside'

defineProps<{ x: number; y: number }>()
const emit = defineEmits<{
  (e: 'color', c: string): void
  (e: 'bg', c: string): void
  (e: 'underline'): void
  (e: 'strike'): void
  (e: 'clear'): void
  (e: 'close'): void
}>()

const COLORS = ['#FFFFFF', '#FF6B6B', '#FFA94D', '#FFD43B', '#51CF66', '#4DABF7', '#9775FA', '#F783AC']

const popupRoot = ref<HTMLElement | null>(null)
useClickOutside(popupRoot, () => emit('close'))
</script>

<template>
  <Teleport to="body">
    <div
      ref="popupRoot"
      class="no-drag fixed z-50 flex w-max flex-col gap-1.5 rounded-2xl border border-white/10 bg-neutral-900/95 p-2 shadow-[var(--shadow-soft)] backdrop-blur-xl"
      :style="{ left: x + 'px', top: y + 'px' }"
      @mousedown.prevent
    >
      <div class="flex items-center gap-1">
        <span class="w-8 shrink-0 text-[10px] text-white/40">文字</span>
        <button
          v-for="c in COLORS"
          :key="'c' + c"
          class="h-4 w-4 shrink-0 rounded-full transition-transform hover:scale-110"
          :style="{ backgroundColor: c, boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none' }"
          @click="emit('color', c)"
        />
      </div>
      <div class="flex items-center gap-1">
        <span class="w-8 shrink-0 text-[10px] text-white/40">背景</span>
        <button
          v-for="c in COLORS"
          :key="'b' + c"
          class="h-4 w-4 shrink-0 rounded-full transition-transform hover:scale-110"
          :style="{ backgroundColor: c, boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none' }"
          @click="emit('bg', c)"
        />
      </div>
      <div class="flex items-center gap-1.5 border-t border-white/10 pt-1.5">
        <button
          class="flex-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] text-white/80 transition-colors hover:bg-white/15"
          @click="emit('underline')"
        >
          <span class="underline">下划线</span>
        </button>
        <button
          class="flex-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] text-white/80 transition-colors hover:bg-white/15"
          @click="emit('strike')"
        >
          <span class="line-through">划掉</span>
        </button>
      </div>
      <button
        class="rounded-lg py-1 text-[11px] text-white/45 transition-colors hover:bg-white/10 hover:text-white/75"
        @click="emit('clear')"
      >
        清除标注
      </button>
    </div>
  </Teleport>
</template>
