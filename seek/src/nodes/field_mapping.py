# seek/src/nodes/field_mapping.py
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class FieldMappingNode(NodeBase):
    node_type = "字段映射"

    def execute(self) -> bool:
        mapping = self.config.get("mapping", {})
        source_record = self.config.get("source", "提取结果")
        as_result = self.config.get("add_to_results", True)

        record = self.ctx.get(source_record, {})
        if not isinstance(record, dict):
            record = {}

        mapped = {}
        for src_field, tgt_field in mapping.items():
            value = record.get(src_field)
            if value is not None:
                mapped[tgt_field] = value

        if as_result:
            self.ctx.add_result(mapped)
        else:
            self.ctx.set("映射后记录", mapped)

        return True