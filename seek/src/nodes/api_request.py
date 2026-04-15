# seek/src/nodes/api_request.py
import httpx
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class ApiRequestNode(NodeBase):
    node_type = "API请求"

    def execute(self) -> bool:
        method = self.config.get("method", "GET").upper()
        base_url = self._resolve_url()
        params = self.config.get("params", {})
        headers = self.config.get("headers", {})
        auth = self.config.get("auth")  # {"type": "bearer", "token": "..."} or {"type": "basic", "username": "...", "password": "..."}

        # Resolve variables in params and headers
        params = self._resolve_dict(params)
        headers = self._resolve_dict(headers)

        # Apply auth
        if auth:
            if auth.get("type") == "bearer":
                headers["Authorization"] = f"Bearer {auth.get('token')}"
            elif auth.get("type") == "basic":
                import base64
                credentials = f"{auth.get('username')}:{auth.get('password')}"
                headers["Authorization"] = f"Basic {base64.b64encode(credentials.encode()).decode()}"

        with httpx.Client(timeout=self.config.get("timeout", 30)) as client:
            response = client.request(method, base_url, params=params, headers=headers)

        self.ctx.set("最近响应状态码", response.status_code)
        self.ctx.set("最近响应内容", response.text)
        self.ctx.set("最近响应头", dict(response.headers))

        if not self.config.get("allow_errors", False) and response.status_code >= 400:
            raise httpx.HTTPStatusError(f"HTTP {response.status_code}", request=response.request, response=response)

        return True

    def _resolve_url(self) -> str:
        url = self.config.get("url", "")
        for key, value in self.ctx.variables.items():
            url = url.replace(f"{{{key}}}", str(value))
        return url

    def _resolve_dict(self, d: dict) -> dict:
        result = {}
        for k, v in d.items():
            if isinstance(v, str):
                for key, value in self.ctx.variables.items():
                    v = v.replace(f"{{{key}}}", str(value))
            result[k] = v
        return result