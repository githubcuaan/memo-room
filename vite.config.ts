import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const { VITE_SITE_URL: site } = loadEnv(mode, process.cwd())
  return {
    base: './',
    plugins: [{
      name: 'sharing-metadata',
      transformIndexHtml() {
        if (!site) return []
        const url = new URL(site.endsWith('/') ? site : `${site}/`)
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return []
        return [
          { tag: 'meta', attrs: { property: 'og:url', content: url.href } },
          { tag: 'meta', attrs: { property: 'og:image', content: new URL('chia-se.png', url).href } },
          { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Mô hình Phòng ký ức ngày 20/11' } },
        ]
      },
    }],
  }
})
