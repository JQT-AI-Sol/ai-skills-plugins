---
description: >
  テスト駆動開発の統合スキル。変更内容を分析し、適切なテスト種別（単体/API統合/E2E）を判断、
  TDDサイクル（RED→GREEN→REFACTOR）で実装する。E2EテストではPlaywright Test Agents
  （Planner/Generator/Healer）を活用。
  「テスト書いて」「TDD」「テスト追加」「品質チェック」「テスト駆動」で発火。
  POM作成のみ → /pom-generator。QAレビュー動画のみ → /qa-review。
  デモ動画録画のみ → /demo-recorder。E2Eパターン参照のみ → e2e-testing。
user-invocable: true
---

# TDD 統合スキル

テスト駆動開発のワークフローを実行する統合スキル。
Playwright Test Agents（Planner/Generator/Healer）と連携し、E2Eテストの設計・生成・修復を自動化する。

---

## Iron Law: テストファーストの絶対原則

> **失敗するテストなしに、本番コードを一行たりとも書いてはならない。**

テストより先にコードを書いた場合 → **削除する**。そのまま残さない。「参考にする」「テストに合わせて調整する」も禁止。削除とは削除を意味する。

### よくある合理化とその反論

| 合理化 | 反論 |
|--------|------|
| 「シンプルすぎてテスト不要」 | シンプルなものはテストもシンプル。書く理由がないのではなく、書かない理由がない |
| 「後でテストを書く」 | 後で書くテストは、コードに合わせたテストになる。仕様に合わせたテストにならない |
| 「手動で確認済み」 | 手動確認は次の変更で無効。自動テストだけが回帰を防ぐ |
| 「X時間分のコードを消すのはもったいない」 | テストなしのコードは負債。早く消すほど安い |
| 「まず探索が必要」 | プロトタイプは別ブランチ/worktreeで。本実装はテストファースト |
| 「既存コードにテストがない」 | 変更する部分からテストを書き始める。全カバレッジは求めない |
| 「TDDは遅い」 | デバッグ時間を含めるとTDDの方が速い。最初から正しく書ける |

---

## Section 0: テスト仕様書の更新（任意）

TDDサイクルの前に、テスト仕様書（`docs/04-testing/test-spec-functional.md`）を更新するか確認する。

- 新機能の追加や大きな変更の場合 → `/test-spec` を呼び出してテストケースを起案
- 既存テストの修正や小さなリファクタの場合 → スキップしてSection 1へ

`/test-spec` は変更内容から6カテゴリ（Functional / UI / Integration / Regression / Security / Performance）の観点でテストケースを自動生成し、仕様書に追記する。

---

## Section 1: コンテキスト分析

スキル起動時、まず変更内容を分析する。

```bash
# 1. 変更されたファイルを特定
git diff --name-only HEAD
git diff --name-only --staged
git status --short

# 2. 最近のコミットで変更されたファイル（未コミットがない場合）
git diff --name-only HEAD~1
```

変更ファイルのパスから、テストすべき対象を特定する。

---

## Section 2: テスト種別判定ロジック

変更ファイルのパスに基づき、必要なテスト種別を自動判定する。

| 変更パス | テスト種別 | テスト配置先 | ツール |
|---|---|---|---|
| `src/lib/**/*.ts` | 単体テスト | `tests/unit/` | Vitest |
| `src/app/api/**/*.ts` | API統合テスト | `tests/api/` | Vitest |
| `src/app/(authenticated)/**` | E2Eテスト | `tests/e2e/` | Playwright |
| `src/components/**` | E2Eテスト | `tests/e2e/` | Playwright |
| 複数パターンに該当 | 全該当種別 | 各配置先 | 両方 |

**判定ルール:**
1. 変更ファイルのパスをパターンマッチ
2. 該当する全てのテスト種別をリストアップ
3. **E2E判定時**: 対象ページの POM が `tests/page-objects/` に存在するか確認
   - 存在する → そのPOMをimportしてテストを書く
   - 存在しない → Section 3 の E2Eパス Step 1 で `/pom-generator` に委譲
4. 既存テストがあれば更新、なければ新規作成
5. ユーザーに判定結果を報告し、確認を取る

---

## Section 2.5: コードレビュー＆構造チェック（テスト前ゲート）

