import { defineConfig } from 'vitepress'
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind'
import { defineTeekConfig } from 'vitepress-theme-teek/config'

const teekConfig = defineTeekConfig({
  teekHome: false,
  vpHome: true,
  footerInfo: {
    theme: { show: false },
    copyright: { show: false }
  },
  vitePlugins: {
    sidebarOption: {
      ignoreIndexMd: true
    }
  }
})

export default defineConfig({
  extends: teekConfig,
  lang: 'zh-CN',
  title: '速查表',
  description: '个人速查手册',
  cleanUrls: true,
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
    nav: [{ text: '速查表', link: '/cheat-sheets/' }]
  }
})
