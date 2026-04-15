from pathlib import Path
from datetime import datetime
from typing import Union
import threading


class DiagLogger:
    """Thread-safe diagnostic logger that writes timestamped events to a file."""

    def __init__(self, log_file: Union[Path, str]):
        self.log_file = Path(log_file)
        self._lock = threading.Lock()

    def _write(self, level: str, node_id: str, event: str, **kwargs):
        timestamp = datetime.now().isoformat()
        parts = [f"[{timestamp}]", f"[{level}]", f"[{node_id}]", event]
        if kwargs:
            parts.append(str(kwargs))
        line = " ".join(parts) + "\n"
        with self._lock:
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.log_file, "a") as f:
                f.write(line)

    def diag(self, node_id: str, event: str, **kwargs):
        self._write("DIAG", node_id, event, **kwargs)

    def navigate(self, node_id: str, url: str):
        self._write("NAVIGATE", node_id, f"url={url}")

    def error(self, node_id: str, exc: Exception):
        self._write("ERROR", node_id, f"{type(exc).__name__}: {exc}")

    def warn(self, node_id: str, msg: str):
        self._write("WARN", node_id, msg)