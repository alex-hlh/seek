import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.human_verify import HumanVerifyNode


def test_human_verify_sets_cookie_on_success():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "<div>驾驶机动车在高速公路上倒车</div>")
    node = HumanVerifyNode(id="n1", node_type="人机验证", config={}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert ctx.get("验证通过") is True
    assert ctx.get("验证结果")["answer"] == "C"


def test_human_verify_fails_gracefully_when_not_required():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "<div>未知验证问题ABC123</div>")
    node = HumanVerifyNode(id="n1", node_type="人机验证", config={"required": False}, ctx=ctx)
    result = node.execute()
    assert ctx.get("验证通过") is False
    assert result is True  # Returns True because not required


def test_human_verify_fails_and_halts_when_required():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("最近响应内容", "<div>未知验证问题ABC123</div>")
    node = HumanVerifyNode(id="n1", node_type="人机验证", config={"required": True}, ctx=ctx)
    result = node.execute()
    assert ctx.get("验证通过") is False
    assert result is False  # Returns False because required and failed
