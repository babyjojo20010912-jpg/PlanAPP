/** 使用 Web Audio API 生成一段简短提示音，避免引入额外的音频资源文件 */
export function playReminderSound() {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime
    ;[0, 0.15].forEach((offset, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = i === 0 ? 880 : 1046.5
      gain.gain.setValueAtTime(0.0001, now + offset)
      gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + offset)
      osc.stop(now + offset + 0.3)
    })
    setTimeout(() => ctx.close(), 800)
  } catch {
    // 忽略音频播放失败（例如浏览器策略限制），不影响系统通知的提醒效果
  }
}
