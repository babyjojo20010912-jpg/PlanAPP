<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TitleBar from './components/TitleBar.vue'
import TaskList from './components/TaskList.vue'
import TaskEditor from './components/TaskEditor.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { useTasks } from './composables/useTasks'
import { useSettings } from './composables/useSettings'
import { initAuth, syncNow, subscribeRealtime } from './composables/useSupabaseSync'
import { playReminderSound } from './lib/sound'
import type { Task, TaskInput, TaskSection } from './types/task'

const { tasks, deletedTasks, reload, add, edit, toggleCompleted, remove, purge, restore, move } = useTasks()
const { settings, update: updateSettings } = useSettings()

const editingTask = ref<Task | null | undefined>(undefined) // undefined = 关闭, null = 新建, Task = 编辑
const newTaskSection = ref<TaskSection>('schedule')
const newTaskParentId = ref<string | null>(null)
const settingsOpen = ref(false)

const nextTask = computed(() => tasks.find((t) => !t.completed) ?? null)

async function toggleExpanded() {
  const expanded = !settings.expanded
  await window.api.window.toggleCollapse(expanded)
  await updateSettings({ expanded })
}

async function togglePin() {
  await updateSettings({ alwaysOnTop: !settings.alwaysOnTop })
}

function openEditor(task: Task | null) {
  newTaskParentId.value = null
  editingTask.value = task
}

function openNewTaskEditor(section: TaskSection) {
  newTaskSection.value = section
  newTaskParentId.value = null
  editingTask.value = null
}

function openNewSubtaskEditor(parent: Task) {
  newTaskSection.value = parent.section
  newTaskParentId.value = parent.id
  editingTask.value = null
}

function closeEditor() {
  editingTask.value = undefined
}

async function saveTask(input: TaskInput) {
  if (editingTask.value) {
    // 标题文字一旦被编辑表单修改，原有的字符区间标注（颜色/背景/下划线/划掉）会错位，需一并清空
    const titleChanged = input.title !== editingTask.value.title
    await edit(editingTask.value.id, titleChanged ? { ...input, titleMarks: [] } : input)
  } else {
    await add(input)
  }
  closeEditor()
}

let unsubscribeDue: (() => void) | undefined
let unsubscribeRealtime: (() => void) | undefined
let syncInterval: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  unsubscribeDue = window.api.tasks.onDue((due) => {
    playReminderSound()
    void reload()
    if (due.length > 0) {
      openEditor(due[0])
    }
  })

  await initAuth()
  await syncNow()
  unsubscribeRealtime = subscribeRealtime(() => {
    void syncNow().then(() => reload())
  })
  syncInterval = setInterval(() => {
    void syncNow().then(() => reload())
  }, 60_000)
})

onUnmounted(() => {
  unsubscribeDue?.()
  unsubscribeRealtime?.()
  if (syncInterval) clearInterval(syncInterval)
})
</script>

<template>
  <div
    class="relative flex h-screen w-screen flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-900/60 shadow-[var(--shadow-soft)] backdrop-blur-2xl"
  >
    <TitleBar :expanded="settings.expanded" :always-on-top="settings.alwaysOnTop" @toggle-expanded="toggleExpanded" @toggle-pin="togglePin" @open-settings="settingsOpen = true" />

    <template v-if="settings.expanded">
      <div class="relative flex-1 overflow-hidden px-2 pb-3 pt-1">
        <TaskList
          :tasks="tasks"
          :deleted-tasks="deletedTasks"
          @toggle="toggleCompleted"
          @edit="openEditor"
          @remove="remove"
          @add="openNewTaskEditor"
          @move="move"
          @format-title="(id, marks) => edit(id, { titleMarks: marks })"
          @add-subtask="openNewSubtaskEditor"
          @set-color="(id, color) => edit(id, { color })"
          @set-bg-color="(id, color) => edit(id, { bgColor: color })"
          @purge="purge"
          @restore="restore"
        />

        <TaskEditor
          v-if="editingTask !== undefined"
          :task="editingTask"
          :default-section="newTaskSection"
          :parent-id="newTaskParentId"
          @save="saveTask"
          @close="closeEditor"
        />
        <SettingsPanel v-if="settingsOpen" @close="settingsOpen = false" />
      </div>
    </template>

    <template v-else>
      <div class="no-drag flex flex-1 items-center px-3 pb-2 text-[12px] text-white/80">
        <span v-if="nextTask" class="truncate">
          <span class="mr-1.5 inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: nextTask.color }" />
          {{ nextTask.title }}
        </span>
        <span v-else class="text-white/40">暂无待办</span>
      </div>
    </template>
  </div>
</template>

