import * as T from 'three'

function paperTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  draw(ctx)
  const texture = new T.CanvasTexture(canvas)
  texture.colorSpace = T.SRGBColorSpace
  return texture
}

function ink(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, font: string, color: string) {
  ctx.textAlign = 'center'
  ctx.fillStyle = color
  ctx.font = font
  ctx.fillText(value, x, y)
}

function face(width: number, height: number, map: T.Texture, z: number) {
  const mesh = new T.Mesh(new T.PlaneGeometry(width, height), new T.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.25 }))
  mesh.position.z = z
  return mesh
}

export function createEnvelope(purpose: 'tribute' | 'welcome' = 'tribute') {
  const root = new T.Group()
  const glow = face(4.55, 3.25, paperTexture(256, 192, (ctx) => {
    const halo = ctx.createRadialGradient(128, 96, 20, 128, 96, 122)
    halo.addColorStop(0, 'rgba(255,237,176,0.85)')
    halo.addColorStop(0.4, 'rgba(255,203,119,0.42)')
    halo.addColorStop(1, 'rgba(255,171,93,0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, 256, 192)
  }), -0.19)
  glow.material.alphaTest = 0
  glow.material.side = T.DoubleSide
  glow.material.blending = T.AdditiveBlending
  glow.material.depthWrite = false
  root.add(glow)
  const body = new T.Mesh(new T.BoxGeometry(3.2, 2, 0.105), new T.MeshStandardMaterial({ color: '#e7c48a', roughness: 0.91 }))
  body.position.z = -0.065
  root.add(body)

  const back = face(3.18, 1.98, paperTexture(768, 480, (ctx) => {
    ctx.fillStyle = '#ead2a6'
    ctx.fillRect(0, 0, 768, 480)
    ctx.strokeStyle = '#ae835a'
    ctx.lineWidth = 2
    ctx.strokeRect(25, 25, 718, 430)
    ink(ctx, '✦', 384, 135, '36px Georgia', '#a85940')
    ink(ctx, purpose === 'welcome' ? 'Gửi bạn' : 'Kính gửi thầy cô', 384, 246, 'italic 65px Georgia', '#764c34')
    ink(ctx, '20 · 11', 384, 324, '32px Georgia', '#92684a')
  }), -0.121)
  back.rotation.y = Math.PI
  root.add(back)

  const sheet = face(2.85, 1.72, paperTexture(768, 464, (ctx) => {
    ctx.fillStyle = '#f6ebd3'
    ctx.fillRect(0, 0, 768, 464)
    ctx.strokeStyle = '#c5a477'
    ctx.lineWidth = 2
    ctx.strokeRect(22, 22, 724, 420)
    ink(ctx, purpose === 'welcome' ? 'ĐẠI HỌC PHENIKAA' : '20 THÁNG 11', 384, 90, '24px Georgia', '#a85940')
    ink(ctx, purpose === 'welcome' ? 'Một lời mời' : 'Thư gửi thầy cô', 384, 181, 'italic 62px Georgia', '#73543b')
    if (purpose === 'welcome') {
      ink(ctx, 'Mời bạn bước vào căn phòng ký ức,', 384, 252, '32px Georgia', '#73543b')
      ink(ctx, 'đi qua bốn mùa và mở những câu chuyện.', 384, 309, '30px Georgia', '#73543b')
    } else {
      ctx.strokeStyle = '#c4ae8d'
      for (let y = 238; y <= 362; y += 31) {
        ctx.beginPath(); ctx.moveTo(110, y); ctx.lineTo(y === 362 ? 485 : 658, y); ctx.stroke()
      }
    }
    ink(ctx, '✦', 384, 416, '27px Georgia', '#a85940')
  }), 0.014)
  sheet.material.side = T.DoubleSide
  root.add(sheet)

  const pocket = face(3.2, 2, paperTexture(768, 480, (ctx) => {
    const fill = ctx.createLinearGradient(0, 0, 0, 480)
    fill.addColorStop(0, '#dcb77d')
    fill.addColorStop(1, '#f0d6a6')
    ctx.fillStyle = fill
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(384, 161); ctx.lineTo(768, 0)
    ctx.lineTo(768, 480); ctx.lineTo(0, 480); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = '#b88b5e'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(0, 480); ctx.lineTo(384, 157); ctx.lineTo(768, 480); ctx.stroke()
  }), 0.055)
  root.add(pocket)

  const hinge = new T.Group()
  hinge.position.set(0, 1, 0.076)
  root.add(hinge)
  const flapShape = new T.Shape()
  flapShape.moveTo(-1.6, 0)
  flapShape.lineTo(1.6, 0)
  flapShape.quadraticCurveTo(0.24, -1.15, 0, -1.17)
  flapShape.quadraticCurveTo(-0.24, -1.15, -1.6, 0)
  const flap = new T.Mesh(new T.ShapeGeometry(flapShape), new T.MeshBasicMaterial({ color: '#f2d8a9', side: T.DoubleSide }))
  hinge.add(flap)
  const seal = face(0.45, 0.45, paperTexture(128, 128, (ctx) => {
    const wax = ctx.createRadialGradient(46, 37, 7, 64, 64, 61)
    wax.addColorStop(0, '#ba654b')
    wax.addColorStop(1, '#803b31')
    ctx.fillStyle = wax
    ctx.beginPath()
    for (let i = 0; i <= 80; i++) {
      const a = i / 80 * Math.PI * 2
      const r = 58 + Math.sin(a * 5) * 3 + Math.cos(a * 7) * 2
      ctx.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r)
    }
    ctx.fill()
    ctx.strokeStyle = '#dd98708c'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(64, 64, 38, 0, 2 * Math.PI); ctx.stroke()
    ink(ctx, '✦', 64, 80, '46px Georgia', '#edac80')
  }), 0.015)
  seal.position.y = -0.99
  hinge.add(seal)

  function reset() {
    hinge.rotation.x = 0
    seal.scale.setScalar(1)
    sheet.position.set(0, -0.1, 0.014)
    sheet.rotation.set(0, 0, 0)
    sheet.scale.setScalar(1)
  }
  reset()
  return { kind: 'envelope' as const, root, body, hinge, seal, sheet, reset }
}

