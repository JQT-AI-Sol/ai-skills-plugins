---
description: >
  TDDサイクル後のドキュメント同期（Gate 9）。コード変更に伴うAPI定義書、
  DB定義書、画面遷移図、テスト仕様書等の更新を実行する。
  /doc-condenser で品質チェック。
  /tdd から自動呼び出しされる。単独でも使用可能。
  「ドキュメント同期」「doc sync」「ドキュメント更新」で発火。
---

# TDD Doc Sync（Gate 9: ドキュメント同期）

> **ロール**: Generator（ドキュメント更新・`/doc-condenser` 実行）→ Evaluator（Gate 9 スコアリング）

> **コードを変更したら、関連ドキュメントも同期する。コードとドキュメントの乖離は技術的負債。**

---

## 1. 同期対象の特定

変更内容から影響を受けるドキュメントを特定する。

```bash
git diff --name-only HEAD
```

### マッピングルール

| 変更ファイル | 同期対象ドキュメント | 更新内容 |
|-------------|-------------------|---------|
| `src/app/api/**/*.ts` | `docs/02-design/api-reference.md` | エンドポイント追加/変更/削除、リクエスト/レスポンス定義 |
| `src/app/(authenticated)/**/*.tsx` | `docs/02-design/screen-flow.md` | 画面追加/削除、遷移パスの変更 |
| `src/app/(authenticated)/**/*.tsx` | `docs/02-design/design.md` | UI仕様・レイアウト変更 |
| `src/lib/**/*.ts` | `docs/02-design/design.md` | ビジネスロジック仕様の変更 |
| `supabase/migrations/**` | `docs/02-design/db-schema.md` | テーブル・カラム・Enum・関数の変更 |
| `src/lib/types.ts` | `docs/02-design/db-schema.md` | 型定義とDB定義の整合性 |
| `tests/**/*.test.ts` `tests/**/*.spec.ts` | `docs/04-testing/test-spec-functional.md` | テストケース追加/変更 |
| `tests/**/*.test.ts` `tests/**/*.spec.ts` | `docs/04-testing/tdd-workflow.md` | テストファイル一覧・カバレッジ状況 |
| 機能追加・要件変更 | `docs/01-requirements/requirements.md` | ユーザーストーリー・機能要件の追加/変更 |

---

## 2. 各ドキュメントの同期手順

### API定義書（`docs/02-design/api-reference.md`）
1. エンドポイントURL、HTTPメソッド、認証要否
2. リクエストパラメータ / ボディスキーマ
3. レスポンス形式（成功・エラー）
4. 関連するRLSポリシーの記載

### DB定義書（`docs/02-design/db-schema.md`）
1. テーブル定義（カラム名・型・制約）
2. Enum値の追加/変更
3. RLSポリシー
4. DB関数・トリガー

### 画面遷移図（`docs/02-design/screen-flow.md`）
1. 画面ノードの追加/削除
2. 遷移矢印の追加/変更
3. 遷移条件の記載

### 設計書（`docs/02-design/design.md`）
1. 該当セクションの内容を実装に合わせて修正
2. レイアウト変更の記載

### 要件定義書（`docs/01-requirements/requirements.md`）
1. 該当USの追加/変更
2. 機能要件リストの更新
3. 非機能要件の変更

### テスト仕様書（`docs/04-testing/test-spec-functional.md`）
1. テストケース追加
2. E2Eテスト実装一覧の更新
3. テスト統計の更新

---

## 3. 同期不要の判定

以下の場合はスキップする:
- リファクタリングのみ（外部振る舞いの変更なし）
- テストヘルパー・フィクスチャのみの変更
- CSSのみの変更（レイアウト変更を伴わない見た目調整）
- 依存パッケージの更新のみ

---

## 4. ドキュメント品質チェック

更新後、`/doc-condenser` を呼び出して品質をチェックする。
冗長な記述、重複、コードとの不整合を検出し、簡潔で正確なドキュメントを維持する。

---

## Gate 9 評価（Evaluator）

| 評価項目 | 配点 |
|---------|------|
| 同期対象の網羅性 | 3 |
| API定義書の最新性 | 3 |
| DB定義書の最新性 | 3 |
| 画面遷移図の最新性 | 3 |
| テスト仕様書の最新性 | 3 |
| ドキュメント品質（`/doc-condenser` 指摘ゼロ） | 3 |

**該当項目のみで計算 / 合格ライン80%**

---

## 関連スキル

| スキル | 役割 |
|--------|------|
| `/doc-condenser` | ドキュメント品質チェック |