TDDサイクルに入る前に、変更対象コードの品質と構造を確認する。
テスト対象が不適切な構造のまま（肥大化、未分割）だとテスト自体が書きにくくなるため、ここで先に整理する。

### 2.5.1 ファイル肥大化・モジュール分割チェック

変更対象ファイルに対して `/decompose` の観点でチェックする。

**自動判定基準:**
- 変更対象ファイルが **300行超** → `/decompose` でモジュール分割を検討
- 1ファイルに **複数の責務**（API呼び出し + UI + バリデーション等）が混在 → 分割を推奨
- コンポーネント内に **ビジネスロジック** が直接書かれている → `src/lib/` への切り出しを推奨

**手順:**
1. `wc -l` で変更対象ファイルの行数を確認
2. 300行超のファイルがあれば `/decompose` を呼び出して分割を実施
3. 分割後にテストを書く（分割前のテストは書かない）

### 2.5.2 ソースコードレビュー

変更ファイルのパスに応じて、該当するレビュースキルを実行する。

| 変更パス | レビュースキル | 観点 |
|----------|--------------|------|
| `src/app/(authenticated)/**/*.tsx` | `/review-vercel-frontend` | UI/UX品質、React/Next.jsパフォーマンス、Webガイドライン準拠 |
| `src/components/**/*.tsx` | `/review-vercel-frontend` | 同上 |
| `src/app/api/**/*.ts` | `/review-python-backend` | API設計、セキュリティ、入力バリデーション、エラーハンドリング |
| `src/lib/**/*.ts` | `/review-python-backend` | コード品質、セキュリティパターン |

### 2.5.3 DBレビュー

DB関連の変更がある場合、`/supabase-postgres-best-practices` の観点でチェックする。

| 変更パス | チェック観点 |
|----------|------------|
| `supabase/migrations/**` | スキーマ設計、インデックス、RLSポリシー、パフォーマンス |
| `src/lib/types.ts` | 型定義とDBスキーマの整合性 |
| `src/lib/database.types.ts` | Supabase生成型の最新性 |

### 2.5.4 スキップ条件

以下の場合はこのセクションをスキップする:
- テストコードのみの変更（`tests/**`）
- ドキュメントのみの変更（`docs/**`）
- 設定ファイルのみの変更（`*.config.*`）
- ユーザーが明示的にスキップを指示した場合

### 2.5.5 完了条件

- [ ] 300行超のファイルがない、または `/decompose` で分割済み
- [ ] 該当するレビュースキルの 🔴 Critical 指摘がゼロ
- [ ] DB変更がある場合、RLSポリシーとインデックスの確認済み
- [ ] レビュー指摘の修正が完了してからSection 3へ進む

---

## Section 3: RED フェーズ（失敗テスト作成）

### 共通手順

1. テスト対象のコードを読み、公開APIを把握
2. AAA パターン（Arrange / Act / Assert）でテストを構造化
3. テストを書く（この時点で実装はまだない or 変更前）
4. テストを実行し、**失敗すること**を確認
5. **失敗の質を検証する**: コンパイルエラーやimportエラーではなく、**アサーション失敗**で落ちていること

### テスト設計チェックリスト

- [ ] 正常系: 期待どおりの入力で期待どおりの出力
- [ ] 境界値: 空文字、空配列、null、最大長
- [ ] 異常系: 不正入力、存在しないID、権限なし
- [ ] エッジケース: 同時実行、重複データ

ストレスデータ・画面状態パターン → `references/test-data.md` を参照

### 単体テスト・API統合テスト

テンプレート → `references/test-templates.md` を参照

### E2Eテスト（Playwright Test Agents 連携）

E2Eテストは以下のステップで進める:

#### Step 1: POM準備

`/pom-generator` に委譲する。既存POMがあればそれを使用。

#### Step 2: シナリオ設計（Playwright Planner Agent）

Planner Agent を使ってテストシナリオを自動探索する。

1. `planner_setup_page` で対象ページのURLを指定
2. Planner がアクセシビリティツリーを探索し、操作可能な要素を特定
3. `planner_save_plan` で探索結果をテスト計画として保存
4. 計画を確認し、必要に応じて手動で補完

シナリオ分類・優先度ルール → `references/scenario-design.md` を参照

#### Step 3: テストコード生成（Playwright Generator Agent）

Generator Agent を使ってテストコードを生成する。

