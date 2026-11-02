/** 根据背景色亮度自动返回黑/白文字颜色，确保标签文字在任意背景色上清晰可读 */
export function getContrastTextColor(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150 ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.95)'
}

/** 将 #RRGGBB 转为带透明度的 rgba()，用于行背景填充色这类需要半透明叠加在深色主题上的场景 */
export function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
