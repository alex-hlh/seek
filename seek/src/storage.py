import json
from pathlib import Path
from typing import Any


class WorkflowStorage:
    """Persist and retrieve workflow JSON files."""

    def __init__(self, workflows_dir: Path | str):
        self.dir = Path(workflows_dir)
        self.dir.mkdir(parents=True, exist_ok=True)

    def list_workflows(self) -> list[dict[str, Any]]:
        return [
            {"id": p.stem, "name": self._load_meta(p)}
            for p in sorted(self.dir.glob("*.json"), reverse=True)
            if p.stem != "template"
        ]

    def _load_meta(self, path: Path) -> str:
        try:
            data = json.loads(path.read_text())
            return data.get("name", path.stem)
        except Exception:
            return path.stem

    def save_workflow(self, workflow: dict[str, Any]) -> dict[str, Any]:
        import uuid
        if "id" not in workflow:
            workflow["id"] = str(uuid.uuid4())[:8]
        workflow.setdefault("created_at", "2026-04-15T00:00:00")
        path = self.dir / f"{workflow['id']}.json"
        path.write_text(json.dumps(workflow, ensure_ascii=False, indent=2))
        return workflow

    def load_workflow(self, workflow_id: str) -> dict[str, Any] | None:
        path = self.dir / f"{workflow_id}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text())

    def delete_workflow(self, workflow_id: str):
        path = self.dir / f"{workflow_id}.json"
        if path.exists():
            path.unlink()
