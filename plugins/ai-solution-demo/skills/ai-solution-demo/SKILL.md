---
name: ai-solution-demo
description: >
  顧客DX案件のAIソリューションデモを一気通貫で構築するワークフロースキル。
  ヒアリングメモ(memo.md)から要件定義→設計→UI/UX→実装→テスト→デモ動画→提案書まで、
  フェーズゲート付きで再現可能に実行する。
  以下の場合に使用：
  (1) 顧客向けAIソリューションのデモを作りたい
  (2) DX案件の提案準備を一括で進めたい
  (3)「ソリューションデモ」「AI提案」「デモ構築」と言われた場合
  (4) /ai-solution-demo コマンドが呼ばれた場合
compatibility: claude-code-only
---

# AI Solution Demo

顧客DX案件のAIソリューションデモを、フェーズゲート付きワークフローで一気通貫構築する。

## Commands

| コマンド | 説明 |
|---------|------|
| `/ai-solution-demo start <project-name>` | 新規プロジェクト初期化 |
| `/ai-solution-demo status` | 現在の進捗表示（WORKFLOW.md参照） |
| `/ai-solution-demo phase <N>` | 指定フェーズを実行 |
| `/ai-solution-demo review` | 整合性レビュー実行（Phase 3） |
| `/ai-solution-demo skip <N>` | 指定フェーズをスキップ |
| `/ai-solution-demo hearing [phase]` | ヒアリングチェックリスト生成 |

## Phase Overview

| Phase | Name | 成果物 | 依存スキル |
|-------|------|--------|-----------|
| 0 | 初期化 | WORKFLOW.md, ディレクトリ | dev-session |
| 1 | 要件定義 | docs/01-requirements/requirements.md | brainstorming, doc-coauthoring |
| 2 | 設計 | docs/02-design/{design,db-schema,api-reference,screen-flow}.md | doc-coauthoring |
| 3 | 整合性レビュー | review-report.md | scripts/consistency-check.py |
| 4 | UI/UX設計 | ワイヤーフレーム, デザインシステム | wireframe-prototyping, ui-ux-pro-max |
| 5 | 実装 | Next.js + Supabaseアプリ, implementation-plan.md | feature-dev, frontend-design, subagent-driven |
| 6 | テスト+レビュー | テストコード, レビュー結果 | tdd, pom-generator, code-review |
| 7 | デモ動画 | MP4 | demo-recorder |
| 8 | マニュアル | PDF | manual-generator |
| 9 | 提案書 | PPTX | jqit-proposal |

詳細は [references/phase-definitions.md](references/phase-definitions.md) を参照。

## Workflow

### Command: `start <project-name>`

1. `scripts/init-project.sh <project-name>` を実行してディレクトリ構造を生成
2. `assets/workflow-state-template.md` を `<project>/WORKFLOW.md` にコピー
3. WORKFLOW.mdのプロジェクト名・開始日を記入
4. `docs/memo.md` の有無を確認
   - あれば「memo.mdを検出しました。Phase 1に進みますか？」と確認
   - なければ「docs/memo.md にヒアリングメモを配置してください」と案内
5. Phase 0を `completed` に更新

### Command: `status`

1. WORKFLOW.mdを読み込み
2. 各フェーズの状態をテーブル表示
3. 次に実行すべきフェーズを提案

### Command: `phase <N>`

1. WORKFLOW.mdから現在の状態を読み込み
2. 前提フェーズが完了しているか確認（未完了なら警告）
3. 対象フェーズの実行パターンに従って処理（後述）
4. 成果物の生成を確認
5. WORKFLOW.mdの対象フェーズを `completed` に更新
6. 次フェーズの案内

### Command: `review`

`phase 3` のショートカット。整合性レビューを実行する。

### Command: `skip <N>`

1. 対象フェーズを `skipped` に更新
2. スキップ理由をユーザーに確認してWORKFLOW.mdに記録

### Command: `hearing [phase]`

ヒアリングチェックリストを生成する。営業・開発が顧客先で使用するプロジェクト固有のチェックリスト。

1. WORKFLOW.mdから完了済みフェーズを確認（`[phase]`指定時はそのフェーズ時点を想定）
2. [references/hearing-guide.md](references/hearing-guide.md) から現在フェーズに適した質問を選択:
   - Phase 5-7完了: デモ提示時の質問を中心に
   - Phase 9完了: 提案書提出時の質問も含めて全カテゴリ
3. プロジェクト固有の情報を埋め込み:
   - `docs/requirement.md` から要件一覧（F-xxx）を抽出し、各要件の確認質問を生成
   - `design/screen-design.md` から画面一覧を抽出
   - `design/api-design.md` からAPI一覧を抽出
   - 未完了フェーズの成果物は「次回確認予定」として記載
4. [assets/hearing-checklist-template.md](assets/hearing-checklist-template.md) をベースに `docs/hearing-checklist.md` を出力
5. ユーザーに出力先を案内（印刷・共有用途）

**出力例**: `docs/hearing-checklist.md`（マークダウン形式、チェックボックス付き）

## Design Approval Gate（設計承認ゲート）

> **ユーザーの承認なしに実装フェーズ（Phase 5以降）に進んではならない。**

Phase 1-4は設計フェーズ。以下のルールを適用する:

- Phase 1（要件定義）: brainstormingスキルで要件を精緻化する際、**一度に1つの質問**、**選択肢形式を優先**
- Phase 1完了時: 要件一覧をセクション単位で提示し、**セクションごとにユーザー承認**を得る
- Phase 3（整合性レビュー）: PASS/FAIL判定。FAILなら差し戻し。曖昧なまま先へ進めない
- Phase 4（UI/UX設計）: ワイヤーフレームをユーザーに提示し、承認後にのみPhase 5へ

