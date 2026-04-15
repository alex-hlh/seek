from seek.src.nodes.base import NodeBase, NodeExecutionContext


class StartUrlNode(NodeBase):
    node_type = "起始URL"

    def execute(self) -> bool:
        urls = self.config.get("urls", [])
        if isinstance(urls, str):
            urls = [urls]
        self.ctx.set("起始URL列表", urls)
        self.ctx.set("当前URL索引", 0)
        return True
