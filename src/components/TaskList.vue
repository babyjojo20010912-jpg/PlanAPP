<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Task, TaskSection, TextMark } from '../types/task'
import TaskItem from './TaskItem.vue'

const props = defineProps<{ tasks: readonly Task[]; deletedTasks?: readonly Task[] }>()
const emit = defineEmits<{
  (e: 'toggle', id: string, completed: boolean): void
  (e: 'edit', task: Task): void
  (e: 'remove', id: string): void
  (e: 'add', section: TaskSection): void
  (e: 'move', taskId: string, section: TaskSection, index: number): void
  (e: 'formatTitle', id: string, marks: TextMark[]): void
  (e: 'addSubtask', task: Task): void
  (e: 'setColor', id: string, color: string): void
  (e: 'setBgColor', id: string, color: string | null): void
  (e: 'purge', id: string): void
  (e: 'restore', id: string): void
}>()

const topLevelTasks = computed(() => props.tasks.filter((t) => !t.parentId))
const scheduleTasks = computed(() =>
  topLevelTasks.value.filter((t) => t.section !== 'longterm').slice().sort((a, b) => a.order - b.order)
)
const longtermTasks = computed(() =>
  topLevelTasks.value.filter((t) => t.section === 'longterm').slice().sort((a, b) => a.order - b.order)
)

function childrenOf(parentId: string) {
  return props.tasks.filter((t) => t.parentId === parentId).sort((a, b) => a.order - b.order)
}

const expandedIds = reactive(new Set<string>())
function toggleExpand(id: string) {
  if (expandedIds.has(id)) expandedIds.delete(id)
  else expandedIds.add(id)
}

const dropTarget = ref<{ section: TaskSection; index: number } | null>(null)

function onDragOverRow(e: DragEvent, section: TaskSection, index: number) {
  e.preventDefault()
  const rowEl = e.currentTarget as HTMLElement
  const rect = rowEl.getBoundingClientRect()
  const insertBefore = e.clientY < rect.top + rect.height / 2
  dropTarget.value = { section, index: insertBefore ? index : index + 1 }
}

function onDragOverSectionEnd(e: DragEvent, section: TaskSection, index: number) {
  e.preventDefault()
  dropTarget.value = { section, index }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const id = e.dataTransfer?.getData('text/plain')
  const target = dropTarget.value
  dropTarget.value = null
  if (!id || !target) return
  emit('move', id, target.section, target.index)
}

function onDragLeaveRoot() {
  dropTarget.value = null
}

function formatDeletedAt(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 单击恢复、双击彻底删除：单击先延迟触发，若短时间内第二次点击到来则取消单击并改为彻底删除 */
const clickTimers = new Map<string, ReturnType<typeof setTimeout>>()

function onDeletedClick(id: string) {
  if (clickTimers.has(id)) return
  const timer = setTimeout(() => {
    clickTimers.delete(id)
    emit('restore', id)
  }, 220)
  clickTimers.set(id, timer)
}

function onDeletedDblClick(id: string) {
  const timer = clickTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    clickTimers.delete(id)
  }
  emit('purge', id)
}
</script>

