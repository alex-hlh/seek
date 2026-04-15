# seek/tests/nodes/test_html_parse.py
import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.html_parse import HtmlParseNode


def test_html_parse_extracts_single_field():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "<html><body><h1 class='title'>Hello</h1></body></html>")
    node = HtmlParseNode(id="n1", node_type="HTML解析", config={
        "selectors": [{"selector": "h1.title", "field": "title"}]
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("提取结果")["title"] == "Hello"


def test_html_parse_extracts_multiple():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "<html><body><a class='link'>Item 1</a><a class='link'>Item 2</a></body></html>")
    node = HtmlParseNode(id="n1", node_type="HTML解析", config={
        "selectors": [{"selector": "a.link", "field": "items", "multiple": True}]
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("提取结果")["items"] == ["Item 1", "Item 2"]


def test_html_parse_table_mode():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "<table><tr><th>Name</th><th>Age</th></tr><tr><td>Alice</td><td>30</td></tr></table>")
    node = HtmlParseNode(id="n1", node_type="HTML解析", config={
        "table_mode": True,
        "table_selector": "table"
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    table = ctx.get("表格数据")
    assert len(table) == 1
    assert table[0]["Name"] == "Alice"
    assert table[0]["Age"] == "30"