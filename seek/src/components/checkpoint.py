from __future__ import annotations
import json
import threading
from pathlib import Path
from typing import Union


class CheckpointManager:
    """Manages crawl state with done-IDs set and arbitrary metadata."""

    def __init__(self, checkpoint_dir: Union[Path, str]):
        self.dir = Path(checkpoint_dir)
        self.state_file = self.dir / "progress.json"
        self.done_file = self.dir / "done_ids.txt"
        self._lock = threading.Lock()
        self._done_ids = None

    def _ensure_dir(self):
        self.dir.mkdir(parents=True, exist_ok=True)

    def _load_done_ids(self) -> set:
        if self._done_ids is not None:
            return self._done_ids
        self._ensure_dir()
        if self.done_file.exists():
            self._done_ids = set(self.done_file.read_text().strip().splitlines())
        else:
            self._done_ids = set()
        return self._done_ids

    def is_done(self, item_id: str) -> bool:
        return item_id in self._load_done_ids()

    def mark_done(self, item_id: str):
        self._ensure_dir()
        with self._lock:
            done_ids = self._load_done_ids()
            if item_id not in done_ids:
                done_ids.add(item_id)
                self.done_file.write_text("\n".join(sorted(done_ids)) + "\n")
                self._done_ids = done_ids

    def mark_batch_done(self, ids: list):
        for id_ in ids:
            self.mark_done(id_)

    def save_state(self, **kwargs):
        self._ensure_dir()
        with self._lock:
            state = self.load_state()
            state.update(kwargs)
            self.state_file.write_text(json.dumps(state, indent=2))

    def load_state(self) -> dict:
        self._ensure_dir()
        if not self.state_file.exists():
            return {}
        return json.loads(self.state_file.read_text())

    def reset(self):
        with self._lock:
            self._done_ids = set()
            if self.dir.exists():
                for f in self.dir.glob("*.txt"):
                    f.write_text("")
                if self.state_file.exists():
                    self.state_file.write_text("{}")
