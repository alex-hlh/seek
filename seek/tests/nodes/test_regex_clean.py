# seek/tests/nodes/test_regex_clean.py
import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.regex_clean import RegexCleanNode


def test_regex_clean_extracts_pattern():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "ID: ABC-12345 Price: $99.99")
    node = RegexCleanNode(id="n1", node_type="正则清洗", config={
        "source_field": "最近响应内容",
        "target_field": "提取结果",
        "rules": [
            {"pattern": r"ID: ([A-Z]+-\d+)", "replacement": r"\1"}
        ]
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert "ABC-12345" in ctx.get("提取结果")


def test_regex_clean_removes_html_tags():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "<p>Hello <b>World</b></p>")
    node = RegexCleanNode(id="n1", node_type="正则清洗", config={
        "source_field": "最近响应内容",
        "target_field": "清洗后内容",
        "rules": [
            {"pattern": r"<[^>]+>", "replacement": ""}
        ]
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert "<" not in ctx.get("清洗后内容")