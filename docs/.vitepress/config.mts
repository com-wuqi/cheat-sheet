import path from 'node:path'
import { defineConfig } from 'vitepress'
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind'
import { buildSidebar } from './sidebar'

const docsDir = path.resolve(process.cwd(), 'docs')
const cleanUrls = true

export default defineConfig({
  lang: 'zh-CN',
  title: '速查表',
  description: '个人速查手册',
  cleanUrls,
  lastUpdated: true,
  vite: {
    plugins: [
      pagefindPlugin({
        forceLanguage: 'zh-cn',
        customSearchQuery: chineseSearchOptimize
      })
    ]
  },
  themeConfig: {
    nav: [{ text: '速查表', link: '/cheat-sheets/' }],
    sidebar: buildSidebar({ docsDir, cleanUrls })
  }
})
