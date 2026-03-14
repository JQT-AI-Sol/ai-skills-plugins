---
name: image-generator
description: NanoBanana Pro 2 (Gemini 3.1 Flash) 画像生成。提案書・説明資料・ブログ・プレゼン等で使用。「画像生成」「AI画像」「NanoBanana」「イメージ生成」「generate image」で発火。
---

# AI画像生成スキル（Gemini 3.1 Flash / NanoBanana Pro 2）

Gemini 3.1 Flash Image Preview（NanoBanana Pro 2）を使ったAI画像生成の汎用スキル。
提案書・説明資料・ブログ・プレゼン等、あらゆるプロジェクトで再利用可能。

## セットアップ

### APIキー

`~/.claude/.env` に以下を設定:

```
GEMINI_API_KEY=your_api_key_here
```

Claude Codeのシェル環境で自動的に読み込まれる。

### 依存パッケージ

```bash
npm install @google/genai
```

## PICSLフレームワーク

画像生成プロンプトの構成フレームワーク。ICSフレームワークを拡張し、Purpose（用途）とLayout（配置）を追加。

### P - Purpose（用途）

画像の用途・対象を1文で明記する。生成AIが画像の文脈を理解し、適切なトーンを選択する助けになる。

```
Purpose: Professional cover image for a corporate proposal presentation.
Purpose: Blog header illustration for an article about AI automation.
Purpose: Social media banner for a product launch announcement.
```

### I - Image type（画像種別）

画像の種類を具体的に指定する。抽象的な指示は品質低下の原因になる。

```
Image type: Horizontal step-by-step flow diagram with 3 stages.
Image type: Hub-and-spoke infographic with 3 feature columns.
Image type: Donut chart with labeled segments showing budget allocation.
Image type: Abstract hero visual for a presentation title slide.
Image type: Side-by-side comparison chart with "Before" and "After" columns.
Image type: 2x2 grid of mini charts (bar, line, pie, metric card).
Image type: Horizontal timeline with 3 phases, each containing task cards.
Image type: Photorealistic editorial-style photograph for a blog article.
```

### C - Content（コンテンツ）

スライドやページの全テキストデータを構造的に渡す。タイトル、項目名、数値をすべてプロンプトに含める。

```
Content:
- Title: "導入効果"
- Three metrics:
  Column 1: "業務効率" — 30% improvement
  Column 2: "コスト削減" — ¥2M annual savings
  Column 3: "顧客満足度" — 4.2 → 4.8 rating
```

**重要**: Gemini 3.1 Flash はテキスト描画精度が向上している。ラベル・数値を積極的に含めること（「テキストなし」は逆効果）。ただしtitleスライドのヒーロー画像のみ「No text, no labels」を指定してよい（テキストは別途オーバーレイするため）。

### S - Style（スタイル）

カラーパレット・フォーマット・解像度を指定する。ブランドカラーは変数化してスタイルブロックに組み込む。

```
Visual Style:
- Color palette: Primary (#1C2833), Secondary (#277884), Accent (#D32F2F), Background (#FAFBFC), White (#FFFFFF).
- Modern, clean, professional flat design suitable for a corporate presentation.
- Format: Landscape, 16:9 aspect ratio, 4K resolution.
- Typography: Clean sans-serif font. All text labels must be clearly legible.
- No watermarks, no stock photo elements, no decorative borders.
```

### L - Layout（レイアウト）

要素の配置・接続関係・空間利用を詳細に指示する。これにより画像の構図がコントロールされる。

```
Layout:
- Title at the top center in bold text.
- 3 large rounded-rectangle boxes arranged horizontally from left to right.
- Each box is labeled with its step name.
- Inside or below each box, list the sub-items as small bullet points.
- Thick directional arrows connect each box to the next, colored in secondary color.
- Box headers use alternating colors from the palette.
```

## スタイルブロックテンプレート

プロジェクトごとにカラーパレットを定義し、`STYLE_BASE` としてプロンプト末尾に付与する。

### テンプレート（コピーして色を変更）

