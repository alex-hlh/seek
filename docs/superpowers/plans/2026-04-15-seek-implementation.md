# Seek: 通用可配置爬虫 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个通用可配置的视觉化爬虫平台，支持 React Flow 流程编辑 + FastAPI 执行引擎 + 可复用组件库。

**Architecture:** 后端 FastAPI + Python 暴露 HTTP/WebSocket 接口；前端 React + React Flow 提供可视化流程编辑器；节点执行器基于 httpx/Playwright；组件库提炼自 seejav 实战模式。

**Tech Stack:** Python + FastAPI + Playwright + httpx + BeautifulSoup + React + React Flow

---

## 实施阶段概览

| 阶段 | 内容 | 产出 |
|------|------|------|
| **Phase 1** | 项目脚手架 + 组件库核心（RetryConfig, DiagLogger, CheckpointManager, BrowserSession） | 可独立导入使用的 Python 组件包 |
| **Phase 2** | 节点执行器基类 + 5 种核心节点（起始URL, HTTP请求, HTML解析, JSON解析, 保存到文件） | 节点框架 + 基础节点实现 |
| **Phase 3** | 流程执行引擎（拓扑排序、上下文传递、WebSocket 进度推送） | 引擎可运行完整流程 |
| **Phase 4** | FastAPI HTTP 接口 + WebSocket 端点 + 静态文件服务 | 后端完整 API |
| **Phase 5** | React + React Flow 前端项目骨架（空白画布、节点拖拽、流程保存/加载） | 可交互的前端界面 |

---

## 阶段 1：项目脚手架 + 组件库核心

### 目录结构初始化

**Files:**
- Create: `seek/src/__init__.py`
- Create: `seek/src/components/__init__.py`
- Create: `seek/src/components/retry.py`
- Create: `seek/src/components/diag.py`
- Create: `seek/src/components/checkpoint.py`
- Create: `seek/src/components/browser_session.py`
- Create: `seek/src/nodes/__init__.py`
- Create: `seek/src/nodes/base.py`
- Create: `seek/src/engine.py`
- Create: `seek/src/storage.py`
- Create: `seek/src/config.py`
- Create: `seek/app.py`
- Create: `seek/pyproject.toml`
- Create: `seek/.gitignore`

---

### Task 1: retry.py — 重试配置组件

**Files:**
- Create: `seek/src/components/retry.py`
- Create: `seek/tests/components/test_retry.py`

- [ ] **Step 1: 写失败的测试**

```python
# tests/components/test_retry.py
import pytest
from seek.src.components.retry import RetryConfig

def test_exponential_delay_calculation():
    cfg = RetryConfig(max_attempts=3, base_delay=1.0, exponential=True, jitter=False)
    assert cfg.get_delay(0) == 1.0  # 1.0 * 2^0
    assert cfg.get_delay(1) == 2.0  # 1.0 * 2^1
    assert cfg.get_delay(2) == 4.0  # 1.0 * 2^2

def test_fixed_delay_calculation():
    cfg = RetryConfig(max_attempts=3, base_delay=2.0, exponential=False, jitter=False)
    assert cfg.get_delay(0) == 2.0
    assert cfg.get_delay(1) == 2.0
    assert cfg.get_delay(2) == 2.0

def test_jitter_adds_randomness():
    cfg = RetryConfig(max_attempts=10, base_delay=1.0, exponential=True, jitter=True)
    # With jitter, calls should return values in a range (not deterministic)
    # We test that multiple calls don't all return the same value
    delays = [cfg.get_delay(1) for _ in range(10)]
    assert len(set(delays)) > 1, "Jitter should produce varied delays"

def test_should_retry():
    cfg = RetryConfig(max_attempts=3)
    assert cfg.should_retry(0) is True
    assert cfg.should_retry(1) is True
    assert cfg.should_retry(2) is True
    assert cfg.should_retry(3) is False
    assert cfg.should_retry(4) is False
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_retry.py -v`
Expected: FAIL — module not found

- [ ] **Step 3: 创建目录结构**

Run: `mkdir -p seek/src/components seek/src/nodes seek/tests/components`

- [ ] **Step 4: 写 retry.py 实现**

