// 标签数据模型：用于给任务打分类标记，独立于任务颜色（颜色标记优先级/视觉分类）

export interface Tag {
  id: string
  name: string
  /** 标签背景色，如 #4DABF7 */
  color: string
}

export const TAG_COLORS = [
  '#2F3137', // 黑灰（默认）
  '#4DABF7', // 天空蓝
  '#51CF66', // 薄荷绿
  '#FFA94D', // 暖橙
  '#FF6B6B', // 珊瑚红
  '#9775FA', // 薰衣草紫
  '#F783AC', // 樱花粉
  '#FFD43B' // 柠檬黄
] as const

export const DEFAULT_TAG_COLOR = TAG_COLORS[0]

/** 内置默认标签：工作。id 固定，首次启动自动创建，便于识别与保留 */
export const BUILTIN_WORK_TAG_ID = 'tag-work'

export const BUILTIN_TAGS: Tag[] = [{ id: BUILTIN_WORK_TAG_ID, name: '工作', color: DEFAULT_TAG_COLOR }]
