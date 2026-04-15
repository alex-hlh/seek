from __future__ import annotations
import csv
import json
from pathlib import Path
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class SaveToFileNode(NodeBase):
    node_type = "保存到文件"

    def execute(self) -> bool:
        output_format = self.config.get("format", "jsonl").lower()
        output_path = Path(self.config.get("path", "output.txt"))
        output_path.parent.mkdir(parents=True, exist_ok=True)

        records = self.ctx.results
        if self.config.get("use_field_mapping", False):
            mapped = self._apply_field_mapping(records)
        else:
            mapped = records

        if output_format == "jsonl":
            with output_path.open("a") as f:
                for record in mapped:
                    f.write(json.dumps(record, ensure_ascii=False) + "\n")
        elif output_format == "json":
            existing = []
            if output_path.exists():
                existing = json.loads(output_path.read_text())
            existing.extend(mapped)
            output_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
        elif output_format == "csv":
            if not mapped:
                return True
            with output_path.open("a", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=mapped[0].keys())
                if output_path.stat().st_size == 0:
                    writer.writeheader()
                writer.writerows(mapped)

        return True

    def _apply_field_mapping(self, records: list[dict]) -> list[dict]:
        mapping = self.config.get("field_mapping", {})
        return [{mapping.get(k, k): v for k, v in r.items()} for r in records]
