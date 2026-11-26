---
title: SQL / PostgreSQL
description: 查询、聚合、连接、CTE、窗口函数、写入、DDL、JSONB、事务与性能。
sidebarSort: 33
---

# SQL / PostgreSQL

PostgreSQL 常用的 SQL 语法、psql 元命令和性能排查方式。

## 读取数据

```sql
-- 基础
SELECT * FROM users;
SELECT id, email, created_at FROM users WHERE created_at > NOW() - INTERVAL '7 days';

-- DISTINCT
SELECT DISTINCT country FROM users;

-- 排序 + 分页
SELECT id, email FROM users
ORDER BY created_at DESC
LIMIT 50 OFFSET 100;

-- IN / BETWEEN / LIKE / ILIKE / IS NULL
SELECT * FROM events WHERE event_type IN ('signup', 'purchase');
SELECT * FROM events WHERE amount BETWEEN 10 AND 100;
SELECT * FROM users WHERE email LIKE '%@example.com';
SELECT * FROM users WHERE name ILIKE 'jo%';        -- 不区分大小写
SELECT * FROM users WHERE deleted_at IS NULL;
```

## 聚合

```sql
SELECT
    country,
    COUNT(*)            AS user_count,
    COUNT(DISTINCT email) AS unique_emails,
    AVG(age)::numeric(10,2) AS avg_age,
    MIN(created_at)     AS earliest,
    MAX(created_at)     AS latest
FROM users
GROUP BY country
HAVING COUNT(*) > 100
ORDER BY user_count DESC;
```

## 连接

```sql
-- INNER
SELECT u.id, u.email, o.total
FROM users u
JOIN orders o ON o.user_id = u.id;

-- LEFT（包含没有订单的用户）
SELECT u.id, u.email, COALESCE(SUM(o.total), 0) AS lifetime_value
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.email;

-- 自连接
SELECT a.id, b.id AS referrer_id
FROM users a
JOIN users b ON a.referrer_id = b.id;

-- 反连接（没有订单的用户）
SELECT u.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;
-- 或者，通常更清晰：
SELECT *
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE user_id = u.id);
```

## CTE（WITH）

```sql
WITH recent_orders AS (
    SELECT user_id, SUM(total) AS spend
    FROM orders
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY user_id
),
high_value AS (
    SELECT user_id FROM recent_orders WHERE spend > 1000
)
SELECT u.id, u.email, ro.spend
FROM users u
JOIN high_value hv ON hv.user_id = u.id
JOIN recent_orders ro ON ro.user_id = u.id;
```

## 窗口函数

```sql
-- 每个用户的累计总额
SELECT
    user_id, created_at, total,
    SUM(total) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total
FROM orders;

-- 分区内排名
SELECT
    user_id, total,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total DESC) AS rn,
    RANK()       OVER (PARTITION BY user_id ORDER BY total DESC) AS rk,
    DENSE_RANK() OVER (PARTITION BY user_id ORDER BY total DESC) AS dr
FROM orders;

-- LAG / LEAD
SELECT
    created_at, total,
    LAG(total)  OVER (ORDER BY created_at) AS prev_total,
    LEAD(total) OVER (ORDER BY created_at) AS next_total
FROM orders;
```

## 写入数据

```sql
-- INSERT
INSERT INTO users (email, name) VALUES ('a@b.com', 'A');

-- 多行插入
INSERT INTO users (email, name) VALUES
    ('a@b.com', 'A'),
    ('c@d.com', 'C');

-- INSERT … ON CONFLICT（upsert，插入或更新）
INSERT INTO users (id, email)
VALUES (1, 'new@example.com')
ON CONFLICT (id)
DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();

-- UPDATE
UPDATE users SET name = 'X' WHERE id = 1;
UPDATE users u
SET total_orders = subq.cnt
FROM (SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id) subq
WHERE u.id = subq.user_id;

-- DELETE
DELETE FROM users WHERE deleted_at < NOW() - INTERVAL '90 days';

-- RETURNING — 便于取回插入的 id
INSERT INTO orders (user_id, total) VALUES (1, 50)
RETURNING id, created_at;
```

## DDL

```sql
CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    email        TEXT NOT NULL UNIQUE,
    name         TEXT,
    age          INT CHECK (age >= 0),
    metadata     JSONB DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email_lower ON users (LOWER(email));
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

ALTER TABLE users ADD COLUMN tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users DROP COLUMN unused_col;
ALTER TABLE users RENAME COLUMN old_name TO new_name;

DROP TABLE IF EXISTS old_users;
```

## 角色与数据库

```sql
CREATE ROLE app_user LOGIN PASSWORD 'change-me';
CREATE ROLE readonly NOINHERIT;
GRANT readonly TO app_user;

SET ROLE app_user;
RESET ROLE;

CREATE DATABASE app_db;
DROP DATABASE IF EXISTS app_db;
```

## 视图与物化视图

