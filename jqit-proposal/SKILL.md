---
name: jqit-proposal
description: JQIT提案書PPTX生成。「提案書を作って」「JQITの資料」「プレゼン作成」「スライド作成」「提案資料」などで発火
---

# JQIT提案書スキル

JQIT（ジェイキット）ブランドの提案書PPTXを生成するスキル。
白ヘッダー + JQIT赤サイドバー + ティールアクセントの統一デザインで提案書を自動生成する。

## デザインシステム

### カラーパレット（6色）

| 名前 | HEX | 用途 |
|------|-----|------|
| Navy (Primary) | `#1C2833` | ダークスライド背景、テキスト主色、ヘッダーアンダーライン |
| Teal (Secondary) | `#277884` | カード上ボーダー、ラベル色、アクセントテキスト |
| JQIT Red (Accent) | `#D32F2F` | サイドバー（全スライド共通）、強調カード、CTA、ステップハイライト |
| Light Gray (BG) | `#FAFBFC` | ライトスライドの背景色 |
| Mid Gray (Text) | `#5D6D7E` | 本文テキスト、補足情報 |
| Muted Gray | `#AAB7B8` | スコープ外テキスト、メタ情報、日付など |

### フォント

- **メインフォント**: Arial, sans-serif
- **タイトル**: 24-30pt, bold, `#FFFFFF`（ダーク背景時）
- **見出し**: 13-18pt, bold, `#1C2833` or `#FFFFFF`
- **本文**: 10-11pt, `#5D6D7E` or `#2C3E50`
- **キャプション/ラベル**: 8-9pt, `#AAB7B8` or `#277884`

### 共通パーツ

#### サイドバー（全スライド共通）
```html
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>
```
- JQIT Red `#D32F2F` を全スライドで統一使用（ライト・ダーク共通）

#### ヘッダーバー（ライトスライド共通）
```html
<div style="position: absolute; left: 0; top: 0; width: 720pt; height: 50pt; background: #FFFFFF; border-bottom: 2pt solid #1C2833;">
  <p style="color: #1C2833; font-size: 18pt; font-weight: bold; margin: 14pt 0 0 40pt;">{{タイトル}}</p>
  <img src="logo.png" style="position: absolute; right: 20pt; top: 14pt; height: 22pt;">
</div>
```
- 白背景 + ネイビーアンダーライン（2pt）
- テキスト色はネイビー `#1C2833`
- JQITロゴをヘッダー右に配置

#### ロゴ配置
- ロゴファイル: `assets/logo.png`（300x88px）
- ライトスライド: ヘッダー右に配置（`right: 20pt; top: 14pt; height: 22pt;`）
- ダークスライド（title, dark-checklist）: 右下に小さく配置（`right: 30pt; bottom: 20pt; height: 20pt; opacity: 0.7;`）

### スライドサイズ
- **幅**: 720pt（10インチ × 72dpi）
- **高さ**: 405pt（5.625インチ × 72dpi）
- **アスペクト比**: 16:9
- **コンテンツマージン**: 左40pt, 上60-68pt（ヘッダーバー下）, 右40pt

## ワークフロー

ユーザーから提案書作成の依頼を受けたら、以下のステップで進める:

### Step 1: 要件ヒアリング
AskUserQuestion ツールを使って以下を確認する:

**質問1**（必須）: 提案書の基本情報
- 提案書のタイトル
- スライド構成（枚数・各スライドの内容概要）
- 特別な要件（テーブル挿入、図解など）

**質問2**（必須）: AI画像生成の要否
AskUserQuestion で以下を聞く:
```
question: "スライドにAI生成画像（図解・グラフ・イラスト等）を挿入しますか？"
options:
  - label: "はい（Nano Banana Proで生成）"
    description: "Gemini APIで画像を自動生成してスライドに挿入します。GEMINI_API_KEY が必要です"
  - label: "いいえ（テキスト＋HTMLのみ）"
    description: "HTML/CSSのみでスライドを構成します。画像生成APIは使いません"
```
→ 「はい」の場合のみ Step 3.5 を実行する

### Step 2: レイアウト選択
`references/layouts.md` を読み、各スライドに最適なレイアウトパターンを選択する。

| レイアウト | 適用場面 |
|-----------|---------|
| title | 表紙・中扉 |
| card-list | サマリー、会社紹介など縦積み情報 |
| card-grid-2x2 | 4項目の並列比較（課題、メリットなど） |
| card-3col | 3機能/3ポイントの説明 |
| flow-diagram | プロセス・システム構成の図解 |
| dark-checklist | デモ紹介、次のステップなど強調スライド |
| two-column | 比較/対照（スコープ内外、Before/Afterなど） |
| timeline | スケジュール・ロードマップ |

