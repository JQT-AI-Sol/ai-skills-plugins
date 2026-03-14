---
name: review-vercel-frontend
description: >
  Vercel/Next.jsフロントエンドのコードレビュー。
  UI/UXデザイン品質、Reactパフォーマンス最適化、Webインターフェースガイドライン準拠を一括チェックする。
  ui-ux-pro-max、vercel-react-best-practices、web-design-guidelinesを統合実行。
  以下の場合に使用：
  (1) Next.jsプロジェクトの「フロントエンドをレビューして」
  (2) 「Reactのパフォーマンスチェック」「Next.jsのコードレビュー」
  (3) Vercelデプロイ前のコード品質チェック
  (4) /review-vercel-frontend コマンドが呼ばれた場合
  Next.js以外のフロントエンド（Vue, Svelte等）にはreview-frontendを使うこと。
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Skill
---

# Review Vercel Frontend

Vercel/Next.js フロントエンドコードの総合レビューコマンド。

## 実行手順

このコマンドが呼ばれたら、以下の3つのスキルを順番にロードしてレビューを実行する。

### Step 1: 対象ファイルの特定

- 引数でファイルやディレクトリが指定されていればそれを対象にする
- 指定がなければ `git diff --name-only` で変更ファイルを取得する
- `.tsx`, `.ts`, `.jsx`, `.js`, `.css` ファイルをレビュー対象とする

### Step 2: スキルをロードしてレビュー実行

以下の3つのスキルを **すべて** ロードし、それぞれの観点でレビューする：

1. **ui-ux-pro-max** を `/ui-ux-pro-max` で呼び出し、UI/UXデザイン品質をレビュー
   - 配色、タイポグラフィ、アクセシビリティ
   - レスポンシブデザイン、インタラクション
   - コンポーネント設計

2. **vercel-react-best-practices** を `/vercel-react-best-practices` で呼び出し、パフォーマンスをレビュー
   - React コンポーネントの最適化
   - Next.js のデータフェッチング、ルーティング
   - バンドルサイズ、レンダリング効率

3. **web-design-guidelines** を `/web-design-guidelines` で呼び出し、ガイドライン準拠をレビュー
   - Web インターフェースガイドライン
   - アクセシビリティ (a11y)
   - セマンティックHTML

### Step 3: レビュー結果の統合出力

以下のフォーマットで統合レビューを出力する：

```
## Vercel Frontend Review

### UI/UX デザイン
- [指摘事項]

### React/Next.js パフォーマンス
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
