---
title: Linux 命令行
description: 文件、查找、进程、systemd、网络、SSH、文本处理与磁盘管理的常用命令。
sidebarSort: 12
---

# Linux 命令行

日常开发与运维中高频使用的 Linux 命令和组合模式。

## 文件与目录

```bash
ls -lah                          # 长格式列出全部文件，大小易读
ls -lt                           # 最新的在前
ls -lS                           # 最大的在前

cd -                             # 返回上一个目录
pushd /tmp && popd               # 记录位置并返回

cp -r src/ dest/                 # 递归复制
cp -a src/ dest/                 # 归档模式：保留权限、时间戳、符号链接
mv old new
rm -rf bad/                      # 小心

mkdir -p a/b/c                   # 按需创建父目录
ln -sf /actual /link             # 符号链接（强制替换）

stat file                        # 详细元数据
file file                        # 判断文件类型
du -sh dir/                      # 总大小，易读格式
df -h                            # 磁盘剩余空间，易读格式
```

## 查找文件

```bash
find . -name '*.log' -mtime -1                  # 最近 24 小时内修改过的 *.log
find . -type f -size +100M                       # 大于 100 MB 的文件
find . -type f -exec grep -l "pattern" {} +      # 在所有文件中搜索
find . -type d -empty -delete                    # 删除空目录

# 如果已安装，有更好的替代工具
fd 'pattern'                                     # 更快的 find
rg 'pattern'                                     # 更快的 grep
```

## grep 及相关工具

```bash
grep -rn 'pattern' src/                          # 递归搜索，显示行号
grep -rni 'pattern' --include='*.py' src/        # 忽略大小写，通配符过滤
grep -rl 'pattern' src/                          # 只列出文件名
grep -v 'noise'                                  # 反向匹配
grep -A 3 -B 1 'pattern'                         # 显示匹配行后 3 行、前 1 行
grep -E 'foo|bar'                                # 正则表达式
```

## 管道与组合

```bash
# 目录树中最大的 5 个文件
du -h ./* 2>/dev/null | sort -h | tail -5

# 最近 10 分钟日志中包含 ERROR 的行
journalctl --since "10 min ago" | grep -i error

# 统计 nginx 访问日志中各状态码的请求数
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# 访问某个接口最多的 IP
grep '/predict' access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head
```

## 权限

```bash
chmod 755 script.sh              # rwxr-xr-x
chmod +x script.sh               # 增加执行权限
chmod -R u+rw,go-w dir/          # 递归设置（符号模式）
chown -R user:group dir/

# 查看权限
stat -c '%a %U %G %n' file
ls -l                            # 易读格式

# 是什么阻止了访问？
namei -l /path/to/thing          # 沿路径逐级诊断 ACL
```

## 进程

```bash
ps aux                           # 所有进程
ps -ef --forest                  # 进程树
pgrep -a -f 'pattern'            # 按命令查找
pkill -f 'pattern'               # 按命令终止
kill -9 <pid>                    # SIGKILL（最后手段）
kill -15 <pid>                   # SIGTERM（让它自行清理）

top                              # 实时监控
htop                             # 更友好的 top（若已安装）
iotop                            # IO 使用情况
iftop                            # 网络使用情况

# 谁在监听？
ss -tlnp                         # TCP 监听 + 程序
ss -tunp                         # 所有 TCP/UDP + 连接
lsof -i :8080                    # 8080 端口被谁占用
lsof -p <pid>                    # 该 pid 打开了哪些文件/套接字
```

## systemd

```bash
systemctl status nginx
systemctl start|stop|restart nginx
systemctl enable nginx           # 开机自启
systemctl daemon-reload          # 修改 .service 文件后执行

journalctl -u nginx -f           # 跟踪日志
journalctl --since "1 hour ago" --until "10 min ago"
journalctl -u nginx --since today --no-pager | tail -200
```

## 网络

```bash
# 连通性
ping -c 4 host
traceroute host
mtr host

# DNS
dig +short example.com
dig example.com @1.1.1.1         # 指定 DNS 服务器查询
host -t MX example.com

# HTTP
curl -sS https://example.com
curl -v -X POST -H 'content-type: application/json' \
     -d '{"x":1}' https://example.com/api
curl -o file.tar.gz -L https://example.com/release.tar.gz
curl -I https://example.com      # 仅显示响应头
curl -w '\n%{http_code} %{time_total}s\n' https://example.com

# 网卡信息
ip a
ip route
ip -s link show eth0             # 统计信息
```

## SSH

