<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TextMark, TextMarkType } from '../types/task'
import { DEFAULT_TASK_COLOR } from '../types/task'
import { useTags } from '../composables/useTags'
import { getContrastTextColor, hexToRgba } from '../lib/color'
import { getSelectionOffsets, applyMark, clearMarks } from '../lib/textMarks'
import FormattedText from './FormattedText.vue'
import TextFormatPopup from './TextFormatPopup.vue'
import TaskColorMenu from './TaskColorMenu.vue'

const props = withDefaults(
  defineProps<{ task: Task; isSubtask?: boolean; hasChildren?: boolean; childrenExpanded?: boolean }>(),
  { isSubtask: false, hasChildren: false, childrenExpanded: false }
)

const emit = defineEmits<{
  (e: 'toggle', id: string, completed: boolean): void
  (e: 'edit', task: Task): void
  (e: 'remove', id: string): void
  (e: 'formatTitle', id: string, marks: TextMark[]): void
  (e: 'addSubtask', task: Task): void
  (e: 'toggleExpand', id: string): void
  (e: 'setColor', id: string, color: string): void
  (e: 'setBgColor', id: string, color: string | null): void
}>()

const { tags } = useTags()
const tag = computed(() => tags.find((t) => t.id === props.task.tagId) ?? null)
const baseColor = computed(() => (props.task.color !== DEFAULT_TASK_COLOR ? props.task.color : undefined))
const rowBgStyle = computed(() => (props.task.bgColor ? hexToRgba(props.task.bgColor, 0.22) : undefined))

const dragging = ref(false)
const titleText = ref<InstanceType<typeof FormattedText> | null>(null)
const activeSelection = ref<{ start: number; end: number } | null>(null)
const popupPos = ref({ x: 0, y: 0 })
const colorMenuPos = ref<{ x: number; y: number } | null>(null)
let suppressNextClick = false

