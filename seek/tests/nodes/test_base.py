import pytest
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class ConcreteNode(NodeBase):
    """Concrete implementation for testing."""
    def execute(self) -> bool:
        return True


def test_node_base_has_id_and_type():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = ConcreteNode(id="n1", node_type="test", config={}, ctx=ctx)
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