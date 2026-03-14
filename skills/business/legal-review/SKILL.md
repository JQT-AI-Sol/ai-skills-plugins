---
name: legal-review
description: |
  日本語の業務委託契約書・NDA等のリーガルチェックを実施し、リスク判定と修正案を提示するスキル。
  docx赤入れ（tracked changes）の生成にも対応。JQITが甲にも乙にもなりうる双方向の観点でレビューする。
  以下の場合に使用：
  (1) 「契約書をレビューして」「リーガルチェック」「法務チェック」
  (2) 「契約書の赤入れを作って」「tracked changesで修正」
  (3) 「NDAをチェック」「機密保持契約書のレビュー」
  (4) 「業務委託契約書の問題点を洗い出して」
  (5) 「著作権の帰属を見直したい」「IP条項のチェック」
  document-skills:docxスキルが必要（赤入れ生成時）。
---

# リーガルチェック

業務委託契約書・NDA等の日本語契約書をレビューし、リスク判定（GREEN/YELLOW/RED）と修正案を提示する。

## ワークフロー

### Phase 1: 契約書読み込み

1. pandocで全文markdown化: `pandoc contract.docx -o contract.md`
2. 全文を読み、契約構造を把握（当事者、契約類型、条項構成）
3. JQITがどちらの当事者か確認（甲 or 乙、不明なら確認）

### Phase 2: チェックリストレビュー

[references/checklist.md](references/checklist.md) を読み込み、全カテゴリ（A〜I）を順にチェック。
各項目を GREEN / YELLOW / RED で判定する。

**判定基準:**
- **GREEN**: 問題なし、または業界標準的な条項
- **YELLOW**: 改善の余地あり、リスクは中程度
- **RED**: 重大なリスク、修正必須

### Phase 3: 結果レポート

以下のフォーマットで結果を提示:

```
## リーガルチェック結果: [契約書名]

### サマリー
| カテゴリ | GREEN | YELLOW | RED |
|---------|:-----:|:------:|:---:|

### RED（修正必須）
- **[ID] 項目名**: 問題の説明
  修正案: 具体的な条文案

### YELLOW（改善推奨）
- **[ID] 項目名**: 問題の説明
  推奨: 改善の方向性
```

### Phase 4: 赤入れ生成（依頼された場合）

ユーザーが赤入れ（tracked changes付きdocx）を依頼した場合:

1. [references/recommended-clauses.md](references/recommended-clauses.md) から該当する推奨条項テンプレートを参照
2. [references/docx-redlining.md](references/docx-redlining.md) の技術ガイドに従い、document-skills:docxスキルでdocxを編集
3. 変更はbottom-to-topで適用（line numberずれ防止）
4. pandoc --track-changes=all で最終検証

## レビューの重点ポイント

### JQITが乙（受託者）の場合に特に注意

- **IP条項**: 著作権が甲に全帰属だとJQITの資産が失われる。乙帰属+甲ライセンスを推奨
- **損害賠償**: 上限なしは致命的。委託料総額を上限とする
- **契約不適合**: 甲修正後の免責範囲が広すぎないか
- **検査期間**: 短すぎるとJQITが甲の場合に不利
- **残留知識**: 開発で得た一般知識の再利用が制限されないか

### 請負/準委任の対応

基本契約が請負のみ対応の場合、準委任対応の追加を提案:
- 第4条に契約類型の選択を追加
- 第5条・第6条・第8条に「請負型に適用」の注記
- 第9条を請負/準委任の二本立て支払に
- 準委任型の業務規定（善管注意義務、月次報告、任意解約権）を新設

## リソース

- [references/checklist.md](references/checklist.md) — チェック項目一覧（カテゴリA〜I）
- [references/recommended-clauses.md](references/recommended-clauses.md) — 推奨条項テンプレート
- [references/docx-redlining.md](references/docx-redlining.md) — docx赤入れ技術ガイド
