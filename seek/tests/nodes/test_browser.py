# seek/tests/nodes/test_browser.py
import pytest
from unittest.mock import patch, MagicMock
from seek.src.nodes.base import NodeExecutionContext
from seek.src.nodes.browser import BrowserNode

def test_browser_node_stores_html():
    ctx = NodeExecutionContext(workflow_id="wf1")
    ctx.set("url", "https://example.com")
    node = BrowserNode(id="n1", node_type="浏览器执行", config={"url": "https://example.com", "headless": True}, ctx=ctx)
    # Mock BrowserSession to avoid actual browser launch
    with patch("seek.src.nodes.browser.BrowserSession") as mock_session_cls:
        mock_session = MagicMock()
        mock_browser = MagicMock()
        mock_page = MagicMock()
        mock_session_cls.return_value = mock_session
        mock_session.launch.return_value = mock_browser
        mock_session.new_page.return_value = mock_page
        mock_page.content.return_value = "<html><body>Test</body></html>"
        result = node.execute()
        assert result is True
        assert ctx.get("最近响应内容") == "<html><body>Test</body></html>"