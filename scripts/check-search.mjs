import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { extractFuzzyKeywordsFromExcerpts, formatPagefindResult } from '../node_modules/vitepress-plugin-pagefind/dist/search.mjs'
import { customSearchQuery, filter, searchResultPageCount } from '../docs/.vitepress/pagefind-search.mjs'

const dist = resolve('docs/.vitepress/dist')
const pagefindDir = join(dist, 'pagefind')
const assetsDir = join(dist, 'assets')

if (!existsSync(pagefindDir)) {
  console.error('找不到 docs/.vitepress/dist/pagefind，请先运行 npm run docs:build')
  process.exit(1)
}

if (!existsSync(assetsDir)) {
  console.error('找不到 docs/.vitepress/dist/assets，请先运行 npm run docs:build')
  process.exit(1)
}

const pagefindBase = pathToFileURL(join(pagefindDir, '')).href

// Pagefind 的浏览器版通过 fetch 读取索引文件；在 Node 里把 file:// 请求映射到本地文件。
globalThis.fetch = async (input) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const filePath = url.startsWith('file:')
    ? fileURLToPath(url)
    : url.startsWith('/')
      ? join(dist, decodeURIComponent(url))
      : fileURLToPath(new URL(url, pagefindBase))
  return new Response(await readFile(filePath), { status: 200 })
}

const pagefind = await import(pathToFileURL(join(pagefindDir, 'pagefind.js')).href)
await pagefind.init()

const plainTitle = (item) => item.meta.title.join(' > ').replace(/<[^>]+>/g, '')
const plainDescription = (item) => (item.meta.description || '').replace(/<[^>]+>/g, '')

async function searchAndFilter(query) {
  const searchText = customSearchQuery(query)
  const raw = await pagefind.search(searchText)
  const results = await Promise.all(raw.results.map((result) => result.data()))
  const fuzzyKeywords = extractFuzzyKeywordsFromExcerpts(results, searchText)
  const formatted = results.flatMap((result) => formatPagefindResult(result, searchResultPageCount, fuzzyKeywords))
  return { searchText, results, kept: formatted.filter(filter) }
}

async function* walkJs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walkJs(path)
    else if (entry.name.endsWith('.js')) yield path
  }
}

try {
  const clone = await searchAndFilter('git clone')
  assert.ok(clone.kept.length > 0, '搜索 "git clone" 没有返回结果')
  const first = clone.kept[0]
  const title = plainTitle(first)
  assert.match(title, /初始化与克隆/, `搜索 "git clone" 的首条应指向「初始化与克隆」，实际为：${title}`)
  assert.match(plainDescription(first), /git clone/, '搜索 "git clone" 的摘要应包含 git clone')
  assert.match(
    decodeURIComponent(first.route),
    /#初始化与克隆/,
    `搜索 "git clone" 的首条应带 #初始化与克隆 锚点，实际为：${first.route}`
  )
  assert.match(first.route, /cheat-sheets\/dev\/git/, `搜索 "git clone" 的首条应位于 Git 页面，实际为：${first.route}`)

  const git = await searchAndFilter('git')
  assert.ok(git.kept.length > 0, '搜索 "git" 没有返回结果')
  const gitTitle = plainTitle(git.kept[0])
  assert.match(gitTitle, /Git 常用命令/, `搜索 "git" 的首条应是 Git 页面，实际为：${gitTitle}`)
  assert.doesNotMatch(gitTitle, /初始化与克隆/, `搜索 "git" 不应定位到「初始化与克隆」，实际为：${gitTitle}`)

  let hasTerms = false
  let hasPageResultCount = false
  for await (const file of walkJs(assetsDir)) {
    const code = await readFile(file, 'utf8')
    if (code.includes('__pagefindQueryTerms')) hasTerms = true
    if (/pageResultCount\s*:\s*100/.test(code)) hasPageResultCount = true
    if (hasTerms && hasPageResultCount) break
  }
  assert.ok(hasTerms, '构建产物中未找到查询词配置，页面搜索可能未使用 pagefind-search.mjs')
  assert.ok(hasPageResultCount, '构建产物中未找到 pageResultCount: 100，搜索结果候选可能不足')

  console.log('搜索结果排序检查通过：')
  console.log(`  git clone -> ${title}`)
  console.log(`  摘要：${plainDescription(first).trim().slice(0, 100)}`)
} catch (error) {
  console.error('搜索结果排序检查失败：')
  console.error(error.message)
  process.exit(1)
}
