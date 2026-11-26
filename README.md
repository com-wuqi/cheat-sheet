# 速查表

基于 [VitePress](https://vitepress.dev/) + [Teek](https://github.com/teekhub/vitepress-theme-teek) 主题的个人速查站点。内容按主题分组，侧边栏、索引页和搜索结果会自动更新。

## 环境要求

- Node.js >= 20（推荐 22，仓库内 `.nvmrc` 已指定）
- npm

## 本地开发

```bash
npm install
npm run docs:dev
```

默认地址为 `http://localhost:5173`。

## 内容结构

```text
docs/cheat-sheets/
├─ index.md                 # 自动索引页
├─ shell/                   # 命令行
│  ├─ index.md
│  ├─ bash.md
│  └─ linux.md
├─ dev/                     # 开发工具
│  ├─ index.md
│  ├─ git.md
│  ├─ docker.md
│  └─ kubernetes.md
├─ languages/               # 编程语言
│  ├─ index.md
│  ├─ python.md
│  ├─ go.md
│  └─ sql.md
└─ tools/                   # 实用工具
   ├─ index.md
   ├─ vim.md
   ├─ ffmpeg.md
   └─ adb.md
```

- 分组目录的 `index.md` 只提供侧边栏分组标题和简介；Teek 的 `ignoreIndexMd` 会把它排除在侧边栏条目之外，`pagefind-indexed: false` 则让它不进入搜索结果。
- 正文语言尽量沿用原始资料：Bash、Vim、Git、Go、FFmpeg、ADB 为中文；Docker、Kubernetes、Linux、Python、SQL 保留英文原文。页面标题和描述为中文。
- `docs-raw/` 是本地原始素材，已加入 `.gitignore`，不参与构建。

## 添加速查

1. 在对应的主题目录下新建 `.md` 文件，或在 `docs/cheat-sheets/` 下新建主题目录。
2. 添加可选的 frontmatter：

```md
---
title: Git 常用命令
description: 日常提交、分支与回滚命令。
sidebarSort: 21
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

- 每篇只保留一个一级标题，其余章节使用 `##` / `###`。
- 新增或删除文件后需要重启 `npm run docs:dev`，侧边栏才会更新。
- 以 `.` 或 `_` 开头的文件/目录不会被收录。

## 构建与预览

```bash
npm run docs:build
npm run docs:preview
```

构建产物在 `docs/.vitepress/dist`。构建后可以检查内部链接和静态资源：

```bash
npm run check:links
```

## 搜索

搜索使用 [Pagefind](https://pagefind.app/)（`vitepress-plugin-pagefind`），离线运行，支持中文。

注意：Pagefind 索引只在 `docs:build` 时生成，`npm run docs:dev` 下搜索不可用。要验证搜索，请先构建再预览：

```bash
npm run docs:build
npm run docs:preview
```

## 界面语言

站点内容使用中文，并使用 Teek 主题：Teek 自己的组件（文章信息、阅读时长、文章更新等）为中文。VitePress 默认主题的少量界面文字仍是英文（例如 “On this page”），本项目没有手写主题翻译。

## 来源与许可

- Bash、Vim、ADB、FFmpeg 和 Git 中文内容整理自 [skywind3000/awesome-cheatsheets](https://github.com/skywind3000/awesome-cheatsheets)（MIT License）。许可文本见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
- Go 内容整理自 [a8m/golang-cheat-sheet](https://github.com/a8m/golang-cheat-sheet) 的中文翻译版本。
- Docker、Kubernetes、Linux、Python、SQL 页面来自本地英文资料，原始出处未标注；命令请以官方文档为准。

## 部署到 Cloudflare Workers

仓库已包含 `wrangler.jsonc`，按 Workers 静态资源部署：

| 配置项 | 值 |
| --- | --- |
| Root directory / 路径 | `/`（仓库根目录） |
| Build command（构建命令） | `npm run docs:build` |
| Deploy command（部署命令） | `npx wrangler deploy` |
| Preview command（预览命令） | `npx wrangler preview` |
| 环境变量 | `NODE_VERSION=22` |

`wrangler.jsonc` 的关键配置：

- `assets.directory`：`./docs/.vitepress/dist`
- `assets.not_found_handling`：`404-page`
- HTML 路由使用默认的 `auto-trailing-slash`，因此现有的 `cleanUrls` 链接可以直接工作

注意：`wrangler.jsonc` 里的 `name` 是 `cheat-sheet`。如果 Cloudflare 上创建的 Worker 名称不同，请同步修改这个字段，或把 Worker 改成同名。

如果改用 Cloudflare Pages，则不需要 Wrangler：Build command 填 `npm run docs:build`，Build output directory 填 `docs/.vitepress/dist`，Root directory 填 `/`。

## 部署注意事项

- 站点部署在域名根路径，因此不需要设置 `base`。若以后改到子路径，需要在 `docs/.vitepress/config.mts` 中设置 `base` 并重新验证。
- 不要开启 Cloudflare 的 Auto Minify 的 HTML 压缩，它可能删掉 Vue 依赖的注释，导致 hydration 报错。
