---
name: jqit-proposal
description: JQIT提案書PPTX生成。「提案書を作って」「JQITの資料」「プレゼン作成」「スライド作成」「提案資料」などで発火
---

# JQIT提案書スキル

JQIT（ジェイキット）ブランドの提案書PPTXを生成するスキル。
白ベース + JQIT赤サイドバー + ティールアクセントの統一デザインで提案書を自動生成する。

## デザインシステム

### カラーパレット（6色）

| 名前 | HEX | 用途 |
|------|-----|------|
| Navy (Primary) | `#1C2833` | テキスト主色、ヘッダーアンダーライン、ダークチェックリスト背景 |
| Teal (Secondary) | `#277884` | カード上ボーダー、ラベル色、アクセントテキスト |
| JQIT Red (Accent) | `#D32F2F` | サイドバー（全スライド共通）、強調カード、CTA、ステップハイライト |
| Light Gray (BG) | `#FAFBFC` | ライトスライドの背景色 |
| Mid Gray (Text) | `#5D6D7E` | 本文テキスト、補足情報 |
| Muted Gray | `#AAB7B8` | スコープ外テキスト、メタ情報、日付など |

### フォント

- **メインフォント**: Arial, sans-serif
- **タイトル**: 24-30pt, bold, `#1C2833`（白背景時）or `#FFFFFF`（ダークチェックリスト時）
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
- タイトルスライド: 右下に配置（`right: 30pt; bottom: 20pt; height: 22pt;`）
- ダークスライド（dark-checklist）: 右下に小さく配置（`right: 30pt; bottom: 20pt; height: 20pt; opacity: 0.7;`）

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
  - label: "はい（Gemini 3.1 Flash で生成）"
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

### Step 3.5: 画像生成（Gemini 3.1 Flash Image Preview）
**Step 1 でユーザーが「はい」と回答した場合のみ実行。**

Gemini 3.1 Flash Image Preview でスライド用画像を生成する。
`@google/genai` SDK + `GEMINI_API_KEY` で Google API に直接アクセス。

**手順**:
1. 各スライドの内容から画像生成プロンプトを作成（画像スロット定義を参照）
2. `scripts/generate-images-template.js` をベースに `/tmp/pptx-slides/generate-images.js` を生成
3. `~/.claude/.env` から `GEMINI_API_KEY` が読み込まれていることを確認（`echo $GEMINI_API_KEY` で検証）
4. スクリプトを実行して画像を `/tmp/pptx-slides/` に保存
5. HTMLスライドの `<img src="gen-{slug}.png">` が生成された画像を参照していることを確認

**画像スロット定義**（スライドタイプ別の推奨画像配置）:

| レイアウト | 画像タイプ | 配置 | 優先度 |
|-----------|-----------|------|--------|
| **title** | ヒーロー画像（抽象ビジュアル） | 右半分 or 背景 | 必須 |
| **card-3col** | 機能インフォグラフィック | ヘッダー下・全幅 | 推奨 |
| **flow-diagram** | プロセスフロー図 | 全面画像で置換 | 推奨 |
| **timeline** | ガントチャート/ロードマップ | 全面画像で置換 | 推奨 |
| **card-grid-2x2** | データビジュアライゼーション | 全面画像で置換 | 任意 |
| **two-column** | 比較チャート | 全面画像で置換 | 任意 |
| **dark-checklist** | 装飾的背景 | 右側アクセント | 任意 |
| **card-list** | なし | — | 不要 |

提案書1件あたり **5〜8枚** の画像生成を目安とする。

**プロンプト作成ガイド（ICSフレームワーク）**:

Gemini 3.1 Flash のプロンプトは **ICS = Image type + Content + Style** の3要素で構成する。
プロンプトは英語で記述する（品質が高い）。

**I - Image type**: 画像の種類を明確に指定
- title → "Abstract hero visual for a presentation title slide"
- card-3col → "Hub-and-spoke infographic with 3 feature columns"
- flow-diagram → "Horizontal step-by-step flow diagram with N stages"
- timeline → "Horizontal timeline with N phases, Gantt chart"
- card-grid-2x2（費用） → "Donut chart with labeled segments showing budget allocation"
- card-grid-2x2（効果） → "2x2 grid of mini charts (bar, line, pie, metric card)"
- two-column → "Side-by-side comparison chart with Before and After columns"

**C - Content**: スライドの全テキストデータを具体的に渡す
- タイトル、項目名、数値をすべてプロンプトに含める
- 「Layout:」セクションで要素の配置・接続関係を詳細に指示
- データがあれば正確な数値を渡す（例: "AI開発費 500万円"）

**S - Style**: 共通スタイルブロックを末尾に付与
```
Visual Style:
- Color palette: Dark Navy (#1C2833), Teal (#277884), Accent Red (#D32F2F), Light Gray (#FAFBFC), White (#FFFFFF).
- Modern, clean, professional flat design suitable for a corporate proposal presentation.
- Format: Landscape, 16:9 aspect ratio, 4K resolution.
- Typography: Clean sans-serif font. All text labels must be clearly legible.
- No watermarks, no stock photo elements, no decorative borders.
```

