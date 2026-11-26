// Pagefind 默认只按“单个最高权重命中”选择页面小节，标题命中会压过正文中的完整命令。
// 例如搜索 "git clone" 时，标题 "Git 常用命令" 的权重更高，结果会指向页面开头，
// 而不是包含命令的「初始化与克隆」小节。
//
// 这里通过 vitepress-plugin-pagefind 公开的配置做一次覆盖度排序：
// 1. customSearchQuery 记录当前查询词，供 filter 使用；
// 2. pageResultCount 让每页先产出足够多的小节候选；
// 3. filter 只保留包含查询词最多的小节，并取每页最靠前的一条。
//
// 注意：插件会把这两个函数的源码序列化到浏览器端，函数必须自包含，
// 不能引用本模块外部的变量或导入。

export const searchResultPageCount = 100

export function customSearchQuery(input) {
  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
  const terms = []
  for (const part of segmenter.segment(input)) {
    if (part.isWordLike) terms.push(part.segment)
  }
  globalThis.__pagefindQueryTerms = terms
    .map((term) => term.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '').trim().toLowerCase())
    .filter(Boolean)
  return terms.join(' ')
}

export function filter(item, idx, array) {
  const terms = globalThis.__pagefindQueryTerms || []

  const pageOf = (x) => x.result?.url || x.route.split('#')[0]
  const scoreOf = (x) => {
    if (typeof x.__pagefindCoverage !== 'number') {
      const text = ((x.meta.title || []).join(' ') + ' ' + (x.meta.description || ''))
        .replace(/<[^>]+>/g, '')
        .toLowerCase()
      x.__pagefindCoverage = terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0)
    }
    return x.__pagefindCoverage
  }

  if (!terms.length) {
    return array.findIndex((x) => pageOf(x) === pageOf(item)) === idx
  }

  const score = scoreOf(item)
  let max = 0
  for (const x of array) {
    const value = scoreOf(x)
    if (value > max) max = value
  }
  if (score < max) return false

  return array.findIndex((x) => pageOf(x) === pageOf(item) && scoreOf(x) === score) === idx
}
