// 任务数据模型，供主进程（本地存储）与渲染进程（UI、Supabase 同步）共用

/** 任务所属板块：日程计划（有明确时间安排）或长期计划（无需按天追踪的长线目标） */
export type TaskSection = 'schedule' | 'longterm'

/** 标题文字标注类型：文字颜色、背景色、下划线、划掉（取消完成/弱化显示） */
export type TextMarkType = 'color' | 'bg' | 'underline' | 'strike'

/** 标题文本中 [start, end) 字符区间的标注，value 仅对 color/bg 有效 */
export interface TextMark {
  start: number
  end: number
  type: TextMarkType
  value?: string
}

export interface Task {
  id: string
  title: string
  /** 标题文字的字符级样式标注（支持选中部分文字单独标色/划线/划掉） */
  titleMarks: readonly TextMark[]
  /** 父任务 id，null 表示顶级任务；非空表示这是子行程 */
  parentId: string | null
  /** ISO 8601 字符串，到期提醒时间；为空表示无截止时间 */
  dueAt: string | null
  /** 纯视觉分类颜色，如 #FF6B6B */
  color: string
  /** 整行背景填充色，null 表示未设置（默认透明） */
  bgColor: string | null
  /** 任务所属板块 */
  section: TaskSection
  /** 同一板块内的手动排序位置，数字越小越靠前（支持拖拽排序） */
  order: number
  /** 关联标签 id，null 表示无标签 */
  tagId: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
  /** 软删除标记，便于离线编辑后与云端同步 */
  deletedAt: string | null
  /** 本地是否有未同步到云端的改动 */
  dirty: boolean
  /** 到期提醒是否已触发过，避免重复提醒 */
  notifiedAt: string | null
}

export type TaskInput = Pick<Task, 'title' | 'dueAt' | 'color' | 'section' | 'tagId'> & { parentId?: string | null }

export type TaskPatch = Partial<
  Pick<Task, 'title' | 'dueAt' | 'color' | 'bgColor' | 'section' | 'completed' | 'tagId' | 'titleMarks'>
>

export const TASK_COLORS = [
  '#FFFFFF', // 默认（白色，未特别分类）
  '#FF6B6B', // 珊瑚红
  '#FFA94D', // 暖橙
  '#FFD43B', // 柠檬黄
  '#51CF66', // 薄荷绿
  '#4DABF7', // 天空蓝
  '#9775FA', // 薰衣草紫
  '#F783AC', // 樱花粉
  '#868E96' // 中性灰
] as const

export const DEFAULT_TASK_COLOR = TASK_COLORS[0]
