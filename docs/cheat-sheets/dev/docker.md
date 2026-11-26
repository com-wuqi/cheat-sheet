---
title: Docker 常用命令
description: 镜像、容器、Dockerfile、Compose、网络、卷与排错的常用命令。
sidebarSort: 22
---

# Docker 常用命令

日常开发中高频使用的 Docker 命令和配置片段。

## 基础命令

### 版本与信息
```bash
# 查看 Docker 版本
docker --version
docker version  # 详细版本信息

# 查看系统级信息
docker info

# 获取帮助
docker --help
docker <command> --help
```

### 镜像
```bash
# 列出镜像
docker images
docker image ls

# 拉取镜像
docker pull <image>:<tag>
docker pull python:3.9

# 删除镜像
docker rmi <image-id>
docker image rm <image-id>

# 删除未使用的镜像
docker image prune
docker image prune -a  # 删除所有未使用的镜像
```

### 容器
```bash
# 列出运行中的容器
docker ps
docker container ls

# 列出所有容器（包括已停止的）
docker ps -a
docker container ls -a

# 运行容器
docker run <image>
docker run -d <image>  # 分离模式
docker run -it <image> bash  # 交互式 bash

# 停止容器
docker stop <container-id>

# 启动已停止的容器
docker start <container-id>

# 删除容器
docker rm <container-id>

# 删除所有已停止的容器
docker container prune
```


## 镜像管理

### 构建镜像
```bash
# 基于当前目录的 Dockerfile 构建
docker build -t <image-name>:<tag> .

# 指定 Dockerfile 构建
docker build -f Dockerfile.prod -t myapp:prod .

# 使用构建参数构建
docker build --build-arg VERSION=1.0 -t myapp:1.0 .

# 不使用缓存构建
docker build --no-cache -t myapp:latest .
```

### 标记镜像
```bash
# 标记镜像
docker tag <image-id> <repository>:<tag>
docker tag myapp:latest myuser/myapp:v1.0

# 推送到镜像仓库
docker push myuser/myapp:v1.0

# 拉取指定标签
docker pull myuser/myapp:v1.0
```

### 查看镜像信息
```bash
# 显示详细信息
docker inspect <image-id>

# 查看镜像历史
docker history <image-id>

# 查看镜像大小
docker images --format "{{.Repository}}:{{.Tag}} - {{.Size}}"
```


## 容器管理

### 运行容器

#### 基础运行
```bash
# 指定名称运行容器
docker run --name my-container nginx

# 带端口映射运行
docker run -p 8080:80 nginx

# 带环境变量运行
docker run -e "ENV=production" -e "DEBUG=false" myapp

# 带卷挂载运行
docker run -v /host/path:/container/path myapp

# 带资源限制运行
docker run --memory="256m" --cpus="1.0" myapp
```

#### 高级选项
```bash
# 带重启策略运行
docker run --restart=always nginx
docker run --restart=on-failure:3 myapp  # 最多重启 3 次

# 使用自定义网络运行
docker run --network my-network myapp

# 以指定用户身份运行
docker run --user 1000:1000 myapp

# 指定工作目录运行
docker run -w /app myapp

# 指定主机名运行
docker run --hostname my-host myapp
```

### 容器操作
```bash
# 在运行中的容器内执行命令
docker exec <container-id> <command>
docker exec -it <container-id> bash  # 交互式 bash

# 查看日志
docker logs <container-id>
docker logs -f <container-id>  # 实时跟踪日志
docker logs --tail 100 <container-id>  # 最后 100 行

# 查看容器进程
docker top <container-id>

# 查看容器资源占用
docker stats
docker stats <container-id>

# 在容器与主机之间复制文件
docker cp <container-id>:/path/in/container /local/path
docker cp /local/path <container-id>:/path/in/container

# 查看容器详情
docker inspect <container-id>
```

### 容器生命周期
```bash
# 优雅停止容器（先 SIGTERM 后 SIGKILL）
docker stop <container-id>

# 强制停止（立即 SIGKILL）
docker kill <container-id>

# 暂停容器
docker pause <container-id>

# 恢复容器
docker unpause <container-id>

# 重启容器
docker restart <container-id>

# 重命名容器
docker rename <old-name> <new-name>
```


## Dockerfile 语法

