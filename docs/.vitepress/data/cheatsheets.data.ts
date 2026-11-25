import { createContentLoader } from 'vitepress'
import { extractDescription, extractHeading, readFrontmatter } from '../content'

export interface CheatSheet {
  url: string
  title: string
  description: string
  order: number
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function pathToTitle(url: string): string {
  const last = url.split('/').filter(Boolean).pop() ?? 'untitled'
  return decodeURIComponent(last.replace(/\.html$/i, ''))
}

export default createContentLoader('cheat-sheets/**/*.md', {
  includeSrc: true,
  transform(raw): CheatSheet[] {
    return raw
      .filter((page) => page.url !== '/cheat-sheets/')
      .map((page) => {
        const src = page.src ?? ''
        const meta = { ...readFrontmatter(src), ...page.frontmatter }
        const order = typeof meta.order === 'number' && Number.isFinite(meta.order) ? meta.order : 9999

        return {
          url: page.url,
          title: asText(meta.title) ?? extractHeading(src) ?? pathToTitle(page.url),
          description: asText(meta.description) ?? extractDescription(src, meta) ?? '',
          order
        }
      })
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'zh-CN', { numeric: true }))
  }
})
