import pytest
from seek.src.components.age_verification import AgeVerificationSolver, solve_age_verification


def test_solve_finds_answer_in_question():
    solver = AgeVerificationSolver()
    html = "<div>机动车驾驶人在驾驶证有效期满前多长时间申请换证</div>"
    result = solver.solve(html)
    assert result is not None
    assert result["answer"] == "C"


def test_solve_partial_match():
    solver = AgeVerificationSolver()
    html = "<span>造成致人轻伤以上或者死亡的交通事故后逃逸</span>"
    result = solver.solve(html)
    assert result is not None
    assert result["answer"] == "B"


def test_solve_returns_none_for_unknown_question():
    solver = AgeVerificationSolver()
    html = "<div>这是一道完全未知的验证问题XYZ123</div>"
    result = solver.solve(html)
    assert result is None


def test_convenience_function():
    html = "<div>驾驶机动车在高速公路上倒车</div>"
    result = solve_age_verification(html)
    assert result is not None
    assert result["answer"] == "C"


def test_custom_bank_path_loads():
    solver = AgeVerificationSolver(bank_path="/nonexistent/path.json")
    # Falls back to default bank
    html = "<div>驾驶机动车在高速公路上倒车</div>"
    result = solver.solve(html)
    assert result is not None
    assert result["answer"] == "C"
