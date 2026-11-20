import * as T from 'three'
import { CameraController, type View } from './camera'
import { buildRoom, materials, type Target } from './room'
import { createEnvelope, LetterInspection, type Envelope, type Inspectable, type LetterPhase } from './envelope'
import type { Memory, Year } from '../memories'

export class SceneManager {
  private renderer: T.WebGLRenderer
  private scene = new T.Scene()
  private room = new T.Group()
  private rooms = new Map<Year, { root: T.Group; window: T.Group; updateWeather: (time: number) => void; targets: T.Object3D[]; envelope: Envelope; cards: Map<string, Extract<Inspectable, { kind: 'card' }>>; solids: T.Object3D[] }>()
  private currentYear: Year = 1
  private camera = new CameraController()
  private targets: T.Object3D[] = []
  private solids: T.Object3D[] = []
  private observer: ResizeObserver
  private weatherTimer: number
  private envelope?: Envelope
  private welcomeEnvelope = createEnvelope('welcome')
  private cards = new Map<string, Extract<Inspectable, { kind: 'card' }>>()
  private inspection?: LetterInspection
  private onWelcomePaper?: () => void
  private paperDown = false
  private pendingWelcomeTap = false
  private request = 0
  private ray = new T.Raycaster()
  private pointer = new T.Vector2()
  private down?: { x: number; y: number }
  private drag?: { id: number; x: number; y: number; moved: boolean }
  private onLetterPhase?: (phase: LetterPhase) => void
  private hovered?: T.Group
  private hoverStates = new Map<T.Group, { position: T.Vector3; scale: number; value: number; target: number; glow?: T.Mesh }>()
  private lastFrame = 0

  constructor(private host: HTMLElement, private canPick: () => boolean,
    private select: (target: Target) => void, private failed: () => void) {
    this.renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    this.renderer.setClearColor(0, 0)
    this.renderer.outputColorSpace = T.SRGBColorSpace
    this.renderer.toneMapping = T.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.13
    this.scene.add(this.welcomeEnvelope.root, new T.HemisphereLight('#fff2d9', '#91735e', 2))
    const sun = new T.DirectionalLight('#ffe3b6', 2.45)
    sun.position.set(2, 7, 5)
    const fill = new T.DirectionalLight('#cadfd4', 0.55)
    fill.position.set(-5, 3, 0)
    this.scene.add(sun, fill)
    const canvas = this.renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    host.append(canvas)
    canvas.addEventListener('webglcontextlost', this.contextLost)
    canvas.addEventListener('pointerdown', this.pointerDown)
    canvas.addEventListener('pointerup', this.pointerUp)
    canvas.addEventListener('pointercancel', this.pointerCancel)
    canvas.addEventListener('lostpointercapture', this.pointerCancel)
    canvas.addEventListener('pointermove', this.pointerMove)
    canvas.addEventListener('pointerleave', () => this.setHovered())
    this.observer = new ResizeObserver(this.resize)
    this.observer.observe(host)
    this.weatherTimer = window.setInterval(() => {
      if (!this.room.visible || !this.rooms.has(this.currentYear) || this.camera.reduced) return
      this.rooms.get(this.currentYear)?.updateWeather(performance.now())
      this.invalidate()
    }, 60)
    this.resize()
  }

