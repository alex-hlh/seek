# Seek — 通用可配置可视化爬虫

一个通过可视化界面构建爬虫工作流的工具。支持拖拽节点、设计流程、配置参数、运行爬取、查看结果。

---

## 功能特性

### 12 种节点类型

| 节点 | 说明 |
|------|------|
| 起始 URL | 定义爬取入口，支持多 URL |
| HTTP 请求 | 通用 HTTP 请求，支持 GET/POST/PUT/DELETE |
| API 请求 | 结构化 API 调用，支持 Bearer/Basic 认证 |
| 浏览器执行 | Playwright 驱动，可执行 JS、截图、等待元素 |
| 循环 | 遍历 URL 列表、分页、JSON 数组 |
| 条件分支 | 根据数据内容判断执行路径 |
| HTML 解析 | CSS 选择器提取内容，支持表格模式 |
| JSON 解析 | JSONPath 表达式提取 |
| 正则清洗 | 正则表达式替换/提取 |
| 字段映射 | 规范化输出字段名 |
| 保存到文件 | 输出为 JSONL / JSON / CSV |
| 人机验证 | 自动处理年龄验证（选择题、滑块） |

### 可复用组件库

- **RetryConfig** — 指数退避重试，支持抖动
- **DiagLogger** — 线程安全的诊断日志
- **CheckpointManager** — 断点续爬状态管理
- **BrowserSession** — 浏览器会话管理（Cookie 持久化、定期重启）

---

## 系统架构

```
┌─────────────────────────────────────┐
│  前端 React + React Flow             │  ← 可视化编辑器，拖拽节点、配置、保存
└──────────────┬──────────────────────┘
               │ HTTP / WebSocket
┌──────────────▼──────────────────────┐
│  后端 FastAPI + Python              │  ← 流程执行引擎
└──────────────┬──────────────────────┘
               │ 调用
         ┌─────▼─────┐
         │  爬虫执行器 │  ← httpx / Playwright
         └───────────┘
```

---

## 项目结构

```
seek/
├── app.py                      # FastAPI 入口
├── src/
│   ├── components/            # 可复用组件
│   │   ├── retry.py           # 重试配置
│   │   ├── diag.py            # 诊断日志
│   │   ├── checkpoint.py      # 断点续爬
│   │   ├── browser_session.py # 浏览器会话
│   │   └── age_verification.py # 人机验证
│   ├── nodes/                 # 节点执行器
│   │   ├── base.py            # 节点基类
│   │   ├── start_url.py
│   │   ├── http_request.py
│   │   ├── api_request.py
│   │   ├── browser.py
│   │   ├── loop.py
│   │   ├── condition.py
│   │   ├── html_parse.py
│   │   ├── json_parse.py
│   │   ├── regex_clean.py
│   │   ├── field_mapping.py
│   │   ├── save_to_file.py
│   │   └── human_verify.py
│   ├── engine.py              # 流程执行引擎
│   ├── storage.py             # 流程存储
│   └── config.py              # 配置
├── frontend/                  # 前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/        # NodePalette, FlowEditor, NodeConfigPanel
│   │   └── styles/           # theme.ts, global.css
│   └── dist/                 # 构建产物
├── workflows/                 # 保存的流程 JSON
├── outputs/                   # 爬取结果
├── logs/                      # 诊断日志
└── tests/                     # 单元测试
```

---

## 安装

### 环境要求

- Python 3.9+
- Node.js 18+
- Playwright（用于浏览器节点）

### 1. 克隆项目

```bash
git clone https://github.com/alex-hlh/seek.git
cd seek
```

### 2. 安装 Python 依赖

```bash
cd seek
pip install fastapi uvicorn httpx playwright beautifulsoup4
playwright install chromium  # 安装浏览器驱动
```

### 3. 安装前端依赖

```bash
cd seek/frontend
npm install
```

### 4. 构建前端（可选，开发时不需要）

```bash
# 每次修改前端后重新构建
npm run build
# 构建产物输出到 dist/
```

### 5. 启动服务

```bash
# 在 seek/ 目录下
python -m uvicorn seek.app:app --reload --port 8000
```

访问 http://localhost:8000/ 即可使用。

---

## 使用流程

### 1. 设计流程

从左侧面板拖拽节点到画布，连接节点形成完整爬取流程。

### 2. 配置节点

点击节点，在右侧面板配置参数。每个节点类型有不同配置项：

- **起始 URL** — 输入种子 URL 列表
- **HTTP 请求** — 配置 URL 模板、方法、请求头、请求体
- **HTML 解析** — 配置 CSS 选择器

### 3. 保存流程

点击工具栏「保存」，流程 JSON 保存到 `workflows/` 目录。

### 4. 运行爬取

点击工具栏「运行」，通过 WebSocket 实时查看执行日志。

### 5. 查看结果

爬取结果保存到 `outputs/` 目录，支持 JSONL / JSON / CSV 格式。

---

## 开发

### 运行测试

```bash
pytest tests/ -v
```

### 前端开发

```bash
cd seek/frontend

# 开发模式（需要后端运行在 8000 端口）
# Vite dev server 会代理 /api 和 /ws 请求到后端
npm run dev
```

### 添加新节点

1. 在 `src/nodes/` 创建新节点类，继承 `NodeBase`
2. 在 `app.py` 的 `NODE_REGISTRY` 注册
3. 在前端 `App.tsx` 的 `NODE_TYPES` 添加类型定义
4. 在 `NodeConfigPanel.tsx` 添加配置字段

---

## 技术栈

- **后端** — Python 3.9+ / FastAPI / httpx / Playwright / BeautifulSoup4
- **前端** — React 18 / TypeScript / React Flow / Vite / Axios
- **存储** — 本地文件系统（workflows/ 为流程 JSON，outputs/ 为结果文件）
- **通信** — HTTP + WebSocket

---

## License

MIT
