#!/usr/bin/env python3
"""
consistency-check.py — 要件定義・設計ドキュメントの整合性チェック

Usage:
    python3 consistency-check.py <project-dir>

チェック内容:
    1. キーワード抽出・カバレッジ確認 (memo → requirement)
    2. 要件→設計の対応確認 (requirement → design)
    3. F-xx → S-xx トレーサビリティ
    4. 数値照合（予算、人数、期限）
    5. Markdownレポート出力
"""

import sys
import re
import os
from pathlib import Path
from datetime import datetime
from collections import defaultdict


def read_file(path: Path) -> str:
    """ファイルを読み込む。存在しない場合は空文字を返す。"""
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""


def extract_ids(text: str, prefix: str) -> list[str]:
    """F-001, S-001 などのIDを抽出する（1桁以上の数字に対応）。"""
    pattern = rf"{prefix}-(\d+)"
    return sorted(set(re.findall(pattern, text)), key=lambda x: int(x))


def extract_numbers(text: str) -> list[str]:
    """数値表現を抽出する（金額、人数、日付など）。"""
    patterns = [
        r"\d{1,3}(?:,\d{3})+円",  # 金額（カンマ区切り）
        r"\d+万円",  # 金額（万円）
        r"\d+億円",  # 金額（億円）
        r"\d+名",  # 人数
        r"\d+人",  # 人数
        r"\d+台",  # 台数
        r"\d{4}[/-]\d{1,2}[/-]\d{1,2}",  # 日付
        r"\d{4}年\d{1,2}月\d{1,2}日",  # 日付（日本語）
        r"\d{4}年\d{1,2}月",  # 年月
    ]
    results = []
    for p in patterns:
        results.extend(re.findall(p, text))
    return results


def extract_keywords(text: str, min_length: int = 2) -> set[str]:
    """日本語キーワードを抽出する（簡易的な名詞抽出）。"""
    # カタカナ語
    katakana = set(re.findall(r"[ァ-ヶー]{2,}", text))
    # 英単語（3文字以上）
    english = set(w.lower() for w in re.findall(r"[A-Za-z]{3,}", text))
    # Markdownヘッダーのテキスト
    headers = set(re.findall(r"^#+\s+(.+)$", text, re.MULTILINE))
    # 除外ワード
    stopwords = {
        "the", "and", "for", "that", "this", "with", "from", "are", "was",
        "not", "but", "have", "has", "had", "will", "would", "can", "could",
        "markdown", "json", "http", "https", "api", "url", "html", "css",
    }
    english -= stopwords
    return katakana | english | headers


def check_memo_to_requirement(memo: str, requirement: str) -> dict:
    """Category 1: memo → requirement のカバレッジ確認。"""
    memo_keywords = extract_keywords(memo)
    req_keywords = extract_keywords(requirement)

    covered = memo_keywords & req_keywords
    uncovered = memo_keywords - req_keywords

    # 短すぎるキーワードや一般的すぎるものを除外
    uncovered = {k for k in uncovered if len(k) >= 3}

    total = len(memo_keywords) if memo_keywords else 1
    coverage = len(covered) / total * 100

    return {
        "coverage": round(coverage, 1),
        "covered_count": len(covered),
        "total_count": len(memo_keywords),
        "uncovered_keywords": sorted(uncovered)[:20],  # 上位20件
        "pass": coverage >= 70,
    }


def check_requirement_to_design(requirement: str, designs: dict[str, str]) -> dict:
    """Category 2: requirement → design のカバレッジ確認。"""
    req_ids = extract_ids(requirement, "F")
    all_design_text = "\n".join(designs.values())
    design_req_refs = extract_ids(all_design_text, "F")

    covered = set(req_ids) & set(design_req_refs)
    uncovered = set(req_ids) - set(design_req_refs)

    total = len(req_ids) if req_ids else 1
    coverage = len(covered) / total * 100

    return {
        "coverage": round(coverage, 1),
        "covered_ids": sorted(covered),
        "uncovered_ids": sorted(uncovered),
        "total_requirements": len(req_ids),
        "pass": coverage >= 80,
    }


