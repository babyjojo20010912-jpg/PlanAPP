import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 点击 rootEl 之外区域时触发 onOutside。
 * 监听器延迟到下一事件循环注册，避免刚打开弹窗时就被立即关闭。
 */
export function useClickOutside(rootEl: Ref<HTMLElement | null>, onOutside: () => void) {
  function handleMouseDown(e: MouseEvent) {
    if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
      onOutside()
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined

  onMounted(() => {
    timer = setTimeout(() => {
      document.addEventListener('mousedown', handleMouseDown)
    }, 0)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
    document.removeEventListener('mousedown', handleMouseDown)
  })
}
