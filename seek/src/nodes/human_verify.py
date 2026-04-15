"""Human/age verification node."""
from seek.src.nodes.base import NodeBase, NodeExecutionContext
from seek.src.components.age_verification import AgeVerificationSolver


class HumanVerifyNode(NodeBase):
    node_type = "人机验证"

    def execute(self) -> bool:
        bank_path = self.config.get("bank_path")
        html = self.ctx.get("最近响应内容", "")

        solver = AgeVerificationSolver(bank_path) if bank_path else AgeVerificationSolver()
        result = solver.solve(html)

        if result:
            self.ctx.set("验证结果", result)
            self.ctx.set("验证通过", True)
            return True

        self.ctx.set("验证通过", False)
        # If not required, return True anyway; if required, return False to halt
        return not self.config.get("required", False)
