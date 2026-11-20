import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/600.css'
import '@fontsource/be-vietnam-pro/700.css'
import '@fontsource-variable/lora'
import '@fontsource-variable/lora/wght-italic.css'
import './style.css'
import { AudioManager, preference } from './audio'
import { ContentPanel } from './content'
import { icon } from './icons'
import { chapters, chapterMemories, tribute, type Memory, type Year } from './memories'
import type { SceneManager } from './scene'
import type { View } from './scene/camera'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <main class="experience" data-view="welcome">
    <div class="stage" id="stage" data-mode="loading" aria-label="Không gian phòng ký ức">
      <div id="scene"></div>
      <div class="stage-mid" id="stage-mid" aria-live="polite"></div>
    </div>
    <div class="hud-top">
      <button class="brand" id="brand" aria-label="Phòng ký ức, về màn chào">
        <span class="brand-icon">${icon('room', 22)}</span>
        <span><strong>Phòng ký ức</strong><small id="stage-label">ĐANG MỞ PHÒNG</small></span>
      </button>
      <div class="header-actions">
        <a class="hud-button" href="?che-do=doc" aria-label="Mở bản đọc" title="Mở bản đọc">${icon('book', 18)}</a>
        <button class="hud-button" id="motion" aria-label="Giảm chuyển động" title="Giảm chuyển động">${icon('motion', 19)}</button>
        <button class="hud-button" id="sound"></button>
      </div>
    </div>
    <section class="intro" id="intro-content" aria-labelledby="hero-title"></section>
    <nav class="hud-bottom" id="stage-controls" aria-label="Điều hướng phòng" hidden>
      <button class="hud-button" id="previous" aria-label="Góc nhìn trước">${icon('back', 18)}</button>
      <div class="chapter-dock">
        ${chapters.map(({ year, title, icon: symbol }) => `
          <button class="chapter" data-year="${year}" aria-label="Năm ${year}: ${title}" title="${title}">
            ${icon(symbol, 16)}<span>Năm ${year}</span>
          </button>
        `).join('')}
        <button class="chapter" id="open-letter" aria-label="Đọc thư gửi thầy cô" title="Thư gửi thầy cô">${icon('mail', 19)}</button>
      </div>
      <button class="hud-button" id="next" aria-label="Góc nhìn tiếp theo">${icon('arrow', 18)}</button>
    </nav>
    <section class="invitation" id="invitation" aria-labelledby="invitation-title" hidden>
      <div class="invitation-sheet">
        <span class="invitation-stamp">${icon('star', 18)} ĐẠI HỌC PHENIKAA · 20/11</span>
        <h2 id="invitation-title">Một lời mời<br><em>dành cho bạn.</em></h2>
        <div class="invitation-rule"></div>
        <p>Mời bạn bước vào căn phòng ký ức: nơi bốn năm học được lưu lại qua những tấm ảnh, mẩu giấy và lời muốn gửi đến thầy cô.</p>
        <p>Đi qua bốn mùa, mở từng kỷ niệm và cùng lắng nghe những câu chuyện của chúng mình.</p>
        <button class="primary invitation-yes" id="accept-invitation">Yes ${icon('arrow', 19)}</button>
      </div>
    </section>
    <div class="room-transition" id="room-transition" aria-hidden="true" hidden>
      <div class="transition-card">
        <span class="transition-mark">${icon('star', 21)} MỘT TRANG KÝ ỨC</span>
        <span class="transition-caption" id="transition-caption"></span>
        <span class="transition-rule"></span>
        <span class="transition-footnote">Chúng mình đã đi qua thêm một mùa…</span>
      </div>
    </div>
    <section class="inspect-hud" id="letter-inspect" aria-label="Xem kỷ niệm" hidden>
      <button class="hud-button inspect-close" id="put-letter-back" aria-label="Đặt kỷ niệm về chỗ cũ" title="Đặt về chỗ cũ">${icon('close', 19)}</button>
      <div class="inspect-actions">
        <p id="inspect-detail" role="status"></p>
        <button class="primary" id="unseal-letter">${icon('mail', 17)} Mở phong bì</button>
      </div>
    </section>
    <span id="announcement" class="sr-only" role="status"></span>
  </main>`

const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const intro = get('intro-content')
const experience = app.querySelector<HTMLElement>('.experience')!
const stage = get('stage')
const stageMid = get('stage-mid')
const announcement = get('announcement')
const chapterButtons = [...app.querySelectorAll<HTMLButtonElement>('.chapter')]
const audio = new AudioManager()
const sound = get<HTMLButtonElement>('sound')
const motion = get<HTMLButtonElement>('motion')
const mediaMotion = matchMedia('(prefers-reduced-motion: reduce)')
const views = [1, 2, 3, 4] as const
let view: View = 'welcome'
let boardFocused = false
let scene: SceneManager | undefined
let mode: 'loading' | 'scene' | 'reading' = 'loading'
let opened = false
let soundEnabled = false
let soundRequest = 0
let loadingAttempt = 0
let loadingTimer: number | undefined
let readingMessage = ''
let welcomeState: 'lifting' | 'sealed' | 'opening' | 'paper' | 'expanded' = 'lifting'
const invitation = get('invitation')
const transition = get('room-transition')
let changingRoom = false
let transitionTarget: { year: Year; focus: boolean } | undefined
let transitionTimers: number[] = []
let inspectionTrigger: HTMLElement | undefined
let inspectionMemory: Memory | undefined
const inspection = get('letter-inspect')
const putBack = get<HTMLButtonElement>('put-letter-back')
const unseal = get<HTMLButtonElement>('unseal-letter')
const roomControls = [intro, get('stage-controls'), app.querySelector<HTMLElement>('.hud-top')!]

const content = new ContentPanel(() => {
  opened = false
  scene?.closeInspection()
  scene?.go(boardFocused ? 'board' : view)
})

function reduced() { return mediaMotion.matches || preference('reduced') }
function setMotion() {
  const active = reduced()
  document.documentElement.toggleAttribute('data-reduced', active)
  motion.setAttribute('aria-pressed', String(active))
  motion.title = mediaMotion.matches ? 'Đang giảm chuyển động theo cài đặt thiết bị' : 'Giảm chuyển động'
  motion.setAttribute('aria-disabled', String(mediaMotion.matches))
  scene?.setReduced(active)
  if (active && changingRoom) finishRoomTransition()
}
setMotion()
mediaMotion.addEventListener('change', setMotion)
motion.addEventListener('click', () => {
  if (mediaMotion.matches) return
  preference('reduced', !reduced())
  setMotion()
})

function paintSound() {
  sound.innerHTML = icon(soundEnabled ? 'sound' : 'mute', 18)
  sound.setAttribute('aria-label', 'Âm thanh')
  sound.setAttribute('aria-pressed', String(soundEnabled))
  sound.title = soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'
}
paintSound()
async function setSound(active: boolean) {
  const request = ++soundRequest
  soundEnabled = active
  paintSound()
  const played = await audio.set(active)
  if (request !== soundRequest) return
  soundEnabled = played
  preference('sound', played)
  paintSound()
  if (!played && active) announcement.textContent = 'Không phát được âm thanh trên thiết bị này.'
}
sound.addEventListener('click', () => void setSound(!soundEnabled))

function renderIntro() {
  if (view === 'welcome') {
    intro.innerHTML = `
      <div class="eyebrow date">${icon('star', 13)} 20 THÁNG 11 · 2026</div>
      <h1 id="hero-title">Một <em>lá thư.</em></h1>
      <p class="hero-copy" id="welcome-instruction">Chạm vào phong bì để mở lời mời.</p>
      <button class="primary" id="start">${mode === 'reading' ? 'Đọc lời mời' : 'Mở phong bì'} ${icon('arrow', 20)}</button>`
    get('start').addEventListener('click', () => {
      if (mode === 'reading' || welcomeState === 'paper') return expandInvitation()
      scene?.openInspection()
    })
    updateWelcome()
    return
  }
  const chapter = chapters.find(({ year }) => year === view)
  intro.innerHTML = `
    ${mode === 'scene' ? `<button class="board-back" id="toggle-board">${boardFocused ? `${icon('back', 15)} Về toàn cảnh` : `${icon('image', 15)} Xem gần bảng ký ức`}</button>` : ''}
    <div class="eyebrow">PHÒNG 0${chapter?.year ?? 1} / NĂM 0${chapter?.year ?? 1}</div>
    <h1 id="hero-title" class="active-title" tabindex="-1">${chapter?.title ?? 'Bốn mùa ký ức'}</h1>
    ${chapter ? '<div class="memory-list" id="memory-list"></div>' : '<p class="hero-copy">Chọn một chương hoặc lá thư để khám phá.</p>'}`
  if (mode === 'scene') get('toggle-board').addEventListener('click', () => {
    if (boardFocused) leaveBoard()
    else if (typeof view === 'number') focusBoard(view)
  })
  if (!chapter) return
  const list = get('memory-list')
  const items = chapterMemories(chapter.year)
  for (const memory of items) {
    const button = document.createElement('button')
    button.className = 'memory-link'
    const name = document.createElement('span')
    name.textContent = memory.label ?? memory.title
    button.innerHTML = icon(memory.kind === 'photo' ? 'image' : memory.kind === 'note' ? 'mail' : 'star', 19)
    button.append(name)
    button.insertAdjacentHTML('beforeend', icon('arrow', 16))
    button.addEventListener('click', () => takeMemory(memory, button))
    list.append(button)
  }
  if (!items.length) list.textContent = 'Chưa có kỷ niệm được đăng cho chương này.'
}

function renderStage() {
  experience.dataset.view = typeof view === 'number' ? 'chapter' : view
  stage.dataset.mode = mode
  get('stage-label').textContent = mode === 'loading' ? 'ĐANG MỞ PHÒNG' : mode === 'reading' ? 'CHẾ ĐỘ ĐỌC' : 'KHÔNG GIAN 3D'
  get('stage-controls').hidden = view === 'welcome'
  get<HTMLButtonElement>('previous').disabled = view === 1 || view === 'welcome'
  get<HTMLButtonElement>('next').disabled = view === 4 || view === 'welcome'
  for (const button of chapterButtons) {
    if (Number(button.dataset.year) === view) button.setAttribute('aria-current', 'true')
    else button.removeAttribute('aria-current')
  }
  stageMid.classList.toggle('is-visible', mode !== 'scene')
  if (mode === 'loading') {
    stageMid.innerHTML = '<span class="loading-dot"></span><p>Đang chuẩn bị căn phòng…</p><button id="read-instead">Đọc nội dung không cần 3D</button>'
    get('read-instead').addEventListener('click', () => useReading('Bạn vẫn có thể mở đủ bốn chương và thư tri ân.'))
  } else if (mode === 'reading') {
    stageMid.innerHTML = `<div class="fallback-art" aria-hidden="true"><img alt="" src="${import.meta.env.BASE_URL}phong-ky-uc.webp"></div><div class="fallback-note"><p id="fallback-message"></p><button id="retry-3d">Thử mở lại 3D</button></div>`
    get('fallback-message').textContent = readingMessage
    get('retry-3d').addEventListener('click', () => void loadRoom())
  } else stageMid.replaceChildren()
}

function updateWelcome() {
  if (view !== 'welcome') return
  const button = get<HTMLButtonElement>('start')
  const instruction = get('welcome-instruction')
  if (!button || !instruction) return
  button.disabled = mode === 'loading' || (mode !== 'reading' && (welcomeState === 'lifting' || welcomeState === 'opening' || welcomeState === 'expanded'))
  if (welcomeState === 'paper') {
    instruction.textContent = 'Lá thư đã hé mở. Chạm vào tờ giấy để đọc.'
    button.innerHTML = `Đọc lá thư ${icon('arrow', 20)}`
  } else if (welcomeState === 'opening') instruction.textContent = 'Phong bì đang mở…'
  else if (mode === 'reading') button.innerHTML = `Đọc lời mời ${icon('arrow', 20)}`
}

function showWelcomeScene() {
  welcomeState = 'lifting'
  renderIntro()
  scene?.showWelcome((phase) => {
    if (phase === 'held') welcomeState = 'sealed'
    if (phase === 'opening') welcomeState = 'opening'
    if (phase === 'opened') welcomeState = 'paper'
    updateWelcome()
  }, expandInvitation)
}

function expandInvitation() {
  if (welcomeState === 'expanded') return
  welcomeState = 'expanded'
  invitation.hidden = false
  experience.dataset.invitation = 'expanded'
  get('accept-invitation').focus({ preventScroll: true })
}

get('accept-invitation').addEventListener('click', () => {
  invitation.hidden = true
  delete experience.dataset.invitation
  scene?.closeInspection()
  navigate(1, true)
})

function navigate(next: View, focus = false) {
  if (opened || inspectionTrigger || changingRoom) return
  if (typeof view === 'number' && typeof next === 'number' && view !== next && mode === 'scene' && !reduced()) {
    startRoomTransition(next, focus)
    return
  }
  applyView(next, focus)
}

function setRoomTransitionBusy(busy: boolean) {
  changingRoom = busy
  experience.toggleAttribute('data-transitioning', busy)
  for (const control of roomControls) control.inert = busy
}

function finishRoomTransition() {
  transitionTimers.forEach(window.clearTimeout)
  transitionTimers = []
  const target = transitionTarget
  transitionTarget = undefined
  if (target && view !== target.year) applyView(target.year)
  transition.hidden = true
  transition.classList.remove('is-visible', 'is-leaving')
  setRoomTransitionBusy(false)
  if (target?.focus) get('hero-title').focus({ preventScroll: true })
}

function startRoomTransition(year: Year, focus: boolean) {
  transitionTarget = { year, focus }
  transition.dataset.year = String(year)
  get('transition-caption').textContent = `Năm 0${year} · ${chapters[year - 1].title}`
  transition.hidden = false
  transition.classList.remove('is-leaving', 'is-visible')
  setRoomTransitionBusy(true)
  requestAnimationFrame(() => requestAnimationFrame(() => transition.classList.add('is-visible')))
  transitionTimers.push(window.setTimeout(() => {
    applyView(year)
    announcement.textContent = `Đã đến phòng năm ${year}, ${chapters[year - 1].title}.`
    transitionTimers.push(window.setTimeout(() => {
      transition.classList.add('is-leaving')
      transitionTimers.push(window.setTimeout(finishRoomTransition, 1100))
    }, 340))
  }, 1060))
}

function applyView(next: View, focus = false) {
  if (view === 'welcome' && next !== 'welcome' && audio.saved && !soundRequest) void setSound(true)
  boardFocused = false
  view = next
  renderIntro()
  renderStage()
  scene?.go(next)
  if (next === 'welcome' && mode === 'scene') showWelcomeScene()
  if (focus) get('hero-title').focus({ preventScroll: true })
}

function focusBoard(year: Year) {
  if (opened || inspectionTrigger || changingRoom || view !== year || boardFocused) return
  boardFocused = true
  scene?.go('board')
  renderIntro()
  announcement.textContent = `Đã phóng gần bảng kỷ niệm năm ${year}.`
}

function leaveBoard() {
  boardFocused = false
  scene?.go(view)
  renderIntro()
  get('toggle-board').focus({ preventScroll: true })
}

function setInspection(active: boolean) {
  inspection.hidden = !active
  experience.toggleAttribute('data-inspecting', active)
  for (const element of roomControls) element.inert = active
}

function takeMemory(memory: Memory, trigger: HTMLElement) {
  if (opened || inspectionTrigger || view === 'welcome') return
  if (!scene) {
    opened = true
    content.show(memory, trigger)
    return
  }
  inspectionTrigger = trigger
  inspectionMemory = memory
  setInspection(true)
  const envelope = memory === tribute
  inspection.setAttribute('aria-label', envelope ? 'Phong bì tri ân' : `Xem ${memory.title}`)
  unseal.innerHTML = `${icon(envelope ? 'mail' : 'book', 17)} ${envelope ? 'Mở phong bì' : 'Đọc lời nhắn'}`
  get('inspect-detail').textContent = envelope ? 'Đang nhấc phong bì lên…' : 'Đang nhấc kỷ niệm lên…'
  unseal.disabled = true
  putBack.focus({ preventScroll: true })
  scene.liftMemory(memory, (phase) => {
    if (phase === 'held') {
      get('inspect-detail').textContent = `Kéo để xoay 360°. Chạm lại vào ${envelope ? 'phong bì' : 'kỷ niệm'} để mở.`
      unseal.disabled = false
      unseal.focus({ preventScroll: true })
    } else if (phase === 'opening') {
      get('inspect-detail').textContent = envelope ? 'Đang mở phong bì…' : 'Đang mở kỷ niệm…'
      putBack.focus({ preventScroll: true })
      unseal.disabled = true
    } else if (phase === 'opened') finishInspection()
  }, boardFocused)
}

function finishInspection() {
  const trigger = inspectionTrigger
  const memory = inspectionMemory
  if (!trigger || !memory) return
  inspectionTrigger = undefined
  inspectionMemory = undefined
  setInspection(false)
  opened = true
  content.show(memory, trigger)
}

function cancelInspection() {
  const trigger = inspectionTrigger
  if (!trigger) return
  inspectionTrigger = undefined
  inspectionMemory = undefined
  scene?.closeInspection()
  scene?.go(boardFocused ? 'board' : view)
  setInspection(false)
  trigger.focus({ preventScroll: true })
}

putBack.addEventListener('click', cancelInspection)
unseal.addEventListener('click', () => scene?.openInspection())
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && boardFocused && !inspectionTrigger && !opened) {
    event.preventDefault()
    leaveBoard()
    return
  }
  if (!inspectionTrigger) return
  const rotations: Record<string, [number, number]> = {
    ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -30], ArrowDown: [0, 30],
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelInspection()
  } else if (Object.hasOwn(rotations, event.key)) {
    event.preventDefault()
    scene?.rotateInspection(...rotations[event.key])
  }
})

function step(offset: number) {
  const index = views.findIndex((item) => item === view)
  const next = views[index + offset]
  if (next) navigate(next, true)
}
get('previous').addEventListener('click', () => step(-1))
get('next').addEventListener('click', () => step(1))
get('brand').addEventListener('click', () => navigate('welcome'))
get('open-letter').addEventListener('click', () => takeMemory(tribute, get('open-letter')))
chapterButtons.forEach((button) => button.addEventListener('click', () => navigate(Number(button.dataset.year) as Year, true)))

function useReading(message: string) {
  if (changingRoom) finishRoomTransition()
  loadingAttempt++
  window.clearTimeout(loadingTimer)
  scene?.dispose()
  scene = undefined
  mode = 'reading'
  readingMessage = message
  boardFocused = false
  renderStage()
  if (inspectionTrigger) finishInspection()
  renderIntro()
}
async function loadRoom() {
  const attempt = ++loadingAttempt
  mode = 'loading'
  renderStage()
  loadingTimer = window.setTimeout(() => useReading('Tải phòng quá lâu. Bạn có thể tiếp tục ở chế độ đọc.'), 10000)
  try {
    const { SceneManager } = await import('./scene')
    if (attempt !== loadingAttempt) return
    scene = new SceneManager(get('scene'), () => view !== 'welcome' && !opened && !inspectionTrigger && !changingRoom, (target) => {
      if (target.memory === tribute) takeMemory(tribute, get('open-letter'))
      else if (target.memory) {
        const trigger = [...document.querySelectorAll<HTMLButtonElement>('.memory-link')]
          .find((button) => button.querySelector('span')?.textContent === (target.memory?.label ?? target.memory?.title)) ?? get('hero-title')
        takeMemory(target.memory, trigger)
      }
      else if (target.year) focusBoard(target.year)
    }, () => useReading('Không gian 3D bị gián đoạn. Bạn vẫn có thể đọc các kỷ niệm.'))
    setMotion()
    if (view === 'welcome') showWelcomeScene()
    else scene.go(view, opened)
    mode = 'scene'
    renderStage()
    if (view !== 'welcome') renderIntro()
    updateWelcome()
  } catch {
    if (attempt === loadingAttempt) useReading('Thiết bị chưa mở được không gian 3D. Chọn một chương bên dưới để đọc.')
  } finally {
    if (attempt === loadingAttempt) window.clearTimeout(loadingTimer)
  }
}
renderIntro()
if (new URLSearchParams(location.search).get('che-do') === 'doc') {
  useReading('Chọn một chương để xem ảnh và đọc kỷ niệm mà không cần 3D.')
} else void loadRoom()