<template>
  <div class="flex-1 overflow-y-auto pb-2" @dragleave.self="onDragLeaveRoot" @drop="onDrop">
    <section>
      <div class="flex items-center justify-between px-2 pb-1 pt-1">
        <span class="text-[13px] font-semibold tracking-wide text-white/50">日程计划</span>
        <button class="section-add-btn" title="新建日程任务" @click="emit('add', 'schedule')">
          <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <p v-if="scheduleTasks.length === 0" class="px-2 pb-2 text-[12px] text-white/35">暂无日程任务</p>
      <div v-for="(t, idx) in scheduleTasks" :key="t.id" @dragover="onDragOverRow($event, 'schedule', idx)">
        <div
          class="drop-indicator"
          :class="{ 'drop-indicator-active': dropTarget?.section === 'schedule' && dropTarget.index === idx }"
        />
        <TaskItem
          :task="t"
          :has-children="childrenOf(t.id).length > 0"
          :children-expanded="expandedIds.has(t.id)"
          @toggle="(id, c) => emit('toggle', id, c)"
          @edit="(task) => emit('edit', task)"
          @remove="(id) => emit('remove', id)"
          @format-title="(id, marks) => emit('formatTitle', id, marks)"
          @add-subtask="(task) => emit('addSubtask', task)"
          @toggle-expand="toggleExpand"
          @set-color="(id, color) => emit('setColor', id, color)"
          @set-bg-color="(id, color) => emit('setBgColor', id, color)"
        />
        <div v-if="expandedIds.has(t.id)" class="space-y-0.5 pb-0.5">
          <TaskItem
            v-for="child in childrenOf(t.id)"
            :key="child.id"
            :task="child"
            is-subtask
            @toggle="(id, c) => emit('toggle', id, c)"
            @edit="(task) => emit('edit', task)"
            @remove="(id) => emit('remove', id)"
            @format-title="(id, marks) => emit('formatTitle', id, marks)"
            @set-color="(id, color) => emit('setColor', id, color)"
            @set-bg-color="(id, color) => emit('setBgColor', id, color)"
          />
        </div>
      </div>
      <div
        class="drop-indicator drop-indicator-tail"
        :class="{ 'drop-indicator-active': dropTarget?.section === 'schedule' && dropTarget.index === scheduleTasks.length }"
        @dragover="onDragOverSectionEnd($event, 'schedule', scheduleTasks.length)"
      />
    </section>

    <section class="mt-3 border-t border-white/10 pt-2">
      <div class="flex items-center justify-between px-2 pb-1 pt-1">
        <span class="text-[13px] font-semibold tracking-wide text-white/50">长期计划</span>
        <button class="section-add-btn" title="新建长期任务" @click="emit('add', 'longterm')">
          <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <p v-if="longtermTasks.length === 0" class="px-2 pb-2 text-[12px] text-white/35">暂无长期计划</p>
      <div v-for="(t, idx) in longtermTasks" :key="t.id" @dragover="onDragOverRow($event, 'longterm', idx)">
        <div
          class="drop-indicator"
          :class="{ 'drop-indicator-active': dropTarget?.section === 'longterm' && dropTarget.index === idx }"
        />
        <TaskItem
          :task="t"
          :has-children="childrenOf(t.id).length > 0"
          :children-expanded="expandedIds.has(t.id)"
          @toggle="(id, c) => emit('toggle', id, c)"
          @edit="(task) => emit('edit', task)"
          @remove="(id) => emit('remove', id)"
          @format-title="(id, marks) => emit('formatTitle', id, marks)"
          @add-subtask="(task) => emit('addSubtask', task)"
          @toggle-expand="toggleExpand"
          @set-color="(id, color) => emit('setColor', id, color)"
          @set-bg-color="(id, color) => emit('setBgColor', id, color)"
        />
        <div v-if="expandedIds.has(t.id)" class="space-y-0.5 pb-0.5">
          <TaskItem
            v-for="child in childrenOf(t.id)"
            :key="child.id"
            :task="child"
            is-subtask
            @toggle="(id, c) => emit('toggle', id, c)"
            @edit="(task) => emit('edit', task)"
            @remove="(id) => emit('remove', id)"
            @format-title="(id, marks) => emit('formatTitle', id, marks)"
            @set-color="(id, color) => emit('setColor', id, color)"
            @set-bg-color="(id, color) => emit('setBgColor', id, color)"
          />
        </div>
      </div>
      <div
        class="drop-indicator drop-indicator-tail"
        :class="{ 'drop-indicator-active': dropTarget?.section === 'longterm' && dropTarget.index === longtermTasks.length }"
        @dragover="onDragOverSectionEnd($event, 'longterm', longtermTasks.length)"
      />
    </section>

    <section v-if="(props.deletedTasks ?? []).length > 0" class="mt-3 border-t border-white/10 pt-2">
      <div class="flex items-center justify-between px-2 pb-1 pt-1">
        <span class="text-[13px] font-semibold tracking-wide text-red-400/60">已删除</span>
      </div>
      <div
        v-for="t in props.deletedTasks"
        :key="t.id"
        class="group flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-white/35 transition-colors hover:bg-white/5"
        title="单击恢复行程，双击彻底清除"
        @click="onDeletedClick(t.id)"
        @dblclick="onDeletedDblClick(t.id)"
      >
        <span class="min-w-0 flex-1 truncate text-[12px] line-through">{{ t.title }}</span>
        <span class="shrink-0 text-[10px] text-white/25">{{ formatDeletedAt(t.deletedAt) }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.section-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.5);
  transition: background-color 0.15s, color 0.15s;
}
.section-add-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
}

.drop-indicator {
  height: 4px;
  margin: 0 4px;
  border-radius: 2px;
  transition: background-color 0.1s;
}
.drop-indicator-tail {
  min-height: 10px;
}
.drop-indicator-active {
  background-color: rgba(77, 171, 247, 0.85);
}
</style>