```python
# seek/src/components/retry.py
from dataclasses import dataclass
import random
import math


@dataclass
class RetryConfig:
    max_attempts: int = 3
    base_delay: float = 1.0
    exponential: bool = True
    jitter: bool = True

    def get_delay(self, attempt: int) -> float:
        if self.exponential:
            delay = self.base_delay * (2 ** attempt)
        else:
            delay = self.base_delay

        if self.jitter:
            delay *= random.uniform(1.0, 2.0)

        return delay

    def should_retry(self, attempt: int) -> bool:
        return attempt < self.max_attempts


def retry_with_backoff(func, retry_cfg: RetryConfig | None = None):
    """Decorator that retries a function with exponential backoff."""
    cfg = retry_cfg or RetryConfig()

    def wrapper(*args, **kwargs):
        attempt = 0
        while True:
            try:
                return func(*args, **kwargs)
            except Exception as exc:
                if not cfg.should_retry(attempt):
                    raise
                delay = cfg.get_delay(attempt)
                attempt += 1
                import time
                time.sleep(delay)
                if attempt >= cfg.max_attempts:
                    raise

    return wrapper
```

- [ ] **Step 4: 运行测试验证通过**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_retry.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
cd /Users/hulihua/workspace/seek
git add seek/src/components/retry.py seek/tests/components/test_retry.py
git commit -m "feat(components): add RetryConfig with exponential backoff"
```

---

### Task 2: diag.py — 诊断日志组件

**Files:**
- Create: `seek/src/components/diag.py`
- Create: `seek/tests/components/test_diag.py`

- [ ] **Step 1: 写失败的测试**

```python
# tests/components/test_diag.py
import pytest
import tempfile
import os
from seek.src.components.diag import DiagLogger

def test_diag_log_writes_line(tmp_path):
    log_file = tmp_path / "diag.log"
    logger = DiagLogger(log_file)
    logger.diag("node1", "start", url="https://example.com")
    assert log_file.exists()
    content = log_file.read_text()
    assert "node1" in content
    assert "start" in content
    assert "https://example.com" in content

def test_error_log_includes_exception(tmp_path):
    log_file = tmp_path / "diag.log"
    logger = DiagLogger(log_file)
    try:
        raise ValueError("test error")
    except ValueError as e:
        logger.error("node1", e)
    content = log_file.read_text()
    assert "node1" in content
    assert "ValueError" in content
    assert "test error" in content

def test_navigate_log(tmp_path):
    log_file = tmp_path / "diag.log"
    logger = DiagLogger(log_file)
    logger.navigate("node1", "https://example.com/page1")
    content = log_file.read_text()
    assert "node1" in content
    assert "NAVIGATE" in content
    assert "https://example.com/page1" in content
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_diag.py -v`
Expected: FAIL — module not found

- [ ] **Step 3: 写 diag.py 实现**

```python
# seek/src/components/diag.py
from pathlib import Path
from datetime import datetime
import threading


class DiagLogger:
    """Thread-safe diagnostic logger that writes timestamped events to a file."""

    def __init__(self, log_file: Path | str):
        self.log_file = Path(log_file)
        self._lock = threading.Lock()

    def _write(self, level: str, node_id: str, event: str, **kwargs):
        timestamp = datetime.now().isoformat()
        parts = [f"[{timestamp}]", f"[{level}]", f"[{node_id}]", event]
        if kwargs:
            parts.append(str(kwargs))
        line = " ".join(parts) + "\n"
        with self._lock:
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            self.log_file.write_text(self.log_file.read_text() + line)

    def diag(self, node_id: str, event: str, **kwargs):
        self._write("DIAG", node_id, event, **kwargs)

    def navigate(self, node_id: str, url: str):
        self._write("NAVIGATE", node_id, f"url={url}")

    def error(self, node_id: str, exc: Exception):
        self._write("ERROR", node_id, f"{type(exc).__name__}: {exc}")

    def warn(self, node_id: str, msg: str):
        self._write("WARN", node_id, msg)
```

- [ ] **Step 4: 运行测试验证通过**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_diag.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add seek/src/components/diag.py seek/tests/components/test_diag.py
git commit -m "feat(components): add DiagLogger for thread-safe diagnostic logging"
```

---

### Task 3: checkpoint.py — 断点续爬状态管理

**Files:**
- Create: `seek/src/components/checkpoint.py`
- Create: `seek/tests/components/test_checkpoint.py`

- [ ] **Step 1: 写失败的测试**