### Step 3: HTMLスライド生成
1. `references/layouts.md` のHTMLテンプレートをベースに、各スライドのHTMLを生成
2. ファイル名は `slide{NN}-{slug}.html` 形式
3. 出力先: `/tmp/pptx-slides/` ディレクトリ
4. コンテンツのプレースホルダーを実際のテキストに置換
5. 画像が必要なスライドには `<img src="gen-{slug}.png">` プレースホルダーを配置

### Step 3.5: 画像生成（Nano Banana Pro）
**Step 1 でユーザーが「はい」と回答した場合のみ実行。**

Nano Banana Proでスライド用画像を生成する。

**手順**:
1. 各スライドの内容から画像生成プロンプトを作成
2. `scripts/generate-images-template.js` をベースに `/tmp/pptx-slides/generate-images.js` を生成
3. `~/.claude/.env` から `GEMINI_API_KEY` が読み込まれていることを確認（`echo $GEMINI_API_KEY` で検証）
4. スクリプトを実行して画像を `/tmp/pptx-slides/` に保存
5. HTMLスライドの `<img src="gen-{slug}.png">` が生成された画像を参照していることを確認

**プロンプト作成のコツ**:
- JQITブランドカラー（Navy `#1C2833`, Teal `#277884`, JQIT Red `#D32F2F`）を指定
- 「ビジネスプレゼンテーション向けのプロフェッショナルなフラットデザイン」を基本指示に含める
- テキスト生成が不要な場合は「テキスト・ラベル・透かしなし」を明記
- 出力サイズはスライドに合わせて指示（例: 「横長フォーマット、16:9 アスペクト比」）
- プロンプトは日本語で記述する

### Step 4: ビルドスクリプト生成
`scripts/build-pptx-template.js` をベースに、今回のスライドリストに合わせた `build-pptx.js` を `/tmp/pptx-slides/build-pptx.js` に生成する。

テーブルなどHTML/CSSで表現しにくい要素がある場合は、プレースホルダー (`class="placeholder"`) を使い、ビルドスクリプトで pptxgenjs API 経由で挿入する。

### Step 5: ビルド実行
```bash
cd /tmp/pptx-slides && npm init -y && npm install pptxgenjs && node build-pptx.js
```

画像生成を含む場合:
```bash
cd /tmp/pptx-slides && npm init -y && npm install pptxgenjs @google/genai && node generate-images.js && node build-pptx.js
```

### Step 6: 検証
生成されたPPTXを確認:
- 全スライドが正しく生成されているか
- マージン溢れがないか
- テーブル・図解が正しく表示されるか

## 注意事項

### html2pptx の制約
- html2pptx は document-skills の pptx スキル内のスクリプト
- パス: `/Users/takahiromiyamoto/.claude/plugins/cache/anthropic-agent-skills/document-skills/*/skills/pptx/scripts/html2pptx`
- **注意**: キャッシュパスのハッシュ部分（`*`）はビルド時に glob で解決すること
- テーブルは HTML では綺麗にレンダリングされないため、pptxgenjs の `addTable()` API を使用する

### Nano Banana Pro（画像生成）
- **モデル**: `nano-banana-pro-preview`（Nano Banana Pro）
- **SDK**: `@google/genai`（npm install `@google/genai`）
- **APIキー管理**: `~/.claude/.env` に `GEMINI_API_KEY=your_key` を記載。Claude Codeのシェル環境で自動的に読み込まれる
- **レスポンス**: `response.candidates[0].content.parts` 内の `inlineData.data`（base64）を `Buffer.from(data, 'base64')` でファイル保存
- **テンプレート**: `scripts/generate-images-template.js`
- テキスト描画は正確だが、提案書では「テキストなし」指定して画像のみ生成するのが安全
- 画像ファイルは `/tmp/pptx-slides/` に保存し、HTMLスライドから相対パスで参照

### コンテンツ作成のガイドライン
- スライド1枚あたりの情報量を抑える（読みやすさ優先）
- 箇条書きは3-5項目が目安
- カードは最大4枚まで
- フォントサイズは最小8pt（これ以下は読めない）

### ファイルパス
- ロゴ: `/Users/takahiromiyamoto/.claude/skills/jqit-proposal/assets/logo.png`
- レイアウトカタログ: `/Users/takahiromiyamoto/.claude/skills/jqit-proposal/references/layouts.md`
- ビルドスクリプトテンプレート: `/Users/takahiromiyamoto/.claude/skills/jqit-proposal/scripts/build-pptx-template.js`
- 画像生成スクリプトテンプレート: `/Users/takahiromiyamoto/.claude/skills/jqit-proposal/scripts/generate-images-template.js`