def check_traceability(requirement: str, designs: dict[str, str]) -> dict:
    """Category 3: F-xx → S-xx トレーサビリティ。"""
    req_ids = extract_ids(requirement, "F")
    all_design_text = "\n".join(designs.values())
    design_ids = extract_ids(all_design_text, "S")

    # S-xx から F-xx への参照をチェック
    trace_map = {}
    for f_id in req_ids:
        related_s = []
        for s_id in design_ids:
            # S-xxの周辺にF-xxが記載されているか簡易チェック
            pattern = rf"S-{s_id}.*?F-{f_id}|F-{f_id}.*?S-{s_id}"
            if re.search(pattern, all_design_text, re.DOTALL):
                related_s.append(f"S-{s_id}")
        trace_map[f"F-{f_id}"] = related_s

    orphan_designs = []
    for s_id in design_ids:
        found = False
        for f_id in req_ids:
            pattern = rf"S-{s_id}.*?F-{f_id}|F-{f_id}.*?S-{s_id}"
            if re.search(pattern, all_design_text, re.DOTALL):
                found = True
                break
        if not found:
            orphan_designs.append(f"S-{s_id}")

    traced = sum(1 for v in trace_map.values() if v)
    total = len(req_ids) if req_ids else 1

    return {
        "trace_map": trace_map,
        "orphan_designs": orphan_designs,
        "traced_count": traced,
        "total_count": len(req_ids),
        "coverage": round(traced / total * 100, 1),
        "pass": traced / total >= 0.7,
    }


def check_number_consistency(memo: str, requirement: str, designs: dict[str, str]) -> dict:
    """Category 4: 数値の一貫性チェック。"""
    memo_numbers = extract_numbers(memo)
    req_numbers = extract_numbers(requirement)
    design_numbers = extract_numbers("\n".join(designs.values()))

    # memo にあって requirement にない数値
    memo_only = [n for n in memo_numbers if n not in req_numbers]
    # requirement にあって design にない数値
    req_only = [n for n in req_numbers if n not in design_numbers]

    issues = []
    if memo_only:
        issues.append(f"memo.mdにあるがrequirement.mdにない数値: {', '.join(memo_only)}")
    if req_only:
        issues.append(f"requirement.mdにあるがdesign/*.mdにない数値: {', '.join(req_only)}")

    return {
        "memo_numbers": memo_numbers,
        "requirement_numbers": req_numbers,
        "design_numbers": design_numbers,
        "issues": issues,
        "pass": True,  # 数値チェックは参考情報（AIレビューで最終判断）
        "warnings": issues,
    }


def generate_report(project_dir: Path, results: dict) -> str:
    """Markdownレポートを生成する。"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    fail_count = sum(1 for r in results.values() if not r["pass"])
    if fail_count == 0:
        judgment = "PASS"
    elif fail_count <= 1:
        judgment = "CONDITIONAL PASS"
    else:
        judgment = "FAIL"

    report = f"""# 整合性レビューレポート（自動チェック）

**実行日時**: {now}
**対象ディレクトリ**: {project_dir}
**判定**: {judgment}

## サマリー

| カテゴリ | 結果 | 詳細 |
|---------|------|------|
| 1. 網羅性(memo→req) | {"PASS" if results["memo_to_req"]["pass"] else "FAIL"} | カバレッジ {results["memo_to_req"]["coverage"]}% |
| 2. 網羅性(req→design) | {"PASS" if results["req_to_design"]["pass"] else "FAIL"} | カバレッジ {results["req_to_design"]["coverage"]}% |
| 3. トレーサビリティ | {"PASS" if results["traceability"]["pass"] else "FAIL"} | {results["traceability"]["traced_count"]}/{results["traceability"]["total_count"]} traced |
| 4. 数値一貫性 | {"PASS" if not results["numbers"]["issues"] else "WARN"} | {len(results["numbers"]["issues"])} issues |

## 詳細

### Category 1: 網羅性（memo → requirement）

- **カバレッジ**: {results["memo_to_req"]["coverage"]}% ({results["memo_to_req"]["covered_count"]}/{results["memo_to_req"]["total_count"]})
"""

    if results["memo_to_req"]["uncovered_keywords"]:
        report += "- **未カバーキーワード**:\n"
        for kw in results["memo_to_req"]["uncovered_keywords"]:
            report += f"  - {kw}\n"

    report += f"""
