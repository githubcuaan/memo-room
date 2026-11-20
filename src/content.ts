import { icon } from './icons'
import { narrators, preview, stories, type Memory, type Photo, type Story } from './memories'

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
    if (memory.id === 'y1-photo') this.dialog.dataset.feature = 'lam'
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
    this.dialog.querySelector('.lam-portrait')?.remove()
    if (memory.id === 'y1-photo') {
      const portrait = node('div', undefined, 'lam-portrait')
      const flames = node('div', undefined, 'lam-flames')
      flames.setAttribute('aria-hidden', 'true')
      for (let i = 0; i < 9; i++) {
        const flame = node('span', undefined, 'lam-flame')
        flame.style.setProperty('--i', String(i))
        flames.append(flame)
      }
      const image = node('img')
      image.src = `${import.meta.env.BASE_URL}anh/thay-lam.webp`
      image.alt = 'Chân dung thầy Phạm Tiến Lâm'
      portrait.append(flames, image)
      this.dialog.querySelector('.reader-inner')!.append(portrait)
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