**重要なポイント**:
- Gemini 3.1 Flash はテキスト描画精度が向上 → ラベル・数値を積極的に含める（「テキストなし」は逆効果）
- 16:9・4K はプロンプトの Style ブロックで指定（SDK の `responseModalities: ['image', 'text']` で画像生成モードを有効化）
- 抽象的プロンプトは品質が低い → 具体的なデータと配置指示が必須
- コンサルファーム風スタイル参照が効果的（"similar to McKinsey presentations"）
- titleスライドのヒーロー画像のみ「No text, no labels」を指定（テキストはpptxgenjsで描画）

**プロンプトテンプレート例（flow-diagram）**:
```
Create a professional process flow diagram as a presentation slide.

Image type: Horizontal step-by-step flow diagram with 3 stages.

Content:
- Title: "システム構成"
- Process flow (left to right):
  Step 1: "データ収集" — アンケート, 出欠データ, 相談記録
  Step 2: "AI分析" — 感情分析, パターン検出, リスクスコア
  Step 3: "通知・対応" — アラート送信, 対応ガイド, フォローアップ

Layout:
- Title "システム構成" at the top center in bold text.
- 3 large rounded-rectangle boxes arranged horizontally from left to right.
- Each box is labeled with its step name.
- Inside or below each box, list the sub-items as small bullet points.
- Thick directional arrows (▶) connect each box to the next, colored in teal (#277884).
- Box headers use alternating colors: teal, navy, red.

Visual Style:
- Color palette: Dark Navy (#1C2833), Teal (#277884), Accent Red (#D32F2F), Light Gray (#FAFBFC).
- Modern, clean, professional flat design.
- Format: Landscape, 16:9 aspect ratio, 4K resolution.
- All text labels must be accurately rendered and clearly legible.
- Clean flowchart style, similar to McKinsey presentation diagrams.
```

### Step 3.8: HTMLレイアウト検証（必須）

HTMLスライド生成後、**ビルド前に必ず全スライドのレイアウトを検証する**。

**手順**:
1. Playwrightで各HTMLファイルを720x405のビューポートで開き、スクリーンショットを撮影
2. 各スクリーンショットを目視確認し、以下をチェック:
   - テキストが枠外にはみ出していないか
   - カード・要素が重なっていないか
   - 下端の余白が確保されているか（最低10pt）
   - フォントサイズが8pt未満になっていないか
3. 問題があれば **HTMLを修正してから** Step 4 に進む

**検証スクリプト（ビルドスクリプト内に組み込む）**:
```javascript
// HTMLスライドのスクリーンショット撮影
const { chromium } = require('playwright');
async function screenshotSlides(slideFiles, slideDir) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  for (const file of slideFiles) {
    const filePath = path.join(slideDir, file);
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(500);
    const screenshotPath = filePath.replace('.html', '.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    // オーバーフロー検知: bodyの実際の高さが405ptを超えていないか
    const overflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollHeight > body.clientHeight || body.scrollWidth > body.clientWidth;
    });
    if (overflow) {
      console.warn(`⚠️  OVERFLOW DETECTED: ${file}`);
    } else {
      console.log(`✅ ${file}`);
    }
  }
  await browser.close();
}
```

**重要**: この検証でオーバーフローが検出されたスライドは、コンテンツ量を減らすかフォントサイズを調整してから次に進む。`layouts.md` の各レイアウトに記載されたコンテンツ上限を遵守すること。

### Step 4: ビルドスクリプト生成
`scripts/build-pptx-template.js` をベースに、今回のスライドリストに合わせた `build-pptx.js` を `/tmp/pptx-slides/build-pptx.js` に生成する。

テーブルなどHTML/CSSで表現しにくい要素がある場合は、プレースホルダー (`class="placeholder"`) を使い、ビルドスクリプトで pptxgenjs API 経由で挿入する。

### Step 5: ビルド実行
```bash
cd /tmp/pptx-slides && npm init -y && npm install pptxgenjs playwright sharp && npx playwright install chromium && NODE_PATH=/tmp/pptx-slides/node_modules node build-pptx.js
```

画像生成を含む場合:
```bash
cd /tmp/pptx-slides && npm init -y && npm install pptxgenjs playwright sharp @google/genai && npx playwright install chromium && export GEMINI_API_KEY=$(grep GEMINI_API_KEY ~/.claude/.env | cut -d= -f2) && node generate-images.js && NODE_PATH=/tmp/pptx-slides/node_modules node build-pptx.js
```

### Step 6: PPTX検証（必須）

ビルド完了後、**生成されたPPTXの全スライドを画像化して目視確認する**。

**手順**:
1. python-pptxとPillowでPPTXの全スライドからテキスト抽出し、スライド数が正しいか確認
2. Read ツールでPPTXファイルを読み込み（PPTXを直接画像として閲覧可能）、全スライドを目視確認
3. 以下のチェックリストを**1スライドずつ**確認:

**チェックリスト（全スライド共通）**:
- [ ] テキストが枠外にはみ出していない
- [ ] カード・要素が重なっていない
- [ ] ヘッダーバーのタイトルとロゴが正しく表示されている
- [ ] サイドバー（赤）が左端に表示されている
- [ ] フォントサイズが小さすぎない（8pt以上）
- [ ] 下端に最低10ptの余白がある
- [ ] 色がデザインシステムに準拠している（Navy/Teal/Red/Gray）

**追加チェック（該当スライドのみ）**:
- [ ] テーブルのセルが正しく表示されている（費用スライド等）
- [ ] AI生成画像が正しい位置に挿入されている
- [ ] 費用条件の注記テキストが含まれている（費用条件・免責事項セクション参照）

### Step 6.5: 修正→再ビルドループ

Step 6 で問題が見つかった場合:

1. **問題のあるスライドのHTMLを特定** → 修正
2. **Step 3.8 を再実行** → スクリーンショットで修正を確認
3. **Step 5 を再実行** → PPTX再ビルド
4. **Step 6 を再実行** → 最終確認

**全スライドが問題なしになるまでこのループを繰り返す。**
レイアウト崩れを残したまま納品しないこと。

## 注意事項

### html2pptx の制約
- html2pptx は document-skills の pptx スキル内のスクリプト
- パス: `/Users/takahiromiyamoto/.claude/plugins/cache/anthropic-agent-skills/document-skills/*/skills/pptx/scripts/html2pptx.js`
- **注意**: ファイル名は `html2pptx.js`（拡張子 `.js` が必要）
- **注意**: キャッシュパスのハッシュ部分（`*`）はビルド時に `fs.readdirSync()` で解決すること
- **注意**: html2pptx.js は playwright と sharp に依存する。`/tmp/pptx-slides/node_modules` にインストールされているが、html2pptx.js のある別ディレクトリからは参照できないため、ビルド実行時に `NODE_PATH=/tmp/pptx-slides/node_modules` を指定すること
- テーブルは HTML では綺麗にレンダリングされないため、pptxgenjs の `addTable()` API を使用する

### Gemini 3.1 Flash（画像生成）
- **モデル**: `gemini-3.1-flash-image-preview`（Gemini 3.1 Flash Image Preview）
- **SDK**: `@google/genai`（npm install `@google/genai`）
- **APIキー管理**: `~/.claude/.env` に `GEMINI_API_KEY=your_key` を記載。Claude Codeのシェル環境で自動的に読み込まれる
- **レスポンス**: `response.candidates[0].content.parts` 内の `inlineData.data`（base64）を `Buffer.from(data, 'base64')` でファイル保存
- **テンプレート**: `scripts/generate-images-template.js`
- **プロンプト設計**: ICSフレームワーク（Image type + Content + Style）で構成。詳細は Step 3.5 参照
- **テキストレンダリング**: Gemini 3.1 Flash はテキスト描画精度が向上 → ラベル・数値を積極的に含める（「テキストなし」は非推奨）
- **プロンプト言語**: 英語で記述した方が画像品質が高い
- **画像枚数**: 提案書1件あたり5〜8枚を目安（画像スロット定義に基づく）
- 画像ファイルは `/tmp/pptx-slides/` に保存し、HTMLスライドから相対パスで参照

### 費用条件・免責事項（全提案書に必須記載）

費用スライドまたは「次のステップ」スライドに、以下の標準条件を注記として必ず記載すること。
費用テーブルがある場合はその下に、ない場合は最終スライドのフッター付近に記載する。

記載テンプレート（スライド内の注記テキスト）:
```
※ 表示金額はすべて税別です。
※ 開発費には納品後3ヶ月間の不具合修正を含みます。
※ 保守が発生する場合は別途お見積りとなります（開発費の10%/年 目安）。
※ ランニングコスト（インフラ利用料・API利用料等）は実費精算となります。
※ 開発着手後の仕様変更・追加要件は別途お見積りとなります。
※ AI機能の出力精度は100%を保証するものではありません。
```

**条件の詳細**:

| # | 項目 | 内容 | 備考 |
|---|------|------|------|
| 1 | 税別表記 | 見積金額はすべて税別 | 全提案書共通 |
| 2 | 不具合修正 | 納品後3ヶ月間は開発費に含む | 期間超過後は保守契約で対応 |
| 3 | 保守費用 | 別途見積（開発費の10%/年 目安） | 見積に含まれていないことを明示 |
| 4 | ランニングコスト | インフラ代・API利用料は実費精算 | Vercel, Supabase, OpenAI等 |
| 5 | 仕様変更 | 開発着手後の変更・追加は別途見積 | スコープクリープ防止 |
| 6 | AI精度免責 | AI出力精度は100%保証しない | AI系案件のみ（全案件該当想定） |

**注意事項**:
- 費用テーブルがある場合（例: URリンケージ様のような概算費用スライド）→ テーブル下に注記を配置
- 費用テーブルがない場合 → 「次のステップ」スライドの下部に小さめ（8-9pt, `#AAB7B8`）で配置
- AI機能を含まない案件の場合は項目6を省略してよい

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
