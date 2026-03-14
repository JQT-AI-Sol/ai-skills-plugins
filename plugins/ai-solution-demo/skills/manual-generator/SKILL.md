---
name: manual-generator
description: >
  Webアプリの操作マニュアルPDFを自動生成するスキル。
  Playwrightでスクリーンショットを撮影し、操作手順テキストと組み合わせてA4 PDFマニュアルを作成する。
  以下の場合に使用：
  (1) 操作マニュアルを作りたい
  (2) スクショ付きの手順書・ガイドをPDFで作りたい
  (3) Webアプリの使い方ドキュメントを自動生成したい
  (4)「マニュアル作って」「手順書」「操作ガイド」「PDF手順書」と言われた場合
---

# Manual Generator

Playwright + HTML→PDF変換で、スクショ付きWebアプリ操作マニュアルを自動生成する。

## Prerequisites

- Node.js, `playwright` npm package

## Workflow

### 1. Prepare

1. `/tmp/<project>-manual/` に作業ディレクトリ、`screenshots/` サブディレクトリを作成
2. `playwright` が使えるか確認。なければ `npm init -y && npm install playwright`
3. 対象アプリのURL・ログイン情報をユーザーに確認

### 2. Plan sections

ユーザーの要件からマニュアルの構成を決める。典型的な構成：

```
1. ログイン
2. 一覧画面の説明
3. 新規作成フロー
4. 詳細画面の説明
5. 編集・操作
6. 承認・完了
```

### 3. Capture screenshots

[scripts/capture-screenshots.mjs](scripts/capture-screenshots.mjs) をテンプレートとして `/tmp/<project>-manual/capture.mjs` にコピーしカスタマイズ。

**CONFIG:**

```js
const CONFIG = {
  baseUrl: "https://example.com",
  viewport: { width: 1280, height: 800 },
  outDir: "/tmp/<project>-manual/screenshots",
};
```

**重要なポイント:**
- `fullPage: false`（viewport固定）で撮影。PDF A4に収まるサイズにする
- スクロールが必要な場合は `page.evaluate(() => window.scrollTo(...))`で表示位置を変えて複数枚撮影
- `page.waitForLoadState("networkidle")` でページ読み込み完了を待つ
- `page.waitForTimeout(600)` を撮影前に入れて描画完了を保証
- ファイル名は `01-login`, `02-list` のように連番プレフィックス付き

### 4. Create config JSON

スクショ撮影後、PDF生成用の設定JSONを作成：

```json
{
  "title": "○○ 操作マニュアル",
  "subtitle": "機能フロー説明",
  "company": "会社名",
  "date": "2026年2月28日",
  "system": "システム名（URL）",
  "accentColor": "#319795",
  "screenshotsDir": "/tmp/<project>-manual/screenshots",
  "sections": [
    {
      "title": "1. ログイン",
      "steps": [
        {
          "img": "01-login",
          "text": "メールアドレスとパスワードを入力して「ログイン」をクリックします。"
        }
      ]
    }
  ]
}
```

- `img`: スクショのファイル名（拡張子`.png`は不要）
- `text`: 操作手順の説明テキスト。`\n`で改行可。箇条書きは `・` を使う
- `img` を省略するとテキストのみのステップになる

### 5. Generate PDF

```bash
cd /tmp/<project>-manual
node generate-pdf.mjs --config manual-config.json --out manual.pdf
```

[scripts/generate-pdf.mjs](scripts/generate-pdf.mjs) を作業ディレクトリにコピーして実行。

### 6. Verify and iterate

生成されたPDFをReadツールで確認し、以下をチェック：
- スクショとテキストが同じページに収まっているか
- 画像が見切れていないか
- テキストが読みやすいか

問題があれば設定JSONのテキストを調整、またはスクショを撮り直して再生成。

## Layout tips

- 1ステップ = テキスト + 1画像。`page-break-inside: avoid` で分断を防止
- 画像の `max-height: 360px` でA4ページ内に収める
- セクション見出しは `page-break-after: avoid` で画像と分離しない
- `accentColor` で見出し・左ボーダーの色をプロジェクトに合わせる
