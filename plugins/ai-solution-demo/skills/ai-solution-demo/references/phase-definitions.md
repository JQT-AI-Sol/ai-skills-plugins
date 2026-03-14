# Phase Definitions

各フェーズの詳細定義。

## Phase 0: 初期化

**目的**: プロジェクトディレクトリとワークフロー状態ファイルの生成

**手順**:
1. `scripts/init-project.sh <project-name>` を実行
2. WORKFLOW.mdを生成・初期化
3. memo.mdの有無を確認

**成果物**:
- `<project>/WORKFLOW.md`
- ディレクトリ構造一式

**完了条件**: ディレクトリ構造が存在し、WORKFLOW.mdが初期化されている

---

## Phase 1: 要件定義

**目的**: ヒアリングメモから要件定義書を作成

**入力**: `docs/memo.md`

**手順**:
1. memo.mdを読み込み、顧客の課題・要望を整理
2. `brainstorming` スキルで要件のブレスト（ユーザーと対話）
3. `doc-coauthoring` スキルで requirement.md を共同作成
4. 要件IDを `F-001`, `F-002`, ... で採番

**成果物**:
- `docs/requirement.md`

**テンプレート**: [document-templates.md](document-templates.md) の要件定義テンプレートを使用

**完了条件**:
- 全ヒアリング項目が要件としてカバーされている
- 各要件にユニークIDが振られている
- 優先度（Must/Should/Could）が設定されている

---

## Phase 2: 設計

**目的**: 要件定義に基づく技術設計

**入力**: `docs/requirement.md`

**手順**:
1. requirement.mdの要件を技術的に分解
2. `doc-coauthoring` スキルで設計ドキュメントを共同作成
3. DB設計はSupabaseベストプラクティスを参照
4. API設計はRESTful原則に準拠
5. 設計IDを `S-001`, `S-002`, ... で採番し、要件IDと紐付け

**成果物**:
- `design/screen-design.md` — 画面設計（画面一覧、遷移図）
- `design/db-schema.md` — DB設計（テーブル定義、ER図記述）
- `design/api-design.md` — API設計（エンドポイント一覧、リクエスト/レスポンス）

**完了条件**:
- 全要件(F-xx)に対応する設計項目(S-xx)が存在する
- DB設計にテーブル定義とリレーションが記載されている
- API設計にエンドポイント・メソッド・パラメータが記載されている

---

## Phase 3: 整合性レビュー

**目的**: Phase 1-2の成果物間の整合性を検証するゲートフェーズ

**入力**: `docs/memo.md`, `docs/requirement.md`, `design/*.md`

**手順**:
1. `scripts/consistency-check.py` で自動チェックを実行
2. [consistency-review-checklist.md](consistency-review-checklist.md) に基づきAIレビュー
3. 結果をレポートにまとめる
4. 重大な問題 → Phase 1/2への差し戻し提案
5. 軽微な問題 → 修正後に続行

**成果物**:
- `docs/reviews/review-report.md`

**完了条件**:
- 自動チェックが全項目PASSまたは許容範囲内
- AIレビューで重大な矛盾がない
- トレーサビリティマトリクス(F-xx→S-xx)が完成している

---

## Phase 4: UI/UX設計

**目的**: 画面設計に基づくワイヤーフレームとデザインシステムの作成

**入力**: `design/screen-design.md`, `docs/requirement.md`

**手順**:
1. `wireframe-prototyping` スキルで画面ごとのワイヤーフレームを作成
2. `ui-ux-pro-max` スキルでデザインシステム（カラー・フォント・コンポーネント）を定義
3. ユーザーにワイヤーフレームを提示しフィードバック収集
4. アクション可能IDを `A-001`, `A-002`, ... で採番し、設計IDと紐付け

**成果物**:
- `wireframes/` — 各画面のワイヤーフレーム（HTML/画像）
- `design/design-system.md` — デザインシステム定義

**完了条件**:
- 全画面のワイヤーフレームが作成されている
- デザインシステムが定義されている
- ユーザーの承認を得ている

---

## Phase 5: 実装

**目的**: Next.js + Supabaseでデモアプリを構築

**入力**: `design/*.md`, `wireframes/`, `docs/requirement.md`

**手順**:
1. `feature-dev` スキルでNext.jsプロジェクトを初期化
2. `frontend-design` スキルでUIコンポーネントを実装
3. Supabaseプロジェクトのセットアップ（DB, Auth, Storage）
4. API Routes / Server Actionsの実装
5. 画面ごとに実装・動作確認

**成果物**:
- `src/` — Next.jsアプリケーションコード
- Supabaseプロジェクト設定

**完了条件**:
- 全画面が実装されている
- DB接続・CRUD操作が動作する
- devサーバーでエラーなく動作する

---

## Phase 6: テスト+レビュー

**目的**: E2Eテストとコードレビュー

**入力**: `src/`, `design/*.md`

**手順**:
1. `pom-generator` スキルでPage Object Modelを生成
2. `e2e-testing` スキルでE2Eテストを作成・実行
3. コードレビュー（品質・セキュリティ・パフォーマンス）
4. テスト結果とレビュー結果をまとめる

**成果物**:
- `tests/` — E2Eテストコード
- `docs/reviews/code-review.md` — コードレビュー結果

**完了条件**:
- 主要フローのE2Eテストが全PASS
- 重大なコード品質問題がない
- セキュリティ脆弱性がない

---

## Phase 7: デモ動画

**目的**: デモ用動画の録画

**入力**: 動作するアプリケーション

**手順**:
1. デモシナリオを定義（主要フローを網羅）
2. `demo-recorder` スキルでPlaywright録画を実行
3. キャプション付きMP4を生成

**成果物**:
- `demo/*.mp4` — デモ動画

**完了条件**:
- 主要フローが動画でカバーされている
- キャプションが適切に表示されている

**ヒアリング観点**: Phase 5-7完了後が「デモ提示時ヒアリング」の実施タイミング。`/ai-solution-demo hearing` でチェックリストを生成可能。

---

## Phase 8: マニュアル

**目的**: 操作マニュアルPDFの生成

**入力**: 動作するアプリケーション, `design/screen-design.md`

**手順**:
1. `manual-generator` スキルでスクリーンショット撮影+手順書作成
2. PDF出力

**成果物**:
- `docs/manual.pdf` — 操作マニュアル

**完了条件**:
- 全画面の操作手順が記載されている
- スクリーンショットが含まれている

---

## Phase 9: 提案書

**目的**: JQIT提案書PPTXの生成

**入力**: `docs/requirement.md`, `design/*.md`, `demo/*.mp4`

**手順**:
1. `jqit-proposal` スキルで提案書PPTXを生成
2. 要件・設計・デモ結果を反映
3. ユーザーにレビューを依頼

**成果物**:
- `proposal/*.pptx` — 提案書

**完了条件**:
- 提案書が生成されている
- 要件・設計内容が正しく反映されている

**ヒアリング観点**: Phase 9完了後が「提案書提出時ヒアリング」の実施タイミング。技術要件・運用保守の詳細確認を含む全カテゴリのチェックリストを生成可能。
