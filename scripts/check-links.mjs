import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const dist = resolve('docs/.vitepress/dist')

if (!existsSync(dist)) {
  console.error('找不到 docs/.vitepress/dist，请先运行 npm run docs:build')
  process.exit(1)
}

const htmlFiles = []
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (entry.name.endsWith('.html')) htmlFiles.push(path)
  }
}
walk(dist)

const broken = new Set()
const hrefRe = /\b(?:href|src)=["']([^"']+)["']/g

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  for (const match of html.matchAll(hrefRe)) {
    const url = match[1].trim()
    if (!url || url.startsWith('#') || url.startsWith('data:')) continue
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) continue
    if (/^[a-z][a-z\d+.-]*:\/\//i.test(url)) continue

    const withoutHash = url.split('#')[0].split('?')[0]
    if (!withoutHash) continue

    let target
    if (withoutHash.startsWith('/')) {
      target = join(dist, decodeURIComponent(withoutHash))
    } else {
      target = resolve(file, '..', decodeURIComponent(withoutHash))
    }

    const candidates = [target]
    if (!extname(target)) {
      candidates.push(`${target}.html`, join(target, 'index.html'))
    }

    if (!candidates.some((path) => existsSync(path) && statSync(path).isFile())) {
      broken.add(`${relative(dist, file)} -> ${url}`)
    }
  }
}

if (broken.size) {
  console.error(`发现 ${broken.size} 个无效内部链接或资源：`)
  for (const item of [...broken].sort()) console.error(`  ${item}`)
  process.exit(1)
}

console.log(`检查了 ${htmlFiles.length} 个 HTML 文件，内部链接和静态资源均有效。`)
