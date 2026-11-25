export interface ContentMeta {
  title?: string
  description?: string
  sidebarSort?: number
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

export function stripFrontmatter(src: string): string {
  return src.replace(FRONTMATTER_RE, '')
}

export function readFrontmatter(src: string): ContentMeta {
  const match = src.match(FRONTMATTER_RE)
  if (!match) return {}

  const body = match[1]
  const title = readScalar(body, 'title')
  const description = readScalar(body, 'description')
  const sortText = readScalar(body, 'sidebarSort')

  let sidebarSort: number | undefined
  if (sortText && /^-?\d+(?:\.\d+)?$/.test(sortText)) {
    const parsed = Number(sortText)
    if (Number.isFinite(parsed)) sidebarSort = parsed
  }

  return { title, description, sidebarSort }
}

function readScalar(body: string, key: string): string | undefined {
  const match = body.match(new RegExp(`^\\s*${key}\\s*:\\s*(.+?)\\s*$`, 'm'))
  if (!match) return undefined
  const value = match[1].replace(/^['"]|['"]$/g, '').trim()
  return value || undefined
}

export function extractHeading(src: string): string | undefined {
  const match = stripFrontmatter(src).match(/^#\s+(.+?)\s*$/m)
  return match ? cleanInline(match[1]) : undefined
}

export function extractDescription(src: string, meta: ContentMeta = readFrontmatter(src)): string | undefined {
  if (meta.description) return meta.description

  for (const block of stripFrontmatter(src).split(/\r?\n\s*\r?\n/)) {
    const line = block.trim()
    if (!line) continue
    if (/^(#|```|~~~|:::|<|\||>|[-*+]\s|\d+\.\s)/.test(line)) continue
    return cleanInline(line.replace(/\r?\n/g, ' '))
  }

  return undefined
}

export function cleanInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
