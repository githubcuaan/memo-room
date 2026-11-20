import { icon } from './icons'
import { narrators, preview, stories, type Memory, type Photo, type Story } from './memories'
import xoaNhom from '../assets/xoaNhom.jpg'

function node<K extends keyof HTMLElementTagNameMap>(tag: K, value?: string, className?: string) {
  const element = document.createElement(tag)
  if (value) element.textContent = value
  if (className) element.className = className
  return element
}
function picture(photo: Photo) {
  const figure = node('figure')
  const image = node('img')
  image.alt = photo.alt
  image.decoding = 'async'
  image.addEventListener('error', () => image.replaceWith(node('p', 'Không tải được ảnh này.', 'empty-photo')), { once: true })
  image.src = photo.src
  figure.append(image)
  if (photo.caption) figure.append(node('figcaption', photo.caption))
  return figure
}

export class ContentPanel {
  readonly dialog: HTMLDialogElement
  private body: HTMLElement
  private returnFocus?: HTMLElement
  get open() { return this.dialog.open }
  constructor(onClose: () => void) {
    this.dialog = node('dialog', undefined, 'reader')
    this.dialog.setAttribute('aria-labelledby', 'reader-title')
    this.dialog.innerHTML = `<div class="reader-inner">
      <button class="icon-button close-reader" aria-label="Đóng nội dung" autofocus>${icon('close')}</button>
      <div class="reader-body"></div>
    </div>`
    this.body = this.dialog.querySelector('.reader-body')!
    this.dialog.querySelector('button')!.addEventListener('click', () => this.dialog.close())
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog) this.dialog.close()
    })
    this.dialog.addEventListener('close', () => {
      onClose()
      this.returnFocus?.focus({ preventScroll: true })
    })
    document.body.append(this.dialog)
  }
  show(memory: Memory, trigger: HTMLElement) {
    this.returnFocus = trigger
    const photoNote = memory.kind === 'photo'
    this.dialog.dataset.kind = photoNote ? 'note' : memory.kind
    const feature = memory.id === 'y1-photo' ? 'lam' : memory.id === 'y3-note-c' ? 'dung' : memory.id === 'y4-photo' ? 'tuan' : undefined
    if (feature || memory.id === 'y2-photo-a') this.dialog.dataset.feature = feature ?? 'hung'
    else delete this.dialog.dataset.feature
    const heading = node('h2', memory.noteTitle ?? memory.title)
    heading.id = 'reader-title'
    this.body.replaceChildren(node('div', memory.year ? `CHƯƠNG 0${memory.year} / ${photoNote ? 'LỜI NHẮN' : memory.kind === 'photo' ? 'ẢNH' : 'KỶ NIỆM'}` : '20/11 / LỜI TRI ÂN', 'eyebrow'), heading)
    if (memory.recipient) this.body.append(node('p', memory.recipient, 'recipient'))
    for (const paragraph of memory.body ?? []) this.body.append(node('p', paragraph))
    const related = photoNote ? [] : stories.filter((story) => story.memoryId === memory.id && (preview || !story.sample))
    if (related.length) this.body.append(this.storyPicker(related))
    else if (!memory.body?.length) {
      this.body.append(node('p', memory.kind === 'pending' ? 'Vị trí này được giữ lại cho một kỷ niệm sẽ bổ sung sau.' : photoNote ? 'Lời nhắn đang chờ bổ sung.' : 'Nội dung kỷ niệm sẽ được bổ sung sau.', 'quiet'))
    }
    this.dialog.querySelector('.teacher-portrait')?.remove()
    this.dialog.querySelector('.hung-photo')?.remove()
    if (feature) {
      const portrait = node('div', undefined, `teacher-portrait ${feature}-portrait`)
      const image = node('img')
      image.src = `${import.meta.env.BASE_URL}anh/thay-${feature}.webp`
      image.alt = `Chân dung thầy ${feature === 'lam' ? 'Phạm Tiến Lâm' : feature === 'dung' ? 'Phạm Trung Dũng' : 'Nguyễn Kim Tuấn'}`
      if (feature === 'lam') {
        const flames = node('div', undefined, 'lam-flames')
        flames.setAttribute('aria-hidden', 'true')
        for (let i = 0; i < 9; i++) {
          const flame = node('span', undefined, 'lam-flame')
          flame.style.setProperty('--i', String(i))
          flames.append(flame)
        }
        portrait.append(flames, image)
      } else if (feature === 'tuan') {
        const network = node('div', undefined, 'tuan-network')
        network.setAttribute('aria-hidden', 'true')
        network.innerHTML = `<svg viewBox="0 0 390 510" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="network-line" d="M30 72H113V155H284V75H354M28 255H85V205H324V265H370M42 407H137V338H270V429H355M113 155V338M284 75V205M324 265V429"/>
          <g class="network-node"><circle cx="30" cy="72" r="7"/><circle cx="354" cy="75" r="7"/><circle cx="28" cy="255" r="7"/><circle cx="370" cy="265" r="7"/><circle cx="42" cy="407" r="7"/><circle cx="355" cy="429" r="7"/></g>
          <g class="network-server" transform="translate(5 120)">
            <rect width="82" height="152" rx="10"/><path d="M13 31h56M13 70h56M13 109h56"/>
            <circle cx="20" cy="18" r="3"/><circle cx="20" cy="57" r="3"/><circle cx="20" cy="96" r="3"/><circle cx="20" cy="135" r="3"/>
          </g>
          <g class="network-server" transform="translate(302 175)">
            <rect width="82" height="152" rx="10"/><path d="M13 31h56M13 70h56M13 109h56"/>
            <circle cx="20" cy="18" r="3"/><circle cx="20" cy="57" r="3"/><circle cx="20" cy="96" r="3"/><circle cx="20" cy="135" r="3"/>
          </g>
          <g class="network-shield" transform="translate(154 12)">
            <path d="M41 2 78 16v36Q73 80 41 95 9 80 4 52V16Z"/>
            <path d="m26 47 11 11 22-24"/>
          </g>
          <g class="network-lock" transform="translate(145 393)">
            <rect x="4" y="42" width="91" height="68" rx="9"/>
            <path d="M23 42V29a26 26 0 0 1 53 0v13M50 68v17"/>
            <circle cx="50" cy="65" r="4"/>
          </g>
        </svg>`
        portrait.append(network, image)
      } else {
        const grove = node('div', undefined, 'dung-grove')
        grove.setAttribute('aria-hidden', 'true')
        const bush = `<svg viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg">
          <path d="M78 165V75m0 55Q55 91 31 88m48 24q25-31 55-36" fill="none" stroke="#536543" stroke-width="8" stroke-linecap="round"/>
          <ellipse cx="35" cy="105" rx="27" ry="32" fill="#71865a"/>
          <ellipse cx="54" cy="75" rx="30" ry="37" fill="#536e4d"/>
          <ellipse cx="80" cy="52" rx="30" ry="38" fill="#879b66"/>
          <ellipse cx="111" cy="77" rx="31" ry="36" fill="#607c53"/>
          <ellipse cx="131" cy="107" rx="25" ry="30" fill="#718c5d"/>
          <ellipse cx="79" cy="112" rx="37" ry="35" fill="#435f47"/>
          <path d="M66 50q18-12 32-1m-67 51q16-13 30-4m52-21q14-9 24 2" fill="none" stroke="#c0ca8b" stroke-width="4" opacity=".6"/>
        </svg>`
        grove.innerHTML = `<span class="dung-bush">${bush}</span><span class="dung-bush">${bush}</span>`
        const rifle = node('div', undefined, 'dung-rifle')
        rifle.setAttribute('aria-hidden', 'true')
        rifle.innerHTML = `<svg viewBox="0 0 90 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 30 Q7 94 24 235" stroke="#6a5136" stroke-width="7" opacity=".8"/>
          <path d="M47 4v187" stroke="#292d28" stroke-width="12" stroke-linecap="round"/>
          <path d="M47 7v145" stroke="#787d71" stroke-width="3"/>
          <path d="M36 178h24v34H36z" fill="#444337"/>
          <path d="M42 203v43Q27 256 19 283L37 294Q73 256 67 221L60 203z" fill="#79533b" stroke="#4c3b2d" stroke-width="4"/>
        </svg>`
        const hat = node('div', undefined, 'dung-hat')
        hat.setAttribute('aria-hidden', 'true')
        hat.innerHTML = `<svg viewBox="0 0 160 75" xmlns="http://www.w3.org/2000/svg">
          <path d="M28 52Q27 12 80 8q53 4 52 44" fill="#5e6a3e" stroke="#35442e" stroke-width="3"/>
          <path d="M32 43q48 15 96 0" fill="none" stroke="#929d68" stroke-width="5"/>
          <ellipse cx="80" cy="56" rx="77" ry="11" fill="#465435" stroke="#303c2a" stroke-width="3"/>
          <path d="M18 54q62 12 124 0" fill="none" stroke="#a4ae72" stroke-width="3" opacity=".65"/>
        </svg>`
        const callout = node('div', undefined, 'dung-callout')
        callout.setAttribute('aria-hidden', 'true')
        callout.innerHTML = `TRINH SÁT <svg viewBox="0 0 110 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M98 4Q54 5 24 63m0 0 1-17m-1 17 15-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
        portrait.append(grove, rifle, image, hat, callout)
      }
      this.dialog.querySelector('.reader-inner')!.append(portrait)
    }
    if (memory.id === 'y2-photo-a') {
      const figure = node('figure', undefined, 'hung-photo')
      const picture = node('div', undefined, 'hung-picture')
      const image = node('img')
      image.src = xoaNhom
      image.alt = 'Ảnh các bạn được thầy Hưng xoá khỏi nhóm'
      image.decoding = 'async'
      const hearts = node('div', undefined, 'hung-hearts')
      hearts.setAttribute('aria-hidden', 'true')
      for (let i = 0; i < 7; i++) hearts.append(node('span', '♥'))
      picture.append(image, hearts)
      figure.append(picture, node('figcaption', 'note: mấy con quỷ bị sếp diệt trừ =).'))
      this.dialog.querySelector('.reader-inner')!.append(figure)
    }
    this.dialog.showModal()
    this.dialog.scrollTop = 0
  }
  private storyPicker(related: Story[]) {
    const section = node('section', undefined, 'story')
    const title = node('h3', 'Lời kể')
    const choices = node('div', undefined, 'story-choices')
    const article = node('article')
    article.id = 'current-story'
    article.setAttribute('aria-live', 'polite')
    const buttons = related.map((story) => {
      const button = node('button', `${narrators[story.narratorId]?.name ?? 'Người kể'} · ${story.title}`)
      button.type = 'button'
      button.setAttribute('aria-controls', article.id)
      button.addEventListener('click', () => select(story))
      return button
    })
    const select = (story: Story) => {
      buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(related[index] === story)))
      article.replaceChildren(node('h4', story.title))
      const narrator = narrators[story.narratorId]
      if (narrator) {
        const byline = node('div', undefined, 'byline')
        if (narrator.avatar) {
          const avatar = node('img')
          avatar.src = narrator.avatar
          avatar.alt = ''
          avatar.addEventListener('error', () => avatar.remove(), { once: true })
          byline.append(avatar)
        }
        byline.append(node('span', narrator.name))
        article.append(byline)
      }
      if (story.sample) article.append(node('span', 'NỘI DUNG MẪU', 'sample-tag'))
      article.append(...story.paragraphs.map((paragraph) => node('p', paragraph)), ...(story.photos ?? []).map(picture))
    }
    choices.append(...buttons)
    section.append(title, choices, article)
    select(related[0])
    return section
  }
}
