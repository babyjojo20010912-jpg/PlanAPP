<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = defineProps<{
  expanded: boolean
  alwaysOnTop: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-expanded'): void
  (e: 'toggle-pin'): void
  (e: 'open-settings'): void
}>()

const clickThrough = ref(false)
const pinButtonEl = ref<HTMLElement | null>(null)
// 跟踪当前已下发给主进程的穿透状态，避免每次 mousemove 都重复发送 IPC 造成卡顿
let lastIgnoring: boolean | null = null

function onMouseMove(e: MouseEvent) {
  if (!clickThrough.value || !pinButtonEl.value) return
  const r = pinButtonEl.value.getBoundingClientRect()
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
  const shouldIgnore = !inside
  if (shouldIgnore === lastIgnoring) return
  lastIgnoring = shouldIgnore
  window.api.window.setIgnoreMouseEvents(shouldIgnore, true)
}

function toggleClickThrough() {
  clickThrough.value = !clickThrough.value
  if (clickThrough.value) {
    lastIgnoring = true
    window.addEventListener('mousemove', onMouseMove)
    window.api.window.setIgnoreMouseEvents(true, true)
  } else {
    lastIgnoring = null
    window.removeEventListener('mousemove', onMouseMove)
    window.api.window.setIgnoreMouseEvents(false, false)
  }
}

function hideToTray() {
  window.api.window.hide()
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div class="drag-region flex items-center justify-between px-3 py-2 select-none">
    <div class="flex items-center gap-1.5">
      <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
      <span class="text-[13px] font-semibold text-white/90 tracking-wide">日程</span>
    </div>

    <div class="no-drag flex items-center gap-1">
      <button
        ref="pinButtonEl"
        class="icon-btn tooltip-trigger"
        :class="{ 'icon-btn-active': clickThrough }"
        data-tooltip="点击穿透：开启后鼠标可穿过窗口操作桌面"
        aria-label="点击穿透"
        @click="toggleClickThrough"
      >
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <button
        class="icon-btn tooltip-trigger"
        :class="{ 'icon-btn-active': props.alwaysOnTop }"
        data-tooltip="置顶显示"
        aria-label="置顶显示"
        @click="emit('toggle-pin')"
      >
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M12 2v6m0 0 3 3h-2l-1 8-1-8H9l3-3Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button class="icon-btn" title="设置" @click="emit('open-settings')">
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.32.37.6.66.82.29.21.63.33.99.33H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
          />
        </svg>
      </button>

      <button class="icon-btn" :title="props.expanded ? '收起' : '展开'" @click="emit('toggle-expanded')">
        <svg
          viewBox="0 0 24 24"
          class="h-3.5 w-3.5 transition-transform"
          :class="{ 'rotate-180': !props.expanded }"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m18 15-6-6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <button class="icon-btn" title="隐藏到托盘" @click="hideToTray">
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.7);
  transition: background-color 0.15s, color 0.15s;
}
.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
}
.icon-btn-active {
  background-color: rgba(77, 171, 247, 0.3);
  color: #4dabf7;
}

/* 自定义悬浮提示：原生 title 属性在无边框透明窗口里经常不显示或延迟很久，
   这里用纯 CSS 伪元素实现一个与整体毛玻璃风格一致的小气泡，hover 即时显示。 */
.tooltip-trigger {
  position: relative;
}
.tooltip-trigger::after {
  content: attr(data-tooltip);
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(20, 20, 24, 0.92);
  color: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  line-height: 1.3;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.12s ease, transform 0.12s ease;
  transition-delay: 0.15s;
  z-index: 20;
}
.tooltip-trigger:hover::after {
  opacity: 1;
  transform: translateY(0);
}
</style>