### 基本结构
```dockerfile
# 基础镜像
FROM python:3.9-slim

# 元数据
LABEL maintainer="you@example.com"
LABEL version="1.0"

# 设置工作目录
WORKDIR /app

# 复制文件
COPY requirements.txt .
COPY . .

# 执行命令
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

# 暴露端口
EXPOSE 8000

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

# 定义入口点与命令
ENTRYPOINT ["python"]
CMD ["app.py"]
```

### 多阶段构建
```dockerfile
# 构建阶段
FROM python:3.9 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# 运行阶段
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

### 常用指令
```dockerfile
# ARG - 构建时变量
ARG VERSION=1.0
ARG BUILD_DATE

# ENV - 环境变量
ENV APP_HOME=/app \
    PORT=8000

# VOLUME - 挂载点
VOLUME ["/data"]

# HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000/health || exit 1

# ONBUILD - 子镜像的触发指令
ONBUILD COPY . /app
```


## Docker Compose

### 基础命令
```bash
# 启动服务
docker compose up
docker compose up -d  # 分离模式

# 启动指定服务
docker compose up service1 service2

# 停止服务
docker compose stop

# 停止并删除容器、网络
docker compose down

# 停止并删除所有内容（包括卷）
docker compose down -v

# 查看日志
docker compose logs
docker compose logs -f  # 实时跟踪
docker compose logs service1  # 指定服务

# 列出服务
docker compose ps

# 在服务中执行命令
docker compose exec service1 bash

# 构建或重建服务
docker compose build
docker compose build --no-cache

# 拉取服务镜像
docker compose pull

# 校验 compose.yaml
docker compose config
```

### Compose YAML 结构
```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VERSION: "1.0"
    image: myapp:latest
    container_name: my-web-app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
      - DATABASE_URL=postgresql://db:5432/mydb
    env_file:
      - .env
    volumes:
      - ./src:/app/src
      - app-data:/app/data
    networks:
      - app-network
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    command: python app.py

  db:
    image: postgres:13
    container_name: my-postgres
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    networks:
      - app-network

volumes:
  app-data:
  postgres-data:

networks:
  app-network:
    driver: bridge
```


## 网络

### 网络命令
```bash
# 列出网络
docker network ls

# 创建网络
docker network create my-network
docker network create --driver bridge my-bridge

# 查看网络详情
docker network inspect my-network

# 将容器连接到网络
docker network connect my-network <container-id>

# 断开容器与网络的连接
docker network disconnect my-network <container-id>

# 删除网络
docker network rm my-network

# 删除未使用的网络
docker network prune
```

### 网络驱动
- **bridge**：默认模式，单主机上的隔离网络
- **host**：取消网络隔离，使用宿主机网络
- **overlay**：多主机网络（Swarm）
- **macvlan**：为容器分配 MAC 地址
- **none**：禁用网络

### DNS 解析
```bash
# 在自定义网络上，容器可通过名称互相访问
docker run --network my-network --name web nginx
docker run --network my-network alpine ping web
```


## 卷

### 卷命令
```bash
# 列出卷
docker volume ls

# 创建卷
docker volume create my-volume

# 查看卷详情
docker volume inspect my-volume

# 删除卷
docker volume rm my-volume

# 删除未使用的卷
docker volume prune
```

### 卷类型

#### 具名卷
```bash
docker run -v my-volume:/data alpine
```

```yaml
services:
  app:
    volumes:
      - my-volume:/data
volumes:
  my-volume:
```

#### 绑定挂载
```bash
docker run -v /host/path:/container/path alpine
```

```yaml
services:
  app:
    volumes:
      - ./local:/app
```

#### 匿名卷
```bash
docker run -v /data alpine
```


## 故障排查

### 调试容器

#### 容器无法启动
```bash
# 查看日志
docker logs <container-id>

# 查看容器配置
docker inspect <container-id>

# 尝试以交互方式运行
docker run -it <image> bash

# 检查端口是否已被占用
netstat -tulpn | grep <port>
```

#### 容器立即退出
```bash
# 检查退出码
docker ps -a
docker inspect <container-id> | grep ExitCode

# 常见退出码：
# 0 - 成功
# 1 - 应用错误
# 137 - SIGKILL（被系统杀死）
# 139 - 段错误
# 143 - SIGTERM（优雅退出）
```

#### 网络问题
```bash
# 检查容器网络
docker exec <container-id> ping google.com
docker exec <container-id> nslookup google.com

# 检查已暴露的端口
docker port <container-id>

# 查看网络详情
docker network inspect <network-name>
```

#### 性能问题
```bash
# 检查资源占用
docker stats <container-id>

# 检查磁盘占用
docker system df

