import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
import { defineTeekConfig } from 'vitepress-theme-teek/config'
import { customSearchQuery, filter, searchResultPageCount } from './pagefind-search.mjs'

const teekConfig = defineTeekConfig({
  teekHome: false,
  vpHome: true,
  footerInfo: {
    theme: { show: false },
    copyright: { show: false }
  },
  vitePlugins: {
    sidebarOption: {
      ignoreIndexMd: true,
      titleFormMd: true,
      initItemsText: true,
      ignoreWarn: true,
      sidebarResolved: (sidebar) => {
        if (Array.isArray(sidebar)) return sidebar

        const sectionTitles: Record<string, string> = {
          '/cheat-sheets/': '速查表',
          '/guide/': '文档'
        }

        for (const [key, title] of Object.entries(sectionTitles)) {
          const list = sidebar[key]
          if (!Array.isArray(list)) continue

          const wrapper = list.length === 1 && list[0]?.items ? list[0] : undefined
          const groups = wrapper ? (wrapper.items ?? []) : list

          if (!groups.length) {
            delete sidebar[key]
            continue
          }

          sidebar[key] = [{ text: title, link: key, items: groups }]
        }

        return sidebar
      }
    }
  }
})

export default defineConfig({
  extends: teekConfig,
  lang: 'zh-CN',
  title: '文档',
  description: '文档与速查',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    plugins: [
      pagefindPlugin({
        forceLanguage: 'zh-cn',
        customSearchQuery,
        filter,
        pageResultCount: searchResultPageCount
      })
    ]
  },
  themeConfig: {
    nav: [
      { text: '文档', link: '/guide/', activeMatch: '^/guide/' },
      { text: '速查表', link: '/cheat-sheets/', activeMatch: '^/cheat-sheets/' }
    ]
  }
})