function onDragStart(e: DragEvent) {
  e.dataTransfer?.setData('text/plain', props.task.id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  dragging.value = true
}

function onDragEnd() {
  dragging.value = false
}

function onTitleMouseUp() {
  const root = titleText.value?.rootEl
  if (!root) return
  const offsets = getSelectionOffsets(root)
  if (!offsets) {
    activeSelection.value = null
    return
  }
  const range = window.getSelection()?.getRangeAt(0)
  const rect = range?.getBoundingClientRect()
  if (rect) {
    const popupWidth = 190
    const popupHeight = 140
    popupPos.value = {
      x: Math.min(Math.max(8, rect.left), window.innerWidth - popupWidth - 8),
      y: Math.min(rect.bottom + 6, window.innerHeight - popupHeight - 8)
    }
  }
  activeSelection.value = offsets
  suppressNextClick = true
}

function onTitleClick() {
  if (suppressNextClick) {
    suppressNextClick = false
    return
  }
  emit('edit', props.task)
}

function closeSelectionPopup() {
  activeSelection.value = null
  window.getSelection()?.removeAllRanges()
}

function applyToSelection(type: TextMarkType, value?: string) {
  const sel = activeSelection.value
  if (!sel) return
  const next = applyMark(props.task.titleMarks ?? [], sel.start, sel.end, type, value)
  emit('formatTitle', props.task.id, next)
  closeSelectionPopup()
}

function clearSelectionMarks() {
  const sel = activeSelection.value
  if (!sel) return
  const next = clearMarks(props.task.titleMarks ?? [], sel.start, sel.end)
  emit('formatTitle', props.task.id, next)
  closeSelectionPopup()
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  const menuWidth = 220
  const menuHeight = 150
  colorMenuPos.value = {
    x: Math.min(e.clientX, window.innerWidth - menuWidth - 8),
    y: Math.min(e.clientY, window.innerHeight - menuHeight - 8)
  }
}

function pickWholeColor(c: string) {
  emit('setColor', props.task.id, c)
  colorMenuPos.value = null
}

function clearWholeColor() {
  emit('setColor', props.task.id, DEFAULT_TASK_COLOR)
  colorMenuPos.value = null
}

function pickWholeBg(c: string) {
  emit('setBgColor', props.task.id, c)
  colorMenuPos.value = null
}

function clearWholeBg() {
  emit('setBgColor', props.task.id, null)
  colorMenuPos.value = null
}

function formatDue(dueAt: string | null) {
  if (!dueAt) return ''
  const d = new Date(dueAt)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return time
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`
}
</script>

<template>
  <div
    class="group flex items-start gap-1.5 rounded-2xl px-1.5 py-2.5 transition-colors"
    :class="{ 'opacity-50': props.task.completed, 'opacity-30': dragging, 'ml-5': props.isSubtask, 'hover:bg-white/10': !props.task.bgColor }"
    :style="{ backgroundColor: rowBgStyle }"
    @contextmenu="onContextMenu"
  >
    <div
      v-if="!props.isSubtask"
      class="drag-handle mt-0.5 shrink-0 cursor-grab touch-none p-1 text-white/25 transition-colors hover:text-white/60 active:cursor-grabbing"
      draggable="true"
      title="按住拖动可排序或移动到另一板块"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
    >
      <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M3 6h10M3 10h10" stroke-linecap="round" />
      </svg>
    </div>

    <button
      class="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors"
      :style="{ borderColor: props.task.color, backgroundColor: props.task.completed ? props.task.color : 'transparent' }"
      @click="emit('toggle', props.task.id, !props.task.completed)"
    />

    <div class="min-w-0 flex-1 cursor-pointer" @click="onTitleClick">
      <p class="flex items-center gap-1 text-[13px] text-white/90" :class="{ 'line-through': props.task.completed }">
        <span
          v-if="tag"
          class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none"
          :style="{ backgroundColor: tag.color, color: getContrastTextColor(tag.color) }"
        >
          {{ tag.name }}
        </span>
        <span class="min-w-0 truncate" @mouseup.stop="onTitleMouseUp">
          <FormattedText ref="titleText" :text="props.task.title" :marks="props.task.titleMarks ?? []" :base-color="baseColor" />
        </span>
      </p>
      <p v-if="props.task.dueAt" class="mt-0.5 text-[11px] text-white/45">
        {{ formatDue(props.task.dueAt) }}
      </p>
    </div>

    <TextFormatPopup
      v-if="activeSelection"
      :x="popupPos.x"
      :y="popupPos.y"
      @color="(c) => applyToSelection('color', c)"
      @bg="(c) => applyToSelection('bg', c)"
      @underline="applyToSelection('underline')"
      @strike="applyToSelection('strike')"
      @clear="clearSelectionMarks"
      @close="closeSelectionPopup"
    />

    <TaskColorMenu
      v-if="colorMenuPos"
      :x="colorMenuPos.x"
      :y="colorMenuPos.y"
      @pick="pickWholeColor"
      @clear="clearWholeColor"
      @pick-bg="pickWholeBg"
      @clear-bg="clearWholeBg"
      @close="colorMenuPos = null"
    />

    <button
      v-if="!props.isSubtask && props.hasChildren"
      class="mt-0.5 shrink-0 rounded-full p-1 text-white/25 transition-colors hover:bg-white/15 hover:text-white/70"
      :title="props.childrenExpanded ? '收起子行程' : '展开子行程'"
      @click="emit('toggleExpand', props.task.id)"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-3.5 w-3.5 transition-transform"
        :class="{ 'rotate-90': props.childrenExpanded }"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <button
      v-if="!props.isSubtask"
      class="mt-0.5 shrink-0 rounded-full p-1 text-white/0 transition-colors hover:bg-white/15 hover:text-white/70 group-hover:text-white/40"
      title="添加子行程"
      @click="emit('addSubtask', props.task)"
    >
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <button
      class="shrink-0 rounded-full p-1 text-white/0 transition-colors hover:bg-white/15 hover:text-white/70 group-hover:text-white/40"
      title="删除"
      @click="emit('remove', props.task.id)"
    >
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>