# 查看日志大小
docker inspect -f '{{.LogPath}}' <container-id>
# 然后执行 ls -lh /path/to/log
```

### 常见问题

**问题**："Permission denied"（权限被拒绝）
```bash
# 方案 1：以 root 运行（不推荐）
docker run --user root <image>

# 方案 2：在 Dockerfile 中修正所有者
RUN chown -R appuser:appuser /app
USER appuser
```

**问题**："Cannot connect to Docker daemon"（无法连接 Docker 守护进程）
```bash
# 方案：启动 Docker 服务
sudo systemctl start docker

# 或者把用户加入 docker 组
sudo usermod -aG docker $USER
# 注销后重新登录
```

**问题**："No space left on device"（磁盘空间不足）
```bash
# 清理
docker system prune -a --volumes
```

::: warning
`docker system prune -a --volumes` 会删除所有未使用镜像、容器、网络和卷，执行前先确认没有需要保留的数据。
:::


## 最佳实践

### Dockerfile 最佳实践

1. **使用具体的基础镜像标签**
   ```dockerfile
   # 推荐
   FROM python:3.9-slim

   # 避免
   FROM python:latest
   ```

2. **尽量减少层数**
   ```dockerfile
   # 推荐
   RUN apt-get update && apt-get install -y \
       package1 \
       package2 \
       && rm -rf /var/lib/apt/lists/*

   # 避免
   RUN apt-get update
   RUN apt-get install -y package1
   RUN apt-get install -y package2
   ```

3. **按变更频率排序指令**
   ```dockerfile
   # 很少变动
   FROM python:3.9-slim
   RUN apt-get update && apt-get install -y gcc

   # 有时变动
   COPY requirements.txt .
   RUN pip install -r requirements.txt

   # 频繁变动
   COPY . .
   ```

4. **使用 .dockerignore**
   ```
   .git
   .env
   __pycache__
   *.pyc
   node_modules
   .venv
   ```

5. **不要以 root 运行**
   ```dockerfile
   RUN useradd -m -u 1000 appuser
   USER appuser
   ```

6. **用 COPY 代替 ADD**
   ```dockerfile
   # 首选
   COPY requirements.txt .

   # 仅用于解压 tar 或获取 URL
   ADD archive.tar.gz /app
   ```

### 容器最佳实践

1. **每个容器只运行一个进程**
2. **用环境变量进行配置**
3. **实现健康检查**
4. **合理使用重启策略**
5. **使用语义化版本给镜像打标签**
6. **让容器保持临时性（可随时丢弃）**
7. **不要把数据存在容器里（使用卷）**

### 安全最佳实践

1. **扫描镜像漏洞**
   ```bash
   docker scout cves <image>
   ```

2. **不要在镜像中包含密钥**
3. **使用密钥管理**
4. **保持基础镜像更新**
5. **限制容器能力**
   ```bash
   docker run --cap-drop ALL --cap-add NET_BIND_SERVICE myapp
   ```


## 快速参考

### 最常用命令
```bash
# 构建并运行
docker build -t myapp .
docker run -d -p 8000:8000 --name myapp-container myapp

# 查看与调试
docker ps
docker logs -f myapp-container
docker exec -it myapp-container bash

# 清理
docker stop myapp-container
docker rm myapp-container
docker rmi myapp
docker system prune -a
```

### 资源限制
```bash
# 内存限制
docker run -m 512m myapp

# CPU 限制
docker run --cpus="1.5" myapp

# 同时限制
docker run -m 512m --cpus="1.5" myapp
```

### Docker Compose 快速上手
```bash
# 启动全部服务
docker compose up -d

# 查看日志
docker compose logs -f

# 重新构建并重启
docker compose up -d --build

# 停止全部服务
docker compose down

# 停止并删除卷
docker compose down -v
```


## 常用别名

将以下内容添加到 `~/.bashrc` 或 `~/.zshrc`：

```bash
# Docker
alias d='docker'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dex='docker exec -it'
alias dlogs='docker logs -f'
alias dstop='docker stop $(docker ps -q)'
alias drm='docker rm $(docker ps -aq)'
alias drmi='docker rmi $(docker images -q)'

# Docker Compose
alias dc='docker compose'
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcl='docker compose logs -f'
alias dce='docker compose exec'
alias dcb='docker compose build'

# 清理
alias docker-clean='docker system prune -a --volumes'
```


## 其他资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Play with Docker](https://labs.play-with-docker.com/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)


