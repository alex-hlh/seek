# seek/tests/nodes/test_condition.py
import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.condition import ConditionNode

def test_condition_equals():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("status", "200")
    node = ConditionNode(id="n1", node_type="条件分支", config={
        "condition": "status", "operator": "equals", "value": "200"
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("条件结果") is True

def test_condition_contains():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("title", "Hello World")
    node = ConditionNode(id="n1", node_type="条件分支", config={
        "condition": "title", "operator": "contains", "value": "World"
    }, ctx=ctx)
    result = node.execute()
    assert result is True

def test_condition_is_empty():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("data", "")
    node = ConditionNode(id="n1", node_type="条件分支", config={
        "condition": "data", "operator": "is_empty"
    }, ctx=ctx)
    result = node.execute()
    assert result is True