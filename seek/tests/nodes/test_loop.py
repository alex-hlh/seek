# seek/tests/nodes/test_loop.py
import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.loop import LoopNode

def test_loop_from_url_list():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("起始URL列表", ["https://a.com", "https://b.com"])
    node = LoopNode(id="n1", node_type="循环", config={"source_type": "url_list", "max_iterations": 10}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("循环完成") is True

def test_loop_from_pagination():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = LoopNode(id="n1", node_type="循环", config={
        "source_type": "pagination",
        "base_url": "https://example.com?page={page}",
        "start_page": 1,
        "page_increment": 1,
        "max_iterations": 3
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("当前页码") == 3
    assert ctx.get("当前URL") == "https://example.com?page=3"

def test_loop_from_array():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("JSON解析结果", ["item1", "item2", "item3"])
    node = LoopNode(id="n1", node_type="循环", config={"source_type": "array", "max_iterations": 10}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("循环完成") is True