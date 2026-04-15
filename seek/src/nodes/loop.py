# seek/src/nodes/loop.py
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class LoopNode(NodeBase):
    node_type = "循环"

    def execute(self) -> bool:
        source_type = self.config.get("source_type", "url_list")
        max_iterations = self.config.get("max_iterations", 100)
        page_var = self.config.get("page_variable", "当前页码")
        offset_var = self.config.get("offset_variable", "当前偏移")

        if source_type == "url_list":
            urls = self.ctx.get("起始URL列表", [])
            for i, url in enumerate(urls[:max_iterations]):
                self.ctx.set("当前URL索引", i)
                self.ctx.set("当前URL", url)
                self.ctx.set(page_var, i + 1)
            self.ctx.set("循环完成", True)
            return True

        elif source_type == "pagination":
            base_url = self.config.get("base_url", "")
            start_page = self.config.get("start_page", 1)
            page_increment = self.config.get("page_increment", 1)

            for page in range(start_page, start_page + max_iterations * page_increment, page_increment):
                self.ctx.set(page_var, page)
                url = base_url.replace("{page}", str(page))
                self.ctx.set("当前URL", url)
            self.ctx.set("循环完成", True)
            return True

        elif source_type == "array":
            array = self.ctx.get("JSON解析结果", [])
            if not isinstance(array, list):
                array = [array]
            for i, item in enumerate(array[:max_iterations]):
                self.ctx.set("循环索引", i)
                self.ctx.set("循环当前项", item)
            self.ctx.set("循环完成", True)
            return True

        return True