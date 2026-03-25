---
description: >
  TDDのRED→GREENフェーズ（Gate 4-5）。失敗テスト作成→最小実装→パス確認を実行する。
  E2EテストではPlaywright Test Agents（Planner/Generator）と連携。
  テストコードレビュー・実装コードレビューも含む。
  /tdd から自動呼び出しされる。単独でも使用可能。
  「テスト作成」「RED GREEN」「テストコード生成」で発火。
---

# TDD Test Writer（Gate 4-5: RED→GREEN）

> **ロール**: Planner（テスト設計・シナリオ策定）→ Generator（テスト作成・最小実装）→ Evaluator（Gate 4/5 スコアリング）

---

## Section RED: 失敗テスト作成

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
- [ ] セキュリティ: 認証バイパス、権限昇格、インジェクション（XSS/SQLi）、RLS漏れ

ストレスデータ・画面状態パターン → `../tdd/references/test-data.md` を参照

### 単体テスト・API統合テスト

テンプレート → `../tdd/references/test-templates.md` を参照

### E2Eテスト（Playwright Test Agents 連携）

#### Step 1: POM準備

`/pom-generator` に委譲する。既存POMがあればそれを使用。

#### Step 2: シナリオ設計（Playwright Planner Agent）

1. `planner_setup_page` で対象ページのURLを指定
2. Planner がアクセシビリティツリーを探索し、操作可能な要素を特定
3. `planner_save_plan` で探索結果をテスト計画として保存
4. 計画を確認し、必要に応じて手動で補完

シナリオ分類・優先度ルール → `../tdd/references/scenario-design.md` を参照

#### Step 3: テストコード生成（Playwright Generator Agent）

1. `generator_setup_page` で対象ページを開く
2. ブラウザ上で操作を記録
3. `generator_write_test` でテストコードを出力
4. 生成されたコードを POM インポートに書き換える
5. 直接セレクタ（`page.getByTestId()` 等）を POM メソッドに置換

テンプレート → `../tdd/references/test-templates.md`（E2Eテスト セクション）を参照

#### Step 4: RED確認

テストを実行し、**正しい理由で失敗**していることを確認する。

### テストコードレビュー

RED完了後、作成したテストコード自体をレビュースキルでチェックする。

| テストファイルパス | レビュースキル | 観点 |
|------------------|--------------|------|
| `tests/unit/*.test.ts` | `/review-python-backend` | コード品質、テスト設計パターン |
| `tests/api/*.test.ts` | `/review-python-backend` | API呼び出しパターン、モック設計 |
| `tests/e2e/*.spec.ts` | `/review-vercel-frontend` | POM利用、セレクタ品質、待機処理 |

### Gate 4 評価（Evaluator）— RED フェーズ

| 評価項目 | 配点 |
|---------|------|
| `[CRITICAL]` テストが失敗している | 3 |
| `[CRITICAL]` 失敗理由がアサーション失敗 | 3 |
| AAAパターン準拠 | 3 |
| テスト名の記述性 | 3 |
| 正常系テストの存在 | 3 |
| 境界値・異常系テスト | 3 |
| 1テスト1アサーション | 3 |
| テストの独立性 | 3 |
| テストコードレビュー指摘ゼロ | 3 |

**満点27点 / 合格ライン22点（80%）** — Critical項目0点で即FAIL

---

## Section GREEN: 最小実装

### 手順

1. 失敗テストを通す**最小限のコード**を書く
2. テストを実行し、パスすることを確認
3. 他の既存テストが壊れていないことを確認

### ルール

- **YAGNI**: 今必要なコードだけ書く
- **テストバイパス禁止**: テストを修正してパスさせるのは禁止
- **一度に1テスト**: 複数テストを同時に通そうとしない

### 実装コードレビュー

GREEN完了後、新たに書いた実装コードをレビュースキルでチェックする。

| 変更パス | レビュースキル | 観点 |
|----------|--------------|------|
| `src/app/(authenticated)/**/*.tsx`, `src/components/**/*.tsx` | `/review-vercel-frontend` | UI/UX品質、React/Next.jsパフォーマンス |
| `src/app/api/**/*.ts`, `src/lib/**/*.ts` | `/review-python-backend` | API設計、セキュリティ、コード品質 |
| `supabase/migrations/**` | `supabase-postgres-best-practices` | スキーマ、RLS、インデックス |

**スキップ条件**: GREEN で追加したコードが5行以下の軽微な変更の場合

### セキュリティレビュー（`/security-review`）

GREEN完了後、実装コードレビューと合わせて `/security-review` を実行する。
新たに書いたコードにインジェクション、認証不備、データ露出がないか確認する。
Critical指摘があれば修正してから Gate 5 評価に進む。

### Gate 5 評価（Evaluator）— GREEN フェーズ

| 評価項目 | 配点 |
|---------|------|
| `[CRITICAL]` 新テストがパス | 3 |
| `[CRITICAL]` 既存テスト非破壊 | 3 |
| `[CRITICAL]` 実行ログの提示 | 3 |
| YAGNI準拠 | 3 |
| テストバイパス不在 | 3 |
| 実装コードレビュー指摘ゼロ | 3 |
| `/security-review` 指摘ゼロ | 3 |

**満点21点 / 合格ライン17点（80%）** — Critical項目0点で即FAIL

Gate 5 PASS後、`/tdd-refactor`（REFACTOR）へ進む。

---

## References

| ファイル | 用途 |
|---------|------|
| `../tdd/references/test-templates.md` | 単体/API/E2Eテストのコードテンプレート |
| `../tdd/references/scenario-design.md` | シナリオ分類6カテゴリ、優先度ルール |
| `../tdd/references/test-data.md` | ストレスデータ8パターン、画面状態マトリクス |
| `../tdd/references/quality-gates.md` | Gate 4-5 の詳細評価基準 |

## 関連スキル

| スキル | 役割 |
|--------|------|
| `/pom-generator` | POM の新規作成・更新 |
| `/review-vercel-frontend` | フロントエンドレビュー |
| `/review-python-backend` | バックエンドレビュー |
| `supabase-postgres-best-practices` | DBレビュー |
