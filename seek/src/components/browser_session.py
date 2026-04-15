from pathlib import Path
from typing import Optional, Union
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page


class BrowserSession:
    """Manages a Playwright browser instance with cookie persistence and periodic restart."""

    def __init__(
        self,
        profile_dir: Union[Path, str],
        restart_interval: int = 300,
        headless: bool = True,
    ):
        self.profile_dir = Path(profile_dir)
        self.cookies_path = self.profile_dir / "cookies.json"
        self.restart_interval = restart_interval
        self.headless = headless
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self.request_count = 0

    def launch(self) -> Browser:
        pw = sync_playwright().start()
        self._browser = pw.chromium.launch(headless=self.headless)
        self._context = self._browser.new_context()
        self.load_cookies()
        return self._browser

    def new_page(self) -> Page:
        self.increment_request()
        if self.should_rebuild():
            self.rebuild()
        return self._context.new_page()

    def increment_request(self):
        self.request_count += 1

    def should_rebuild(self) -> bool:
        return self.request_count > 0 and self.request_count % self.restart_interval == 0

    def rebuild(self):
        """Close current browser and relaunch with fresh context."""
        if self._browser:
            self._browser.close()
        self._browser = None
        self._context = None
        self.launch()

    def save_cookies(self):
        if self._context is None:
            return
        self.profile_dir.mkdir(parents=True, exist_ok=True)
        cookies = self._context.cookies()
        import json
        self.cookies_path.write_text(json.dumps(cookies, indent=2))

    def load_cookies(self) -> bool:
        if not self.cookies_path.exists():
            return False
        import json
        cookies = json.loads(self.cookies_path.read_text())
        self._context.add_cookies(cookies)
        return True

    def close(self):
        self.save_cookies()
        if self._browser:
            self._browser.close()
            self._browser = None
            self._context = None