---
title: 示例速查
description: 演示速查表的常见写法，可复制后修改。
order: 99
---

# 示例速查

这是一个示例页面，可以删除，也可以复制成你自己的速查表。

## 常用命令

```bash
git status
git add .
git commit -m "update"
```

## 配置片段

| 项目 | 说明 |
| --- | --- |
| `order` | 侧边栏排序，数字越小越靠前 |
| `title` | 侧边栏与索引页标题 |
| `description` | 索引页上显示的简短说明 |

## 提示

::: tip
把 Markdown 文件放进 `docs/cheat-sheets/`，重启 dev server 后侧边栏就会更新。
:::

::: warning
`docs:dev` 下不生成搜索索引，搜索请用 `docs:build` + `docs:preview`。
:::
