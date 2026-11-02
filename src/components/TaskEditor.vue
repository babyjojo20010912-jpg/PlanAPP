<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import type { Task, TaskInput, TaskSection } from '../types/task'
import { DEFAULT_TASK_COLOR } from '../types/task'
import { TAG_COLORS, DEFAULT_TAG_COLOR } from '../types/tag'
import { useTags } from '../composables/useTags'
import { getContrastTextColor } from '../lib/color'

const { tags, add: addTag, edit: editTag } = useTags()

const props = defineProps<{ task: Task | null; defaultSection?: TaskSection; parentId?: string | null }>()
const emit = defineEmits<{
  (e: 'save', input: TaskInput): void
  (e: 'close'): void
}>()

function toLocalInputValue(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const form = reactive<TaskInput>({
  title: props.task?.title ?? '',
  dueAt: props.task?.dueAt ?? null,
  color: props.task?.color ?? DEFAULT_TASK_COLOR,
  section: props.task?.section ?? props.defaultSection ?? 'schedule',
  tagId: props.task?.tagId ?? null,
  parentId: props.task?.parentId ?? props.parentId ?? null
})
const dueLocal = reactive({ value: toLocalInputValue(props.task?.dueAt ?? null) })

const showNewTag = ref(false)
const newTagName = ref('')
const newTagColor = ref<string>(DEFAULT_TAG_COLOR)

async function createTag() {
  const name = newTagName.value.trim()
  if (!name) return
  const tag = await addTag(name, newTagColor.value)
  form.tagId = tag.id
  newTagName.value = ''
  newTagColor.value = DEFAULT_TAG_COLOR
  showNewTag.value = false
}

function setTagColor(c: string) {
  if (!form.tagId) return
  void editTag(form.tagId, { color: c })
}

watch(
  () => props.task,
  (t) => {
    form.title = t?.title ?? ''
    form.dueAt = t?.dueAt ?? null
    form.color = t?.color ?? DEFAULT_TASK_COLOR
    form.section = t?.section ?? props.defaultSection ?? 'schedule'
    form.tagId = t?.tagId ?? null
    form.parentId = t?.parentId ?? props.parentId ?? null
    dueLocal.value = toLocalInputValue(t?.dueAt ?? null)
  }
)

function onDueChange(e: Event) {
  const value = (e.target as HTMLInputElement).value
  form.dueAt = value ? new Date(value).toISOString() : null
}

function submit() {
  if (!form.title.trim()) return
  emit('save', { ...form, title: form.title.trim(), parentId: props.task?.parentId ?? props.parentId ?? null })
}
</script>

<template>
  <div class="no-drag absolute inset-0 z-10 flex flex-col rounded-[1.75rem] bg-black/55 p-4 backdrop-blur-xl">
    <div class="flex items-center justify-between pb-2">
      <span class="text-[13px] font-semibold text-white/90">{{ props.task ? '编辑任务' : props.parentId ? '新建子行程' : '新建任务' }}</span>
      <button class="icon-btn" @click="emit('close')">
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <input
      v-model="form.title"
      type="text"
      placeholder="任务标题"
      class="w-full rounded-xl bg-white/10 px-3 py-2 text-[13px] text-white placeholder-white/40 outline-none focus:bg-white/15"
      @keydown.enter="submit"
    />

    <div class="mt-2 flex gap-1.5">
      <button
        class="flex-1 rounded-xl py-1.5 text-[12px] transition-colors"
        :class="form.section === 'schedule' ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'"
        @click="form.section = 'schedule'"
      >
        日程计划
      </button>
      <button
        class="flex-1 rounded-xl py-1.5 text-[12px] transition-colors"
        :class="form.section === 'longterm' ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'"
        @click="form.section = 'longterm'"
      >
        长期计划
      </button>
    </div>

    <div class="mt-2 flex flex-wrap items-center gap-1.5">
      <button
        v-for="tag in tags"
        :key="tag.id"
        class="rounded-full px-2.5 py-1 text-[11px] font-medium transition-transform hover:scale-105"
        :style="{
          backgroundColor: tag.color,
          color: getContrastTextColor(tag.color),
          boxShadow: form.tagId === tag.id ? '0 0 0 2px rgba(15,15,18,0.9), 0 0 0 3.5px white' : 'none'
        }"
        @click="form.tagId = form.tagId === tag.id ? null : tag.id"
      >
        {{ tag.name }}
      </button>
      <button
        class="rounded-full border border-dashed border-white/25 px-2.5 py-1 text-[11px] text-white/50 transition-colors hover:border-white/40 hover:text-white/75"
        @click="showNewTag = !showNewTag"
      >
        + 新标签
      </button>
    </div>

    <div v-if="showNewTag" class="mt-2 rounded-xl bg-white/10 p-2">
      <input
        v-model="newTagName"
        type="text"
        placeholder="标签名称"
        maxlength="8"
        class="w-full rounded-lg bg-white/10 px-2.5 py-1.5 text-[12px] text-white placeholder-white/40 outline-none focus:bg-white/15"
        @keydown.enter="createTag"
      />
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <button
          v-for="c in TAG_COLORS"
          :key="c"
          class="h-4.5 w-4.5 rounded-full transition-transform hover:scale-110"
          :style="{
            backgroundColor: c,
            boxShadow: newTagColor === c ? '0 0 0 2px rgba(15,15,18,0.9), 0 0 0 3.5px white' : 'none'
          }"
          @click="newTagColor = c"
        />
      </div>
      <div class="mt-2 flex gap-1.5">
        <button class="flex-1 rounded-lg bg-white/10 py-1 text-[11px] text-white/70 hover:bg-white/15" @click="showNewTag = false">
          取消
        </button>
        <button class="flex-1 rounded-lg bg-sky-500 py-1 text-[11px] font-medium text-white hover:bg-sky-400" @click="createTag">
          创建
        </button>
      </div>
    </div>

    <input
      type="datetime-local"
      :value="dueLocal.value"
      class="mt-2 w-full rounded-xl bg-white/10 px-3 py-2 text-[12px] text-white outline-none focus:bg-white/15 [color-scheme:dark]"
      @change="onDueChange"
    />

    <div v-if="form.tagId" class="mt-3">
      <span class="text-[11px] text-white/40">标签背景色</span>
      <div class="mt-1.5 flex flex-wrap items-center gap-3">
        <button
          v-for="c in TAG_COLORS"
          :key="c"
          class="h-5 w-5 rounded-full transition-transform hover:scale-110"
          :style="{
            backgroundColor: c,
            boxShadow: tags.find((t) => t.id === form.tagId)?.color === c ? '0 0 0 2px rgba(15,15,18,0.9), 0 0 0 4px white' : 'none'
          }"
          @click="setTagColor(c)"
        />
      </div>
    </div>

    <div class="mt-auto flex gap-2 pt-3">
      <button
        class="flex-1 rounded-xl bg-white/10 py-2 text-[12px] text-white/80 transition-colors hover:bg-white/15"
        @click="emit('close')"
      >
        取消
      </button>
      <button
        class="flex-1 rounded-xl bg-sky-500 py-2 text-[12px] font-medium text-white transition-colors hover:bg-sky-400"
        @click="submit"
      >
        保存
      </button>
    </div>
  </div>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.7);
}
.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
}
</style>
