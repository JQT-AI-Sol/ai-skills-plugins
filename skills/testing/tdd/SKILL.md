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

# TDD 統合スキル（オーケストレーター）

テスト駆動開発のワークフローを実行する統合スキル。
各工程は専門サブスキルに委譲し、品質ゲートで品質を担保する。

---

## Agent Roles: Planner / Generator / Evaluator

| ロール | 責務 | 担当工程 |
|--------|------|---------|
| **Planner（計画者）** | テスト計画・シナリオ設計・レビュー方針策定 | Section 0-2 |
| **Generator（実行者）** | テスト作成・実装・リファクタ・ドキュメント更新 | Section 3-5, 9 |
| **Evaluator（評価者）** | 各ゲートのスコアリング評価・合否判定・差し戻し | 全Section完了時 |

### 品質ゲートシステム

- **採点**: 各項目 0-3点（Missing / Partial / Good / Excellent）
- **80点以上** = PASS → 次工程へ
- **60-79点** = CONDITIONAL → 指摘箇所のみ修正して再評価（最大2回）
- **59点以下** = FAIL → Planner に差し戻して工程やり直し
- **Critical項目が0点** → スコアに関係なく FAIL

各ゲートの詳細な評価項目・配点・合格ラインは `references/quality-gates.md` を参照。

---

## ワークフロー全体像

```
Section 0: テスト仕様書更新（任意） → /test-spec
Section 1: コンテキスト分析 [Gate 1]
Section 1.5: カバレッジ監査（変更なし時）
Section 2: テスト種別判定 [Gate 2]
    ↓
/tdd-code-review [Gate 3] — コードレビュー＆構造チェック
    ↓
/tdd-test-writer [Gate 4-5] — RED → GREEN
    ↓
/tdd-refactor [Gate 6] — REFACTOR
    ↓
/tdd-ui-review [Gate 7] — UI/UXレビュー（E2E時のみ）
    ↓
Section 6: テスト実行・検証
Section 7: 失敗時対応
Section 8: 完了前検証 [Gate 8]
    ↓
/tdd-doc-sync [Gate 9] — ドキュメント同期
```

---

## Iron Law: テストファーストの絶対原則

> **失敗するテストなしに、本番コードを一行たりとも書いてはならない。**

テストより先にコードを書いた場合 → **削除する**。そのまま残さない。

| 合理化 | 反論 |
|--------|------|
| 「シンプルすぎてテスト不要」 | シンプルなものはテストもシンプル。書かない理由がない |
| 「後でテストを書く」 | 後で書くテストはコードに合わせたテストになる |
| 「手動で確認済み」 | 手動確認は次の変更で無効 |
| 「まず探索が必要」 | プロトタイプは別ブランチ/worktreeで |
| 「TDDは遅い」 | デバッグ時間を含めるとTDDの方が速い |

---

## Section 0: テスト仕様書の更新（任意）

- 新機能の追加や大きな変更 → `/test-spec` を呼び出してテストケースを起案
- 既存テストの修正や小さなリファクタ → スキップしてSection 1へ

---

## Section 1: コンテキスト分析

```bash
git diff --name-only HEAD
git diff --name-only --staged
git status --short
git diff --name-only HEAD~1  # 未コミットがない場合
```

### モード判定

| 条件 | モード | 次のセクション |
|------|--------|-------------|
| `git diff` で変更ファイルがある | **差分テストモード** | Section 2 へ |
| 変更なし + 「品質チェック」「全体テスト」等 | **カバレッジ監査モード** | Section 1.5 へ |

### Gate 1 評価

| 評価項目 | 配点 |
|---------|------|
| `[CRITICAL]` 変更ファイルの網羅的特定 | 3 |
| モード判定の正確性 | 3 |
| 変更の影響範囲分析 | 3 |
| テスト対象の明確化 | 3 |

**満点12点 / 合格ライン10点（80%）**

---

## Section 1.5: カバレッジ監査モード（全体テスト）

> 目標: 機能カバレッジ95%以上。

1. **全機能の棚卸し**: プロジェクト全体のソースコードから全機能をリストアップ
2. **既存テストとのマッピング**: テストファイルを走査し、カバレッジを確認
3. **ギャップ分析**: 未テスト機能をリスク評価（High/Medium/Low/テスト不適）
4. **テスト計画の作成**: `docs/test-plan.md` に出力
5. **テスト実行**: 優先度順にテストを実行
6. **完了条件**:
   - 機能カバレッジ **95%以上**
   - High リスク未テスト **ゼロ**
   - テスト不適な機能に手動テスト手順書作成済み

Section 1.5 完了後、Section 8（完了前検証）へ進む。

---

## Section 2: テスト種別判定ロジック

| 変更パス | テスト種別 | テスト配置先 | ツール |
|---|---|---|---|
| `src/lib/**/*.ts` | 単体テスト | `tests/unit/` | Vitest |
| `src/app/api/**/*.ts` | API統合テスト | `tests/api/` | Vitest |
| `src/app/(authenticated)/**` | E2Eテスト | `tests/e2e/` | Playwright |
| `src/components/**` | E2Eテスト | `tests/e2e/` | Playwright |
| 複数パターンに該当 | 全該当種別 | 各配置先 | 両方 |

**判定手順:**
1. 変更ファイルのパスをパターンマッチ
2. E2E判定時: POM が `tests/page-objects/` に存在するか確認
3. 既存テストがあれば更新、なければ新規作成
4. ユーザーに判定結果を報告し、確認を取る

### Gate 2 評価

