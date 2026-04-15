import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch
from seek.src.components.browser_session import BrowserSession

def test_browser_session_initial_state(tmp_path):
    bs = BrowserSession(tmp_path / "profile")
    assert bs.cookies_path == tmp_path / "profile" / "cookies.json"
    assert bs.profile_dir == tmp_path / "profile"
    assert bs.request_count == 0
    assert bs.restart_interval == 300

@patch("seek.src.components.browser_session.sync_playwright")
def test_launch_starts_browser(mock_playwright, tmp_path):
    mock_browser = MagicMock()
    mock_context = MagicMock()
    mock_page = MagicMock()
    mock_playwright.return_value.start.return_value.chromium.launch.return_value = mock_browser
    mock_browser.new_context.return_value = mock_context
    mock_context.new_page.return_value = mock_page

    bs = BrowserSession(tmp_path / "profile")
    browser = bs.launch()

    assert browser is mock_browser
    mock_browser.new_context.assert_called_once()

def test_request_count_increments(tmp_path):
    bs = BrowserSession(tmp_path / "profile")
    bs.request_count = 299
    bs.increment_request()
    assert bs.request_count == 300

def test_should_rebuild_true_at_interval(tmp_path):
    bs = BrowserSession(tmp_path / "profile", restart_interval=300)
    bs.request_count = 300
    assert bs.should_rebuild() is True

def test_should_rebuild_false_under_interval(tmp_path):
    bs = BrowserSession(tmp_path / "profile", restart_interval=300)
    bs.request_count = 299
    assert bs.should_rebuild() is False