from __future__ import annotations
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import json
import asyncio
from typing import Any

from seek.src.nodes.start_url import StartUrlNode
from seek.src.nodes.http_request import HttpRequestNode
from seek.src.nodes.api_request import ApiRequestNode
from seek.src.nodes.browser import BrowserNode
from seek.src.nodes.loop import LoopNode
from seek.src.nodes.condition import ConditionNode
from seek.src.nodes.html_parse import HtmlParseNode
from seek.src.nodes.json_parse import JsonParseNode
from seek.src.nodes.regex_clean import RegexCleanNode
from seek.src.nodes.field_mapping import FieldMappingNode
from seek.src.nodes.save_to_file import SaveToFileNode
from seek.src.nodes.human_verify import HumanVerifyNode
from seek.src.components.diag import DiagLogger
from seek.src.storage import WorkflowStorage
from seek.src.engine import WorkflowEngine
from seek.src.config import WORKFLOWS_DIR, OUTPUTS_DIR, LOGS_DIR

app = FastAPI(title="Seek Crawler")

NODE_REGISTRY = {
    "起始URL": StartUrlNode,
    "HTTP请求": HttpRequestNode,
    "API请求": ApiRequestNode,
    "浏览器执行": BrowserNode,
    "循环": LoopNode,
    "条件分支": ConditionNode,
    "HTML解析": HtmlParseNode,
    "JSON解析": JsonParseNode,
    "正则清洗": RegexCleanNode,
    "字段映射": FieldMappingNode,
    "保存到文件": SaveToFileNode,
    "人机验证": HumanVerifyNode,
}

storage = WorkflowStorage(WORKFLOWS_DIR)


@app.get("/")
async def root():
    dist_index = Path(__file__).parent / "frontend" / "dist" / "index.html"
    return FileResponse(dist_index)


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
