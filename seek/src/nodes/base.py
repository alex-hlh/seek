from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional

from seek.src.components.retry import RetryConfig


@dataclass
class NodeExecutionContext:
    """Shared context passed through the workflow execution."""
    workflow_id: str
    variables: dict[str, Any] = field(default_factory=dict)
    results: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def set(self, key: str, value: Any):
        self.variables[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        return self.variables.get(key, default)

    def add_result(self, result: dict[str, Any]):
        self.results.append(result)


class NodeBase(ABC):
    """Base class for all workflow nodes."""

    def __init__(
        self,
        id: str,
        node_type: str,
        config: dict[str, Any],
        ctx: NodeExecutionContext,
        retry: Optional[RetryConfig] = None,
        stop_on_error: bool = True,
    ):
        self.id = id
        self.node_type = node_type
        self.config = config
        self.ctx = ctx
        self.retry = retry or RetryConfig()
        self.stop_on_error = stop_on_error

    @abstractmethod
    def execute(self) -> bool:
        """Execute the node logic. Returns True on success, False on failure."""
        raise NotImplementedError

    def execute_with_retry(self) -> bool:
        attempt = 0
        while True:
            try:
                return self.execute()
            except Exception as exc:
                if not self.retry.should_retry(attempt):
                    raise
                import time
                time.sleep(self.retry.get_delay(attempt))
                attempt += 1
