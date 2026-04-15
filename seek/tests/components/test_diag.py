import pytest
import tempfile
from pathlib import Path
from seek.src.components.diag import DiagLogger

def test_diag_log_writes_line(tmp_path):
    log_file = tmp_path / "diag.log"
    logger = DiagLogger(log_file)
    logger.diag("node1", "start", url="https://example.com")
    assert log_file.exists()
    content = log_file.read_text()
    assert "node1" in content
    assert "start" in content
    assert "https://example.com" in content

def test_error_log_includes_exception(tmp_path):
    log_file = tmp_path / "diag.log"
    logger = DiagLogger(log_file)
    try:
        raise ValueError("test error")
    except ValueError as e:
        logger.error("node1", e)
    content = log_file.read_text()
    assert "node1" in content
    assert "ValueError" in content
    assert "test error" in content

def test_navigate_log(tmp_path):
    log_file = tmp_path / "diag.log"
    logger = DiagLogger(log_file)
    logger.navigate("node1", "https://example.com/page1")
    content = log_file.read_text()
    assert "node1" in content
    assert "NAVIGATE" in content
    assert "https://example.com/page1" in content