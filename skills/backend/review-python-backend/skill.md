---
name: review-python-backend
description: >
  Python/FastAPIバックエンドのコードレビュー。
  API設計、非同期パターン、セキュリティ、コード品質を一括チェックする。
  python-backendとfastapi-async-patternsを統合実行。
  以下の場合に使用：
  (1) 「Pythonのコードレビュー」「バックエンドをレビューして」
  (2) 「FastAPIのコードチェック」「APIレビュー」
  (3) .py ファイルのレビュー
  (4) /review-python-backend コマンドが呼ばれた場合
  フロントエンドのレビューにはreview-frontendまたはreview-vercel-frontendを使うこと。
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Skill
---

# Review Python Backend

Python/FastAPI バックエンドコードの総合レビューコマンド。

## 実行手順

このコマンドが呼ばれたら、以下の2つのスキルをロードしてレビューを実行する。

### Step 1: 対象ファイルの特定

- 引数でファイルやディレクトリが指定されていればそれを対象にする
- 指定がなければ `git diff --name-only` で変更ファイルを取得する
- `.py` ファイルをレビュー対象とする

### Step 2: スキルをロードしてレビュー実行

以下の2つのスキルを **すべて** ロードし、それぞれの観点でレビューする：

1. **python-backend** を読み込み、以下の観点でレビュー
   - API 設計とルーティング構造
   - JWT/OAuth2 認証パターン
   - Pydantic モデルのバリデーション
   - 依存性注入 (Depends) の使い方
   - エラーハンドリング (HTTPException)
   - プロジェクト構造とモジュール分割
   - セキュリティ（入力バリデーション、SQLインジェクション防止）

2. **fastapi-async-patterns** を読み込み、以下の観点でレビュー
   - async/await の正しい使い方
   - sync vs async エンドポイントの使い分け
   - 並行処理パターン（asyncio.gather 等）
   - データベース非同期接続
   - バックグラウンドタスク
   - パフォーマンスボトルネック

### Step 3: レビュー結果の統合出力

以下のフォーマットで統合レビューを出力する：

```
## Python Backend Review

### API 設計・構造
- [指摘事項]

### 非同期パターン・パフォーマンス
- [指摘事項]

### セキュリティ
- [指摘事項]

### 総評
[全体的な評価とアクションアイテム]
```

重要度は以下で分類する：
- 🔴 **Critical** — 必ず修正すべき（セキュリティ問題、データ損失リスク）
- 🟡 **Warning** — 修正推奨（パフォーマンス低下、アンチパターン）
- 🔵 **Info** — 改善の余地あり（可読性、ベストプラクティス）
