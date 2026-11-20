import * as T from 'three'
import { chapterMemories, tribute, type Memory, type Year } from '../memories'
import { boardCenters } from './camera'
import { createEnvelope } from './envelope'

export type Target = { memory?: Memory; year?: Year }
export const materials = new Map<string, T.MeshStandardMaterial>()
export const cube = new T.BoxGeometry()
const plane = new T.PlaneGeometry(1, 1)
const sphere = new T.SphereGeometry(1, 14, 10)
const cylinder = new T.CylinderGeometry(1, 1, 1, 24)
const potGeo = new T.CylinderGeometry(1, 0.72, 1, 24)
const textureLoader = new T.TextureLoader()

function mat(color: string) {
  if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: 0.83 }))
  return materials.get(color)!
}
function shape<M extends T.Material>(group: T.Object3D, geo: T.BufferGeometry, material: M, scale: number[], at: number[]) {
  const mesh = new T.Mesh(geo, material)
  mesh.scale.set(scale[0], scale[1], scale[2])
  mesh.position.set(at[0], at[1], at[2])
  group.add(mesh)
  return mesh
}
function box(group: T.Object3D, color: string, size: number[], at: number[]) {
  return shape(group, cube, mat(color), size, at)
}
function surface(group: T.Object3D, width: number, height: number, at: number[],
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = Math.round(512 * height / width)
  draw(canvas.getContext('2d')!, canvas.width, canvas.height)
  const map = new T.CanvasTexture(canvas)
  map.colorSpace = T.SRGBColorSpace
  map.anisotropy = 4
  const mesh = shape(group, plane, new T.MeshBasicMaterial({ map, transparent: true }), [width, height, 1], at)
  return mesh
}
function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, font: string, color: string) {
  ctx.fillStyle = color
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.fillText(value, x, y)
}
function wrapped(ctx: CanvasRenderingContext2D, message: string, maxWidth: number, x: number, y: number, lineHeight: number, limit: number) {
  const words = message.split(/\s+/)
  let line = '', lines = 0
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines++ * lineHeight)
      if (lines >= limit) return
      line = word
    } else line = next
  }
  if (line && lines < limit) ctx.fillText(line, x, y + lines * lineHeight)
}
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}
function floorShadow(group: T.Object3D, x: number, z: number, w: number, h: number, opacity: number) {
  const shadow = surface(group, w, h, [x, 0.044, z], (ctx, w, h) => {
    ctx.scale(w / 2, h / 2)
    const grad = ctx.createRadialGradient(1, 1, 0.15, 1, 1, 0.98)
    grad.addColorStop(0, `rgba(38,24,14,${opacity})`)
    grad.addColorStop(1, 'rgba(38,24,14,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 2, 2)
  })
  shadow.rotation.x = -Math.PI / 2
  shadow.material.depthWrite = false
}
function plant(root: T.Object3D, x: number, y: number, z: number, scale: number, color = '#b97553') {
  const g = new T.Group()
  root.add(g)
  g.position.set(x, y, z)
  g.scale.setScalar(scale)
  shape(g, potGeo, mat(color), [0.32, 0.42, 0.32], [0, 0.22, 0])
  shape(g, cylinder, mat('#543d29'), [0.29, 0.035, 0.29], [0, 0.436, 0])
  for (let i = 0; i < 10; i++) {
    const a = i * 2.399, height = 0.52 + i % 4 * 0.17, reach = i % 3 * 0.11 + 0.19
    const tip = new T.Vector3(Math.sin(a) * reach, height + 0.25, Math.cos(a) * reach)
    const start = new T.Vector3(0, 0.37, 0)
    const diff = tip.clone().sub(start)
    const stem = shape(g, cylinder, mat('#5e6542'), [0.014, diff.length(), 0.014], start.clone().addScaledVector(diff, 0.5).toArray())
    stem.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), diff.normalize())
    const leaf = shape(g, sphere, mat(['#657950', '#839365', '#505e40'][i % 3]), [0.093, 0.235, 0.036], tip.toArray())
    leaf.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), diff)
    leaf.rotateY(a)
  }
}
function landscape(ctx: CanvasRenderingContext2D, w: number, h: number, palette = 0) {
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, ['#789999', '#b79b82', '#9ba196', '#bba489'][palette])
  sky.addColorStop(1, '#f2d5a2')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#fbdfa5'
  ctx.beginPath(); ctx.arc(w * 0.72, h * 0.32, h * 0.143, 0, 2 * Math.PI); ctx.fill()
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = ['#a4a487', '#78866b', '#536f61'][layer]
    ctx.beginPath(); ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += w / 20) {
      ctx.lineTo(x, h * (0.58 + layer * 0.105) + Math.sin(x / w * 8 + layer * 2 + palette) * h * 0.115)
    }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill()
  }
}
function seasonOutside(ctx: CanvasRenderingContext2D, w: number, h: number, year: Year) {
  const skies: Record<Year, [string, string]> = {
    1: ['#a8d7d6', '#fff0ca'], 2: ['#6cbedb', '#fce3a1'],
    3: ['#92aba3', '#f4c794'], 4: ['#9db5c6', '#e6eef0'],
  }
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, skies[year][0]); sky.addColorStop(1, skies[year][1])
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = year === 4 ? '#f3f6ea' : '#fff3bf'
  ctx.beginPath(); ctx.arc(w * 0.75, h * 0.25, year === 2 ? h * 0.14 : h * 0.1, 0, Math.PI * 2); ctx.fill()
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = (year === 4
      ? ['#bdcfce', '#9dbab7', '#78989b']
      : year === 3
        ? ['#b8ad8f', '#927d66', '#676f5a']
        : ['#abd2b5', '#79aa95', '#547f76'])[layer]
    ctx.beginPath(); ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 12)
      ctx.lineTo(x, h * (0.59 + layer * 0.1) + Math.sin(x / w * 9 + layer * 1.8) * h * 0.11)
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill()
  }
  // A nearby branch gives the window a distinct silhouette in every season.
  ctx.lineCap = 'round'; ctx.strokeStyle = year === 4 ? '#5b5e5d' : '#6e6250'
  ctx.lineWidth = 16; ctx.beginPath()
  ctx.moveTo(-30, h * 0.38); ctx.bezierCurveTo(w * 0.14, h * 0.48, w * 0.25, h * 0.18, w * 0.54, h * 0.21); ctx.stroke()
  ctx.lineWidth = 7
  for (const [x, y, ex, ey] of [[0.18, 0.37, 0.19, 0.12], [0.35, 0.25, 0.39, 0.06], [0.44, 0.22, 0.58, 0.35]]) {
    ctx.beginPath(); ctx.moveTo(w * x, h * y); ctx.lineTo(w * ex, h * ey); ctx.stroke()
  }
  const rng = random(year * 7643)
  if (year === 1 || year === 3) {
    for (let i = 0; i < 82; i++) {
      const x = rng() * w * 0.66, y = rng() * h * 0.42
      ctx.fillStyle = year === 1
        ? ['#ffe2e6', '#f7aab9', '#fff2e6'][i % 3] : ['#e8aa51', '#bd6e3f', '#efc977'][i % 3]
      ctx.beginPath(); ctx.ellipse(x, y, year === 1 ? 7 : 9, 4, rng() * 3, 0, Math.PI * 2); ctx.fill()
    }
  }
  if (year === 2) {
    for (let i = 0; i < 95; i++) {
      const x = rng() * w * 0.63, y = rng() * h * 0.44
      ctx.fillStyle = ['#488c64', '#6db27d', '#a8c773'][i % 3]
      ctx.beginPath(); ctx.ellipse(x, y, 11, 5, rng() * 3, 0, Math.PI * 2); ctx.fill()
    }
  }
  if (year === 4) {
    ctx.strokeStyle = '#eff9f6'; ctx.lineWidth = 2
    for (let i = 0; i < 90; i++) {
      const x = rng() * w, y = rng() * h, r = 1.5 + rng() * 2.7
      ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke()
    }
  }
  if (year === 1) {
    // Two birds perched on the branch, rather than anonymous flying marks.
    for (const [x, y] of [[0.36, 0.22], [0.5, 0.19]]) {
      ctx.fillStyle = '#594d48'
      ctx.beginPath(); ctx.ellipse(w * x, h * y, 8, 11, -0.3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(w * x + 5, h * y - 8, 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#c58c53'; ctx.beginPath()
      ctx.moveTo(w * x + 9, h * y - 8); ctx.lineTo(w * x + 16, h * y - 6); ctx.lineTo(w * x + 9, h * y - 4); ctx.fill()
    }
  }
}
function poster(room: T.Group) {
  box(room, '#81503a', [1.61, 1.95, 0.12], [-3.55, 2.96, -2.91])
  surface(room, 1.45, 1.79, [-3.55, 2.96, -2.839], (ctx, w, h) => {
    ctx.fillStyle = '#f4dfb8'; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#b89969'; ctx.lineWidth = 3; ctx.strokeRect(24, 24, w - 48, h - 48)
    text(ctx, '✦', w / 2, 135, '65px Georgia', '#a6533e')
    text(ctx, '20/11', w / 2, 296, '132px Georgia', '#6b4636')
    text(ctx, 'GỬI THẦY CÔ', w / 2, 382, '33px Georgia', '#6b4636')
    text(ctx, '────────', w / 2, 459, '34px Georgia', '#a6533e')
    text(ctx, 'với lòng biết ơn', w / 2, 513, 'italic 34px Georgia', '#6b4636')
  })
}

function makeCard(group: T.Group, entry: Memory, targets: T.Object3D[], cards: Map<string, { kind: 'card'; root: T.Group; body: T.Mesh; reset: () => void }>, invalidate: () => void) {
  const first = entry.slot === 0
  const card = new T.Group()
  group.add(card)
  card.position.set(first ? -0.69 : 0.69, first ? -0.065 : -0.13, 0.105)
  card.scale.setScalar(1.24)
  card.rotation.z = first ? 0.075 : -0.1
  const photo = entry.kind === 'photo'
  const halo = surface(card, 1.2, 1.05, [0, 0, -0.005], (ctx, w, h) => {
    const glow = ctx.createRadialGradient(w / 2, h / 2, w * 0.21, w / 2, h / 2, w * 0.48)
    glow.addColorStop(0, 'rgba(255,227,157,0.9)')
    glow.addColorStop(0.65, 'rgba(255,211,132,0.43)')
    glow.addColorStop(1, 'rgba(255,211,132,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)
  })
  halo.material.opacity = 0
  halo.material.blending = T.AdditiveBlending
  halo.material.depthWrite = false
  card.userData.hoverGlow = halo
  const paper = box(card, photo ? '#f6e9ca' : first ? '#e6cc94' : '#e5bca5', [0.94, 0.79, 0.035], [0, 0, 0])
  paper.userData.target = { memory: entry } satisfies Target
  targets.push(paper)
  if (photo) {
    const art = surface(card, 0.81, 0.55, [0, 0.055, 0.021], (ctx, w, h) => landscape(ctx, w, h, ((entry.year ?? 1) + entry.slot - 1) % 4))
    surface(card, 0.84, 0.11, [0, -0.32, 0.021], (ctx, w, h) => {
      text(ctx, entry.title, w / 2, h * 0.74, 'italic 34px Georgia', '#805f48')
    })
    if (entry.photo?.thumbnail) {
      textureLoader.load(entry.photo.thumbnail, (map) => {
        if (art.userData.disposed) { map.dispose(); return }
        const aspect = map.image.width / map.image.height
        if (aspect > 0.81 / 0.55) art.scale.y = 0.81 / aspect
        else art.scale.x = 0.55 * aspect
        map.colorSpace = T.SRGBColorSpace
        art.material.map?.dispose()
        art.material.map = map
        art.material.needsUpdate = true
        invalidate()
      }, undefined, () => { /* Keep the illustration if the thumbnail fails. */ })
    }
  } else {
    surface(card, 0.76, 0.57, [0, -0.025, 0.021], (ctx, w, h) => {
      if (entry.kind === 'pending') {
        text(ctx, '✧', w / 2, h * 0.65, '140px Georgia', '#916955')
        return
      }
      text(ctx, entry.title, w / 2, 83, 'italic 36px Georgia', '#794b3b')
      if (entry.recipient) text(ctx, entry.recipient, w / 2, 124, '26px Georgia', '#794b3b')
      ctx.fillStyle = '#795e4c'
      ctx.font = '24px Georgia'
      ctx.textAlign = 'left'
      wrapped(ctx, entry.previewText ?? entry.body?.join(' ') ?? 'Nội dung đang chờ bổ sung.', w - 88, 44, entry.recipient ? 167 : 154, 35, 5)
    })
  }
  shape(group, sphere, mat(first ? '#8f4e37' : '#697554'), [0.05, 0.05, 0.028], [card.position.x + 0.03, card.position.y + 0.48, 0.15])
  card.userData.target = paper.userData.target
  const back = surface(card, 0.89, 0.74, [0, 0, -0.021], (ctx, w, h) => {
    ctx.fillStyle = photo ? '#efe1c5' : '#e7c99b'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#b9986c'
    ctx.lineWidth = 3
    ctx.strokeRect(20, 20, w - 40, h - 40)
    text(ctx, `NĂM 0${entry.year ?? 1}`, w / 2, h / 2, '35px Georgia', '#7c5944')
  })
  back.rotation.y = Math.PI
  cards.set(entry.id, { kind: 'card', root: card, body: paper, reset: () => {} })
}
function memoryBoard(room: T.Group, year: Year, targets: T.Object3D[], cards: Map<string, { kind: 'card'; root: T.Group; body: T.Mesh; reset: () => void }>, invalidate: () => void) {
  const [x, y] = boardCenters[year]
  const board = new T.Group()
  board.position.set(x, y, -2.91)
  room.add(board)
  const frame = box(board, '#724b34', [3.39, 2.28, 0.15], [0, 0, 0])
  frame.userData.target = { year } satisfies Target
  targets.push(frame)
  surface(board, 3.24, 2.13, [0, 0, 0.08], (ctx, w, h) => {
    const rand = random(year)
    ctx.fillStyle = '#b9855d'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = rand() > 0.5 ? '#56382332' : '#fff2c944'
      ctx.fillRect(rand() * w, rand() * h, rand() * 4 + 1, rand() * 3 + 1)
    }
    ctx.fillStyle = '#e5ce9c'; ctx.fillRect(181, 16, 150, 42)
    text(ctx, `NĂM 0${year}`, w / 2, 46, 'bold 25px Georgia', '#604433')
  })
  chapterMemories(year).forEach((entry) => makeCard(board, entry, targets, cards, invalidate))
}

function windowWall(room: T.Group, year: Year) {
  const g = new T.Group()
  g.position.set(4.74, 2.84, -0.63)
  g.rotation.y = -Math.PI / 2
  room.add(g)
  box(g, '#78816b', [3.27, 2.9, 0.15], [0, 0, 0])
  surface(g, 3.02, 2.65, [0, 0, 0.085], (ctx, w, h) => seasonOutside(ctx, w, h, year))
  const frame = '#ead6ac'
  for (const x of [-1.54, 0, 1.54]) box(g, frame, [0.1, 2.73, 0.15], [x, 0, 0.12])
  for (const y of [-1.34, 0, 1.34]) box(g, frame, [3.17, 0.1, 0.15], [0, y, 0.12])
  box(g, '#b69067', [3.46, 0.14, 0.63], [0, -1.42, 0.25])
  box(g, '#754b33', [3.55, 0.065, 0.065], [0, 1.54, 0.31])
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const fold = shape(g, cylinder, mat(i % 2 ? '#c5ab7d' : '#e0c798'), [0.09, 2.39 - i * 0.08, 0.06],
        [side * (1.52 - i * 0.073), 0.3 + i * 0.04, 0.29 + (i % 2) * 0.044])
      fold.rotation.z = side * (i * -0.012)
    }
  }
  const particleCount = 26
  const positions = new Float32Array(particleCount * 3)
  const seed = random(year * 2026)
  const origins = Array.from({ length: particleCount }, () => ({
    x: seed() * 2.8 - 1.4, y: seed() * 2.32 - 1.16, speed: 0.55 + seed() * 0.7,
  }))
  const geometry = new T.BufferGeometry()
  geometry.setAttribute('position', new T.BufferAttribute(positions, 3))
  const flakes = new T.Points(geometry, new T.PointsMaterial({
    color: ({ 1: '#ffe4e5', 2: '#fff1a8', 3: '#efb26c', 4: '#f4fbff' } as Record<Year, string>)[year],
    size: year === 4 ? 3.8 : 3.2, sizeAttenuation: false, transparent: true, opacity: 0.82,
    depthWrite: false,
  }))
  g.add(flakes)
  const updateWeather = (time: number) => {
    for (let i = 0; i < particleCount; i++) {
      const origin = origins[i]
      const drift = time * (year === 2 ? 0.00008 : 0.00018) * origin.speed
      positions[i * 3] = origin.x + Math.sin(time * 0.0008 + i * 2) * 0.13
      positions[i * 3 + 1] = ((origin.y + (year === 2 ? drift : -drift) + 12.5) % 2.5 + 2.5) % 2.5 - 1.25
      positions[i * 3 + 2] = 0.106
    }
    geometry.attributes.position.needsUpdate = true
  }
  updateWeather(0)
  return { window: g, updateWeather }
}