### 「何を作らないか」を明確にする

brainstormingフェーズでは、要件に含めないものも明示的にリストアップする:
- スコープ外の機能一覧を `docs/requirement.md` に `## Out of Scope` セクションとして記録
- YAGNIを徹底: デモに必要ない機能は削る

---

## Phase Execution Pattern

各フェーズ共通の実行手順:

1. **準備**: 前フェーズの成果物を読み込み、コンテキストを把握
2. **スキル呼び出し**: [references/skill-orchestration-map.md](references/skill-orchestration-map.md) に従い依存スキルを実行
3. **成果物生成**: テンプレート（[references/document-templates.md](references/document-templates.md)）に沿って成果物を生成
4. **ユーザー確認**: 成果物をユーザーに提示し、フィードバックを反映
5. **状態更新**: WORKFLOW.mdを更新

## Consistency Review (Phase 3)

Phase 3は特別なゲートフェーズ。Phase 1-2の成果物を照合検証する。

1. `scripts/consistency-check.py` を実行（自動チェック）
2. [references/consistency-review-checklist.md](references/consistency-review-checklist.md) に基づきAIレビュー
3. 検出された問題を `docs/reviews/review-report.md` に出力
4. 重大な問題がある場合、Phase 1-2への差し戻しを提案
5. 問題なしまたは軽微なら、Phase 4以降への進行を承認

## State Management

状態は `<project>/WORKFLOW.md` で管理する。

### Status Values

| 値 | 意味 |
|----|------|
| `pending` | 未着手 |
| `in_progress` | 実行中 |
| `completed` | 完了 |
| `skipped` | スキップ済み |
| `needs_revision` | 要修正（レビューで差し戻し） |

### Update Rules

- フェーズ開始時に `in_progress` に更新
- 成果物完成・ユーザー確認後に `completed` に更新
- レビューで問題検出時: Phase 3自体は `completed` にし、問題のあるPhase 1/2を `needs_revision` に更新
- WORKFLOW.mdを更新する際は、必ず `最終更新` フィールドも現在日付に更新する

## Subagent-Driven Implementation（Phase 5: サブエージェント駆動開発）

Phase 5（実装）では、設計成果物をbite-sizedタスクに分割し、サブエージェントで並列実行する。

### Step 1: 実装計画の作成

設計成果物（`design/*.md`, `wireframes/`）から実装計画を作成し、`docs/implementation-plan.md` に保存する。

**タスク粒度のルール**:
- 1タスク = 2〜5分で完了できるサイズ
- 例: 「1つのAPIエンドポイント実装+テスト」「1画面のコンポーネント実装」
- 各タスクに必要な情報を全て記載（ファイルパス、コード、テストコマンド）

**計画の構造**:
```markdown
## Goal: [プロジェクト名] デモアプリ実装
## Tech Stack: Next.js App Router, Supabase, Tailwind CSS

### Task 1: [タスク名]
- Files: create `src/app/api/xxx/route.ts`, modify `src/lib/supabase.ts`
- Steps:
  - [ ] 失敗テストを書く（TDD RED）
  - [ ] 最小実装（TDD GREEN）
  - [ ] テスト実行で全パス確認
  - [ ] コミット
```

### Step 2: タスクごとのサブエージェント実行

各タスクに対して以下のサイクルを実行する:

1. **実装サブエージェントをディスパッチ** (`Agent` tool, `isolation: "worktree"`)
   - タスクの全コンテキストをプロンプトに含める（計画ファイルを読ませない）
   - TDDサイクル（RED→GREEN→REFACTOR）で実装
   - 完了時にコミット

2. **仕様適合レビュー** — サブエージェントをディスパッチし、実装が要件・設計に合致しているか確認
   - 入力: 実装diff + `docs/requirement.md` の該当要件
   - 不合格 → 実装サブエージェントに修正指示、再レビュー

3. **コード品質レビュー** — 仕様適合がOKになってから、品質レビューサブエージェントをディスパッチ
   - セキュリティ、パフォーマンス、コード品質をチェック
   - 不合格 → 修正後に再レビュー

4. **タスク完了** → 次のタスクへ

### Red Flags（禁止事項）

- mainブランチで直接実装を始めない（worktreeを使う）
- レビューをスキップしない
- 未解決の問題を残したまま次のタスクに進まない
- サブエージェントに計画ファイルを読ませない（全テキストをプロンプトに含める）
- 仕様適合レビュー完了前にコード品質レビューを開始しない

---

## Verification Before Completion（完了前検証）

各フェーズの完了を宣言する前に、**実際の証拠**で検証する:

| フェーズ | 検証方法 |
|---------|---------|
| Phase 3（整合性レビュー） | `scripts/consistency-check.py` の実行結果を添付 |
| Phase 5（実装） | `npm run dev` でエラーなく起動することを確認 |
| Phase 6（テスト） | `npm run test` の全パス出力を添付 |
| Phase 7（デモ動画） | MP4ファイルの存在と再生確認 |

> 「おそらく問題ないでしょう」「正しく動作するはずです」は禁止。コマンド出力で証明する。

---

## Flexibility Rules

- **スキップ**: 任意のフェーズをスキップ可能（`skip`コマンド）
- **再実行**: 完了済みフェーズの再実行可能（成果物は上書き確認あり）
- **順序変更**: 前提フェーズ未完了でも警告付きで実行可能
- **部分実行**: 特定フェーズのみ実行可能（`phase`コマンド）
