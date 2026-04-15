# Seek: 通用可配置爬虫设计文档

**日期:** 2026-04-15
**状态:** 设计完成，待实施

---

## 1. 系统架构

**三层结构：**

```
┌─────────────────────────────────┐
│   前端 (React + React Flow)       │  ← 可视化编辑器，流程设计、预览、运行控制
└──────────────┬──────────────────┘
               │ HTTP / WebSocket
┌──────────────▼──────────────────┐
│   后端 (FastAPI + Python)          │  ← 流程执行引擎 + 文件管理
└──────────────┬──────────────────┘
               │ 调用
         ┌─────▼─────┐
         │ 爬虫执行器   │  ← httpx (静态)、Playwright (动态)、直接 API 调用
         └───────────┘
```

**前端与后端通信：**
- 流程配置保存/加载：HTTP
- 爬取进度实时反馈：WebSocket（流式节点执行日志）
- 单文件 Python 项目，入口是 `app.py`

---

## 2. 节点类型总表

| 节点 | 作用 | 主要参数 |
|------|------|---------|
| `起始 URL` | 流程入口，定义种子 URL | URL 列表、请求方法、Cookie 持久化开关 |
| `HTTP 请求` | 通用 HTTP 请求，可发 headers/body | URL 模板、Method、Headers、Body、RetryConfig |
| `浏览器执行` | Playwright 驱动，截图或获取 DOM | 等待策略、截图开关、执行的 JS、BrowserSession 配置 |
| `API 请求` | 结构化 API 调用 | URL、认证、查询参数 |
| `循环` | 遍历列表（分页列表、URL 列表、JSON 数组） | 迭代来源、分页策略（页码/偏移/下一页链接/API游标）、预取开关、终止条件 |
| `条件分支` | 根据数据内容判断走向 | 条件表达式 |
| `HTML 解析` | CSS 选择器提取内容 | 选择器列表；支持 HTML 表格提取模式 |
| `JSON 解析` | JSON 路径提取 | JSONPath 表达式；响应降级到 HTML 解析 |
| `正则清洗` | 对字符串做正则替换/提取 | 正则表达式、替换模板 |
| `字段映射` | 规范化输出字段名 | 输入字段 → 输出字段映射 |
| `保存到文件` | 最终输出节点 | 文件路径、格式（JSONL/CSV）、断点续爬开关 |
| `人机验证` | 通用人机验证解决 | 验证类型、题库路径 |

---

## 3. 可复用组件库（提炼自 seejav）

### 3.1 `BrowserSession` — 浏览器会话管理

```python
class BrowserSession:
    """管理单个浏览器实例的完整生命周期"""
    cookies_path: Path        # cookies.json 持久化路径
    profile_dir: Path          # 浏览器 profile 目录
    restart_interval: int     # 每 N 个请求强制重启（防内存泄漏，默认 300）

    def launch(self) -> Browser
    def new_page(self) -> Page
    def save_cookies(self)
    def load_cookies(self) -> bool  # 返回是否加载成功
    def rebuild(self)               # 重建浏览器（会话过期时调用）
```

**节点配置项：**
- 是否启用 Cookie 持久化
- 是否启用定期浏览器重启
- Profile 目录路径

---

### 3.2 `RetryConfig` — 指数退避重试

```python
@dataclass
class RetryConfig:
    max_attempts: int = 3
    base_delay: float = 1.0
    exponential: bool = True    # True=指数, False=固定
    jitter: bool = True         # 是否加随机抖动

    def get_delay(self, attempt: int) -> float:
        # 指数: base * 2^attempt * uniform(1.0, 2.0)
        # 固定: base * uniform(0.5, 1.5)
```

**节点配置项：**
- 最大重试次数
- 重试条件（网络超时 / HTTP 5xx / 全部错误）
- 退避策略（指数 / 固定）

---

### 3.3 `AgeVerificationSolver` — 人机验证解决器

来源：seejav `age_verification.py`
- 内置题库 + 模糊匹配（`if key in q`）
- 支持 sync/async 两种实现
- 解题 + 保存 cookie 一步完成

**节点配置项：**
- 验证类型（滑块、Q&A 选择题、Cookie 绕过等）
- 题库文件路径（或内嵌）

---

### 3.4 `CheckpointManager` — 断点续爬状态管理

来源：seejav `progress.json` + `done_ids.txt` 模式

```python
class CheckpointManager:
    """管理爬虫运行状态，支持断点续爬"""
    state_file: Path          # progress.json
    done_ids: set[str]        # 已完成 ID 集合

    def is_done(self, item_id: str) -> bool
    def mark_done(self, item_id: str)        # 单条追加
    def mark_batch_done(self, ids: list)     # 批量追加
    def save_state(self, **kwargs)           # 任意元数据持久化
    def load_state(self) -> dict
    def reset(self)
```

**节点配置项：**
- 开启断点续爬后，每次运行自动跳过已完成的 ID
- 状态文件存于 `workflows/{workflow_id}/checkpoint.json`

---

### 3.5 `DiagLogger` — 诊断日志

来源：seejav 的 `_diag()` 模式（线程/协程安全）

```python
class DiagLogger:
    """带级别的文件日志，事件实时推送前端"""
    def diag(self, node_id: str, event: str, **kwargs)
    def navigate(self, node_id: str, url: str)
    def error(self, node_id: str, exc: Exception)
```

**用途：** 运行日志实时推送前端，用户在 UI 上看到每个节点的执行轨迹。

---

## 4. 增强节点详解

### 4.1 循环节点（增强）