1. `generator_setup_page` で対象ページを開く
2. ブラウザ上で操作を記録
3. `generator_write_test` でテストコードを出力
4. 生成されたコードを POM インポートに書き換える
5. 直接セレクタ（`page.getByTestId()` 等）を POM メソッドに置換

テンプレート → `references/test-templates.md`（E2Eテスト セクション）を参照

#### Step 4: RED確認

テストを実行し、**正しい理由で失敗**していることを確認する。

### RED フェーズ完了条件

- [ ] テストが**正しい理由で失敗**している（コンパイルエラーではなくアサーション失敗）
- [ ] テスト名が振る舞いを明確に記述している
- [ ] 1テスト = 1アサーション（原則）

---

## Section 4: GREEN フェーズ（最小実装）

### 手順

1. 失敗テストを通す**最小限のコード**を書く
2. テストを実行し、パスすることを確認
3. 他の既存テストが壊れていないことを確認

### ルール

- **YAGNI**: 今必要なコードだけ書く
- **テストバイパス禁止**: テストを修正してパスさせるのは禁止
- **一度に1テスト**: 複数テストを同時に通そうとしない

### GREEN フェーズ完了条件

- [ ] 新しいテストがパスしている
- [ ] 既存テストが壊れていない
- [ ] `npx vitest run` または `npm run test:e2e` が全パス
- [ ] 出力が「全テストパス」の**実際のログ**で確認されている（「たぶん通るはず」は不可）

---

## Section 5: REFACTOR フェーズ（品質改善）

### チェックリスト

- [ ] 重複コードの除去
- [ ] 命名の改善（変数名、関数名が意図を表現しているか）
- [ ] 関数の分割（1関数1責任）
- [ ] テストコード自体の改善（共通セットアップの抽出など）
- [ ] 全テストがパスしたまま

### やらないこと（REFACTORフェーズ外）

- 新機能の追加
- パフォーマンス最適化（別タスクとして扱う）
- テストケースの追加（次のREDフェーズで行う）

---

## Section 5.5: 目視レビュー（E2Eテスト時のみ）

E2Eテスト後、UIの目視確認が必要な場合:

- QAレビュー動画 → `/qa-review` を使用
- デモ動画録画 → `/demo-recorder` を使用
- チェックリスト → `references/visual-review-checklist.md`

単体テスト・API統合テストのみの場合、またはユーザーが「動画不要」と言った場合はスキップ。

---

## Section 6: テスト実行・検証

### 自動選択ロジック

テスト種別に応じて適切なコマンドを自動選択する。

```bash
# 単体テスト / API統合テスト → Vitest
npx vitest run

# 特定ファイルのみ
npx vitest run tests/unit/pii-masking.test.ts

# E2Eテスト → Playwright
npm run test:e2e

# 全テスト
npm run test
```

### 実行結果の検証

1. **全パス**: 次のフェーズへ進む
2. **失敗あり**: Section 7 の失敗対応フローへ

---

## Section 7: 失敗時の対応

### 7.1 一般的な失敗

テストが失敗し、原因が明らかでない場合は `/systematic-debugging` スキルに連携する。

1. 失敗したテストの出力を記録
2. エラーメッセージとスタックトレースを保存
3. `/systematic-debugging` を呼び出し、以下を伝達:
   - 失敗テストのファイルパスと行番号
   - エラーメッセージ
   - 期待値と実際値の差分
   - 直近の変更内容

### 7.2 E2Eテスト失敗時（Playwright Healer Agent 連携）

E2Eテストが失敗した場合、Healer Agent で自動修復を試行する。

#### 自動修復フロー

1. `test_run` でテスト実行し失敗を再現
2. `test_debug` で失敗箇所を診断
3. Healer が自動修正を適用:
   - **セレクタ変更**: DOM構造変更に追随してセレクタを更新
   - **タイミング問題**: 適切な待機処理を自動挿入
   - **アサーション値変更**: 実際の値に基づいてアサーションを更新
4. 修正後に再実行して検証

#### エスカレーション条件

| 条件 | 対応 |
|------|------|
| Healer が `test.fixme()` マーク | 人間に報告（自動修復不能） |
| 同じテストが3回連続フレーキー | 根本原因調査が必要 |
| 解決不能なロジックエラー | `/systematic-debugging` に連携 |
| フレーキー疑い | `references/flaky-test-patterns.md` 参照 |

