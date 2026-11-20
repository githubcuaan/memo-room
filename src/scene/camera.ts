import { MathUtils, OrthographicCamera, Vector3 } from 'three'
import type { Year } from '../memories'

export type View = 'welcome' | 'letter' | 'board' | Year
type Shot = { position: Vector3; target: Vector3; width: number; height: number; x: number; y: number }
const shot = (position: number[], target: number[], width: number, height: number, x: number, y: number): Shot => ({
  position: new Vector3(...position), target: new Vector3(...target), width, height, x, y,
})
export const boardCenters: Record<Year, [number, number]> = {
  1: [0.15, 2.65], 2: [0.15, 2.65], 3: [0.15, 2.65], 4: [0.15, 2.65],
}
function frame(view: View): Shot {
  if (view === 'welcome') return shot([-9.5, 7.95, 13.5], [0, 2.12, -0.05], 12.18, 9.2, 0.15, 0.22)
  if (view === 'letter') return shot([-4.3, 5, 6], [-2.95, 1.4, 1], 4.5, 3, 0, 0)
  if (view === 'board') return shot([-0.7, 3.3, 4.5], [0.15, 2.65, -2.85], 5.2, 3.6, 0, 0.13)
  return shot([-6.7, 6.1, 12], [0, 2.03, -0.12], 12.2, 8.15, 0, 0.09)
}

export class CameraController {
  readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 70)
  reduced = false
  private current = frame('welcome')
  private from = this.current
  private to = this.current
  private start = 0
  private duration = 0
  private aspect = 1
  private view: View = 'welcome'
  get moving() { return this.duration > 0 }

  private frameFor(view: View) {
    const result = frame(view)
    if (this.aspect < 0.75 && view !== 'welcome' && view !== 'letter') {
      result.height *= view === 'board' ? 1.48 : 1.25
      if (view === 'board') {
        result.position.set(-0.55, 3.35, 6)
        result.target.set(0.08, 2.65, -2.85)
      } else {
        result.position.set(-1.6, 5.3, 12)
        result.target.set(0, 2.05, -0.3)
      }
    }
    return result
  }
  resize(width: number, height: number) {
    const wasPortrait = this.aspect < 0.75
    this.aspect = width / height
    if (wasPortrait !== (this.aspect < 0.75)) {
      this.to = this.frameFor(this.view)
      this.current = this.to
      this.duration = 0
    }
    this.apply()
  }
  go(view: View, detail = false) {
    this.view = view
    this.from = this.current
    this.to = this.frameFor(view)
    if (detail) {
      this.to.width *= 0.84
      this.to.height *= 0.84
    }
    this.start = performance.now()
    this.duration = this.reduced ? 0 : detail ? 460 : 780
    if (!this.duration) this.finish()
  }
  finish() {
    this.current = this.to
    this.duration = 0
    this.apply()
  }
  update(now: number) {
    if (!this.moving) return
    const t = MathUtils.clamp((now - this.start) / this.duration, 0, 1)
    if (t === 1) return this.finish()
    const ease = t * t * (3 - 2 * t)
    this.current = {
      position: this.from.position.clone().lerp(this.to.position, ease),
      target: this.from.target.clone().lerp(this.to.target, ease),
      width: MathUtils.lerp(this.from.width, this.to.width, ease),
      height: MathUtils.lerp(this.from.height, this.to.height, ease),
      x: MathUtils.lerp(this.from.x, this.to.x, ease),
      y: MathUtils.lerp(this.from.y, this.to.y, ease),
    }
    this.apply()
  }
  private apply() {
    const { position, target, width, height, x, y } = this.current
    const portrait = this.aspect < 0.75
    const vertical = (portrait && this.view !== 'welcome' && this.view !== 'letter'
      ? height : Math.max(height, width / this.aspect)) / 2
    const horizontal = vertical * this.aspect
    const wide = MathUtils.smoothstep(this.aspect, 0.85, 1.4)
    const shiftX = x * horizontal * wide
    const shiftY = y * vertical * (1 - wide)
    Object.assign(this.camera, { left: -horizontal - shiftX, right: horizontal - shiftX, top: vertical - shiftY, bottom: -vertical - shiftY })
    this.camera.position.copy(position)
    this.camera.lookAt(target)
    this.camera.updateProjectionMatrix()
    this.camera.updateMatrixWorld()
  }
}
