import { ipcRenderer, contextBridge } from 'electron'
import type { Task, TaskInput, TaskPatch, TaskSection } from '../src/types/task'
import type { Tag } from '../src/types/tag'
import type { Settings } from './store'

// --------- 仅暴露受限、结构化的 API 给渲染进程（contextIsolation + 无 nodeIntegration） ---------
contextBridge.exposeInMainWorld('api', {
  tasks: {
    list: (): Promise<Task[]> => ipcRenderer.invoke('tasks:list'),
    create: (input: TaskInput): Promise<Task> => ipcRenderer.invoke('tasks:create', input),
    update: (id: string, patch: TaskPatch): Promise<Task | null> =>
      ipcRenderer.invoke('tasks:update', id, patch),
    remove: (id: string): Promise<Task[]> => ipcRenderer.invoke('tasks:delete', id),
    listDeleted: (): Promise<Task[]> => ipcRenderer.invoke('tasks:listDeleted'),
    purge: (id: string): Promise<void> => ipcRenderer.invoke('tasks:purge', id),
    restore: (id: string): Promise<Task[]> => ipcRenderer.invoke('tasks:restore', id),
    getDirty: (): Promise<Task[]> => ipcRenderer.invoke('tasks:getDirty'),
    clearDirty: (ids: string[]): Promise<void> => ipcRenderer.invoke('tasks:clearDirty', ids),
    replaceAll: (tasks: Task[]): Promise<void> => ipcRenderer.invoke('tasks:replaceAll', tasks),
    reorder: (updates: { id: string; section: TaskSection; order: number }[]): Promise<void> =>
      ipcRenderer.invoke('tasks:reorder', updates),
    onDue: (callback: (tasks: Task[]) => void) => {
      const listener = (_event: unknown, tasks: Task[]) => callback(tasks)
      ipcRenderer.on('tasks:due', listener)
      return () => ipcRenderer.removeListener('tasks:due', listener)
    }
  },
  tags: {
    list: (): Promise<Tag[]> => ipcRenderer.invoke('tags:list'),
    create: (input: { name: string; color: string }): Promise<Tag> => ipcRenderer.invoke('tags:create', input),
    update: (id: string, patch: Partial<Pick<Tag, 'name' | 'color'>>): Promise<Tag | null> =>
      ipcRenderer.invoke('tags:update', id, patch),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('tags:delete', id)
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
    set: (patch: Partial<Settings>): Promise<Settings> => ipcRenderer.invoke('settings:set', patch)
  },
  window: {
    toggleCollapse: (expanded: boolean): Promise<void> =>
      ipcRenderer.invoke('window:toggleCollapse', expanded),
    setIgnoreMouseEvents: (ignore: boolean, forward: boolean): Promise<void> =>
      ipcRenderer.invoke('window:setIgnoreMouseEvents', ignore, forward),
    hide: (): Promise<void> => ipcRenderer.invoke('window:hide'),
    quit: (): Promise<void> => ipcRenderer.invoke('window:quit')
  }
})

