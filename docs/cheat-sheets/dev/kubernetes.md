---
title: Kubernetes 常用命令
description: kubectl、资源管理、Pod、Deployment、Service、ConfigMap、Secret 与排错。
sidebarSort: 23
---

# Kubernetes 常用命令

日常运维和调试中高频使用的 kubectl 命令与 YAML 模板。

## kubectl 基础

### 配置
```bash
# 查看当前上下文
kubectl config current-context

# 列出所有上下文
kubectl config get-contexts

# 切换上下文
kubectl config use-context <context-name>

# 查看集群信息
kubectl cluster-info

# 查看 kubectl 配置
kubectl config view

# 设置默认 Namespace
kubectl config set-context --current --namespace=<namespace>
```

### 获取帮助
```bash
# 通用帮助
kubectl --help

# 指定命令的帮助
kubectl get --help

# 解释资源字段
kubectl explain pod
kubectl explain pod.spec
kubectl explain pod.spec.containers
```

### 基础命令
```bash
# 获取资源
kubectl get <resource>
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all

# 查看资源详细信息
kubectl describe <resource> <name>
kubectl describe pod my-pod

# 从文件创建资源
kubectl apply -f <file.yaml>
kubectl create -f <file.yaml>

# 删除资源
kubectl delete <resource> <name>
kubectl delete -f <file.yaml>

# 编辑资源
kubectl edit <resource> <name>
```


## 资源管理

### 查看资源

#### 获取资源
```bash
# 列出所有 Pod
kubectl get pods
kubectl get po  # 简写

# 查看更详细的信息
kubectl get pods -o wide

# 列出所有 Namespace 中的资源
kubectl get pods --all-namespaces
kubectl get pods -A  # 简写

# 列出指定 Namespace 中的资源
kubectl get pods -n <namespace>

# 输出格式
kubectl get pods -o yaml
kubectl get pods -o json
kubectl get pods -o name
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase
```

#### 监视资源
```bash
# 监视变更
kubectl get pods --watch
kubectl get pods -w  # 简写

# 监视所有资源
kubectl get all -w
```

#### 过滤
```bash
# 按标签过滤
kubectl get pods -l app=myapp
kubectl get pods --selector app=myapp

# 按字段过滤
kubectl get pods --field-selector status.phase=Running

# 多个过滤条件
kubectl get pods -l app=myapp,env=prod
```

### 创建资源

#### 命令式命令
```bash
# 创建 Pod
kubectl run nginx --image=nginx

# 创建 Deployment
kubectl create deployment nginx --image=nginx

# 创建 Service
kubectl expose deployment nginx --port=80 --type=NodePort

# 从文件创建
kubectl create -f deployment.yaml
```

#### 声明式命令
```bash
# 应用配置（创建或更新）
kubectl apply -f deployment.yaml
kubectl apply -f ./configs/

# 递归应用
kubectl apply -f ./configs/ -R
```

### 更新资源
```bash
# 设置镜像
kubectl set image deployment/nginx nginx=nginx:1.19

# 扩缩容 Deployment
kubectl scale deployment nginx --replicas=3

# 自动扩缩容
kubectl autoscale deployment nginx --min=2 --max=10 --cpu-percent=80

# 编辑资源
kubectl edit deployment nginx

# 使用 patch 更新资源
kubectl patch deployment nginx -p '{"spec":{"replicas":5}}'
```

### 删除资源
```bash
# 删除 Pod
kubectl delete pod nginx

# 删除 Deployment
kubectl delete deployment nginx

# 从文件删除
kubectl delete -f deployment.yaml

# 按标签删除
kubectl delete pods -l app=myapp

# 强制删除
kubectl delete pod nginx --force --grace-period=0  # 谨慎：跳过优雅终止

# 删除 Namespace 中的所有 Pod
kubectl delete pods --all -n <namespace>
```


## Pod

