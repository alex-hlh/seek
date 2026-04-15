# seek/tests/nodes/test_http_request.py
import pytest
from unittest.mock import patch, MagicMock
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.http_request import HttpRequestNode


def test_http_request_stores_response():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = HttpRequestNode(id="n1", node_type="HTTP请求", config={"url": "https://httpbin.org/get", "method": "GET"}, ctx=ctx)
    with patch("seek.src.nodes.http_request.httpx.Client") as mock_cls:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = "<html>test</html>"
        mock_resp.headers = {}
        mock_client = MagicMock()
        mock_client.request.return_value = mock_resp
        mock_cls.return_value.__enter__.return_value = mock_client
        result = node.execute()
        assert result is True
        assert ctx.get("最近响应状态码") == 200


def test_http_request_resolves_variables():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("base_url", "https://httpbin.org")
    node = HttpRequestNode(id="n1", node_type="HTTP请求", config={"url": "{base_url}/get", "method": "GET"}, ctx=ctx)
    with patch("seek.src.nodes.http_request.httpx.Client") as mock_cls:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = "{}"
        mock_resp.headers = {}
        mock_client = MagicMock()
        mock_client.request.return_value = mock_resp
        mock_cls.return_value.__enter__.return_value = mock_client
        result = node.execute()
        assert result is True
        mock_client.request.assert_called_once()