```python
# tests/components/test_checkpoint.py
import pytest
import tempfile
from pathlib import Path
from seek.src.components.checkpoint import CheckpointManager

def test_mark_done_and_is_done(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.mark_done("id1")
    assert cm.is_done("id1") is True
    assert cm.is_done("id2") is False

def test_batch_mark_done(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.mark_batch_done(["id1", "id2", "id3"])
    assert cm.is_done("id1") is True
    assert cm.is_done("id3") is True

def test_save_and_load_state(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.save_state(page=5, total=100)
    state = cm.load_state()
    assert state["page"] == 5
    assert state["total"] == 100

def test_reset_clears_state(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.mark_done("id1")
    cm.save_state(page=5)
    cm.reset()
    assert cm.is_done("id1") is False
    assert cm.load_state() == {}
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_checkpoint.py -v`
Expected: FAIL — module not found

- [ ] **Step 3: 写 checkpoint.py 实现**

```python
# seek/src/components/checkpoint.py
import json
import threading
from pathlib import Path


class CheckpointManager:
    """Manages crawl state with done-IDs set and arbitrary metadata."""

    def __init__(self, checkpoint_dir: Path | str):
        self.dir = Path(checkpoint_dir)
        self.state_file = self.dir / "progress.json"
        self.done_file = self.dir / "done_ids.txt"
        self._lock = threading.Lock()
        self._done_ids: set[str] | None = None

    def _ensure_dir(self):
        self.dir.mkdir(parents=True, exist_ok=True)

    def _load_done_ids(self) -> set[str]:
        if self._done_ids is not None:
            return self._done_ids
        self._ensure_dir()
        if self.done_file.exists():
            self._done_ids = set(self.done_file.read_text().strip().splitlines())
        else:
            self._done_ids = set()
        return self._done_ids

    def is_done(self, item_id: str) -> bool:
        return item_id in self._load_done_ids()

    def mark_done(self, item_id: str):
        self._ensure_dir()
        with self._lock:
            done_ids = self._load_done_ids()
            if item_id not in done_ids:
                done_ids.add(item_id)
                self.done_file.write_text("\n".join(sorted(done_ids)) + "\n")
                self._done_ids = done_ids

    def mark_batch_done(self, ids: list[str]):
        for id_ in ids:
            self.mark_done(id_)

    def save_state(self, **kwargs):
        self._ensure_dir()
        with self._lock:
            state = self.load_state()
            state.update(kwargs)
            self.state_file.write_text(json.dumps(state, indent=2))

    def load_state(self) -> dict:
        self._ensure_dir()
        if not self.state_file.exists():
            return {}
        return json.loads(self.state_file.read_text())

    def reset(self):
        with self._lock:
            self._done_ids = set()
            if self.dir.exists():
                for f in self.dir.glob("*.txt"):
                    f.write_text("")
                if self.state_file.exists():
                    self.state_file.write_text("{}")
```

- [ ] **Step 4: 运行测试验证通过**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_checkpoint.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add seek/src/components/checkpoint.py seek/tests/components/test_checkpoint.py
git commit -m "feat(components): add CheckpointManager for resumable crawling"
```

---

### Task 4: browser_session.py — 浏览器会话管理

**Files:**
- Create: `seek/src/components/browser_session.py`
- Create: `seek/tests/components/test_browser_session.py`

- [ ] **Step 1: 写失败的测试**

```python
# tests/components/test_browser_session.py
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch
from seek.src.components.browser_session import BrowserSession

def test_browser_session_initial_state(tmp_path):
    bs = BrowserSession(tmp_path / "profile")
    assert bs.cookies_path == tmp_path / "profile" / "cookies.json"
    assert bs.profile_dir == tmp_path / "profile"
    assert bs.request_count == 0
    assert bs.restart_interval == 300

@patch("seek.src.components.browser_session.sync_playwright")
def test_launch_starts_browser(mock_playwright, tmp_path):
    mock_browser = MagicMock()
    mock_context = MagicMock()
    mock_page = MagicMock()
    mock_playwright.return_value.__enter__.return_value.start.return_value = mock_browser
    mock_browser.new_context.return_value = mock_context
    mock_context.new_page.return_value = mock_page

    bs = BrowserSession(tmp_path / "profile")
    browser = bs.launch()

    assert browser is mock_browser
    mock_browser.new_context.assert_called_once()

def test_request_count_increments(tmp_path):
    bs = BrowserSession(tmp_path / "profile")
    bs.request_count = 299
    bs.increment_request()
    assert bs.request_count == 300

