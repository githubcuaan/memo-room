export function preference(key: string, value?: boolean) {
  try {
    if (value !== undefined) localStorage.setItem(`2011-${key}`, String(value))
    return localStorage.getItem(`2011-${key}`) === 'true'
  } catch { return value ?? false }
}

// A quiet, original loop; no network requests or autoplay.
export class AudioManager {
  private context?: AudioContext
  private volume?: GainNode
  private interval?: number
  private next = 0
  private note = 0
  private version = 0
  private intended = false
  constructor(readonly saved = preference('sound')) {}
  async set(enabled: boolean) {
    this.intended = enabled
    const version = ++this.version
    if (!enabled) {
      window.clearInterval(this.interval)
      this.interval = undefined
      if (this.context && this.volume) this.volume.gain.setTargetAtTime(0, this.context.currentTime, 0.025)
      return false
    }
    try {
      const ctx = this.context ??= new AudioContext()
      if (!this.volume) {
        this.volume = ctx.createGain()
        this.volume.gain.value = 0
        this.volume.connect(ctx.destination)
      }
      if (ctx.state !== 'running') await ctx.resume()
      if (version !== this.version) return this.intended
      this.volume.gain.setTargetAtTime(0.16, ctx.currentTime, 0.1)
      window.clearInterval(this.interval)
      this.next = ctx.currentTime + 0.05
      this.schedule()
      this.interval = window.setInterval(this.schedule, 200)
      return true
    } catch { return false }
  }
  private schedule = () => {
    const ctx = this.context!
    if (this.next < ctx.currentTime) this.next = ctx.currentTime + 0.04
    const melody = [60, 67, 72, 76, 69, 72, 74, 67, 57, 64, 72, 76, 65, 69, 72, 67]
    while (this.next < ctx.currentTime + 0.35) {
      const at = this.next
      const midi = melody[this.note++ % melody.length]
      for (const [octave, level] of [[0, 0.25], [12, 0.055]]) {
        const oscillator = ctx.createOscillator()
        const envelope = ctx.createGain()
        oscillator.frequency.value = 440 * 2 ** ((midi + octave - 69) / 12)
        envelope.gain.setValueAtTime(0.0001, at)
        envelope.gain.exponentialRampToValueAtTime(level, at + 0.045)
        envelope.gain.exponentialRampToValueAtTime(0.0001, at + 1.65)
        oscillator.connect(envelope).connect(this.volume!)
        oscillator.start(at)
        oscillator.stop(at + 1.69)
      }
      this.next += this.note % 4 === 0 ? 1.02 : 0.48
    }
  }
}
