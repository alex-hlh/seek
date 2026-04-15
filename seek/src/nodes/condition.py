# seek/src/nodes/condition.py
import re
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class ConditionNode(NodeBase):
    node_type = "条件分支"

    def execute(self) -> bool:
        condition = self.config.get("condition", "")
        value = self.ctx.get(condition)
        operator = self.config.get("operator", "equals")
        compare_value = self.config.get("value")

        result = self._evaluate(value, operator, compare_value)
        self.ctx.set("条件结果", result)
        return result

    def _evaluate(self, left, operator: str, right) -> bool:
        if operator == "equals":
            return str(left) == str(right)
        elif operator == "not_equals":
            return str(left) != str(right)
        elif operator == "contains":
            return str(right) in str(left)
        elif operator == "not_contains":
            return str(right) not in str(left)
        elif operator == "greater_than":
            return float(left) > float(right)
        elif operator == "less_than":
            return float(left) < float(right)
        elif operator == "is_empty":
            return left is None or str(left).strip() == ""
        elif operator == "is_not_empty":
            return left is not None and str(left).strip() != ""
        elif operator == "matches_regex":
            return bool(re.search(str(right), str(left)))
        return False