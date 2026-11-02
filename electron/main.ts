import { app, BrowserWindow, Tray, Menu, ipcMain, screen, Notification, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  replaceAllTasks,
  getDirtyTasks,
  clearDirty,
  reorderTasks,
  pullDueTasksAndMarkNotified,
  getSettings,
  setSettings,
  listTags,
  createTag,
  updateTag,
  deleteTag,
  listDeletedTasks,
  purgeTask,
  restoreTask
} from './store'
import type { Task, TaskInput, TaskPatch, TaskSection } from '../src/types/task'
import type { Tag } from '../src/types/tag'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null
let tray: Tray | null = null
let reminderTimer: NodeJS.Timeout | null = null

const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.png')

function createWindow() {
  const settings = getSettings()
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize
  const bounds = settings.expanded ? settings.expandedBounds : settings.collapsedBounds

  win = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: screenWidth - bounds.width - 24,
    y: 24,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: true,
    minWidth: 220,
    minHeight: 64,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    show: false,
    icon: nativeImage.createFromPath(iconPath),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (settings.alwaysOnTop) win.setAlwaysOnTop(true, 'screen-saver')

  win.once('ready-to-show', () => {
    win?.show()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('resize', () => {
    if (!win) return
    const [w, h] = win.getSize()
    if (getSettings().expanded) {
      setSettings({ expandedBounds: { width: w, height: h } })
    } else {
      setSettings({ collapsedBounds: { width: w, height: h } })
    }
  })

  win.on('closed', () => {
    win = null
  })
}

function createTray() {
  const image = nativeImage.createFromPath(iconPath)
  tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image)
  tray.setToolTip('悬浮计划表')
  const menu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        if (!win) return
        win.isVisible() ? win.hide() : win.show()
      }
    },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setContextMenu(menu)
  tray.on('click', () => {
    if (!win) return
    win.isVisible() ? win.hide() : win.show()
  })
}

function syncAutoLaunch(enabled: boolean) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath
  })
}

function startReminderTimer() {
  reminderTimer = setInterval(() => {
    const due = pullDueTasksAndMarkNotified(new Date().toISOString())
    if (due.length === 0) return
    for (const task of due) {
      if (Notification.isSupported()) {
        new Notification({
          title: '日程提醒',
          body: task.title,
          silent: false
        }).show()
      }
    }
    win?.webContents.send('tasks:due', due)
  }, 30_000)
}

function registerIpcHandlers() {
  ipcMain.handle('tasks:list', (): Task[] => listTasks())
  ipcMain.handle('tasks:create', (_e, input: TaskInput): Task => createTask(input))
  ipcMain.handle('tasks:update', (_e, id: string, patch: TaskPatch): Task | null => updateTask(id, patch))
  ipcMain.handle('tasks:delete', (_e, id: string): Task[] => deleteTask(id))
  ipcMain.handle('tasks:listDeleted', (): Task[] => listDeletedTasks())
  ipcMain.handle('tasks:purge', (_e, id: string): void => purgeTask(id))
  ipcMain.handle('tasks:restore', (_e, id: string): Task[] => restoreTask(id))
  ipcMain.handle('tasks:getDirty', (): Task[] => getDirtyTasks())
  ipcMain.handle('tasks:clearDirty', (_e, ids: string[]): void => clearDirty(ids))
  ipcMain.handle('tasks:replaceAll', (_e, tasks: Task[]): void => replaceAllTasks(tasks))
  ipcMain.handle(
    'tasks:reorder',
    (_e, updates: { id: string; section: TaskSection; order: number }[]): void => reorderTasks(updates)
  )

  ipcMain.handle('tags:list', (): Tag[] => listTags())
  ipcMain.handle('tags:create', (_e, input: { name: string; color: string }): Tag => createTag(input))
  ipcMain.handle(
    'tags:update',
    (_e, id: string, patch: Partial<Pick<Tag, 'name' | 'color'>>): Tag | null => updateTag(id, patch)
  )
  ipcMain.handle('tags:delete', (_e, id: string): void => deleteTag(id))

  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:set', (_e, patch) => {
    const merged = setSettings(patch)
    if (typeof patch.autoLaunch === 'boolean') syncAutoLaunch(patch.autoLaunch)
    if (typeof patch.alwaysOnTop === 'boolean') win?.setAlwaysOnTop(patch.alwaysOnTop, 'screen-saver')
    return merged
  })

  ipcMain.handle('window:toggleCollapse', (_e, expanded: boolean) => {
    if (!win) return
    const settings = setSettings({ expanded })
    const bounds = expanded ? settings.expandedBounds : settings.collapsedBounds
    win.setBounds({ ...win.getBounds(), width: bounds.width, height: bounds.height })
  })

  ipcMain.handle('window:setIgnoreMouseEvents', (_e, ignore: boolean, forward: boolean) => {
    win?.setIgnoreMouseEvents(ignore, { forward })
  })

  ipcMain.handle('window:hide', () => win?.hide())
  ipcMain.handle('window:quit', () => app.quit())
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
  createTray()
  startReminderTimer()
  syncAutoLaunch(getSettings().autoLaunch)
})

app.on('window-all-closed', () => {
  if (reminderTimer) clearInterval(reminderTimer)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