### Pod 操作
```bash
# 列出 Pod
kubectl get pods

# 查看 Pod 详细信息
kubectl describe pod <pod-name>

# 获取 Pod 日志
kubectl logs <pod-name>
kubectl logs <pod-name> -f  # 持续输出
kubectl logs <pod-name> --tail=100  # 最后 100 行
kubectl logs <pod-name> -c <container-name>  # 指定容器
kubectl logs <pod-name> --previous  # 上一个实例

# 在 Pod 中执行命令
kubectl exec <pod-name> -- <command>
kubectl exec -it <pod-name> -- bash  # 交互式 bash
kubectl exec -it <pod-name> -c <container> -- bash  # 指定容器

# 端口转发
kubectl port-forward <pod-name> 8080:80

# 复制文件
kubectl cp <pod-name>:/path/in/pod /local/path
kubectl cp /local/path <pod-name>:/path/in/pod

# 资源用量（top）
kubectl top pod <pod-name>
kubectl top pods --all-namespaces
```

### Pod 调试
```bash
# 获取 Pod 的 YAML
kubectl get pod <pod-name> -o yaml

# 获取事件
kubectl get events --sort-by=.metadata.creationTimestamp

# 排查问题时查看详细信息
kubectl describe pod <pod-name>

# 检查 Pod 状态
kubectl get pod <pod-name> -o jsonpath='{.status.phase}'

# 检查容器状态
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[*].state}'
```

### Pod YAML 示例
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.19
    ports:
    - containerPort: 80
    env:
    - name: ENV
      value: "production"
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```


## Deployment

### Deployment 操作
```bash
# 创建 Deployment
kubectl create deployment nginx --image=nginx:1.19

# 列出 Deployment
kubectl get deployments
kubectl get deploy  # 简写

# 查看 Deployment 详细信息
kubectl describe deployment nginx

# 扩缩容 Deployment
kubectl scale deployment nginx --replicas=5

# 自动扩缩容
kubectl autoscale deployment nginx --min=2 --max=10 --cpu-percent=80

# 更新镜像
kubectl set image deployment/nginx nginx=nginx:1.20

# 检查滚动更新状态
kubectl rollout status deployment/nginx

# 查看发布历史
kubectl rollout history deployment/nginx

# 回滚到上一版本
kubectl rollout undo deployment/nginx

# 回滚到指定版本
kubectl rollout undo deployment/nginx --to-revision=2

# 暂停发布
kubectl rollout pause deployment/nginx

# 恢复发布
kubectl rollout resume deployment/nginx

# 重启 Deployment（重建 Pod）
kubectl rollout restart deployment/nginx
```

### Deployment YAML 示例
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.19
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```


## Service

### Service 操作
```bash
# 列出 Service
kubectl get services
kubectl get svc  # 简写

# 查看 Service 详细信息
kubectl describe service nginx

# 从 Deployment 创建 Service
kubectl expose deployment nginx --port=80 --type=NodePort

# 获取 Service 端点
kubectl get endpoints nginx

# 删除 Service
kubectl delete service nginx
```

### Service 类型

#### ClusterIP（默认）
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-clusterip
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
```

#### NodePort
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080  # 可选，省略时自动分配
```

#### LoadBalancer
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
```


## ConfigMap 与 Secret

### ConfigMap

#### 创建 ConfigMap
```bash
# 从字面量值创建
kubectl create configmap app-config \
  --from-literal=ENV=production \
  --from-literal=DEBUG=false

# 从文件创建
kubectl create configmap app-config --from-file=config.properties

# 从目录创建
kubectl create configmap app-config --from-file=./configs/

# 从 YAML 创建
kubectl apply -f configmap.yaml
```

#### ConfigMap YAML
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  ENV: "production"
  DEBUG: "false"
  config.properties: |
    property1=value1
    property2=value2
```

#### 在 Pod 中使用 ConfigMap
```yaml
spec:
  containers:
  - name: app
    image: myapp
    # 从 ConfigMap 注入环境变量
    env:
    - name: ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: ENV
    # 将所有键作为环境变量注入
    envFrom:
    - configMapRef:
        name: app-config
    # 挂载为卷
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

### Secret

#### 创建 Secret
```bash
# 从字面量值创建
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123

# 从文件创建
kubectl create secret generic db-secret --from-file=./secret.txt

# TLS Secret
kubectl create secret tls tls-secret \
  --cert=path/to/cert.crt \
  --key=path/to/key.key

# Docker 仓库认证 Secret
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<username> \
  --docker-password=<password>
```

#### Secret YAML
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  # 值必须为 base64 编码
  username: YWRtaW4=  # admin
  password: c2VjcmV0MTIz  # secret123
```

#### Base64 编码/解码
```bash
# 编码
echo -n "secret123" | base64

# 解码
echo "c2VjcmV0MTIz" | base64 --decode
```

