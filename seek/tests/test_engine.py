import pytest
from seek.src.engine import WorkflowEngine, topological_sort


def test_topological_sort_linear():
    edges = [("a", "b"), ("b", "c")]
    order = topological_sort(["a", "b", "c"], edges)
    assert order.index("a") < order.index("b") < order.index("c")

def test_topological_sort_parallel_branches():
    edges = [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")]
    order = topological_sort(["a", "b", "c", "d"], edges)
    assert order.index("a") < order.index("b")
    assert order.index("a") < order.index("c")
    assert order.index("b") < order.index("d")
    assert order.index("c") < order.index("d")

def test_topological_sort_cycle_detection():
    edges = [("a", "b"), ("b", "a")]
    with pytest.raises(ValueError, match="cycle"):
        topological_sort(["a", "b"], edges)