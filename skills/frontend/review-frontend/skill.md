---
name: review-frontend
description: >
  フロントエンドのコードレビュー（Vue, Svelte, 静的HTML等、Vercel/Next.js以外の構成向け）。
  UI/UXデザイン品質とWebインターフェースガイドライン準拠を一括チェックする。
  ui-ux-pro-maxとweb-design-guidelinesを統合実行。
  以下の場合に使用：
  (1) 「フロントエンドをレビューして」（Next.js以外のプロジェクト）
  (2) 「UIのコードレビュー」「デザインチェック」
  (3) .vue, .svelte, .html ファイルのレビュー
  (4) /review-frontend コマンドが呼ばれた場合
  Next.js/Vercelプロジェクトの場合はreview-vercel-frontendを使うこと。
  Pythonバックエンドのレビューにはreview-python-backendを使うこと。
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Skill
---

# Review Frontend

フロントエンドコードの総合レビューコマンド（Vercel/Next.js 以外の構成向け）。

## 実行手順

このコマンドが呼ばれたら、以下の2つのスキルをロードしてレビューを実行する。

### Step 1: 対象ファイルの特定

- 引数でファイルやディレクトリが指定されていればそれを対象にする
- 指定がなければ `git diff --name-only` で変更ファイルを取得する
- `.tsx`, `.ts`, `.jsx`, `.js`, `.css`, `.vue`, `.svelte`, `.html` ファイルをレビュー対象とする

### Step 2: スキルをロードしてレビュー実行

以下の2つのスキルを **すべて** ロードし、それぞれの観点でレビューする：

1. **ui-ux-pro-max** を `/ui-ux-pro-max` で呼び出し、UI/UXデザイン品質をレビュー
   - 配色、タイポグラフィ、アクセシビリティ
   - レスポンシブデザイン、インタラクション
   - コンポーネント設計

2. **web-design-guidelines** を `/web-design-guidelines` で呼び出し、ガイドライン準拠をレビュー
   - Web インターフェースガイドライン
   - アクセシビリティ (a11y)
   - セマンティックHTML

### Step 3: レビュー結果の統合出力

以下のフォーマットで統合レビューを出力する：

```
## Frontend Review

### UI/UX デザイン
- [指摘事項]

### Web ガイドライン準拠
- [指摘事項]

### 総評
[全体的な評価とアクションアイテム]
```

重要度は以下で分類する：
- 🔴 **Critical** — 必ず修正すべき
- 🟡 **Warning** — 修正推奨
- 🔵 **Info** — 改善の余地あり