```javascript
// プロジェクトカラー定義（ここを変更）
const COLORS = {
  primary: '#1C2833',     // メインカラー（テキスト、ヘッダー等）
  secondary: '#277884',   // セカンダリ（アクセント、ラベル等）
  accent: '#D32F2F',      // 強調色（CTA、ハイライト等）
  background: '#FAFBFC',  // 背景色
  muted: '#5D6D7E',       // 補助テキスト色
};

// 共通スタイルブロック（全プロンプトの末尾に付与）
const STYLE_BASE = `
Visual Style:
- Color palette: Primary (${COLORS.primary}), Secondary (${COLORS.secondary}), Accent (${COLORS.accent}), Background (${COLORS.background}), White (#FFFFFF).
- Modern, clean, professional flat design suitable for a corporate presentation.
- Format: Landscape, 16:9 aspect ratio, 4K resolution.
- Typography: Clean sans-serif font. All text labels must be clearly legible.
- No watermarks, no stock photo elements, no decorative borders.`;
```

### よく使うカラーパレット例

| パレット名 | Primary | Secondary | Accent | 適用場面 |
|-----------|---------|-----------|--------|---------|
| Corporate Navy | `#1C2833` | `#277884` | `#D32F2F` | ビジネス提案書 |
| Modern Blue | `#0F172A` | `#3B82F6` | `#F59E0B` | テック系資料 |
| Forest Green | `#1B4332` | `#40916C` | `#E76F51` | サステナビリティ |
| Warm Purple | `#2D1B69` | `#7C3AED` | `#F472B6` | クリエイティブ系 |
| Monochrome | `#111827` | `#6B7280` | `#EF4444` | ミニマルデザイン |

## プロンプト文体ガイドライン（NanoBanana Pro 2 ベストプラクティス）

### 言語

- **プロンプトは英語で記述する**（品質が大幅に向上する）
- 日本語テキストをコンテンツとして含める場合はそのまま記述（例: `Title: "導入効果"`）

### 構造

1. **1行目**: `Create a professional {image_type} as a {context}.` で開始
2. **PICSLセクション**: Purpose → Image type → Content → Style → Layout の順に記述
3. **Style ブロック**: `STYLE_BASE` 定数を末尾に付与
4. **追加指示**: Style ブロックの後に画像固有の指示を追加

### 品質向上のコツ

- **具体性**: 抽象的プロンプトは品質が低い。データと配置を具体的に指示する
- **テキスト描画**: ラベル・数値は積極的に含める（Gemini 3.1 Flash のテキスト精度は高い）
- **コンサルスタイル参照**: `"similar to McKinsey presentation diagrams"` 等のスタイル参照が効果的
- **テキストなし指定**: ヒーロー画像（背景）のみ。それ以外では非推奨
- **色指定**: HEXコードで具体的に指定する（色名だけでは不正確）
- **解像度**: `4K resolution` + `16:9 aspect ratio` を必ず指定

### アンチパターン

- `Create a beautiful image` → 具体性がない
- `Make it look professional` → 何がプロフェッショナルか不明
- テキストや数値を含む画像に `No text` → テキスト描画能力を無駄にする
- カラーパレットなしでブランド画像を生成 → 色がバラバラになる

## ワークフロー

ユーザーから画像生成の依頼を受けたら、以下のステップで進める。

### Step 1: ヒアリング

AskUserQuestion で以下を確認:

1. **用途**: 何に使う画像か（提案書、ブログ、プレゼン等）
2. **内容**: 画像に含めたいテキスト・データ・コンセプト
3. **枚数**: 必要な画像の枚数と種類

### Step 2: カラーパレット確認

AskUserQuestion でカラーパレットを確認:

```
question: "使用するカラーパレットを選んでください"
options:
  - label: "Corporate Navy（ビジネス提案書向け）"
    description: "Navy #1C2833 + Teal #277884 + Red #D32F2F"
  - label: "Modern Blue（テック系資料向け）"
    description: "Slate #0F172A + Blue #3B82F6 + Amber #F59E0B"
  - label: "カスタム"
    description: "独自のカラーコードを指定"
```

### Step 3: プロンプト作成 & 生成スクリプト構築

1. `scripts/generate-images-template.js` をベースに `/tmp/generated-images/generate-images.js` を生成
2. `COLORS` にStep 2のカラーパレットを設定
3. `IMAGES[]` にPICSLフレームワークで構成したプロンプトを定義
4. `references/prompt-templates.md` のテンプレートを参照

### Step 4: 画像生成実行

```bash
cd /tmp/generated-images && npm init -y && npm install @google/genai
export GEMINI_API_KEY=$(grep GEMINI_API_KEY ~/.claude/.env | cut -d= -f2)
node generate-images.js
```

### Step 5: 確認 & 修正ループ

1. 生成された画像をRead ツールで確認（画像ファイルを直接閲覧可能）
2. 問題があればプロンプトを修正して再生成
3. ユーザーに最終確認

## API仕様メモ

| 項目 | 値 |
|------|-----|
| モデル | `gemini-3.1-flash-image-preview`（Gemini 3.1 Flash Image Preview） |
| SDK | `@google/genai`（npm） |
| APIキー | 環境変数 `GEMINI_API_KEY`（`~/.claude/.env` で管理） |
| モデルオーバーライド | 環境変数 `GEMINI_MODEL` で変更可能 |
| レスポンス形式 | `response.candidates[0].content.parts[].inlineData.data`（base64） |
| 画像保存 | `Buffer.from(data, 'base64')` → `fs.writeFileSync()` |
| 設定 | `responseModalities: ['image', 'text']` で画像生成モードを有効化 |
| 出力先 | `/tmp/generated-images/`（デフォルト） |

## 用途別テンプレート

詳細は `references/prompt-templates.md` を参照。

| テンプレート | 用途 |
|-------------|------|
| ヒーロー画像 | 表紙・バナー用の抽象ビジュアル |
| フロー図 | プロセス・システム構成の図解 |
| インフォグラフィック（3カラム） | 機能紹介・ポイント説明 |
| ドーナツチャート | 費用内訳・比率表示 |
| 2x2データグリッド | KPI・効果のダッシュボード |
| タイムライン | スケジュール・ロードマップ |
| Before/After比較 | 導入前後・改善効果 |
| 写真風ビジュアル | ブログ・記事のヘッダー画像 |
