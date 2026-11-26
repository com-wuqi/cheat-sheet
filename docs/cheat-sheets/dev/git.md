---
title: Git 常用命令
description: 配置、提交、分支、撤销、远程协作、rebase、补丁与常见问题处理。
sidebarSort: 21
---

# Git 常用命令

面向日常开发与协作的 Git 速查。命令默认在当前仓库中执行。

## 配置

```bash
# 用户信息（写入全局配置）
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 当前仓库单独配置
git config user.name "Your Name"
git config user.email "you@example.com"

# 默认编辑器与默认分支
git config --global core.editor "vim"
git config --global init.defaultBranch main

# 颜色与查看配置
git config --global color.ui auto
git config --list
git config --global --list
```

凭据存储可以把密码保存到磁盘，公共机器上不要使用：

```bash
git config --global credential.helper store
```

### 配置 SSH

```bash
ssh-keygen -t ed25519 -C "you@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub        # 把公钥添加到 GitHub/GitLab
ssh -T git@github.com            # 测试连接
```

### 别名

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg 'log --oneline --graph --decorate --all'
```

## 初始化与克隆

```bash
git init
git clone <repository-url>
git clone <repository-url> <directory>
git clone -b <branch> <repository-url>
git clone --recursive <repository-url>   # 同时初始化子模块
```

## 提交与状态

```bash
git status
git status -s                    # 缩略状态：A 新增、M 修改、D 删除、? 未跟踪

git add <file>
git add .
git add -A                       # 包含删除
git add -u                       # 只处理已跟踪文件
git add -f <file>                # 强制添加被 .gitignore 忽略的文件

git commit -m "message"
git commit -am "message"         # 只对已跟踪文件执行 add + commit
git commit --amend               # 修改最近一次提交
git commit --amend --no-edit     # 保留提交信息
```

## 查看历史与差异

```bash
git log
git log --oneline
git log --graph --oneline --all
git log -3
git log -p                       # 同时显示补丁
git log --stat                   # 文件变化统计
git log --name-status            # 新增、修改、删除的文件清单
git log --author="name"
git log --since="2 weeks ago"
git log --until="yesterday"
git log --grep="bug fix"
git log -S"keyword"              # 搜索新增或删除该关键字的提交
git log --follow <file>          # 跟踪文件重命名

git diff                         # 工作区 vs 暂存区
git diff --staged                # 暂存区 vs 最新提交
git diff HEAD                    # 工作区 vs 最新提交
git diff main...feature          # feature 相对共同祖先的差异
git diff <commit1> <commit2>
```

`git log --pretty=format` 常用占位符：

| 占位符 | 含义 |
| --- | --- |
| `%H` / `%h` | 完整 / 简短提交哈希 |
| `%T` / `%t` | 完整 / 简短 tree 哈希 |
| `%P` / `%p` | 完整 / 简短父提交哈希 |
| `%an` / `%ae` | 作者名 / 邮箱 |
| `%ad` / `%ar` | 作者日期 / 相对时间 |
| `%cn` / `%ce` | 提交者名 / 邮箱 |
| `%s` | 提交说明 |

## 撤销与回退

```bash
# 撤销工作区修改（未暂存）
git restore <file>
git checkout -- <file>           # 旧写法

# 取消暂存
git restore --staged <file>
git reset HEAD <file>            # 旧写法

# 回退提交
git reset --soft HEAD~1          # 保留修改并留在暂存区
git reset HEAD~1                 # 保留修改，取消暂存
git reset --hard HEAD~1          # 丢弃修改，谨慎

# 生成一个反向提交，适合已推送的历史
git revert <commit>
git revert -m 1 <merge-commit>   # 撤销合并提交

# 清理未跟踪文件
git clean -n                     # 预览
git clean -f                     # 删除未跟踪文件
git clean -fd                    # 同时删除未跟踪目录
git clean -fX                    # 只删除被忽略的文件
```

::: warning
`git reset --hard`、`git clean -fdx` 会不可逆地丢弃本地内容。执行前先确认没有未提交的修改。
:::

## 分支与合并

```bash
git branch                       # 本地分支
git branch -r                    # 远程分支
git branch -a                    # 全部分支
git branch -vv                   # 查看上游跟踪关系

git branch <branch>
git switch <branch>
git checkout <branch>            # 旧写法
git switch -c <branch>           # 创建并切换
git checkout -b <branch>         # 旧写法
git branch <branch> <commit>     # 从指定提交创建分支

git merge <branch>
git merge --no-ff <branch>       # 保留合并提交
git merge --squash <branch>      # 压缩为一次变更
git merge --abort

git branch -d <branch>           # 安全删除
git branch -D <branch>           # 强制删除未合并分支
git branch -m <old> <new>
```

## 远程与协作

```bash
git remote -v
git remote add origin <repository-url>
git remote set-url origin <new-url>
git remote remove <name>
git remote show origin