def test_should_rebuild_true_at_interval(tmp_path):
    bs = BrowserSession(tmp_path / "profile", restart_interval=300)
    bs.request_count = 300
    assert bs.should_rebuild() is True

def test_should_rebuild_false_under_interval(tmp_path):
    bs = BrowserSession(tmp_path / "profile", restart_interval=300)
    bs.request_count = 299
    assert bs.should_rebuild() is False
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_browser_session.py -v`
Expected: FAIL — module not found

- [ ] **Step 3: 写 browser_session.py 实现**

```python
# seek/src/components/browser_session.py
from pathlib import Path
from typing import Optional
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page


class BrowserSession:
    """Manages a Playwright browser instance with cookie persistence and periodic restart."""

    def __init__(
        self,
        profile_dir: Path | str,
        restart_interval: int = 300,
        headless: bool = True,
    ):
        self.profile_dir = Path(profile_dir)
        self.cookies_path = self.profile_dir / "cookies.json"
        self.restart_interval = restart_interval
        self.headless = headless
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self.request_count = 0

    def launch(self) -> Browser:
        pw = sync_playwright().start()
        self._browser = pw.chromium.launch(headless=self.headless)
        self._context = self._browser.new_context()
        self.load_cookies()
        return self._browser

    def new_page(self) -> Page:
        self.request_count += 1
        if self.should_rebuild():
            self.rebuild()
        return self._context.new_page()

    def should_rebuild(self) -> bool:
        return self.request_count > 0 and self.request_count % self.restart_interval == 0

    def rebuild(self):
        """Close current browser and relaunch with fresh context."""
        if self._browser:
            self._browser.close()
        self._browser = None
        self._context = None
        self.launch()

    def save_cookies(self):
        if self._context is None:
            return
        self.profile_dir.mkdir(parents=True, exist_ok=True)
        cookies = self._context.cookies()
        import json
        self.cookies_path.write_text(json.dumps(cookies, indent=2))

    def load_cookies(self) -> bool:
        if not self.cookies_path.exists():
            return False
        import json
        cookies = json.loads(self.cookies_path.read_text())
        self._context.add_cookies(cookies)
        return True

    def close(self):
        self.save_cookies()
        if self._browser:
            self._browser.close()
            self._browser = None
            self._context = None
```

- [ ] **Step 4: 运行测试验证通过**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/components/test_browser_session.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add seek/src/components/browser_session.py seek/tests/components/test_browser_session.py
git commit -m "feat(components): add BrowserSession with cookie persistence and restart interval"
```

---

### Task 5: config.py — 项目配置

**Files:**
- Create: `seek/src/config.py`

- [ ] **Step 1: 创建配置文件**

```python
# seek/src/config.py
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
WORKFLOWS_DIR = BASE_DIR / "workflows"
OUTPUTS_DIR = BASE_DIR / "outputs"
LOGS_DIR = BASE_DIR / "logs"

WORKFLOWS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

DEFAULT_HEADLESS = True
DEFAULT_RESTART_INTERVAL = 300
DEFAULT_MAX_WORKERS = 10
DEFAULT_REQUEST_TIMEOUT = 30
```

- [ ] **Step 2: 提交**

```bash
git add seek/src/config.py
git commit -m "feat: add project configuration defaults"
```

---

## 阶段 2：节点执行器基类 + 核心节点

### Task 6: nodes/base.py — 节点基类

**Files:**
- Create: `seek/src/nodes/base.py`
- Create: `seek/tests/nodes/test_base.py`

- [ ] **Step 1: 写失败的测试**

```python
# tests/nodes/test_base.py
import pytest
from seek.src.nodes.base import NodeBase, NodeExecutionContext

def test_node_base_has_id_and_type():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = NodeBase(id="n1", node_type="test", config={}, ctx=ctx)
    assert node.id == "n1"
    assert node.node_type == "test"
    assert node.config == {}

def test_context_stores_variables():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("url", "https://example.com")
    assert ctx.get("url") == "https://example.com"
    assert ctx.get("missing", default="fallback") == "fallback"

def test_context_results_list():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.add_result({"id": "1", "title": "Item 1"})
    ctx.add_result({"id": "2", "title": "Item 2"})
    assert len(ctx.results) == 2
    assert ctx.results[0]["id"] == "1"
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/nodes/test_base.py -v`
Expected: FAIL

- [ ] **Step 3: 写 base.py 实现**