| 評価項目 | 配点 |
|---------|------|
| `[CRITICAL]` テスト種別の正確性 | 3 |
| POM存在確認（E2E時） | 3 |
| 既存テストとの整合性 | 3 |
| テスト配置先の正確性 | 3 |

**満点12点 / 合格ライン10点（80%）**

---

## → `/tdd-code-review` に委譲（Gate 3）

ファイル肥大化チェック、ソースコードレビュー、DBレビューを実行。
Gate 3 PASS後、`/tdd-test-writer` へ。

---

## → `/tdd-test-writer` に委譲（Gate 4-5）

RED（失敗テスト作成）→ GREEN（最小実装）を実行。
Gate 5 PASS後、`/tdd-refactor` へ。

---

## → `/tdd-refactor` に委譲（Gate 6）

重複除去、命名改善、ファイル構造チェック、`/simplify` を実行。
Gate 6 PASS後:
- E2Eテスト対象あり → `/tdd-ui-review` へ
- E2Eなし → Section 6 へ

---

## → `/tdd-ui-review` に委譲（Gate 7、E2E時のみ）

Playwright MCPスクショ → 3段階優先度評価 → 改善イテレーション。
Gate 7 PASS後、Section 6 へ。

---

## Section 6: テスト実行・検証

```bash
# 単体テスト / API統合テスト
npx vitest run

# E2Eテスト
npm run test:e2e

# 全テスト
npm run test
```

- **全パス**: Section 8 へ
- **失敗あり**: Section 7 へ

---

## Section 7: 失敗時の対応

### 7.1 一般的な失敗
`/systematic-debugging` に連携。失敗テストのファイルパス、エラーメッセージ、期待値/実際値の差分を伝達。

### 7.2 E2Eテスト失敗時（Healer Agent 連携）
1. `test_run` で失敗を再現
2. `test_debug` で診断
3. Healer が自動修正（セレクタ変更、タイミング修正、アサーション更新）
4. 修正後に再実行して検証

**エスカレーション条件:**
- Healer が `test.fixme()` マーク → 人間に報告
- 同じテストが3回連続フレーキー → 根本原因調査
- フレーキー疑い → `references/flaky-test-patterns.md` 参照

### 7.3 目視レビューで問題発見
指摘内容を確認 → 修正 → REDフェーズに戻る → `/qa-review` で再確認

---

## Section 8: 完了前検証

> **「たぶん動く」は禁止。実際のコマンド出力で証明すること。**

1. テスト実行コマンドを実行
2. 出力に `PASS` / `FAIL` の実際の結果があることを確認
3. 全テストが緑であることを確認してから「完了」と報告

**禁止表現**: 「おそらく通るでしょう」「問題ないはずです」「正しく動作するはずです」

### Gate 8 評価

| 評価項目 | 配点 |
|---------|------|
| `[CRITICAL]` 全テスト実行ログ | 3 |
| `[CRITICAL]` 全テストパス | 3 |
| テストファースト遵守 | 3 |
| 禁止表現なし | 3 |

**満点12点 / 合格ライン10点（80%）**

---

## → `/tdd-doc-sync` に委譲（Gate 9）

コード変更に伴う関連ドキュメントの同期を実行。

---

## Appendix: プロジェクト固有設定

### テスト3層の配置

```
tests/
├── unit/          # 単体テスト（Vitest）
├── api/           # API統合テスト（Vitest）
├── e2e/           # E2Eテスト（Playwright）
├── page-objects/  # POM（E2E用セレクタ管理）
├── manifests/     # 画面マニフェスト
└── helpers/       # テストヘルパー
```

### E2Eテスト固有ルール

- UIセレクタは `data-testid` を使用
- POM は `tests/page-objects/` に配置
- 画面マニフェストは `tests/manifests/` に配置

### カバレッジ基準

| 指標 | 基準値 |
|---|---|
| 機能カバレッジ（テスト不適を除外） | **95%** |
| クリティカルパス | **100%** |
| High リスク未テスト機能 | **0件** |

---

## References

| ファイル | 用途 |
|---------|------|
| `references/quality-gates.md` | 品質ゲート定義: Gate 1-9 の詳細評価基準 |
| `references/test-templates.md` | 単体/API/E2Eテストのコードテンプレート |
| `references/scenario-design.md` | シナリオ分類、優先度ルール |
| `references/test-data.md` | ストレスデータ、画面状態マトリクス |
| `references/visual-review-checklist.md` | 目視確認チェックリスト |
| `references/flaky-test-patterns.md` | フレーキーテスト対策 |

### サブスキル

| スキル | Gate | 役割 |
|--------|------|------|
| `/tdd-code-review` | Gate 3 | コードレビュー＆構造チェック |
| `/tdd-test-writer` | Gate 4-5 | RED→GREEN（テスト作成→最小実装） |
| `/tdd-refactor` | Gate 6 | REFACTOR（品質改善） |
| `/tdd-ui-review` | Gate 7 | UI/UXレビュー＆改善ループ |
| `/tdd-doc-sync` | Gate 9 | ドキュメント同期 |

### 外部連携スキル

| スキル | 役割 |
|--------|------|
| `/test-spec` | テスト仕様書の自動生成（Section 0） |
| `/pom-generator` | POM の新規作成・更新 |
| `/qa-review` | QAレビュー動画の自動録画 |
| `/demo-recorder` | デモ動画録画 |
| `/security-review` | セキュリティ脆弱性チェック（ビルトインコマンド） |
| `/systematic-debugging` | 根本原因調査 |
| `e2e-testing` | Playwright E2Eテストのパターンリファレンス |