  get moving() { return this.camera.moving }
  setReduced(reduced: boolean) {
    this.camera.reduced = reduced
    if (reduced) {
      if (this.moving) this.camera.finish()
      this.invalidate()
    }
  }
  go(view: View, detail = false) {
    this.setHovered()
    this.renderer.domElement.style.cursor = ''
    if (typeof view === 'number') this.activateRoom(view)
    else this.room.visible = view !== 'welcome'
    this.camera.go(view, detail)
    this.invalidate()
  }
  private activateRoom(year: Year) {
    let variant = this.rooms.get(year)
    if (!variant) {
      const root = new T.Group()
      const { targets, envelope, cards, window, updateWeather } = buildRoom(root, year, this.invalidate)
      const solids: T.Object3D[] = []
      root.traverse((object) => {
        if (object instanceof T.Mesh && object.material instanceof T.MeshStandardMaterial) solids.push(object)
      })
      this.scene.add(root)
      this.layoutRoom(root, window, this.host.clientWidth / this.host.clientHeight)
      root.updateMatrixWorld(true)
      variant = { root, window, updateWeather, targets, envelope, cards, solids }
      this.rooms.set(year, variant)
    }
    this.room.visible = false
    this.room = variant.root
    this.room.visible = true
    this.currentYear = year
    this.targets = variant.targets
    this.envelope = variant.envelope
    this.cards = variant.cards
    this.solids = variant.solids
  }
  private layoutRoom(root: T.Group, window: T.Group, aspect: number) {
    const narrow = aspect < 0.75
    root.scale.x = narrow ? 0.46 : 1
    window.position.set(narrow ? 2.95 : 4.74, 2.84, narrow ? -2.82 : -0.63)
    window.rotation.y = narrow ? 0 : -Math.PI / 2
    window.scale.set(narrow ? 0.64 : 1, narrow ? 0.78 : 1, 1)
  }
  showWelcome(onPhase: (phase: LetterPhase) => void, onPaper: () => void) {
    this.onWelcomePaper = onPaper
    this.room.visible = false
    this.welcomeEnvelope.root.visible = true
    this.inspection = new LetterInspection(this.welcomeEnvelope)
    this.inspection.resize(this.host.clientWidth / this.host.clientHeight)
    this.onLetterPhase = onPhase
    this.inspection.lift(this.camera.camera, (phase) => {
      if (phase === 'held' || phase === 'opened') this.renderer.domElement.style.cursor = 'pointer'
      this.onLetterPhase?.(phase)
      if (phase === 'held' && this.pendingWelcomeTap) {
        this.pendingWelcomeTap = false
        this.openInspection()
      }
    })
    this.invalidate()
  }
  liftMemory(memory: Memory, notify: (phase: LetterPhase) => void, stayOnBoard = false) {
    const model = memory.id === 'tribute' ? this.envelope : this.cards.get(memory.id)
    if (!model || this.inspection) return
    this.resetHover()
    this.inspection = new LetterInspection(model)
    this.inspection.resize(this.host.clientWidth / this.host.clientHeight)
    this.onLetterPhase = notify
    this.inspection.lift(this.camera.camera, (phase) => {
      if (phase === 'held') this.renderer.domElement.style.cursor = 'grab'
      this.onLetterPhase?.(phase)
    })
    this.go(stayOnBoard && memory.year ? 'board' : memory.year ?? 'letter')
  }
  private setHovered(memory?: Memory) {
    const model = memory && (memory.id === 'tribute' ? this.envelope : this.cards.get(memory.id))
    const root = model?.root
    if (root === this.hovered) return
    if (this.hovered) this.hoverStates.get(this.hovered)!.target = 0
    this.hovered = root
    if (root) {
      let state = this.hoverStates.get(root)
      if (!state) {
        state = {
          position: root.position.clone(), scale: root.scale.x, value: 0, target: 0,
          glow: root.userData.hoverGlow as T.Mesh | undefined,
        }
        this.hoverStates.set(root, state)
      }
      state.target = 1
    }
    this.invalidate()
  }
  private resetHover() {
    this.hovered = undefined
    for (const [root, state] of this.hoverStates) {
      state.target = state.value = 0
      root.position.copy(state.position)
      root.scale.setScalar(state.scale)
      if (state.glow) (state.glow.material as T.MeshBasicMaterial).opacity = 0
    }
    // Inspection owns the object's transform while it is lifted. A stale hover
    // state must not write the docked position/scale over the held object.
    this.hoverStates.clear()
  }
  private updateHover(time: number) {
    const dt = Math.min(50, time - (this.lastFrame || time))
    this.lastFrame = time
    let animating = false
    for (const [root, state] of this.hoverStates) {
      state.value = this.camera.reduced ? state.target : T.MathUtils.lerp(state.value, state.target, Math.min(1, dt / 150))
      if (Math.abs(state.value - state.target) < 0.004) state.value = state.target
      else animating = true
      root.scale.setScalar(state.scale * (1 + state.value * 0.09))
      root.position.copy(state.position)
      if (root.userData.hoverGlow) root.position.z += state.value * 0.045
      else root.position.y += state.value * 0.034
      if (state.glow) (state.glow.material as T.MeshBasicMaterial).opacity = state.value * 0.85
    }
    return animating
  }
  rotateInspection(x: number, y: number) {
    this.inspection?.rotate(x, y)
    this.invalidate()
  }
  openInspection() {
    if (!this.inspection?.open()) return
    this.renderer.domElement.style.cursor = ''
    this.onLetterPhase?.('opening')
    this.invalidate()
  }
  closeInspection() {
    this.drag = undefined
    const wasWelcome = Boolean(this.onWelcomePaper)
    this.onLetterPhase = undefined
    this.onWelcomePaper = undefined
    this.paperDown = false
    this.pendingWelcomeTap = false
    this.renderer.domElement.style.cursor = ''
    this.inspection?.dispose()
    this.inspection = undefined
    if (wasWelcome) this.welcomeEnvelope.root.visible = false
    this.invalidate()
  }
  private invalidate = () => {
    if (!this.request) this.request = requestAnimationFrame(this.render)
  }
  private render = (time: number) => {
    this.request = 0
    this.camera.update(time)
    const hovering = this.updateHover(time)
    this.renderer.render(this.scene, this.camera.camera)
    const inspectionMoving = this.inspection?.update(time, this.camera.reduced)
    this.inspection?.render(this.renderer)
    if (this.moving || inspectionMoving || hovering) this.invalidate()
  }
  private resize = () => {
    const { clientWidth: width, clientHeight: height } = this.host
    if (!width || !height) return
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 560 ? 1.5 : 1.75, Math.sqrt(3_000_000 / (width * height))))
    this.renderer.setSize(width, height, false)
    this.camera.resize(width, height)
    for (const { root, window } of this.rooms.values()) this.layoutRoom(root, window, width / height)
    this.inspection?.resize(width / height)
    this.invalidate()
  }
  private point(event: PointerEvent) {
    const bounds = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(
      (event.clientX - bounds.left) / bounds.width * 2 - 1,
      -(event.clientY - bounds.top) / bounds.height * 2 + 1,
    )
    return this.pointer
  }
  private pick(event: PointerEvent): Target | undefined {
    if (!this.canPick() || this.moving) return
    this.point(event)
    this.ray.setFromCamera(this.pointer, this.camera.camera)
    if (!this.ray.intersectObjects(this.targets, false).length) return
    const object = this.ray.intersectObjects(this.solids, false)[0]?.object
    return object?.userData.target ?? object?.parent?.userData.target
  }
  private pointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return
    if (this.onWelcomePaper && this.inspection?.hitPaper(this.point(event), this.ray)) {
      this.paperDown = true
      return
    }
    if (this.onWelcomePaper && this.inspection?.lifting) {
      this.down = { x: event.clientX, y: event.clientY }
      return
    }
    if (this.inspection?.active) {
      if (!this.inspection.hit(this.point(event), this.ray)) return
      this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
      this.renderer.domElement.setPointerCapture(event.pointerId)
      this.renderer.domElement.style.cursor = 'grabbing'
    } else this.down = { x: event.clientX, y: event.clientY }
  }
  private pointerCancel = (event: PointerEvent) => {
    this.down = undefined
    this.paperDown = false
    if (this.drag?.id === event.pointerId) this.drag = undefined
    if (this.inspection?.held) this.renderer.domElement.style.cursor = 'grab'
  }
  private pointerUp = (event: PointerEvent) => {
    if (this.paperDown) {
      this.paperDown = false
      if (this.inspection?.hitPaper(this.point(event), this.ray)) this.onWelcomePaper?.()
      return
    }
    if (this.onWelcomePaper && this.inspection?.lifting) {
      const down = this.down
      this.down = undefined
      if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) < 10) this.pendingWelcomeTap = true
      return
    }
    if (this.inspection?.active) {
      const drag = this.drag
      if (!drag || drag.id !== event.pointerId) return
      this.drag = undefined
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) <= 7) this.openInspection()
      else this.renderer.domElement.style.cursor = 'grab'
      return
    }
    const down = this.down
    this.down = undefined
    if (!down || !event.isPrimary || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 10) return
    const target = this.pick(event)
    if (target) this.select(target)
  }
  private pointerMove = (event: PointerEvent) => {
    if (this.inspection?.active) {
      const drag = this.drag
      if (drag?.id === event.pointerId) {
        const x = event.clientX - drag.x, y = event.clientY - drag.y
        if (!drag.moved && Math.hypot(x, y) <= 7) return
        drag.moved = true
        drag.x = event.clientX
        drag.y = event.clientY
        this.rotateInspection(x, y)
      } else if (event.pointerType === 'mouse') {
        this.renderer.domElement.style.cursor = this.onWelcomePaper && this.inspection.hitPaper(this.point(event), this.ray) ? 'pointer'
          : this.inspection.hit(this.point(event), this.ray) ? 'grab' : ''
      }
      return
    }
    if (event.pointerType === 'mouse') {
      const target = this.pick(event)
      this.setHovered(target?.memory)
      this.renderer.domElement.style.cursor = target ? 'pointer' : ''
    }
  }
  private contextLost = (event: Event) => {
    event.preventDefault()
    this.failed()
  }
  dispose() {
    this.closeInspection()
    this.resetHover()
    cancelAnimationFrame(this.request)
    window.clearInterval(this.weatherTimer)
    this.observer.disconnect()
    const geometries = new Set<T.BufferGeometry>()
    const allMaterials = new Set<T.Material>()
    for (const root of [...[...this.rooms.values()].map(({ root }) => root), this.welcomeEnvelope.root]) {
      root.traverse((object) => {
        object.userData.disposed = true
        if (object instanceof T.Points) {
          geometries.add(object.geometry)
          allMaterials.add(object.material)
          return
        }
        if (!(object instanceof T.Mesh)) return
        geometries.add(object.geometry)
        allMaterials.add(object.material)
      })
    }
    geometries.forEach((geometry) => geometry.dispose())
    allMaterials.forEach((material) => {
      if (material instanceof T.MeshBasicMaterial) material.map?.dispose()
      material.dispose()
    })
    materials.clear()
    this.renderer.domElement.remove()
    this.renderer.dispose()
  }
}
