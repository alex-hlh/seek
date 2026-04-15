# seek/tests/nodes/test_json_parse.py
import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.json_parse import JsonParseNode


def test_json_parse_extracts_nested_path():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", '{"data": {"items": [{"name": "test"}]}}')
    node = JsonParseNode(id="n1", node_type="JSON解析", config={"path": "data.items.0.name"}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("JSON解析结果") == "test"


def test_json_parse_fallback_to_html_extraction():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", '{"html": "<div>test</div>"}')
    node = JsonParseNode(id="n1", node_type="JSON解析", config={"path": "html"}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("JSON解析结果") == "<div>test</div>"