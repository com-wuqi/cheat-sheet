---
title: 全部速查
autoTitle: false
pagefind-indexed: false
---

<script setup>
import { data as sheets } from '../.vitepress/data/cheatsheets.data'
import { withBase } from 'vitepress'
</script>

# 全部速查

<p v-if="!sheets.length">还没有速查表，把 Markdown 文件放进 <code>docs/cheat-sheets/</code> 即可。</p>

<ul v-else>
  <li v-for="sheet in sheets" :key="sheet.url">
    <a :href="withBase(sheet.url)">{{ sheet.title }}</a>
    <template v-if="sheet.description"> — {{ sheet.description }}</template>
  </li>
</ul>
