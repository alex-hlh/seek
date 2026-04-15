"""Age verification solver — Q&A bank with fuzzy matching."""
import re
import json
from pathlib import Path
from typing import Optional


# Default answer bank extracted from real verification pages
DEFAULT_BANK = {
    "机动车驾驶人在驾驶证有效期满前多长时间申请换证": "C",
    "超过机动车驾驶证有效期一年以上未换证被注销": "B",
    "初次申领机动车驾驶证的": "A",
    "在考试过程中有贿赂": "A",
    "驾驶机动车行经人行横道": "C",
    "驾驶机动车在高速公路上倒车": "C",
    "年龄在70周岁以上": "B",
    "实习期内驾驶人驾驶机动车上高速公路": "C",
    "造成致人轻伤以上或者死亡的交通事故后逃逸": "B",
    "机动车驾驶人逾期不参加审验": "B",
    "机动车购买后尚未注册登记": "A",
    "驾驶机动车在高速公路或城市快速路上不按规定车道行驶": "D",
    "当事人有下列哪种行为，要承担交通事故全部责任": "C",
    "在检查被发现有舞弊行为": "A",
    "申请轻型牵引挂车准驾车型": "C",
    "隐瞒有关情况或提供虚假材料申请机动车驾驶证": "B",
    "机动车驾驶人户籍迁出原车辆管理所需要向什么地方的车辆管理所提出申请": "D",
    "申请人在一年内不得再次申领机动车驾驶证": "B",
    "驾驶机动车行经人行横道，不按规定减速停车避让行人": "C",
    "造成致人轻伤以上或者死亡的交通事故后逃逸，尚不构成犯罪": "B",
    "年龄在70周岁以上的驾驶人多长时间要提交一次身体条件证明": "B",
}


class AgeVerificationSolver:
    """Solve age verification challenges via Q&A fuzzy matching.

    Given HTML content from a verification page, extracts the question
    text, fuzzy-matches it against the answer bank, and returns a dict
    representing the selected answer (or None if not solvable).
    """

    def __init__(self, bank_path: Optional[str] = None):
        if bank_path:
            self.bank = self._load_bank(bank_path)
        else:
            self.bank = DEFAULT_BANK.copy()

    def _load_bank(self, path: str) -> dict:
        p = Path(path)
        if not p.exists():
            return DEFAULT_BANK.copy()
        with open(p) as f:
            return json.load(f)

    def solve(self, page_html: str) -> Optional[dict]:
        """Extract question from page HTML and return answer dict, or None."""
        # Try to find the question text — common patterns in verification pages
        question_match = re.search(
            r'>([^<]{5,100}?(?:岁|年龄|驾驶证|机动车|驾驶人|高速公路|考试|换证|审验|注销|舞弊|牵引|逃逸|准驾|贿赂|责任|轻伤|亡|倒车|人行横道|审验|注销|牵引)[^<]{0,50})<',
            page_html,
        )
        if not question_match:
            return None

        question = question_match.group(1).strip()
        answer = self._find_answer(question)
        if answer is None:
            return None

        return {"question": question, "answer": answer, "solved": True}

    def _find_answer(self, question: str) -> Optional[str]:
        """Fuzzy-match question against the answer bank."""
        for key, value in self.bank.items():
            if key in question or question in key:
                return value
        # Partial match — check if key chars appear in question
        for key, value in self.bank.items():
            if len(key) >= 4 and key[:4] in question:
                return value
        return None


def solve_age_verification(page_html: str, bank_path: Optional[str] = None) -> Optional[dict]:
    """Convenience function."""
    solver = AgeVerificationSolver(bank_path)
    return solver.solve(page_html)
