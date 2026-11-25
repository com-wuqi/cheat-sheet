# 速查表

基于 [VitePress](https://vitepress.dev/) + [Teek](https://github.com/teekhub/vitepress-theme-teek) 主题的个人速查站点。把 Markdown 文件放进 `docs/cheat-sheets/`，侧边栏、索引页和搜索结果会自动更新。

## 环境要求

- Node.js >= 20（推荐 22，仓库内 `.nvmrc` 已指定）
- npm

## 本地开发

```bash
npm install
npm run docs:dev
```

默认地址为 `http://localhost:5173`。

## 添加速查

1. 在 `docs/cheat-sheets/` 下新建 `.md` 文件。
2. 可以直接写内容，也可以添加可选的 frontmatter：

```md
---
title: Git 常用命令
description: 日常提交、分支与回滚命令。
sidebarSort: 10
---

# Git 常用命令

正文……
```

字段说明：

| 字段 | 作用 |
| --- | --- |
| `title` | 侧边栏和索引页标题；缺省时取第一个一级标题，再退化为文件名 |
| `description` | 索引页上的简短说明 |
| `sidebarSort` | 侧边栏与索引页排序，数字越小越靠前；缺省为 9999 |
| `pagefind-indexed` | 设为 `false` 时不进入搜索索引 |

- 支持在 `docs/cheat-sheets/` 下建子目录分组；子目录里的 `index.md` 可用于提供分组标题。
- 侧边栏由 Teek 自动生成，新增文件后无需改站点配置。
- 以 `.` 或 `_` 开头的文件/目录不会被收录。
- **新增或删除文件后需要重启 `npm run docs:dev`**，侧边栏才会更新。

## 构建与预览

```bash
npm run docs:build
npm run docs:preview
```

构建产物在 `docs/.vitepress/dist`。

## 搜索

搜索使用 [Pagefind](https://pagefind.app/)（`vitepress-plugin-pagefind`），离线运行，支持中文。

注意：Pagefind 索引只在 `docs:build` 时生成，`npm run docs:dev` 下搜索不可用。要验证搜索，请先构建再预览：

```bash
npm run docs:build
npm run docs:preview
```

## 界面语言

站点内容使用中文，并使用 Teek 主题：Teek 自己的组件（文章信息、阅读时长、文章更新等）为中文。VitePress 默认主题的少量界面文字仍是英文（例如 “On this page”），本项目没有手写主题翻译。

## 部署到 Cloudflare Pages

在 Cloudflare Pages 中连接本仓库，使用以下设置：

| 配置项 | 值 |
| --- | --- |
| Root directory | `/`（仓库根目录） |
| Framework preset | None |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |
| 环境变量 | `NODE_VERSION=22` |

注意事项：

- 站点部署在域名根路径，因此不需要设置 `base`。若以后改到子路径，需要在 `docs/.vitepress/config.mts` 中设置 `base` 并重新验证。
- 已开启 `cleanUrls`，Cloudflare Pages 会把 `/foo.html` 重定向到 `/foo`，无需额外配置。
- 不要开启 Cloudflare 的 Auto Minify 的 HTML 压缩，它可能删掉 Vue 依赖的注释，导致 hydration 报错。

## 目录结构

```
docs/
├─ index.md                     # 首页
├─ cheat-sheets/
│  ├─ index.md                  # 自动索引页
│  └─ example.md                # 示例速查，可删除
└─ .vitepress/
   ├─ config.mts                # 站点配置（Teek + Pagefind）
   ├─ theme/
   │  └─ index.ts               # 引入 Teek 主题
   ├─ content.ts                # 标题/描述/frontmatter 解析
   └─ data/
      └─ cheatsheets.data.ts    # 索引页数据加载器
```
