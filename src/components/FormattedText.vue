<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TextMark } from '../types/task'
import { computeSegments } from '../lib/textMarks'

const props = defineProps<{ text: string; marks: readonly TextMark[]; baseColor?: string }>()

const rootEl = ref<HTMLElement | null>(null)
const segments = computed(() => computeSegments(props.text, props.marks))

function segStyle(seg: ReturnType<typeof computeSegments>[number]) {
  const style: Record<string, string> = {}
  if (seg.strike) {
    // 划掉的文字统一变灰，忽略原本的文字颜色标注
    style.color = 'rgba(255,255,255,0.35)'
  } else if (seg.color) {
    style.color = seg.color
  }
  const decorations: string[] = []
  if (seg.underline) decorations.push('underline')
  if (seg.strike) decorations.push('line-through')
  if (decorations.length > 0) style.textDecoration = decorations.join(' ')
  if (seg.bg) {
    style.backgroundColor = seg.bg
    style.borderRadius = '3px'
    style.padding = '0 2px'
    style.margin = '0 -2px'
  }
  return style
}

defineExpose({ rootEl })
</script>

<template>
  <span ref="rootEl" class="select-text" :style="{ color: baseColor }">
    <span v-for="(seg, i) in segments" :key="i" :style="segStyle(seg)">{{ seg.text }}</span>
  </span>
</template>
