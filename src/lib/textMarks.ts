// 任务标题文字标注（选中文字后标颜色/背景/下划线/划掉）相关的纯函数工具
import type { TextMark, TextMarkType } from '../types/task'

export interface FormattedSegment {
  text: string
  color?: string
  bg?: string
  underline?: boolean
  strike?: boolean
}

/** 将 title 按 marks 切分为若干段，便于逐段渲染不同样式 */
export function computeSegments(text: string, marks: readonly TextMark[] | undefined): FormattedSegment[] {
  if (!text) return [{ text: '' }]
  if (!marks || marks.length === 0) return [{ text }]

  const boundariesSet = new Set<number>([0, text.length])
  for (const m of marks) {
    boundariesSet.add(Math.max(0, Math.min(m.start, text.length)))
    boundariesSet.add(Math.max(0, Math.min(m.end, text.length)))
  }
  const boundaries = Array.from(boundariesSet).sort((a, b) => a - b)

  const segments: FormattedSegment[] = []
  for (let i = 0; i < boundaries.length - 1; i++) {
    const segStart = boundaries[i]
    const segEnd = boundaries[i + 1]
    if (segStart >= segEnd) continue
    const seg: FormattedSegment = { text: text.slice(segStart, segEnd) }
    for (const m of marks) {
      if (m.start <= segStart && m.end >= segEnd) {
        if (m.type === 'color') seg.color = m.value
        else if (m.type === 'bg') seg.bg = m.value
        else if (m.type === 'underline') seg.underline = true
        else if (m.type === 'strike') seg.strike = true
      }
    }
    segments.push(seg)
  }
  return segments.length > 0 ? segments : [{ text }]
}

/** 对 [start, end) 区间应用一种标注类型；会自动裁剪该区间内已有的同类型标注，避免重叠冲突 */
export function applyMark(
  marks: readonly TextMark[],
  start: number,
  end: number,
  type: TextMarkType,
  value?: string
): TextMark[] {
  if (start >= end) return [...marks]
  const next: TextMark[] = []
  for (const m of marks) {
    if (m.type !== type || m.end <= start || m.start >= end) {
      next.push(m)
      continue
    }
    if (m.start < start) next.push({ ...m, end: start })
    if (m.end > end) next.push({ ...m, start: end })
  }
  next.push({ start, end, type, value })
  return next
}

/** 清除 [start, end) 区间内的所有标注类型 */
export function clearMarks(marks: readonly TextMark[], start: number, end: number): TextMark[] {
  if (start >= end) return [...marks]
  const next: TextMark[] = []
  for (const m of marks) {
    if (m.end <= start || m.start >= end) {
      next.push(m)
      continue
    }
    if (m.start < start) next.push({ ...m, end: start })
    if (m.end > end) next.push({ ...m, start: end })
  }
  return next
}

/** 计算某个容器内，当前文字选区相对纯文本的字符偏移范围；选区跨越多个子节点（多段标注）时也能正确计算 */
export function getSelectionOffsets(root: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return null

  const offsetOf = (node: Node, offset: number): number => {
    let total = 0
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current) {
      if (current === node) return total + offset
      total += current.textContent?.length ?? 0
      current = walker.nextNode()
    }
    return total
  }

  const start = offsetOf(range.startContainer, range.startOffset)
  const end = offsetOf(range.endContainer, range.endOffset)
  if (start === end) return null
  return start < end ? { start, end } : { start: end, end: start }
}
