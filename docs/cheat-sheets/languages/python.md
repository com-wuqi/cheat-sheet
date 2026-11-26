---
title: Python 常用写法
description: 环境与依赖、类型标注、日志、异常、文件、异步、测试和常用标准库。
sidebarSort: 31
---

# Python 常用写法

日常开发中高频使用的 Python 写法与工具链。示例以 Python 3.10+ 为主。

## 环境与依赖

```bash
# 创建并激活虚拟环境
python -m venv .venv
source .venv/bin/activate           # macOS/Linux
.venv\Scripts\activate              # Windows

# 锁定版本，让安装可复现
pip install -r requirements.txt
pip freeze > requirements.txt

# 现代替代方案：uv（比 pip 快 10-100 倍）
uv venv
uv pip install -r requirements.txt
uv pip compile requirements.in -o requirements.txt
```

| 工具 | 用途 |
|---|---|
| `pip` + `venv` | 标准方案，随 Python 自带 |
| `uv` | 可直接替换 pip，速度快得多 |
| `poetry` | 依赖解析 + 打包，约定性强 |
| `pip-tools` | 把 `requirements.in` 编译成锁定版本的 `requirements.txt` |
| `conda` | 需要捆绑非 Python 依赖（CUDA、MKL）时使用 |

## 类型标注

```python
from typing import Optional
from collections.abc import Iterable, Mapping

def predict(features: list[float], model_version: str = "latest") -> float:
    ...

def fetch(urls: Iterable[str]) -> Mapping[str, bytes]:
    ...

def lookup(user_id: int) -> Optional[dict]:  # 或：dict | None（3.10+）
    ...
```

在 CI 中运行 `mypy` 或 `pyright`。把类型错误当作编译错误来对待。

## 日志（而不是 print）

```python
import logging
logger = logging.getLogger(__name__)
logger.info("Loaded model", extra={"model_version": "v3", "size_mb": 42})

# JSON 结构化日志
import json, logging.config
logging.config.dictConfig({
    "version": 1,
    "formatters": {
        "json": {"()": "pythonjsonlogger.json.JsonFormatter",
                  "format": "%(asctime)s %(levelname)s %(name)s %(message)s"}
    },
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "json"}},
    "root": {"level": "INFO", "handlers": ["console"]},
})
```

日志级别：`DEBUG < INFO < WARNING < ERROR < CRITICAL`。

## 异常处理

```python
try:
    result = risky()
except (TimeoutError, ConnectionError) as exc:
    logger.warning("transient", exc_info=exc)
    raise                       # 重新抛出，保留 traceback
except ValueError as exc:
    raise InvalidInput(str(exc)) from exc   # 链式关联
finally:
    cleanup()
```

不要写裸 `except`。除非处在上层边界，否则不要捕获 `Exception`。

## 文件与路径

```python
from pathlib import Path

p = Path("/data/raw") / "events.json"
text = p.read_text()
data = json.loads(text)

# 遍历
for child in Path(".").rglob("*.parquet"):
    print(child)

# 原子写入
tmp = p.with_suffix(".tmp")
tmp.write_text(payload)
tmp.replace(p)
```

## JSON / YAML

```python
import json, yaml

data = json.loads(text)
text = json.dumps(data, indent=2, default=str)   # default=str 可处理 datetime

with open("config.yaml") as f:
    cfg = yaml.safe_load(f)                       # 始终用 safe_load，不要用 load
```

## 子进程（必须调用外部命令时）

```python
import subprocess
res = subprocess.run(
    ["kubectl", "get", "pods", "-o", "json"],
    capture_output=True, text=True, check=True, timeout=30,
)
pods = json.loads(res.stdout)
```

`check=True` 会在退出码非零时抛出异常。始终设置 `timeout`。绝不要把用户输入和 `shell=True` 一起使用。

## 用 argparse 写命令行

```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--model", required=True)
parser.add_argument("--threshold", type=float, default=0.5)
parser.add_argument("-v", "--verbose", action="store_true")
args = parser.parse_args()
```

更复杂的命令行工具：用 `click` 或 `typer`。