git fetch
git fetch --all
git pull
git pull --rebase

git push
git push -u origin main
git push origin <branch>
git push --all
git push --tags
git push --force-with-lease      # 比 --force 安全
git push origin --delete <branch>
```

多人协作的常见流程：

```bash
git fetch origin
git switch -c feature/xxx origin/main
# 开发并提交
git push -u origin feature/xxx
# 在 GitHub/GitLab 上发起 Pull Request
```

## 暂存与拣选

```bash
git stash
git stash push -m "work in progress"
git stash list
git stash apply                  # 应用但保留 stash
git stash pop                    # 应用并删除 stash
git stash apply stash@{2}
git stash drop stash@{0}
git stash clear
git stash branch <branch>        # 从 stash 创建分支

git cherry-pick <commit>
git cherry-pick -n <commit>      # 只应用修改，不提交
git cherry-pick <c1>..<c2>
```

## 标签与子模块

```bash
git tag
git tag -l "v1.*"
git tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"
git tag v1.0.0 <commit>
git push origin v1.0.0
git push origin --tags
git tag -d v1.0.0
git push origin --delete v1.0.0

git submodule add <repository-url> <path>
git submodule init
git submodule update
git submodule update --remote
git submodule foreach git pull origin main
```

## Rebase

把当前分支变基到最新的 `main`：

```bash
git switch feature
git fetch origin
git rebase origin/main
```

处理冲突后继续：

```bash
git add <resolved-files>
git rebase --continue
git rebase --skip
git rebase --abort
```

压缩最近 3 个提交：

```bash
git rebase -i HEAD~3
# 第一行保留 pick，后续改为 squash 或 fixup
```

把 `client` 分支中不在 `server` 分支里的提交重放到 `main`：

```bash
git rebase --onto main server client
```

::: tip
不要对已经推送并被他人使用的公共分支执行 rebase。需要更新远端时使用 `git push --force-with-lease`，不要直接 `--force`。
:::

## 补丁与 Bundle

```bash
# 生成补丁
git format-patch -1 <commit>
git format-patch <c1>..<c2>
git format-patch --root <commit>

# 检查并应用补丁
git apply --check diff.patch
git apply --stat diff.patch
git apply diff.patch              # 不产生 commit

# 应用带提交信息的补丁
git am 0001-fix.patch
git am ./*.patch
git am --abort
git am --resolved

# 打包整个仓库历史
git bundle create repo.bundle HEAD main
git clone repo.bundle
```

## 工作流与提交规范

常见分支模型：

| 分支 | 用途 |
| --- | --- |
| `main` | 稳定、可发布版本 |
| `develop` | 集成分支 |
| `feature/*` | 单个功能 |
| `release/*` | 发布准备 |
| `hotfix/*` | 线上紧急修复 |

提交信息建议使用 `<type>(<scope>): <subject>`：

```text
feat(api): add user authentication endpoint
fix(database): resolve connection timeout
docs(readme): update installation instructions
```

常用类型：`feat`、`fix`、`docs`、`style`、`refactor`、`test`、`chore`。

`.gitignore` 示例：

```text
__pycache__/
*.py[cod]
.env
.venv/
.vscode/
.idea/
.DS_Store
*.log
```

## 常见问题

### 合并冲突

```bash
git status                       # 查看冲突文件
# 编辑文件，处理 <<<<<<<、=======、>>>>>>> 标记
git add <resolved-files>
git commit                       # merge 场景
git rebase --continue            # rebase 场景
```

### 恢复误删分支

```bash
git reflog
git branch <branch> <commit>
```

### 从历史中删除文件

```bash
# 推荐 git filter-repo（需单独安装）
git filter-repo --path <file> --invert-paths
```

不要在新项目中使用已弃用的 `git filter-branch`。

### 同步 fork

```bash
git remote add upstream <original-repository-url>
git fetch upstream
git switch main
git merge upstream/main
git push origin main
```

### 修改历史提交信息

```bash
git commit --amend -m "New message"      # 最近一次
git rebase -i HEAD~3                     # 更早的提交改为 reword
```

## 参考

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git](https://git-scm.com/book/zh/v2)
- [GitHub Git Cheat Sheet](https://training.github.com/downloads/github-git-cheat-sheet/)
- [Learn Git Branching](https://learngitbranching.js.org/)
- [Oh Shit, Git!?!](https://ohshitgit.com/)

## 来源

整理自 [skywind3000/awesome-cheatsheets](https://github.com/skywind3000/awesome-cheatsheets)（MIT License，Copyright (c) 2018 Linwei）中的 Git 中文速查表，并补充了本地英文速查稿中的 SSH、stash、revert 和排错内容。