export function buildRoom(room: T.Group, year: Year, invalidate: () => void) {
  const targets: T.Object3D[] = []
  const cards = new Map<string, { kind: 'card'; root: T.Group; body: T.Mesh; reset: () => void }>()
  box(room, '#694a34', [9.84, 0.32, 6.36], [0, -0.16, 0])
  box(room, '#c9a273', [9.74, 0.09, 6.26], [0, -0.015, 0])
  const woody = ['#aa7552', '#b4825e', '#c08d63', '#b78059', '#ac7d57', '#bf9369']
  for (let row = 0; row < 14; row++) {
    for (let i = 0; i < 5; i++) {
      const offset = row % 2 ? 0.9 : 0
      const start = Math.max(-4.82, -4.82 + i * 2.22 - offset)
      const end = Math.min(4.82, -4.82 + (i + 1) * 2.22 - offset)
      box(room, woody[(row * 7 + i * 11) % woody.length], [end - start - 0.016, 0.022, 0.426],
        [(start + end) / 2, 0.031, -2.87 + row * 0.442])
    }
  }
  box(room, '#e7c5a1', [9.76, 4.72, 0.2], [0, 2.36, -3.02])
  box(room, '#a3ab88', [0.2, 4.72, 6.17], [4.86, 2.36, 0])
  box(room, '#f0d4ad', [9.8, 0.095, 0.25], [0, 4.73, -3.015])
  box(room, '#c3c39e', [0.26, 0.095, 6.2], [4.85, 4.73, 0])
  box(room, '#9d7957', [9.62, 0.26, 0.095], [0, 0.15, -2.89])
  box(room, '#858361', [0.11, 0.26, 6.1], [4.72, 0.15, 0])
  box(room, '#c7a17b', [9.62, 0.05, 0.065], [0, 0.31, -2.89])
  poster(room)
  memoryBoard(room, year, targets, cards, invalidate)
  const { window, updateWeather } = windowWall(room, year)

  const rug = surface(room, 4.95, 2.85, [0.28, 0.051, 0.92], (ctx, w, h) => {
    ctx.fillStyle = '#9b624e'; ctx.fillRect(12, 14, w - 24, h - 28)
    ctx.strokeStyle = '#d1a67e'; ctx.lineWidth = 2
    ctx.strokeRect(24, 25, w - 48, h - 50); ctx.strokeRect(31, 32, w - 62, h - 64)
    ctx.strokeStyle = '#d4a781aa'
    for (let i = 21; i < w - 20; i += 6) {
      ctx.beginPath(); ctx.moveTo(i, 6); ctx.lineTo(i, 14); ctx.moveTo(i, h - 14); ctx.lineTo(i, h - 6); ctx.stroke()
    }
    for (let i = -2; i <= 2; i++) {
      const x = w / 2 + i * 72, y = h / 2
      ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x + 35, y); ctx.lineTo(x, y + 60); ctx.lineTo(x - 35, y); ctx.closePath(); ctx.stroke()
    }
  })
  rug.rotation.x = -Math.PI / 2
  floorShadow(room, -2.95, 0.99, 3.7, 2.9, 0.38)
  floorShadow(room, 3.52, -1.76, 2.2, 1.7, 0.36)
  floorShadow(room, -4.11, -1.76, 1.4, 1.3, 0.34)

  const table = new T.Group()
  room.add(table)
  table.position.set(-2.95, 0, 1)
  shape(table, cylinder, mat('#8b5436'), [1.22, 0.15, 0.79], [0, 1.35, 0])
  shape(table, cylinder, mat('#bd8456'), [1.22, 0.045, 0.79], [0, 1.445, 0])
  for (const x of [-0.77, 0.77]) for (const z of [-0.43, 0.43]) {
    const leg = box(table, '#805036', [0.135, 1.29, 0.135], [x, 0.69, z])
    leg.rotation.z = Math.sign(x) * 0.095
    leg.rotation.x = -Math.sign(z) * 0.095
  }
  const envelopeDock = new T.Group()
  table.add(envelopeDock)
  envelopeDock.position.set(0.27, 1.51, 0.14)
  envelopeDock.rotation.y = -0.25
  const aura = surface(envelopeDock, 1.85, 1.35, [0, -0.023, 0], (ctx, w, h) => {
    const glow = ctx.createRadialGradient(w / 2, h / 2, 12, w / 2, h / 2, w * 0.49)
    glow.addColorStop(0, 'rgba(255,226,148,0.95)')
    glow.addColorStop(0.34, 'rgba(255,196,103,0.6)')
    glow.addColorStop(0.7, 'rgba(255,177,76,0.18)')
    glow.addColorStop(1, 'rgba(255,177,76,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)
  })
  aura.rotation.x = -Math.PI / 2
  aura.material.blending = T.AdditiveBlending
  aura.material.depthWrite = false
  const warmLight = new T.PointLight('#ffcf85', 0.75, 2.1, 2)
  warmLight.position.y = 0.22
  envelopeDock.add(warmLight)
  const envelope = createEnvelope()
  envelope.root.rotation.x = -Math.PI / 2
  envelope.root.scale.setScalar(0.308)
  envelopeDock.add(envelope.root)
  envelope.body.userData.target = { memory: tribute } satisfies Target
  targets.push(envelope.body)
  for (const [i, color] of ['#765740', '#9e6b57', '#75866c'].entries()) {
    const book = box(table, color, [0.49, 0.071, 0.35], [-0.63, 1.505 + i * 0.072, -0.1])
    book.rotation.y = i * 0.16 - 0.2
    box(book, '#d8bc91', [0.92, 0.66, 0.94], [0, 0, 0.048])
  }
  plant(room, -4.11, 0.04, -1.76, 0.84, '#9c6d52')
  plant(room, 3.58, 0.04, -1.77, 1.47)
  plant(table, -0.53, 1.47, -0.44, 0.41, '#d6bb8f')
  return { targets, envelope, cards, window, updateWeather }
}