seejav 分页逻辑（预取下一页 + 检测 Cookie 过期）抽象为循环节点：

**迭代来源：**
- URL 列表
- 分页 URL 模式
- 上一步 JSON 数组

**分页策略：**
- 增量页码（`?page=1` → `?page=2`）
- 增量偏移量（`?offset=0` → `?offset=50`）
- "下一页"链接跟随（CSS 选择器）
- API 风格（`cursor` / `since_id`）

**高级选项：**
- 预取开关（是否预取下一页到缓存）
- 终止条件：最大页数 / 无新数据时停止 / 手动指定
- Cookie 过期检测（通过 ID 集合重叠判断）

---

### 4.2 HTML 解析节点（增强）

seejav 的 `_extract_magnets_from_table()` 模式（单次扫描 + URL 去重）：

- 输入：HTML 片段
- 输出：结构化表格数据（列名 + 行数据）
- 对应节点参数：表格选择器、提取哪些列

---

### 4.3 JSON 解析节点（增强）

在原有设计基础上：
- 支持 JSONPath 表达式（`$.data[0].items[*].title`）
- 响应自动降级：若服务器返回 HTML，降级到 BeautifulSoup 解析

---

## 5. 数据模型

**流程配置（存储为 JSON 文件）：**

```json
{
  "id": "uuid",
  "name": "我的爬虫",
  "created_at": "ISO8601",
  "nodes": [
    { "id": "n1", "type": "起始URL", "data": { "urls": ["https://..."] } },
    { "id": "n2", "type": "HTTP请求", "data": { "method": "GET" }, "position": {...} }
  ],
  "edges": [
    { "source": "n1", "target": "n2" }
  ]
}
```

**爬取结果输出：**
- `JSONL`（每行一条记录，适合大规模数据）
- `JSON`（聚合为数组）
- `CSV`（需字段映射节点预定义列）

---

## 6. 爬取流程执行逻辑

```
用户点击"运行"
  → 前端通过 WebSocket 连接后端
  → 后端加载流程 JSON，按拓扑排序确定节点执行顺序
  → 逐节点执行：
      ① 请求节点：httpx / Playwright 执行，结果放入上下文（供后续节点使用）
      ② 解析节点：从上一步响应中提取字段
      ③ 循环节点：对列表中每项递归执行子流程
      ④ 保存节点：将当前上下文中的记录追加写入文件
  → 每节点完成后，通过 WebSocket 推送执行日志到前端
  → 全部完成后，推送完成状态
```

---

## 7. 错误处理策略

- 单节点失败不影响整流程：节点可配置"失败后继续"或"失败则中止"
- 每个节点有独立 RetryConfig（默认重试 3 次）
- 浏览器执行超时、HTTP 非 2xx 响应、JSON 解析失败等都有明确错误日志
- 错误信息实时推送到前端，用户可随时中断

---

## 8. 项目文件结构

```
seek/
├── app.py                      # FastAPI 入口，静态文件服务
├── components/                 # 可复用组件库（提炼自 seejav）
│   ├── __init__.py
│   ├── browser_session.py     # BrowserSession 类
│   ├── retry.py                # RetryConfig + @retry 装饰器
│   ├── checkpoint.py           # CheckpointManager
│   ├── diag.py                 # DiagLogger
│   └── age_verification.py    # 人机验证解决器
├── nodes/                      # 节点执行器
│   ├── __init__.py
│   ├── base.py                 # 节点基类
│   ├── start_url.py            # 起始 URL
│   ├── http_request.py         # HTTP 请求
│   ├── browser.py              # 浏览器执行
│   ├── api_request.py          # API 请求
│   ├── loop.py                 # 循环（增强：多种分页策略）
│   ├── condition.py            # 条件分支
│   ├── html_parse.py           # HTML 解析（增强：表格提取）
│   ├── json_parse.py           # JSON 解析（增强：JSONPath）
│   ├── regex_clean.py          # 正则清洗
│   ├── field_mapping.py        # 字段映射
│   ├── save_to_file.py         # 保存到文件（增强：断点续爬）
│   └── human_verify.py         # 人机验证（新增）
├── engine.py                   # 流程执行引擎（拓扑排序、节点调度）
├── storage.py                  # 流程配置和结果文件读写
├── workflows/                   # 用户保存的流程配置文件（JSON）
└── outputs/                    # 爬取结果输出目录
```

---

## 9. seejav 提炼对照表

| seejav 模式 | 集成方式 |
|------------|---------|
| 浏览器 Cookie 持久化 (`playwright_driver.py`) | → BrowserSession 组件，节点配置项 |
| 定期浏览器重建 (`scraper.py` _profile_cache) | → BrowserSession.restart_interval，节点配置 |
| 指数退避重试 (`scraper.py`) | → RetryConfig 组件，每个 HTTP/浏览器节点可配 |
| 诊断日志 + WebSocket 推送 (`_diag()`) | → DiagLogger 组件 |
| 断点续爬 (`progress.json` + `done_ids.txt`) | → CheckpointManager 组件 |
| 分页预取 + Cookie 过期检测 | → 增强版循环节点 |
| HTML 表格提取 (`_extract_magnets_from_table()`) | → HTML 解析节点增强 |
| 年龄验证绕过 (`age_verification.py`) | → 人机验证节点（可配置题库） |

---

## 10. 技术栈

- **后端：** Python + FastAPI + Playwright + httpx + BeautifulSoup
- **前端：** React + React Flow（流程编辑器）
- **存储：** 本地文件系统（workflows/ 为流程 JSON，outputs/ 为结果文件）
- **通信：** HTTP + WebSocket
