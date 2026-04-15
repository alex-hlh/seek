# seek/src/nodes/regex_clean.py
import re
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class RegexCleanNode(NodeBase):
    node_type = "正则清洗"

    def execute(self) -> bool:
        rules = self.config.get("rules", [])
        source_field = self.config.get("source_field", "最近响应内容")
        target_field = self.config.get("target_field", "清洗后内容")

        raw = self.ctx.get(source_field, "")
        result = raw

        for rule in rules:
            pattern = rule.get("pattern", "")
            replacement = rule.get("replacement", "")
            flags = rule.get("flags", 0)  # 0=default, re.IGNORECASE=2, re.DOTALL=16

            compiled = re.compile(pattern, flags)
            result = compiled.sub(replacement, result)

        self.ctx.set(target_field, result)
        return True