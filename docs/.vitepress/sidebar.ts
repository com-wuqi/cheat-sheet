import fs from 'node:fs'
import path from 'node:path'
import { extractHeading, readFrontmatter } from './content'

export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

interface SidebarOptions {
  docsDir?: string
  cleanUrls?: boolean
}

interface ScanContext {
  docsDir: string
  cleanUrls: boolean
}

type OrderedItem = SidebarItem & { order: number }

export function buildSidebar(options: SidebarOptions = {}): SidebarItem[] {
  const docsDir = options.docsDir ?? path.resolve(process.cwd(), 'docs')
  const cleanUrls = options.cleanUrls ?? true
  const contentDir = path.join(docsDir, 'cheat-sheets')

  if (!fs.existsSync(contentDir)) return []

  const items = scanDirectory(contentDir, { docsDir, cleanUrls })
  if (!items.length) return []

  const indexFile = path.join(contentDir, 'index.md')
  const hasIndex = fs.existsSync(indexFile)
  const meta = hasIndex ? readMeta(indexFile) : {}

  return [
    {
      text: meta.title ?? '速查表',
      link: hasIndex ? pageUrl(indexFile, docsDir, cleanUrls) : undefined,
      items,
      collapsed: false
    }
  ]
}

function scanDirectory(dir: string, ctx: ScanContext): SidebarItem[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const collected: OrderedItem[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const children = scanDirectory(fullPath, ctx)
      if (!children.length) continue

      const indexFile = path.join(fullPath, 'index.md')
      const hasIndex = fs.existsSync(indexFile)
      const meta = hasIndex ? readMeta(indexFile) : {}

      collected.push({
        text: meta.title ?? entry.name,
        link: hasIndex ? pageUrl(indexFile, ctx.docsDir, ctx.cleanUrls) : undefined,
        items: children,
        collapsed: false,
        order: meta.order ?? 9999
      })
      continue
    }

    if (!entry.isFile() || !/\.md$/i.test(entry.name) || entry.name === 'index.md') continue

    const meta = readMeta(fullPath)
    collected.push({
      text: meta.title ?? entry.name.replace(/\.md$/i, ''),
      link: pageUrl(fullPath, ctx.docsDir, ctx.cleanUrls),
      order: meta.order ?? 9999
    })
  }

  return collected
    .sort((a, b) => a.order - b.order || a.text.localeCompare(b.text, 'zh-CN', { numeric: true }))
    .map(({ order: _order, ...item }) => item)
}

function readMeta(file: string): { title?: string; order?: number } {
  const src = fs.readFileSync(file, 'utf8')
  const frontmatter = readFrontmatter(src)
  return {
    title: frontmatter.title ?? extractHeading(src),
    order: frontmatter.order
  }
}

function pageUrl(file: string, docsDir: string, cleanUrls: boolean): string {
  let rel = path.relative(docsDir, file).split(path.sep).join('/')

  if (rel.endsWith('index.md')) {
    return '/' + rel.slice(0, -'index.md'.length)
  }

  rel = rel.replace(/\.md$/i, '')
  return '/' + rel + (cleanUrls ? '' : '.html')
}