### 7.3 目視レビューで問題発見された場合

人間が動画を確認してUI/UXの問題を指摘した場合:
1. 指摘内容を具体的に確認する（「どの画面の何が問題か」）
2. 該当コンポーネントを修正する
3. REDフェーズに戻り、必要ならテストケースを追加
4. 修正後、`/qa-review` で再度動画を撮影し、人間に再確認を依頼する

---

## Section 8: 完了前検証（Verification Before Completion）

> **「たぶん動く」「これで通るはず」は禁止。実際のコマンド出力で証明すること。**

TDDサイクル完了を宣言する前に、以下を**必ず実行し、出力を確認**する:

1. `npx vitest run` または `npm run test:e2e` を実行
2. 出力に `PASS` / `FAIL` の実際の結果があることを確認
3. 全テストが緑であることを確認してから「完了」と報告

### 禁止表現

以下の表現を使った場合、テストを実行していない証拠と見なす:

- 「おそらく通るでしょう」
- 「問題ないはずです」
- 「正しく動作するはずです」
- 「テストは通ると思います」

代わりに、実行結果の出力を添えて報告する。

---

## Section 9: ドキュメント同期（Doc Sync）

> **コードを変更したら、関連ドキュメントも同期する。コードとドキュメントの乖離は技術的負債。**

### 9.1 同期対象の特定

GREEN/REFACTORフェーズ完了後、変更内容から影響を受けるドキュメントを特定する。

```bash
git diff --name-only HEAD
```

#### マッピングルール

| 変更ファイル | 同期対象ドキュメント | 更新内容 |
|-------------|-------------------|---------|
| `src/app/api/**/*.ts` | `docs/02-design/api-reference.md` | エンドポイント追加/変更/削除、リクエスト/レスポンス定義 |
| `src/app/(authenticated)/**/*.tsx` | `docs/02-design/screen-flow.md` | 画面追加/削除、遷移パスの変更 |
| `src/app/(authenticated)/**/*.tsx` | `docs/02-design/design.md` | UI仕様・レイアウト変更 |
| `src/lib/**/*.ts` | `docs/02-design/design.md` | ビジネスロジック仕様の変更 |
| `supabase/migrations/**` | `docs/02-design/db-schema.md` | テーブル・カラム・Enum・関数の変更 |
| `src/lib/types.ts` | `docs/02-design/db-schema.md` | 型定義とDB定義の整合性 |
| `tests/**/*.test.ts` `tests/**/*.spec.ts` | `docs/04-testing/test-spec-functional.md` | テストケース追加/変更（Section 5 E2E実装一覧） |
| `tests/**/*.test.ts` `tests/**/*.spec.ts` | `docs/04-testing/tdd-workflow.md` | テストファイル一覧・カバレッジ状況 |
| 機能追加・要件変更 | `docs/01-requirements/requirements.md` | ユーザーストーリー・機能要件の追加/変更 |

### 9.2 各ドキュメントの同期手順

#### API定義書（`docs/02-design/api-reference.md`）

APIルートを追加・変更した場合:
1. エンドポイントURL、HTTPメソッド、認証要否
2. リクエストパラメータ / ボディスキーマ
3. レスポンス形式（成功・エラー）
4. 関連するRLSポリシーの記載

#### DB定義書（`docs/02-design/db-schema.md`）

マイグレーションを追加した場合:
1. テーブル定義（カラム名・型・制約）
2. Enum値の追加/変更
3. RLSポリシー
4. DB関数・トリガー

#### 画面遷移図（`docs/02-design/screen-flow.md`）

画面を追加・削除・遷移パスを変更した場合:
1. 画面ノードの追加/削除
2. 遷移矢印の追加/変更
3. 遷移条件の記載

#### 設計書（`docs/02-design/design.md`）

UI仕様やビジネスロジックを変更した場合:
1. 該当セクションの内容を実装に合わせて修正
2. レイアウト変更（例: 1カラム→2カラム）の記載

#### 要件定義書（`docs/01-requirements/requirements.md`）

新機能追加やユーザーストーリー変更があった場合:
1. 該当USの追加/変更
2. 機能要件リストの更新
3. 非機能要件（パフォーマンス・セキュリティ）の変更

#### テスト仕様書（`docs/04-testing/test-spec-functional.md`）