export type Envelope = ReturnType<typeof createEnvelope>
export type Inspectable = Envelope | {
  kind: 'card'
  root: T.Group
  body: T.Mesh
  reset: () => void
}
export type LetterPhase = 'lifting' | 'held' | 'opening' | 'opened'
const ease = (t: number) => t * t * (3 - 2 * t)
const part = (t: number, from: number, to: number) => ease(T.MathUtils.clamp((t - from) / (to - from), 0, 1))

export class LetterInspection {
  private foreground = new T.Scene()
  private camera = new T.OrthographicCamera(-3, 3, 3, -3, 0.01, 30)
  private shade = new T.Mesh(new T.PlaneGeometry(), new T.MeshBasicMaterial({ color: '#122018', transparent: true, opacity: 0 }))
  private parent: T.Object3D
  private restPosition: T.Vector3
  private restRotation: T.Quaternion
  private restScale: number
  private phase?: LetterPhase
  private start = 0
  private source = new T.Vector3()
  private sourceScale = 1
  private sourceAngle = new T.Quaternion()
  private heldAngle = new T.Quaternion().setFromEuler(new T.Euler(0.08, -0.19, -0.08))
  private notify?: (phase: LetterPhase) => void

  constructor(private model: Inspectable) {
    this.parent = model.root.parent!
    this.restPosition = model.root.position.clone()
    this.restRotation = model.root.quaternion.clone()
    this.restScale = model.root.scale.x
    this.camera.position.z = 10
    this.camera.updateMatrixWorld()
    this.shade.position.z = -6
    this.foreground.add(this.shade, new T.HemisphereLight('#fff2d9', '#947356', 2.3))
  }
  get active() { return this.phase !== undefined }
  get lifting() { return this.phase === 'lifting' }
  get held() { return this.phase === 'held' }
  get opened() { return this.phase === 'opened' }
  resize(aspect: number) {
    const halfHeight = Math.max(2.85, 2.08 / aspect)
    const halfWidth = halfHeight * aspect
    Object.assign(this.camera, { left: -halfWidth, right: halfWidth, top: halfHeight, bottom: -halfHeight })
    this.camera.updateProjectionMatrix()
    this.shade.scale.set(2 * halfWidth, 2 * halfHeight, 1)
  }
  lift(roomCamera: T.OrthographicCamera, notify: (phase: LetterPhase) => void) {
    const { root } = this.model
    root.getWorldPosition(this.source).project(roomCamera)
    const offscreen = Math.abs(this.source.x) > 1 || Math.abs(this.source.y) > 1 || Math.abs(this.source.z) > 1
    this.source.set(offscreen ? 0 : this.source.x * this.camera.right, offscreen ? -0.8 * this.camera.top : this.source.y * this.camera.top, 0)
    this.sourceScale = this.restScale * (this.camera.right * 2) / (roomCamera.right - roomCamera.left)
    const viewRotation = roomCamera.getWorldQuaternion(new T.Quaternion()).invert()
    root.getWorldQuaternion(this.sourceAngle).premultiply(viewRotation)
    this.foreground.add(root)
    this.notify = notify
    this.phase = 'lifting'
    this.start = performance.now()
  }
  rotate(x: number, y: number) {
    if (!this.held) return
    // Rotations are applied in screen space, with no pitch or yaw limits.
    const angle = new T.Quaternion().setFromEuler(new T.Euler(y * 0.012, x * 0.012, 0))
    this.model.root.quaternion.premultiply(angle).normalize()
  }
  hit(pointer: T.Vector2, ray: T.Raycaster) {
    if (!this.held) return false
    ray.setFromCamera(pointer, this.camera)
    return ray.intersectObject(this.model.body).length > 0
  }
  hitPaper(pointer: T.Vector2, ray: T.Raycaster) {
    if (!this.opened || this.model.kind !== 'envelope') return false
    ray.setFromCamera(pointer, this.camera)
    return ray.intersectObject(this.model.sheet).length > 0
  }
  open() {
    if (!this.held) return false
    this.phase = 'opening'
    this.sourceAngle.copy(this.model.root.quaternion)
    this.start = performance.now()
    return true
  }
  update(now: number, reduced: boolean) {
    const { root } = this.model
    if (this.phase === 'lifting') {
      const t = reduced ? 1 : T.MathUtils.clamp((now - this.start) / 780, 0, 1)
      const p = ease(t)
      root.position.set(this.source.x * (1 - p), T.MathUtils.lerp(this.source.y, 0.23, p) + Math.sin(Math.PI * p) * 0.36, 0)
      root.scale.setScalar(T.MathUtils.lerp(this.sourceScale, this.model.kind === 'card' ? 3.5 : 1, p))
      root.quaternion.slerpQuaternions(this.sourceAngle, this.heldAngle, p)
      this.shade.material.opacity = 0.52 * p
      if (t < 1) return true
      this.phase = 'held'
      this.notify?.('held')
    } else if (this.phase === 'opening') {
      const t = reduced ? 1 : T.MathUtils.clamp((now - this.start) / (this.model.kind === 'card' ? 720 : 1500), 0, 1)
      root.quaternion.slerpQuaternions(this.sourceAngle, this.heldAngle, part(t, 0, 0.24))
      if (this.model.kind === 'envelope') {
        const { seal, hinge, sheet } = this.model
        root.position.y = 0.23 - 0.8 * part(t, 0.35, 0.74)
        seal.scale.setScalar(1 - part(t, 0.16, 0.3))
        hinge.rotation.x = -Math.PI * 1.06 * part(t, 0.25, 0.53)
        sheet.position.y = T.MathUtils.lerp(-0.1, 1.52, part(t, 0.48, 0.89))
        sheet.position.z = T.MathUtils.lerp(0.014, 0.63, part(t, 0.7, 0.96))
        sheet.rotation.z = 0.12 * part(t, 0.59, 0.93)
        sheet.scale.setScalar(1 + 0.1 * part(t, 0.8, 1))
      } else {
        root.position.y = 0.23 + 0.25 * part(t, 0.2, 0.88)
        root.scale.setScalar(3.5 + 0.45 * part(t, 0.2, 0.88))
      }
      if (t < 1) return true
      this.phase = 'opened'
      this.notify?.('opened')
    }
    return false
  }
  render(renderer: T.WebGLRenderer) {
    if (!this.active) return
    renderer.autoClear = false
    renderer.clearDepth()
    renderer.render(this.foreground, this.camera)
    renderer.autoClear = true
  }
  close() {
    if (!this.active) return
    const { root } = this.model
    this.parent.add(root)
    root.position.copy(this.restPosition)
    root.quaternion.copy(this.restRotation)
    root.scale.setScalar(this.restScale)
    this.model.reset()
    this.phase = undefined
    this.notify = undefined
  }
  dispose() {
    this.close()
    this.shade.geometry.dispose()
    this.shade.material.dispose()
  }
}
