from bs4 import BeautifulSoup
from seek.src.nodes.base import NodeBase, NodeExecutionContext


class HtmlParseNode(NodeBase):
    node_type = "HTML解析"

    def execute(self) -> bool:
        html = self.ctx.get("最近响应内容", "")
        if not html:
            return False

        soup = BeautifulSoup(html, "lxml")
        selectors = self.config.get("selectors", [])

        extracted = {}
        for sel in selectors:
            field_name = sel.get("field", sel.get("selector"))
            elements = soup.select(sel["selector"])
            if sel.get("multiple", False):
                extracted[field_name] = [el.get_text(strip=True) for el in elements]
            else:
                extracted[field_name] = elements[0].get_text(strip=True) if elements else None

        if self.config.get("table_mode", False):
            table_selector = self.config.get("table_selector", "table")
            table = soup.select_one(table_selector)
            if table:
                rows = table.select("tr")
                headers = [th.get_text(strip=True) for th in rows[0].select("th")] if rows else []
                table_data = []
                for row in rows[1:]:
                    cells = [td.get_text(strip=True) for td in row.select("td")]
                    if len(cells) == len(headers):
                        table_data.append(dict(zip(headers, cells)))
                self.ctx.set("表格数据", table_data)
                return True

        self.ctx.set("提取结果", extracted)
        return True