テストを追加・変更した場合:
1. Section 3 のテストケース追加
2. Section 5 のE2Eテスト実装一覧の更新
3. Section 5.5 のテスト統計の更新

### 9.3 同期不要の判定

以下の場合はドキュメント同期をスキップする:

- リファクタリングのみ（外部振る舞いの変更なし）
- テストヘルパー・フィクスチャのみの変更
- CSSのみの変更（レイアウト変更を伴わない見た目調整）
- 依存パッケージの更新のみ

### 9.4 完了条件

- [ ] API変更 → `docs/02-design/api-reference.md` が最新
- [ ] DB変更 → `docs/02-design/db-schema.md` が最新
- [ ] 画面追加/遷移変更 → `docs/02-design/screen-flow.md` が最新
- [ ] UI/ロジック変更 → `docs/02-design/design.md` が最新
- [ ] 新機能/要件変更 → `docs/01-requirements/requirements.md` が最新
- [ ] テスト追加/変更 → `docs/04-testing/test-spec-functional.md` + `docs/04-testing/tdd-workflow.md` が最新

---

## Appendix: プロジェクト固有設定

### テスト3層の配置

```
tests/
├── unit/          # 単体テスト（Vitest）
│   └── *.test.ts
├── api/           # API統合テスト（Vitest）
│   └── *.test.ts
├── e2e/           # E2Eテスト（Playwright）
│   └── *.spec.ts
├── page-objects/  # POM（E2E用セレクタ管理）
├── manifests/     # 画面マニフェスト
└── helpers/       # テストヘルパー
```

### E2Eテスト固有ルール

- UIセレクタは `data-testid` を使用
- Page Object Model は `tests/page-objects/` に配置
- 画面マニフェストは `tests/manifests/` に配置
- 既存の E2E 規約は `CLAUDE.md` の「E2Eテスト基盤」セクション参照

### カバレッジ基準

| 指標 | 基準値 |
|---|---|
| 行カバレッジ | 80% |
| 分岐カバレッジ | 75% |
| クリティカルパス（PII保護、認証、データ永続化） | 100% |

---

## References

| ファイル | 用途 |
|---------|------|
| `references/test-templates.md` | 単体/API/E2Eテストのコードテンプレート |
| `references/scenario-design.md` | シナリオ分類6カテゴリ、優先度ルール、Planner Agent連携 |
| `references/test-data.md` | ストレスデータ8パターン、画面状態マトリクス、APIモックパターン |
| `references/visual-review-checklist.md` | 目視確認15項目チェックリスト（5カテゴリ） |
| `references/flaky-test-patterns.md` | フレーキーテスト対策、Healer連携、クォランティン戦略 |

### ドキュメント同期対象

| ドキュメント | 同期トリガー |
|-------------|------------|
| `docs/01-requirements/requirements.md` | 機能追加・要件変更 |
| `docs/02-design/design.md` | UI/ロジック変更 |
| `docs/02-design/api-reference.md` | APIルート追加・変更 |
| `docs/02-design/db-schema.md` | マイグレーション追加 |
| `docs/02-design/screen-flow.md` | 画面追加・遷移変更 |
| `docs/04-testing/test-spec-functional.md` | テスト追加・変更 |
| `docs/04-testing/tdd-workflow.md` | テストファイル追加・カバレッジ変更 |

### 関連スキル

| スキル | 役割 |
|--------|------|
| `/test-spec` | テスト仕様書の自動生成・更新（Section 0） |
| `/pom-generator` | POM の新規作成・更新 |
| `/qa-review` | QAレビュー動画の自動録画 |
| `/demo-recorder` | デモ動画録画 |
| `/decompose` | ファイル肥大化チェック・モジュール分割（Section 2.5） |
| `/review-vercel-frontend` | フロントエンドレビュー: UI/UX + React/Next.js + Webガイドライン（Section 2.5） |
| `/review-python-backend` | バックエンドレビュー: API設計 + セキュリティ + コード品質（Section 2.5） |
| `/supabase-postgres-best-practices` | DBレビュー: スキーマ + RLS + パフォーマンス（Section 2.5） |
| `/systematic-debugging` | 根本原因調査 |
| `/spec` | 仕様書の新規作成・更新 |
| `e2e-testing` | Playwright E2Eテストのパターン・設定リファレンス |
