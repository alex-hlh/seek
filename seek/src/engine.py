from collections import defaultdict, deque
from typing import Any
from seek.src.nodes.base import NodeBase, NodeExecutionContext


def topological_sort(nodes: list[str], edges: list[tuple[str, str]]) -> list[str]:
    """Return nodes in topological order (Kahn's algorithm). Raises ValueError on cycle."""
    in_degree = {n: 0 for n in nodes}
    adj = defaultdict(list)
    for src, dst in edges:
        adj[src].append(dst)
        in_degree[dst] += 1

    queue = deque([n for n, d in in_degree.items() if d == 0])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(nodes):
        raise ValueError("Workflow contains a cycle")
    return result


class WorkflowEngine:
    """Executes a workflow: loads nodes, topologically sorts, runs each node."""

    def __init__(self, workflow: dict[str, Any], node_registry: dict[str, type[NodeBase]]):
        self.workflow = workflow
        self.node_registry = node_registry
        self.ctx = NodeExecutionContext(workflow_id=workflow["id"])

    def build_execution_order(self) -> list[NodeBase]:
        nodes = self.workflow["nodes"]
        edges = [(e["source"], e["target"]) for e in self.workflow.get("edges", [])]
        node_map = {n["id"]: n for n in nodes}

        sorted_ids = topological_sort([n["id"] for n in nodes], edges)
        result = []
        for nid in sorted_ids:
            nd = node_map[nid]
            node_cls = self.node_registry.get(nd["type"])
            if node_cls is None:
                raise ValueError(f"Unknown node type: {nd['type']}")
            result.append(node_cls(id=nd["id"], node_type=nd["type"], config=nd.get("data", {}), ctx=self.ctx))
        return result

    def run(self) -> list[dict[str, Any]]:
        execution_order = self.build_execution_order()
        for node in execution_order:
            success = node.execute_with_retry()
            if not success and node.stop_on_error:
                break
        return self.ctx.results