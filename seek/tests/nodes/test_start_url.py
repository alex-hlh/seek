# seek/tests/nodes/test_start_url.py
import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.start_url import StartUrlNode


def test_start_url_sets_url_list_single():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = StartUrlNode(id="n1", node_type="起始URL", config={"urls": ["https://a.com"]}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("起始URL列表") == ["https://a.com"]


def test_start_url_sets_url_list_multiple():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = StartUrlNode(id="n1", node_type="起始URL", config={"urls": ["https://a.com", "https://b.com"]}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("起始URL列表") == ["https://a.com", "https://b.com"]


def test_start_url_string_converts_to_list():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = StartUrlNode(id="n1", node_type="起始URL", config={"urls": "https://a.com"}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("起始URL列表") == ["https://a.com"]