# seek/tests/nodes/test_field_mapping.py
import pytest
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.field_mapping import FieldMappingNode


def test_field_mapping_renames_fields():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("提取结果", {"id": "123", "name": "Test", "price": 99.9})
    node = FieldMappingNode(id="n1", node_type="字段映射", config={
        "source": "提取结果",
        "mapping": {"id": "ID", "name": "名称", "price": "价格"},
        "add_to_results": True
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert len(ctx.results) == 1
    assert ctx.results[0]["ID"] == "123"
    assert ctx.results[0]["名称"] == "Test"
    assert "price" not in ctx.results[0]


def test_field_mapping_not_add_to_results():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("提取结果", {"id": "123"})
    node = FieldMappingNode(id="n1", node_type="字段映射", config={
        "source": "提取结果",
        "mapping": {"id": "ID"},
        "add_to_results": False
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    assert len(ctx.results) == 0
    assert ctx.get("映射后记录") == {"ID": "123"}