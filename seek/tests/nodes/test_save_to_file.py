# seek/tests/nodes/test_save_to_file.py
import pytest
import tempfile
from pathlib import Path
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.save_to_file import SaveToFileNode


def test_save_to_file_jsonl_format(tmp_path):
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.add_result({"id": "1", "name": "test"})
    out_path = tmp_path / "output.jsonl"
    node = SaveToFileNode(id="n1", node_type="保存到文件", config={"path": str(out_path), "format": "jsonl"}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert out_path.exists()
    assert "test" in out_path.read_text()


def test_save_to_file_csv_format(tmp_path):
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.add_result({"name": "test", "value": "123"})
    out_path = tmp_path / "output.csv"
    node = SaveToFileNode(id="n1", node_type="保存到文件", config={"path": str(out_path), "format": "csv"}, ctx=ctx)
    result = node.execute()
    assert result is True
    assert out_path.exists()
    assert "name" in out_path.read_text()


def test_save_to_file_with_field_mapping(tmp_path):
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.add_result({"id": "1", "name": "Test"})
    out_path = tmp_path / "output.jsonl"
    node = SaveToFileNode(id="n1", node_type="保存到文件", config={
        "path": str(out_path), "format": "jsonl",
        "use_field_mapping": True,
        "field_mapping": {"id": "ID", "name": "名称"}
    }, ctx=ctx)
    result = node.execute()
    assert result is True
    content = out_path.read_text()
    assert "ID" in content
    assert "名称" in content
    assert "id" not in content