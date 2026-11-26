import { createContentLoader } from 'vitepress'
import { extractDescription, extractHeading, readFrontmatter } from '../content'

export interface CheatSheet {
  url: string
  title: string
  description: string
  sidebarSort: number
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
      .filter((page) => page.url !== '/cheat-sheets/' && !page.url.endsWith('/'))
      .map((page) => {
        const src = page.src ?? ''
        const meta = { ...readFrontmatter(src), ...page.frontmatter }
        const sidebarSort =
          typeof meta.sidebarSort === 'number' && Number.isFinite(meta.sidebarSort) ? meta.sidebarSort : 9999

        return {
          url: page.url,
          title: asText(meta.title) ?? extractHeading(src) ?? pathToTitle(page.url),
          description: asText(meta.description) ?? extractDescription(src, meta) ?? '',
          sidebarSort
        }
      })
      .sort((a, b) => a.sidebarSort - b.sidebarSort || a.title.localeCompare(b.title, 'zh-CN', { numeric: true }))
  }
})
