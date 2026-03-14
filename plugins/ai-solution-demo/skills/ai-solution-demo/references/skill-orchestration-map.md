# Skill Orchestration Map

各フェーズでの具体的なスキル呼び出しパターン。

## Phase 0: 初期化

```
1. [Bash] scripts/init-project.sh <project-name>
2. [Write] WORKFLOW.md ← assets/workflow-state-template.md
3. [Read] docs/memo.md の存在確認
```

スキル依存: `dev-session`（セッション管理として任意）

---

## Phase 1: 要件定義

```
1. [Read] docs/memo.md
2. [Skill] /brainstorming
   - 入力: memo.mdの内容
   - 目的: 要件の洗い出し、優先度付け
   - ユーザーとの対話で要件を精緻化
3. [Skill] /doc-coauthoring
   - テンプレート: document-templates.md の requirement.md テンプレート
   - 入力: brainstormingの結果 + memo.md
   - 出力: docs/requirement.md
4. [Write] docs/requirement.md
5. [Edit] WORKFLOW.md → Phase 1: completed
```

**ポイント**:
- brainstormingでは「何を作るか」だけでなく「何を作らないか」も明確にする
- 要件IDは `F-001` から連番
- 優先度はMust/Should/Couldの3段階

---

## Phase 2: 設計

```
1. [Read] docs/requirement.md
2. [Skill] /doc-coauthoring
   - テンプレート: document-templates.md の各設計テンプレート
   - 入力: requirement.md
   - 出力:
     a. design/screen-design.md（画面設計）
     b. design/db-schema.md（DB設計）
     c. design/api-design.md（API設計）
3. [参照] supabase-postgres-best-practices（DB設計時）
4. [参照] vercel-react-best-practices（画面設計時）
5. [Write] design/*.md
6. [Edit] WORKFLOW.md → Phase 2: completed
```

**ポイント**:
- 設計IDは `S-001` から連番、各S-xxにF-xxを紐付け
- DB設計ではRLSポリシーも含める
- API設計ではNext.js App Router / Server Actions前提

---

## Phase 3: 整合性レビュー

```
1. [Bash] python3 scripts/consistency-check.py <project-dir>
   - 自動チェック結果を取得
2. [Read] docs/memo.md, docs/requirement.md, design/*.md
3. [AIレビュー] consistency-review-checklist.md に基づく5カテゴリレビュー
4. [Write] docs/reviews/review-report.md
5. 判定:
   - PASS → Phase 4へ進行
   - CONDITIONAL PASS → 軽微な修正後に進行
   - FAIL → Phase 1/2への差し戻し
6. [Edit] WORKFLOW.md:
   - Phase 3は常に `completed` に更新（レビュー自体は完了）
   - FAIL時: 問題のあるPhase 1/2を `needs_revision` に更新
   - `最終更新` フィールドを現在日付に更新
```

**ポイント**:
- 自動チェックとAIレビューの両方を実施
- FAILの場合、具体的な修正箇所と提案を提示

---

## Phase 4: UI/UX設計

```
1. [Read] design/screen-design.md, docs/requirement.md
2. [Skill] /wireframe-prototyping
   - 入力: screen-design.mdの画面一覧
   - 出力: wireframes/ 配下にHTMLワイヤーフレーム
3. [Skill] /ui-ux-pro-max
   - 入力: 要件のテイスト・業種情報
   - 出力: design/design-system.md（カラー、フォント、コンポーネント）
4. ユーザーレビュー → フィードバック反映
5. アクションID `A-001` から採番、S-xxと紐付け
6. [Edit] WORKFLOW.md → Phase 4: completed
```

---

## Phase 5: 実装

```
1. [Read] design/*.md, wireframes/, docs/requirement.md
2. [Skill] /feature-dev
   - Next.jsプロジェクト初期化（App Router）
   - Supabaseクライアント設定
   - 画面ごとのページ/コンポーネント実装
3. [Skill] /frontend-design
   - デザインシステムに基づくUI実装
   - レスポンシブ対応
4. [参照] vercel-react-best-practices
5. [参照] supabase-postgres-best-practices
6. Supabase設定:
   - テーブル作成（db-schema.md準拠）
   - RLSポリシー設定
   - Auth設定
7. [Edit] WORKFLOW.md → Phase 5: completed
```

**ポイント**:
- 画面単位で実装→動作確認のサイクルを回す
- デモ用途なので完全な本番品質は不要、動作するMVPを目指す

---

## Phase 6: テスト+レビュー

```
1. [Skill] /pom-generator
   - 入力: src/のページコンポーネント + ブラウザスナップショット
   - 出力: tests/pom/ 配下にPage Object Model
2. [Skill] /e2e-testing
   - 入力: POM + 要件の受入条件
   - 出力: tests/e2e/ 配下にテストファイル
   - テスト実行・結果確認
3. コードレビュー（AIベース）
   - セキュリティ、パフォーマンス、コード品質
   - 出力: docs/reviews/code-review.md
4. [Edit] WORKFLOW.md → Phase 6: completed
```

---

## Phase 7: デモ動画

```
1. デモシナリオ定義
   - 主要ユースケースを時系列で整理
   - キャプションテキストを準備
2. [Skill] /demo-recorder
   - 入力: デモシナリオ + devサーバーURL
   - 出力: demo/*.mp4
3. [Edit] WORKFLOW.md → Phase 7: completed
```

---

## Phase 8: マニュアル

```
1. [Skill] /manual-generator
   - 入力: 動作するアプリ + design/screen-design.md
   - 出力: docs/manual.pdf
2. [Edit] WORKFLOW.md → Phase 8: completed
```

---

## Phase 9: 提案書

```
1. [Read] docs/requirement.md, design/*.md
2. [Skill] /jqit-proposal
   - 入力: 要件概要、設計概要、デモ動画パス
   - 出力: proposal/*.pptx
3. [Edit] WORKFLOW.md → Phase 9: completed
```