### Category 2: 網羅性（requirement → design）

- **カバレッジ**: {results["req_to_design"]["coverage"]}% ({len(results["req_to_design"]["covered_ids"])}/{results["req_to_design"]["total_requirements"]})
"""

    if results["req_to_design"]["uncovered_ids"]:
        report += "- **設計漏れの要件**:\n"
        for fid in results["req_to_design"]["uncovered_ids"]:
            report += f"  - F-{fid}\n"

    report += f"""
### Category 3: トレーサビリティ

- **トレース済み**: {results["traceability"]["traced_count"]}/{results["traceability"]["total_count"]}
"""

    if results["traceability"]["trace_map"]:
        report += "\n| 要件ID | 設計ID |\n|--------|--------|\n"
        for f_id, s_ids in results["traceability"]["trace_map"].items():
            s_str = ", ".join(s_ids) if s_ids else "(未対応)"
            report += f"| {f_id} | {s_str} |\n"

    if results["traceability"]["orphan_designs"]:
        report += "\n- **孤立設計**: " + ", ".join(results["traceability"]["orphan_designs"]) + "\n"

    report += """
### Category 4: 数値一貫性
"""

    if results["numbers"]["issues"]:
        for issue in results["numbers"]["issues"]:
            report += f"- **問題**: {issue}\n"
    else:
        report += "- 問題なし\n"

    all_pass = all(r["pass"] for r in results.values())

    report += f"""
## 推奨アクション

"""
    if all_pass:
        report += "全チェック項目がPASSです。Phase 4以降に進行可能です。\n"
    else:
        report += "以下の項目を確認・修正してください:\n\n"
        if not results["memo_to_req"]["pass"]:
            report += "1. memo.mdの未カバー項目をrequirement.mdに追加するか、スコープ外として明記する\n"
        if not results["req_to_design"]["pass"]:
            report += "2. 設計漏れの要件(F-xx)に対応する設計(S-xx)をdesign/*.mdに追加する\n"
        if not results["traceability"]["pass"]:
            report += "3. トレーサビリティを改善する（F-xxとS-xxの対応を明記する）\n"
        if results["numbers"]["issues"]:
            report += "4. 数値の不一致を確認する（参考情報 — スコープ外の場合は無視可）\n"

    return report


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 consistency-check.py <project-dir>")
        sys.exit(1)

    project_dir = Path(sys.argv[1])

    if not project_dir.exists():
        print(f"Error: ディレクトリ {project_dir} が存在しません。")
        sys.exit(1)

    # ファイル読み込み
    memo = read_file(project_dir / "docs" / "memo.md")
    requirement = read_file(project_dir / "docs" / "requirement.md")

    designs = {}
    design_dir = project_dir / "design"
    if design_dir.exists():
        for md_file in design_dir.glob("*.md"):
            designs[md_file.name] = read_file(md_file)

    # ファイル存在チェック
    missing = []
    if not memo:
        missing.append("docs/memo.md")
    if not requirement:
        missing.append("docs/requirement.md")
    if not designs:
        missing.append("design/*.md")

    if missing:
        print(f"Warning: 以下のファイルが見つかりません: {', '.join(missing)}")
        if not requirement:
            print("Error: requirement.md は必須です。Phase 1を先に完了してください。")
            sys.exit(1)

    # チェック実行
    results = {
        "memo_to_req": check_memo_to_requirement(memo, requirement),
        "req_to_design": check_requirement_to_design(requirement, designs),
        "traceability": check_traceability(requirement, designs),
        "numbers": check_number_consistency(memo, requirement, designs),
    }

    # レポート生成
    report = generate_report(project_dir, results)

    # レポート出力
    reviews_dir = project_dir / "docs" / "reviews"
    reviews_dir.mkdir(parents=True, exist_ok=True)
    report_path = reviews_dir / "review-report.md"
    report_path.write_text(report, encoding="utf-8")

    print(report)
    print(f"\nレポートを保存しました: {report_path}")

    # 終了コード
    all_pass = all(r["pass"] for r in results.values())
    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