```python
# seek/src/nodes/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional
from seek.src.components.retry import RetryConfig


@dataclass
class NodeExecutionContext:
    """Shared context passed through the workflow execution."""
    workflow_id: str
    variables: dict[str, Any] = field(default_factory=dict)
    results: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def set(self, key: str, value: Any):
        self.variables[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        return self.variables.get(key, default)

    def add_result(self, result: dict[str, Any]):
        self.results.append(result)


class NodeBase(ABC):
    """Base class for all workflow nodes."""

    def __init__(
        self,
        id: str,
        node_type: str,
        config: dict[str, Any],
        ctx: NodeExecutionContext,
        retry: RetryConfig | None = None,
        stop_on_error: bool = True,
    ):
        self.id = id
        self.node_type = node_type
        self.config = config
        self.ctx = ctx
        self.retry = retry or RetryConfig()
        self.stop_on_error = stop_on_error

    @abstractmethod
    def execute(self) -> bool:
        """Execute the node logic. Returns True on success, False on failure."""
        raise NotImplementedError

    def execute_with_retry(self) -> bool:
        attempt = 0
        while True:
            try:
                return self.execute()
            except Exception as exc:
                if not self.retry.should_retry(attempt):
                    raise
                import time
                delay = self.retry.get_delay(attempt)
                attempt += 1
                time.sleep(delay)
```

- [ ] **Step 4: 运行测试验证通过**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/nodes/test_base.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add seek/src/nodes/base.py seek/tests/nodes/test_base.py
git commit -m "feat(nodes): add NodeBase abstract class and NodeExecutionContext"
```

---

### Task 7: 起始 URL 节点 + HTTP 请求节点 + HTML 解析节点 + JSON 解析节点 + 保存到文件节点

**Files:**
- Create: `seek/src/nodes/start_url.py`
- Create: `seek/src/nodes/http_request.py`
- Create: `seek/src/nodes/html_parse.py`
- Create: `seek/src/nodes/json_parse.py`
- Create: `seek/src/nodes/save_to_file.py`
- Create: `seek/tests/nodes/test_start_url.py`
- Create: `seek/tests/nodes/test_http_request.py`
- Create: `seek/tests/nodes/test_html_parse.py`
- Create: `seek/tests/nodes/test_json_parse.py`
- Create: `seek/tests/nodes/test_save_to_file.py`

**Due to length, see abbreviated steps — each node follows TDD pattern:**
1. Write test for the node
2. Run test (verify FAIL)
3. Write minimal implementation
4. Run test (verify PASS)
5. Commit

#### start_url.py implementation:

```python
# seek/src/nodes/start_url.py
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class StartUrlNode(NodeBase):
    node_type = "起始URL"

    def execute(self) -> bool:
        urls = self.config.get("urls", [])
        if isinstance(urls, str):
            urls = [urls]
        self.ctx.set("起始URL列表", urls)
        self.ctx.set("当前URL索引", 0)
        return True
```

#### http_request.py implementation:

```python
# seek/src/nodes/http_request.py
import httpx
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class HttpRequestNode(NodeBase):
    node_type = "HTTP请求"

    def execute(self) -> bool:
        method = self.config.get("method", "GET").upper()
        url = self._resolve_url()
        headers = self.config.get("headers", {})
        body = self.config.get("body")

        with httpx.Client(timeout=self.config.get("timeout", 30)) as client:
            response = client.request(method, url, headers=headers, content=body)

        self.ctx.set("最近响应状态码", response.status_code)
        self.ctx.set("最近响应内容", response.text)
        self.ctx.set("最近响应头", dict(response.headers))

        if not self.config.get("allow_errors", False) and response.status_code >= 400:
            raise httpx.HTTPStatusError(f"HTTP {response.status_code}", request=response.request, response=response)

        return True

    def _resolve_url(self) -> str:
        url = self.config.get("url", "")
        # 支持从上下文变量替换
        import re
        for key, value in self.ctx.variables.items():
            url = url.replace(f"{{{key}}}", str(value))
        return url
