import pytest
import tempfile
from pathlib import Path
from seek.src.components.checkpoint import CheckpointManager

def test_mark_done_and_is_done(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.mark_done("id1")
    assert cm.is_done("id1") is True
    assert cm.is_done("id2") is False

def test_batch_mark_done(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.mark_batch_done(["id1", "id2", "id3"])
    assert cm.is_done("id1") is True
    assert cm.is_done("id3") is True

def test_save_and_load_state(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.save_state(page=5, total=100)
    state = cm.load_state()
    assert state["page"] == 5
    assert state["total"] == 100

def test_reset_clears_state(tmp_path):
    cm = CheckpointManager(tmp_path / "ckpt")
    cm.mark_done("id1")
    cm.save_state(page=5)
    cm.reset()
    assert cm.is_done("id1") is False
    assert cm.load_state() == {}
