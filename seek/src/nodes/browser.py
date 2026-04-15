# seek/src/nodes/browser.py
from playwright.sync_api import sync_playwright
from seek.src.nodes.base import NodeBase, NodeExecutionContext
from seek.src.components.browser_session import BrowserSession


class BrowserNode(NodeBase):
    node_type = "浏览器执行"

    def execute(self) -> bool:
        url = self._resolve_url()
        wait_for = self.config.get("wait_for")
        screenshot = self.config.get("screenshot", False)
        profile_dir = self.config.get("profile_dir", "/tmp/seek_browser")
        headless = self.config.get("headless", True)

        session = BrowserSession(profile_dir, headless=headless)
        browser = session.launch()
        page = session.new_page()

        if wait_for:
            page.goto(url, wait_for=wait_for)
        else:
            page.goto(url)

        html = page.content()
        self.ctx.set("最近响应内容", html)

        if screenshot:
            import base64
            screenshot_bytes = page.screenshot()
            self.ctx.set("截图", base64.b64encode(screenshot_bytes).decode())

        cookies = session._context.cookies()
        self.ctx.set("当前Cookie", cookies)

        session.close()
        return True

    def _resolve_url(self) -> str:
        url = self.config.get("url", "")
        for key, value in self.ctx.variables.items():
            url = url.replace(f"{{{key}}}", str(value))
        return url