#### 在 Pod 中使用 Secret
```yaml
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    envFrom:
    - secretRef:
        name: db-secret
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: db-secret
```


## Namespace

### Namespace 操作
```bash
# 列出 Namespace
kubectl get namespaces
kubectl get ns  # 简写

# 创建 Namespace
kubectl create namespace dev

# 删除 Namespace
kubectl delete namespace dev

# 获取 Namespace 中的资源
kubectl get pods -n dev

# 设置默认 Namespace
kubectl config set-context --current --namespace=dev
```

### Namespace YAML
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
  labels:
    environment: development
```

### 资源配额
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "10"
```


## 故障排查

### 调试命令

#### Pod 问题
```bash
# 检查 Pod 状态
kubectl get pods
kubectl describe pod <pod-name>

# 查看日志
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # 上一个容器

# 事件
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl get events -n <namespace>

# 进入 Pod shell
kubectl exec -it <pod-name> -- sh
kubectl exec -it <pod-name> -- bash

# 检查资源用量
kubectl top pod <pod-name>
kubectl top node
```

#### 网络问题
```bash
# 检查 Service 端点
kubectl get endpoints <service-name>

# 查看 Service 详细信息
kubectl describe service <service-name>

# 端口转发用于测试
kubectl port-forward <pod-name> 8080:80

# 从 Pod 内测试连通性
kubectl exec -it <pod-name> -- wget -qO- http://service-name
kubectl exec -it <pod-name> -- curl service-name
```

#### 资源问题
```bash
# 检查节点资源
kubectl describe node <node-name>
kubectl top nodes

# 检查 Pod 资源用量
kubectl top pods

# 检查资源配额
kubectl describe resourcequota -n <namespace>
```

### 常见 Pod 状态

**Pending**：等待调度
```bash
# 检查节点资源
kubectl describe node
# 检查事件
kubectl describe pod <pod-name>
```

**ImagePullBackOff**：无法拉取容器镜像
```bash
# 检查镜像名称和凭据
kubectl describe pod <pod-name>
```

**CrashLoopBackOff**：容器持续崩溃
```bash
# 查看日志
kubectl logs <pod-name>
kubectl logs <pod-name> --previous
```

**Error**：容器异常退出
```bash
# 查看日志和详细信息
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```


## YAML 模板

### 完整的 Deployment 示例
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
  labels:
    app: myapp
    environment: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: "1.0"
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: ENV
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        resources:
          requests:
            memory: "128Mi"
            cpu: "250m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
        - name: data-volume
          mountPath: /data
      volumes:
      - name: config-volume
        configMap:
          name: app-config
      - name: data-volume
        persistentVolumeClaim:
          claimName: data-pvc
      imagePullSecrets:
      - name: regcred

apiVersion: v1
kind: Service
metadata:
  name: myapp-service
  namespace: production
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```


## 快速参考

### 最常用的命令
```bash
# 查看资源
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all

# 查看详细信息
kubectl describe pod <name>

# 日志
kubectl logs -f <pod-name>

# 执行命令
kubectl exec -it <pod-name> -- bash

# 应用配置
kubectl apply -f <file.yaml>

# 扩缩容
kubectl scale deployment <name> --replicas=3

# 端口转发
kubectl port-forward <pod-name> 8080:80
```

### 资源简称
```bash
po = pods
deploy = deployments
svc = services
ns = namespaces
no = nodes
cm = configmaps
pv = persistentvolumes
pvc = persistentvolumeclaims
sa = serviceaccounts
```


## 常用别名

将以下内容加入 `~/.bashrc` 或 `~/.zshrc`：

```bash
alias k='kubectl'
alias kg='kubectl get'
alias kd='kubectl describe'
alias kdel='kubectl delete'
alias kl='kubectl logs'
alias kex='kubectl exec -it'
alias kaf='kubectl apply -f'
alias kdf='kubectl delete -f'

# 带监视
alias kgpw='kubectl get pods -w'
alias kgdw='kubectl get deployments -w'

# 所有 Namespace
alias kgpa='kubectl get pods --all-namespaces'
alias kgda='kubectl get deployments --all-namespaces'
```


## 其他资源

- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [kubectl 速查表](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Play with Kubernetes](https://labs.play-with-k8s.com/)
- [Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)


