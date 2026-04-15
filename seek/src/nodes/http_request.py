import httpx
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class HttpRequestNode(NodeBase):
    node_type = "HTTP请求"

    def execute(self) -> bool:
        method = self.config.get("method", "GET").upper()
        url = self._resolve_url()
        headers = self.config.get("headers", {})
        body = self.config.get("body")

        with httpx.Client(timeout=self.config.get("timeout", 30)) as client:
            response = client.request(method, url, headers=headers, content=body)

        self.ctx.set("最近响应状态码", response.status_code)
        self.ctx.set("最近响应内容", response.text)
        self.ctx.set("最近响应头", dict(response.headers))

        if not self.config.get("allow_errors", False) and response.status_code >= 400:
            raise httpx.HTTPStatusError(f"HTTP {response.status_code}", request=response.request, response=response)

        return True

    def _resolve_url(self) -> str:
        url = self.config.get("url", "")
        import re
        for key, value in self.ctx.variables.items():
            url = url.replace(f"{{{key}}}", str(value))
        return url