```sql
CREATE OR REPLACE VIEW active_users AS
SELECT id, email FROM users WHERE deleted_at IS NULL;

CREATE MATERIALIZED VIEW user_stats AS
SELECT country, COUNT(*) AS user_count
FROM users
GROUP BY country
WITH NO DATA;

-- 物化视图需要唯一索引才能 CONCURRENTLY 刷新
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;

DROP VIEW IF EXISTS active_users;
DROP MATERIALIZED VIEW IF EXISTS user_stats;
```

## 集合运算

```sql
SELECT id FROM users
UNION
SELECT user_id FROM orders;

SELECT id FROM users
EXCEPT
SELECT user_id FROM orders;

SELECT id FROM users
INTERSECT
SELECT user_id FROM orders;
```

## 索引 — 经验法则

| 场景 | 索引 |
|---|---|
| 单列等值查询 | B-tree（默认） |
| 范围查询或排序 | B-tree（列顺序：等值 → 范围 → 排序） |
| 全文搜索 | GIN + `tsvector` |
| JSONB 包含查询 | GIN |
| 地理数据 | GiST 或 BRIN |
| 顺序时间序列 | BRIN |

对于经常成对出现的列，用单个复合索引覆盖，而不是每列各建一个索引。始终用 `EXPLAIN ANALYZE` 确认规划器使用了你的索引。

## PostgreSQL JSONB

```sql
-- 获取字段
SELECT metadata->'name' FROM users;          -- jsonb
SELECT metadata->>'name' FROM users;         -- text

-- 路径查询
SELECT metadata#>'{address,city}' FROM users;

-- 包含
SELECT * FROM users WHERE metadata @> '{"tier": "gold"}';

-- 键是否存在
SELECT * FROM users WHERE metadata ? 'phone';

-- 更新指定字段
UPDATE users SET metadata = jsonb_set(metadata, '{tier}', '"gold"');
```

## 事务

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- 或 ROLLBACK;

-- 保存点
BEGIN;
INSERT INTO ...;
SAVEPOINT sp1;
INSERT INTO ...;
ROLLBACK TO SAVEPOINT sp1;
COMMIT;
```

隔离级别：`READ COMMITTED`（默认）、`REPEATABLE READ`、`SERIALIZABLE`。当正确性至关紧要、且你可以在冲突时重试时，请使用 `SERIALIZABLE`（可串行化）。

## EXPLAIN

```sql
EXPLAIN SELECT ...;                  -- 执行计划
EXPLAIN ANALYZE SELECT ...;          -- 执行计划 + 实际耗时
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT ...;
```

重点关注：
- 大表上出现 `Seq Scan` → 缺少索引。
- 预估行数与实际行数偏差过大 → 统计信息不准，运行 `ANALYZE`。
- 排序操作溢出到磁盘 → 该查询的 `work_mem` 太小。

## 性能模式

```sql
-- 键集分页（在大表上比 OFFSET 快得多）
SELECT * FROM events
WHERE created_at < $1                -- 上次看到的时间戳
ORDER BY created_at DESC
LIMIT 50;

-- 不扫描表也能估算行数
SELECT reltuples::bigint AS approx_count
FROM pg_class
WHERE relname = 'events';

-- 用 DISTINCT ON 取每组前 N 条
SELECT DISTINCT ON (user_id) user_id, created_at, total
FROM orders
ORDER BY user_id, created_at DESC;
```

## 常用 psql 命令

```bash
psql "postgres://user:pass@host:5432/db"

\l               # 列出数据库
\dn              # 列出模式（schema）
\dt+             # 列出表及其大小
\d+ users        # 查看表的详细结构
\df              # 列出函数
\dv              # 列出视图
\dt              # 列出表
\d users         # 查看表结构
\di              # 列出索引
\du              # 列出角色/用户
\x               # 切换扩展显示
\timing          # 显示查询耗时
\copy users TO 'users.csv' CSV HEADER
\copy events FROM 'events.csv' CSV HEADER
\watch 5         # 每 5 秒重跑上一条查询
```

## 常见陷阱

- **`NULL` 不等于任何值。** `NULL = NULL` 的结果是 `NULL`，而不是 `TRUE`。应使用 `IS NULL`。
- **`COUNT(*)` 与 `COUNT(col)` 不同。** `COUNT(col)` 会忽略 NULL。
- **PostgreSQL 中字符串比较默认区分大小写。** 可使用 `LOWER()` 或 `ILIKE`。
- **时区。** 优先用 `TIMESTAMPTZ` 而不是 `TIMESTAMP`。内部按 UTC 存储。
- **隐式类型转换**可能让索引失效。`WHERE int_column = '5'` 不一定能用到索引；请显式转换类型。
- **OR 通常比 UNION ALL 慢。** 有时把 `WHERE a OR b` 拆成两个查询再用 `UNION ALL` 合并，可以让规划器对各自条件使用索引。

## 另见

- `EXPLAIN` 文档：https://www.postgresql.org/docs/current/using-explain.html
- GUI 客户端：pgAdmin、DBeaver、DataGrip
- pg_stat_statements 扩展，用于生产环境的查询性能分析