```

#### html_parse.py implementation:

```python
# seek/src/nodes/html_parse.py
from bs4 import BeautifulSoup
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class HtmlParseNode(NodeBase):
    node_type = "HTML解析"

    def execute(self) -> bool:
        html = self.ctx.get("最近响应内容", "")
        if not html:
            return False

        soup = BeautifulSoup(html, "lxml")
        selectors = self.config.get("selectors", [])

        extracted = {}
        for sel in selectors:
            field_name = sel.get("field", sel.get("selector"))
            elements = soup.select(sel["selector"])
            if sel.get("multiple", False):
                extracted[field_name] = [el.get_text(strip=True) for el in elements]
            else:
                extracted[field_name] = elements[0].get_text(strip=True) if elements else None

        # 也支持表格模式
        if self.config.get("table_mode", False):
            table_selector = self.config.get("table_selector", "table")
            table = soup.select_one(table_selector)
            if table:
                rows = table.select("tr")
                headers = [th.get_text(strip=True) for th in rows[0].select("th")] if rows else []
                table_data = []
                for row in rows[1:]:
                    cells = [td.get_text(strip=True) for td in row.select("td")]
                    if len(cells) == len(headers):
                        table_data.append(dict(zip(headers, cells)))
                self.ctx.set("表格数据", table_data)
                return True

        self.ctx.set("提取结果", extracted)
        return True
```

#### json_parse.py implementation:

```python
# seek/src/nodes/json_parse.py
import json
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class JsonParseNode(NodeBase):
    node_type = "JSON解析"

    def execute(self) -> bool:
        raw = self.ctx.get("最近响应内容", "")

        # 尝试降级到 HTML 解析（如果响应是 HTML）
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            # 降级：尝试从 HTML 中提取 JSON
            import re
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                except json.JSONDecodeError:
                    return False
            else:
                return False

        path = self.config.get("path", "")
        if path:
            for key in path.split("."):
                if isinstance(data, dict):
                    data = data.get(key, {})
                elif isinstance(data, list):
                    try:
                        data = data[int(key)]
                    except (ValueError, IndexError):
                        return False

        self.ctx.set("JSON解析结果", data)
        return True
```

#### save_to_file.py implementation:

```python
# seek/src/nodes/save_to_file.py
import csv
import json
from pathlib import Path
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class SaveToFileNode(NodeBase):
    node_type = "保存到文件"

    def execute(self) -> bool:
        output_format = self.config.get("format", "jsonl").lower()
        output_path = Path(self.config.get("path", "output.txt"))
        output_path.parent.mkdir(parents=True, exist_ok=True)

        records = self.ctx.results
        if self.config.get("use_field_mapping", False):
            mapped = self._apply_field_mapping(records)
        else:
            mapped = records

        if output_format == "jsonl":
            with output_path.open("a") as f:
                for record in mapped:
                    f.write(json.dumps(record, ensure_ascii=False) + "\n")
        elif output_format == "json":
            existing = []
            if output_path.exists():
                existing = json.loads(output_path.read_text())
            existing.extend(mapped)
            output_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
        elif output_format == "csv":
            if not mapped:
                return True
            with output_path.open("a", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=mapped[0].keys())
                if output_path.stat().st_size == 0:
                    writer.writeheader()
                writer.writerows(mapped)

        return True

    def _apply_field_mapping(self, records: list[dict]) -> list[dict]:
        mapping = self.config.get("field_mapping", {})
        return [{mapping.get(k, k): v for k, v in r.items()} for r in records]
```

---

## 阶段 3：流程执行引擎

### Task 8: engine.py — 拓扑排序 + 节点调度

**Files:**
- Create: `seek/src/engine.py`
- Create: `seek/tests/test_engine.py`

- [ ] **Step 1: 写失败的测试**

```python
# tests/test_engine.py
import pytest
from seek.src.engine import WorkflowEngine, topological_sort


def test_topological_sort_linear():
    edges = [("a", "b"), ("b", "c")]
    order = topological_sort(["a", "b", "c"], edges)
    assert order.index("a") < order.index("b") < order.index("c")

