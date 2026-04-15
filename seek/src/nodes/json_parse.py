import json
import re
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class JsonParseNode(NodeBase):
    node_type = "JSON解析"

    def execute(self) -> bool:
        raw = self.ctx.get("最近响应内容", "")

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                except json.JSONDecodeError:
                    return False
            else:
                return False

        path = self.config.get("path", "")
        if path:
            for key in path.split("."):
                if isinstance(data, dict):
                    data = data.get(key, {})
                elif isinstance(data, list):
                    try:
                        data = data[int(key)]
                    except (ValueError, IndexError):
                        return False

        self.ctx.set("JSON解析结果", data)
        return True
