---
name: demo-recorder
description: >
  Webアプリのデモ動画をPlaywright recordVideoで自動録画しMP4に変換するスキル。
  シナリオ定義→ブラウザ自動操作→録画→MP4変換→複数動画の結合まで対応。
  キャプション（テキストオーバーレイ）をDOM注入で録画中に表示可能。
  以下の場合に使用：
  (1) デモ動画を撮りたい・録画したい
  (2) シナリオテストの一連フローを動画にしたい
  (3) Playwrightで画面操作を録画したい
  (4)「デモ動画」「デモ録画」「操作動画」「recording」「動画を撮って」と言われた場合
---

# Demo Recorder

Playwrightの`recordVideo`でWebアプリ操作を録画し、MP4動画を生成する。

## Prerequisites

- Node.js, `playwright` npm package, `ffmpeg`

## Workflow

### 1. Prepare

1. 対象アプリのdevサーバーが起動しているか確認。未起動なら起動する
2. `/tmp/<project>-demo/` に作業ディレクトリを作成
3. `playwright` が使えるか確認。なければ `npm init -y && npm install playwright`

### 2. Create recording script

[scripts/record-demo.mjs](scripts/record-demo.mjs) をテンプレートとして `/tmp/<project>-demo/record-demo.mjs` にコピーし、以下をカスタマイズ。

**CONFIG:**

```js
const CONFIG = {
  baseUrl: "http://localhost:3000",
  viewport: { width: 1280, height: 1200 },
  slowMo: 350,
  outDir: "/tmp/<project>-demo/videos",
};
```

- 結果が見切れるなら `viewport.height` を大きくする（スクロールより確実）
- `slowMo` は操作の速度感。デモ用途なら 300-400ms 推奨

**SCENARIOS:** 録画シナリオを配列で定義。`run(page, caption)` の第2引数でキャプションを制御。

```js
{
  name: "login-and-create",  // ファイル名に使われる
  label: "ログインして新規作成",
  async run(page, caption) {
    await caption.show("ログインページを開く");
    await page.goto(`${CONFIG.baseUrl}/login`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await caption.show("メールアドレスを入力");
    await page.fill('#email', 'user@example.com');
    await page.waitForTimeout(1500);

    await caption.show("送信ボタンをクリック");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await caption.hide();
  },
}
```

**キャプションAPI:**
- `caption.show(text)` — 画面下部にテキストオーバーレイを表示（前のテキストは自動で置き換わる）
- `caption.hide()` — テキストオーバーレイを非表示にする
- キャプション不要なら `run(page)` のまま第2引数を省略してOK

**キャプションのスタイル設定** (CONFIG.captions):

```js
captions: {
  fontSize: "28px",
  fontColor: "#ffffff",
  bgColor: "rgba(0, 0, 0, 0.75)",
  bold: true,
  padding: "12px 28px",
  borderRadius: "8px",
  bottom: "40px",
},
```

### 3. Scenario authoring tips

- `page.waitForLoadState("networkidle")` — ページ読み込み完了待ち
- `page.waitForTimeout(1500)` — 間を空ける（見やすさのため）
- `caption.show("テキスト")` — 操作の直前に呼ぶと分かりやすい
- `page.locator('input[type="file"]').setInputFiles(path)` — ファイルアップロード
- `page.getByRole("button", { name: "送信" })` — テキストでボタン特定
- `page.getByText("完了").waitFor({ timeout: 30000 })` — 非同期処理の完了待ち
- `page.waitForURL("**/results/**", { timeout: 120000 })` — ページ遷移待ち

### 4. Run

```bash
cd /tmp/<project>-demo
node record-demo.mjs                              # 全シナリオ
node record-demo.mjs --scenario login-and-create   # 特定シナリオ
node record-demo.mjs --concat                      # 全シナリオ＋結合
```

### 5. Output

- 個別: `<outDir>/<scenario-name>.mp4`
- 結合: `<outDir>/demo-all.mp4`（`--concat` 時）

## 連携ツール

- **peekaboo** — デスクトップアプリのスクショ（ブラウザ外のUI素材）
  ```bash
  peekaboo image --path screenshots/desktop-001.png
  ```
- **video-frames (ffmpeg)** — 録画動画からサムネイル抽出
  ```bash
  ffmpeg -i recording.mp4 -ss 00:00:03 -frames:v 1 thumbnail.png
  ```
- `/x-short-video` — 録画動画をRemotionテンプレートでアニメーション化
- `/x-growth` — 録画動画をX投稿にアップロード（xurl media upload）