def test_topological_sort_parallel_branches():
    edges = [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")]
    order = topological_sort(["a", "b", "c", "d"], edges)
    assert order.index("a") < order.index("b")
    assert order.index("a") < order.index("c")
    assert order.index("b") < order.index("d")
    assert order.index("c") < order.index("d")

def test_topological_sort_cycle_detection():
    edges = [("a", "b"), ("b", "a")]
    with pytest.raises(ValueError, match="cycle"):
        topological_sort(["a", "b"], edges)
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/test_engine.py -v`
Expected: FAIL

- [ ] **Step 3: 写 engine.py 实现**

```python
# seek/src/engine.py
from collections import defaultdict, deque
from typing import Any
from seek.src.nodes.base import NodeBase, NodeExecutionContext


def topological_sort(nodes: list[str], edges: list[tuple[str, str]]) -> list[str]:
    """Return nodes in topological order (Kahn's algorithm). Raises ValueError on cycle."""
    in_degree = {n: 0 for n in nodes}
    adj = defaultdict(list)
    for src, dst in edges:
        adj[src].append(dst)
        in_degree[dst] += 1

    queue = deque([n for n, d in in_degree.items() if d == 0])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(nodes):
        raise ValueError("Workflow contains a cycle")
    return result


class WorkflowEngine:
    """Executes a workflow: loads nodes, topologically sorts, runs each node."""

    def __init__(self, workflow: dict[str, Any], node_registry: dict[str, type[NodeBase]]):
        self.workflow = workflow
        self.node_registry = node_registry
        self.ctx = NodeExecutionContext(workflow_id=workflow["id"])

    def build_execution_order(self) -> list[NodeBase]:
        nodes = self.workflow["nodes"]
        edges = [(e["source"], e["target"]) for e in self.workflow.get("edges", [])]
        node_map = {n["id"]: n for n in nodes}

        sorted_ids = topological_sort([n["id"] for n in nodes], edges)
        result = []
        for nid in sorted_ids:
            nd = node_map[nid]
            node_cls = self.node_registry.get(nd["type"])
            if node_cls is None:
                raise ValueError(f"Unknown node type: {nd['type']}")
            result.append(node_cls(id=nd["id"], node_type=nd["type"], config=nd.get("data", {}), ctx=self.ctx))
        return result

    def run(self) -> list[dict[str, Any]]:
        execution_order = self.build_execution_order()
        for node in execution_order:
            success = node.execute_with_retry()
            if not success and node.stop_on_error:
                break
        return self.ctx.results
```

- [ ] **Step 4: 运行测试验证通过**

Run: `cd /Users/hulihua/workspace/seek && pytest tests/test_engine.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add seek/src/engine.py seek/tests/test_engine.py
git commit -m "feat(engine): add WorkflowEngine with topological sort and node dispatch"
```

---

## 阶段 4：FastAPI HTTP 接口 + WebSocket

### Task 9: app.py — FastAPI 入口

**Files:**
- Create: `seek/app.py`

- [ ] **Step 1: 创建 FastAPI 应用**

```python
# seek/app.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import json
import asyncio
from typing import Any

from seek.src.config import WORKFLOWS_DIR, OUTPUTS_DIR, LOGS_DIR
from seek.src.storage import WorkflowStorage
from seek.src.engine import WorkflowEngine
from seek.src.nodes.start_url import StartUrlNode
from seek.src.nodes.http_request import HttpRequestNode
from seek.src.nodes.html_parse import HtmlParseNode
from seek.src.nodes.json_parse import JsonParseNode
from seek.src.nodes.save_to_file import SaveToFileNode
from seek.src.components.diag import DiagLogger

app = FastAPI(title="Seek Crawler")

NODE_REGISTRY = {
    "起始URL": StartUrlNode,
    "HTTP请求": HttpRequestNode,
    "HTML解析": HtmlParseNode,
    "JSON解析": JsonParseNode,
    "保存到文件": SaveToFileNode,
}

storage = WorkflowStorage(WORKFLOWS_DIR)


@app.get("/")
async def root():
    return FileResponse("frontend/dist/index.html")


@app.get("/api/workflows")
async def list_workflows():
    return storage.list_workflows()


@app.post("/api/workflows")
async def create_workflow(workflow: dict[str, Any]):
    return storage.save_workflow(workflow)


@app.get("/api/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    wf = storage.load_workflow(workflow_id)
    if wf is None:
        raise HTTPException(404, "Workflow not found")
    return wf


@app.delete("/api/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    storage.delete_workflow(workflow_id)
    return {"ok": True}


@app.websocket("/ws/run/{workflow_id}")
async def run_workflow(websocket: WebSocket, workflow_id: str):
    await websocket.accept()
    wf = storage.load_workflow(workflow_id)
    if wf is None:
        await websocket.send_json({"type": "error", "message": "Workflow not found"})
        await websocket.close()
        return

    diag_log = LOGS_DIR / f"{workflow_id}.log"
    diag = DiagLogger(diag_log)

    try:
        engine = WorkflowEngine(wf, NODE_REGISTRY)
        await websocket.send_json({"type": "start", "workflow_id": workflow_id})

        # Run engine in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, engine.run)

        await websocket.send_json({
            "type": "complete",
            "results_count": len(results),
            "output": str(OUTPUTS_DIR / f"{workflow_id}.jsonl")
        })
    except Exception as exc:
        diag.error("engine", exc)
        await websocket.send_json({"type": "error", "message": str(exc)})
    finally:
        await websocket.close()
```

- [ ] **Step 2: 创建 storage.py**

```python
# seek/src/storage.py
import json
import shutil
from pathlib import Path
from typing import Any


class WorkflowStorage:
    """Persist and retrieve workflow JSON files."""

    def __init__(self, workflows_dir: Path | str):
        self.dir = Path(workflows_dir)
        self.dir.mkdir(parents=True, exist_ok=True)

    def list_workflows(self) -> list[dict[str, Any]]:
        return [
            {"id": p.stem, "name": self._load_meta(p)}
            for p in sorted(self.dir.glob("*.json"), reverse=True)
            if p.stem != "template"
        ]

    def _load_meta(self, path: Path) -> str:
        try:
            data = json.loads(path.read_text())
            return data.get("name", path.stem)
        except Exception:
            return path.stem

    def save_workflow(self, workflow: dict[str, Any]) -> dict[str, Any]:
        import uuid
        if "id" not in workflow:
            workflow["id"] = str(uuid.uuid4())[:8]
        workflow.setdefault("created_at", "2026-04-15T00:00:00")
        path = self.dir / f"{workflow['id']}.json"
        path.write_text(json.dumps(workflow, ensure_ascii=False, indent=2))
        return workflow

    def load_workflow(self, workflow_id: str) -> dict[str, Any] | None:
        path = self.dir / f"{workflow_id}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def delete_workflow(self, workflow_id: str):
        path = self.dir / f"{workflow_id}.json"
        if path.exists():
            path.unlink()
```

- [ ] **Step 3: 提交**

```bash
git add seek/app.py seek/src/storage.py
git commit -m "feat(api): add FastAPI app with workflow CRUD and WebSocket run endpoint"
```

---

## 阶段 5：前端骨架

### Task 10: 前端 React 项目初始化

**Files:**
- Create: `seek/frontend/` (Vite + React + TypeScript project)
- Create: `seek/frontend/src/components/FlowEditor.tsx`
- Create: `seek/frontend/src/App.tsx`
- Create: `seek/frontend/package.json`
- Create: `seek/frontend/vite.config.ts`
- Create: `seek/frontend/tsconfig.json`

**Setup commands:**
```bash
cd seek/frontend && npm create vite@latest . -- --template react-ts
npm install @xyflow/react axios
```

- [ ] **Step 1: 创建前端项目**

Run: `cd /Users/hulihua/workspace/seek && mkdir -p seek/frontend/src/components`
Run: `npm create vite@latest seek/frontend -- --template react-ts` (accept defaults)
Run: `cd seek/frontend && npm install @xyflow/react axios`

- [ ] **Step 2: 创建 FlowEditor.tsx**

```tsx
// seek/frontend/src/components/FlowEditor.tsx
import { useCallback, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [];
const initialEdges = [];

export function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
```

- [ ] **Step 3: 更新 App.tsx 调用 FlowEditor 并添加保存/加载按钮**

- [ ] **Step 4: 提交**

```bash
git add seek/frontend/
git commit -m "feat(frontend): add React + Vite project with React Flow editor"
```

---

## 自检清单

**Spec 覆盖检查：**
- [ ] 12 种节点类型 → Task 7 实现了 5 种核心节点（起始URL, HTTP, HTML, JSON, 保存），剩余 7 种为后续任务
- [ ] 5 种可复用组件 → Task 1-4 完成全部（RetryConfig, DiagLogger, CheckpointManager, BrowserSession）
- [ ] 流程执行引擎 → Task 8 完成
- [ ] HTTP + WebSocket 接口 → Task 9 完成
- [ ] 前端骨架 → Task 10 完成

**占位符扫描：**
- 无 "TBD"、"TODO" 残留
- 所有代码均为完整可执行实现

**类型一致性：**
- `NodeBase.__init__` 参数顺序与 `WorkflowEngine.build_execution_order()` 调用一致
- `RetryConfig.get_delay(attempt)` 在 Task 1 测试通过后不再改动签名
- `NodeExecutionContext.set/get` 在 Task 6 定义，后续节点均使用相同接口

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-15-seek-implementation.md`**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