## 用 requests 发 HTTP 请求

```python
import requests

resp = requests.post(
    "https://api.example.com/predict",
    json={"features": [...]},
    headers={"Authorization": f"Bearer {token}"},
    timeout=(3.0, 10.0),    # （连接超时, 读取超时）
)
resp.raise_for_status()
data = resp.json()
```

始终设置超时。始终调用 `raise_for_status()` 或检查 `resp.ok`。

## 用 asyncio 写异步

```python
import asyncio, httpx

async def fetch(url):
    async with httpx.AsyncClient() as client:
        r = await client.get(url, timeout=10)
        return r.json()

async def main():
    results = await asyncio.gather(*(fetch(u) for u in urls))

asyncio.run(main())
```

## 并发速查

| 负载类型 | 工具 |
|---|---|
| I/O 密集型，任务很多 | `asyncio` |
| I/O 密集型，任务较少且逻辑简单 | `concurrent.futures.ThreadPoolExecutor` |
| CPU 密集型 | `concurrent.futures.ProcessPoolExecutor` |
| 混合型 | 用 `loop.run_in_executor` 把进程池和事件循环分开 |

## 用 pytest 做测试

```python
import pytest

def test_predict_returns_float():
    assert isinstance(predict([1.0, 2.0]), float)

@pytest.mark.parametrize("inp,expected", [([1.0], 1.0), ([2.0], 2.0)])
def test_identity(inp, expected):
    assert predict(inp) == expected

@pytest.fixture
def client():
    app = create_app({"TESTING": True})
    with app.test_client() as c:
        yield c
```

运行：`pytest -v --cov=src --cov-report=term-missing`

## 工具链

| 工具 | 用途 |
|---|---|
| `black` | 自动格式化（不用再争论配置） |
| `ruff` | 快速的 linter + 格式化工具（可替代 flake8、isort、pyupgrade） |
| `mypy` / `pyright` | 静态类型检查 |
| `pytest` | 测试运行器 |
| `pytest-cov` | 覆盖率 |
| `pre-commit` | 提交时自动运行格式化/linter |
| `bandit` | 安全扫描 |

## 标准项目结构

```
myproject/
├── pyproject.toml         # 项目元数据 + 工具配置
├── src/
│   └── mypackage/
│       ├── __init__.py
│       └── ...
├── tests/
│   └── test_*.py
├── requirements.txt
└── README.md
```

`src/` 布局可以避免从工作目录意外导入模块。

## 常见陷阱

- **可变默认参数。** 不要写 `def f(x=[]):` — 改用 `def f(x=None): x = x or []`。
- **闭包晚绑定。** `[lambda: i for i in range(3)]` — 所有 lambda 都返回 `2`。要写成 `lambda i=i: i`。
- **`is` 与 `==`。** `is` 判断的是同一性。只对 `is None`、`is True`、`is False` 使用。
- **浮点数。** `0.1 + 0.2 != 0.3`。货币计算请用 `math.isclose` 或 `decimal.Decimal`。
- **GIL。** 在 CPython 中线程无法并行执行 CPU 任务。CPU 任务请用多进程。
- **`__init__.py` 中的顺序问题。** 不要在包的初始化代码里放有副作用的代码。

## 常用标准库模块

| 模块 | 用途 |
|---|---|
| `pathlib` | 文件系统路径 |
| `dataclasses` | 简单的数据类 |
| `enum` | 具名常量 |
| `collections` | `Counter`、`defaultdict`、`deque` |
| `itertools` | `chain`、`groupby`、`product`、`islice` |
| `functools` | `lru_cache`、`partial`、`reduce` |
| `contextlib` | `contextmanager`、`suppress`、`ExitStack` |
| `concurrent.futures` | 基于线程/进程池的并行 |
| `secrets` | 密码学安全的随机数 |
| `uuid` | 唯一 ID |
| `datetime` + `zoneinfo` | 带时区的日期时间 |

## 另见

- [Real Python](https://realpython.com/) — 高质量教程
- [Python 类型检查指南](https://mypy.readthedocs.io/)
- [pytest 官方文档](https://docs.pytest.org/)
