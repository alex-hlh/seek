# seek/tests/nodes/test_api_request.py
import pytest
from unittest.mock import patch, MagicMock
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.api_request import ApiRequestNode

def test_api_request_with_bearer_auth():
    ctx = NodeExecutionContext(workflow_id="wf1")
    node = ApiRequestNode(id="n1", node_type="API请求", config={
        "url": "https://httpbin.org/headers",
        "method": "GET",
        "auth": {"type": "bearer", "token": "test-token"}
    }, ctx=ctx)

    with patch("seek.src.nodes.api_request.httpx.Client") as mock_client_cls:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = '{"headers": {}}'
        mock_response.headers = {}
        mock_client = MagicMock()
        mock_client.request.return_value = mock_response
        mock_client_cls.return_value.__enter__.return_value = mock_client

        result = node.execute()
        assert result is True
        # Verify Authorization header was set
        call_kwargs = mock_client.request.call_args
        assert "Authorization" in call_kwargs[1]["headers"]
        assert call_kwargs[1]["headers"]["Authorization"] == "Bearer test-token"