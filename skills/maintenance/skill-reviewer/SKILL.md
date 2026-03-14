---
name: skill-reviewer
description: >
  Claude Code Skillsの品質レビュー・監査スキル。
  Anthropic公式ガイド基準でdescription品質、SKILL.md構造、セキュリティ、スキル競合を診断し、
  具体的な修正案を提示する。
  以下の場合に使用：
  (1) 「スキルをレビューして」「スキルの品質チェック」
  (2) 「descriptionを改善したい」「スキルが発火しない」
  (3) 「スキル競合を調べて」「どのスキルが使われるか分からない」
  (4) 「全スキルを監査して」「スキルの一括診断」
  (5) /skill-reviewer コマンドが呼ばれた場合
  スキルの新規作成にはdocument-skills:skill-creatorを使うこと。
  コードレビュー（review-frontend等）とは異なる。
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Skill Reviewer

Anthropic公式ガイド基準でスキルを診断し、改善案を提示する。

## レビューモード

### モード1: 単体レビュー（デフォルト）

指定されたスキルのSKILL.mdを読み込み、[references/checklist.md](references/checklist.md) の全項目でチェックする。

**手順:**

1. 対象スキルのSKILL.mdを読み込む
2. チェックリストの6カテゴリ（Description、本体品質、セキュリティ、構造、競合、メタデータ）を順にチェック
3. 結果を重大度別に出力
4. CRITICAL/WARNINGの項目には具体的な修正案を提示

### モード2: 一括監査

`~/.claude/skills/` 配下の全スキルを対象に、主要項目を一括チェックする。

**手順:**

1. 全スキルのSKILL.mdからfrontmatterを抽出

```bash
for f in ~/.claude/skills/*/SKILL.md; do
  echo "=== $(basename $(dirname $f)) ==="
  sed -n '/^---$/,/^---$/p' "$f"
  wc -l < "$f"
done
```

2. 以下を一括チェック:
   - description に [何をするか] があるか（D1）
   - description にトリガーフレーズがあるか（D2）
   - ネガティブトリガーがあるか（D5）
   - SKILL.md の行数（500行超を検出）（B1）
   - frontmatterにXML角括弧がないか（S1）
   - nameに"claude"/"anthropic"がないか（S2）
3. 競合検出: descriptionのトリガーフレーズが重複するスキルペアを特定
4. サマリーテーブルで結果を出力

### モード3: 競合検出

全スキルのdescriptionからトリガーフレーズを抽出し、同じユーザー入力で複数スキルが発火する可能性を分析する。

**手順:**

1. 全descriptionを読み込む
2. トリガーフレーズの類似度を比較（完全一致 + 意味的重複）
3. 競合ペアを列挙し、ネガティブトリガーの有無を確認
4. 解消案（ネガティブトリガー追加、統合、非推奨化）を提示

## 出力フォーマット

### 単体レビュー

```markdown
## Skill Review: <スキル名>

### サマリー
| カテゴリ | CRITICAL | WARNING | INFO | PASS |
|---------|:--------:|:-------:|:----:|:----:|
| Description | 0 | 1 | 0 | 3 |
| 本体品質    | 0 | 0 | 1 | 5 |
| セキュリティ | 0 | 0 | 0 | 3 |
| 構造        | 0 | 1 | 0 | 2 |
| 競合        | 0 | 0 | 0 | 3 |
| メタデータ  | 0 | 0 | 1 | 3 |

### CRITICAL（即座に修正）
（なし or 項目リスト）

### WARNING（修正推奨）
- **[D5] ネガティブトリガーなし**: <競合スキル名>と競合の可能性。
  修正案: description末尾に「〇〇の場合は△△を使うこと」を追加

### INFO（改善の余地あり）
- **[B5] エラーハンドリング未記載**: Common Issuesセクションの追加を推奨
```

### 一括監査

```markdown
## Skills Audit Report

### 概要
| 指標 | 値 |
|------|-----|
| 総スキル数 | XX個 |
| CRITICAL問題 | XX個 |
| WARNING問題 | XX個 |

### 問題スキル一覧
| スキル名 | CRITICAL | WARNING | 主な問題 |
|---------|:--------:|:-------:|---------|
| xxx | 1 | 2 | D1: 曖昧なdescription |
```

## チェックリスト詳細

全チェック項目の詳細・Good/Bad例は [references/checklist.md](references/checklist.md) を参照。
レビュー実行前に必ず読み込むこと。