```bash
ssh user@host
ssh -i ~/.ssh/key.pem user@host
ssh -L 8080:remote-svc:80 user@host        # 本地端口转发
ssh -R 8080:localhost:80 user@host         # 远程端口转发
ssh-keygen -t ed25519                       # 生成密钥
ssh-copy-id user@host                       # 安装公钥
```

`~/.ssh/config` 示例：

```text
Host bastion
    HostName 10.0.0.1
    User you
    IdentityFile ~/.ssh/id_ed25519
```

## 文本处理

```bash
sed -i 's/old/new/g' file        # 就地替换
sed -n '20,40p' file             # 打印第 20-40 行

awk '{print $1, $3}' file
awk -F',' '{print $2}' csv       # 逗号分隔
awk '$3 > 100 {print}' file       # 按第 3 列过滤

cut -d',' -f1,3 csv               # 第 1 和第 3 列
sort -k2 -n file                  # 按第 2 列数值排序
sort -u                           # 去重
uniq -c                           # 统计重复次数（先排序）

tr '[:upper:]' '[:lower:]'        # 转小写
tr -d '\r' < file                 # 去掉回车符

wc -l file                        # 统计行数
head -n 20 file                   # 前 20 行
tail -f file                      # 持续跟踪新增内容
tail -n 100 file
```

## tar / gzip

```bash
tar czf archive.tar.gz dir/      # 创建 gzip 压缩包
tar xzf archive.tar.gz           # 解压
tar tzf archive.tar.gz | head    # 列出内容
tar xzf archive.tar.gz -C /dst   # 解压到指定路径

gzip -9 file                     # 压缩（最高压缩比）
zcat file.gz | grep pattern      # 在压缩文件中搜索
```

## Bash 脚本基础

```bash
#!/usr/bin/env bash
set -euo pipefail        # 出错即退出、未定义变量报错、管道失败即退出
IFS=$'\n\t'              # 更安全的字段分割

# 变量
name="value"
readonly CONFIG="/etc/app.conf"
PATH="/usr/local/bin:$PATH"

# 参数
if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <arg>" >&2
    exit 1
fi
input="$1"
shift

# 条件判断
if [[ -f /etc/passwd ]]; then ...; fi
if [[ "$x" == "go" ]]; then ...; fi

# 循环
for f in *.log; do
    echo "$f"
done

while IFS= read -r line; do
    echo "$line"
done < file.txt

# 函数
greet() {
    local name="$1"
    echo "hi $name"
}
greet world

# 退出时清理
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
```

## 作业控制

```bash
sleep 100 &              # 后台运行
jobs                     # 列出作业
fg %1                    # 调到前台
bg %1                    # 转入后台继续运行
Ctrl-Z                   # 挂起
nohup long_cmd &         # 退出登录后仍运行
disown                   # 与 shell 脱离
```

## 磁盘与文件系统

```bash
df -h                    # 文件系统使用情况
du -sh dir/              # 单个目录总大小
du -h --max-depth=1 .    # 只统计一层
ncdu                     # 交互式磁盘用量（若已安装）

lsblk                    # 块设备
mount | column -t        # 已挂载的文件系统
```

## 常用快捷键

| 按键 | 作用 |
|---|---|
| `Ctrl-R` | 反向增量搜索历史 |
| `Ctrl-A` / `Ctrl-E` | 行首 / 行尾 |
| `Ctrl-W` | 删除前一个单词 |
| `Ctrl-U` | 删除到行首 |
| `Ctrl-L` | 清屏 |
| `Alt-.` | 上一条命令的最后一个参数 |
| `!!` | 上一条命令 |
| `!$` | 上一条命令的最后一个参数 |
| `^old^new` | 替换后重新执行上一条命令 |

## 常见陷阱

- **`rm -rf $VAR/`** — 如果 `VAR` 为空，这条命令就变成了 `rm -rf /`。务必加引号并检查。
- **文件名含空格** — 一律加引号：用 `"$f"`，不要用 `$f`。
- **`cat foo | grep bar`** — 多余的 cat。直接 `grep bar foo` 即可。
- **`for f in $(ls)`** — 遇到空格就会出错。改用 `for f in *` 或 `find ... -print0 | xargs -0`。
- **脚本中没有 `set -e`** — 错误会被静默忽略。始终使用 `set -euo pipefail`。
- **Bash 版本** — macOS 自带的是古老的 bash 3.2。使用 `#!/usr/bin/env bash`，并在 Linux 上测试。

## 另见

- `man bash`, `man bash-builtins`
- [ShellCheck](https://www.shellcheck.net/) — 检查脚本中的问题
- [explainshell.com](https://explainshell.com/) — 带注释的命令拆解
