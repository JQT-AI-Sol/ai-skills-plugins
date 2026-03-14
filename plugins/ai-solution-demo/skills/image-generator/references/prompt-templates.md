# 用途別プロンプトテンプレート集

PICSLフレームワークに基づく汎用テンプレート。
`{{変数}}` 部分をプロジェクト固有の内容に置き換えて使用する。
カラーコードは `COLORS` 定数から参照（`${COLORS.primary}` 等）。

---

## 1. ヒーロー画像（表紙・バナー用）

テキストなしの抽象ビジュアル。テキストは別途オーバーレイする前提。

```
Create a professional business cover image.

Purpose: {{用途（例: Cover image for a corporate proposal presentation）}}.

Image type: Abstract hero visual for a presentation title slide.

Content:
- Theme: "{{テーマ（例: AIによる業務改善提案）}}"
- This is a {{分野}} proposal, so the visual should convey {{印象（例: innovation, trust, and professionalism）}}.

Layout:
- Design the composition so the main visual interest is centered or slightly right.
- Leave the left 20% relatively clean (it will be covered by text overlay).
- Use abstract geometric shapes, flowing lines, or subtle tech-themed elements.
- Incorporate secondary color (${COLORS.secondary}) glowing accents and accent color (${COLORS.accent}) highlights sparingly.

${STYLE_BASE}
- No text, no labels, no typography — this is a background hero image only.
- Mood: Sophisticated, forward-looking, high-tech.
```

---

## 2. フロー図 / プロセスダイアグラム

ステップバイステップのプロセスを視覚化する。

```
Create a professional process flow diagram as a presentation slide.

Purpose: {{用途（例: Illustrate the system architecture for a client proposal）}}.

Image type: Horizontal step-by-step flow diagram with {{N}} stages.

Content:
- Title: "{{タイトル}}"
- Process flow (left to right):
  Step 1: "{{ステップ1名}}" — {{サブ項目1}}, {{サブ項目2}}, {{サブ項目3}}
  Step 2: "{{ステップ2名}}" — {{サブ項目1}}, {{サブ項目2}}, {{サブ項目3}}
  Step 3: "{{ステップ3名}}" — {{サブ項目1}}, {{サブ項目2}}, {{サブ項目3}}

Layout:
- Title "{{タイトル}}" at the top center in bold text.
- {{N}} large rounded-rectangle boxes arranged horizontally from left to right.
- Each box labeled with its step name.
- Inside or below each box, list the sub-items as small bullet points.
- Thick directional arrows connect each box to the next, colored in secondary (${COLORS.secondary}).
- Box headers use alternating colors: secondary (${COLORS.secondary}), primary (${COLORS.primary}), accent (${COLORS.accent}).

${STYLE_BASE}
- All text labels must be accurately rendered and clearly legible.
- Clean flowchart style, similar to McKinsey or consulting firm presentation diagrams.
```

---

## 3. インフォグラフィック（3カラム）

3つの機能・ポイントを並列で紹介する。

```
Create a professional infographic slide showing a 3-column feature overview.

Purpose: {{用途（例: Present three key features of the proposed solution）}}.

Image type: Hub-and-spoke infographic with 3 feature columns.

Content:
- Title: "{{タイトル}}"
- Three feature areas:
  Column 1: "{{カラム1名}}" — {{項目1}}, {{項目2}}, {{項目3}}
  Column 2: "{{カラム2名}}" — {{項目1}}, {{項目2}}, {{項目3}}
  Column 3: "{{カラム3名}}" — {{項目1}}, {{項目2}}, {{項目3}}

Layout:
- Title "{{タイトル}}" at the top center in bold white text on a primary (${COLORS.primary}) banner.
- Three equal-width columns arranged horizontally below the title.
- Each column has: a distinctive icon at the top, the feature name as a bold label, and 3 bullet points listed below.
- Columns are separated by thin vertical dividers or subtle spacing.
- Each column header uses secondary (${COLORS.secondary}) color. Bullet text in dark gray.

${STYLE_BASE}
- All text labels must be accurately rendered and clearly legible.
- Icons should be simple, flat-style, and relevant to each feature's theme.
```

---

## 4. ドーナツチャート（費用内訳・比率）

予算や比率の内訳を視覚化する。

```
Create a professional cost breakdown chart as a presentation slide.

Purpose: {{用途（例: Show budget allocation for the proposed project）}}.

Image type: Donut chart (ring chart) with labeled segments showing {{内容（例: budget allocation）}}.

Content:
- Title: "{{タイトル}}"
- Breakdown:
  Segment 1: "{{セグメント1}}" = {{値1}}
  Segment 2: "{{セグメント2}}" = {{値2}}
  Segment 3: "{{セグメント3}}" = {{値3}}
  Segment 4: "{{セグメント4}}" = {{値4}}

Layout:
- Title "{{タイトル}}" at the top center in bold text.
- Large donut chart centered in the slide.
- Each segment is a different color: Secondary (${COLORS.secondary}), Primary (${COLORS.primary}), Accent (${COLORS.accent}), Muted (${COLORS.muted}).
- Each segment has a label line pointing outward with the category name and amount.
- The center of the donut displays the total sum "{{合計表示}}".

${STYLE_BASE}
- All amounts and labels must be accurately rendered with correct numbers.
- Clean data visualization style, similar to corporate financial presentations.
```

---

## 5. 2x2 データビジュアライゼーション

4つのKPI・効果指標をダッシュボード風に表示する。

```
Create a professional data visualization slide with a 2x2 grid of charts.

Purpose: {{用途（例: Demonstrate the ROI of the proposed solution）}}.

Image type: 2x2 grid of mini charts (bar, line, pie, metric card).

Content:
- Title: "{{タイトル}}"
- Top-left: {{チャート種別}} — "{{ラベル1}}" showing {{値1}}
- Top-right: {{チャート種別}} — "{{ラベル2}}" showing {{値2}}
- Bottom-left: {{チャート種別}} — "{{ラベル3}}" showing {{値3}}
- Bottom-right: {{チャート種別}} — "{{ラベル4}}" showing {{値4}}

Layout:
- Title at the top center.
- 2x2 grid of equal-sized chart panels.
- Each panel has a subtle border and its own sub-title.

${STYLE_BASE}
- All numbers and labels must be accurately rendered.
- Dashboard-style layout similar to business intelligence reports.
```

---

## 6. タイムライン / ロードマップ

プロジェクトスケジュールやフェーズを時系列で表示する。

```
Create a professional project timeline as a presentation slide.

Purpose: {{用途（例: Present the implementation roadmap for stakeholder approval）}}.

Image type: Horizontal timeline with {{N}} phases, each containing task cards.

Content:
- Title: "{{タイトル}}"
- Phases:
  Phase 1: {{期間1}} ({{フェーズ名1}}) — {{タスク1}}, {{タスク2}}
  Phase 2: {{期間2}} ({{フェーズ名2}}) — {{タスク1}}, {{タスク2}}
  Phase 3: {{期間3}} ({{フェーズ名3}}) — {{タスク1}}, {{タスク2}}

Layout:
- Title at the top center.
- {{N}} horizontal rows, one per phase.
- Left side: colored phase label boxes.
  Phase colors: Secondary (${COLORS.secondary}), Primary (${COLORS.primary}), Accent (${COLORS.accent}).
- Right side: task cards arranged horizontally within each phase.
- A horizontal timeline axis runs across the top showing time progression.

${STYLE_BASE}
- All phase names, task labels must be clearly legible.
- Gantt chart / roadmap style similar to project management presentations.
```

---

## 7. Before/After 比較

導入前後や改善効果を左右対比で表示する。

```
Create a professional before/after comparison chart as a presentation slide.

Purpose: {{用途（例: Highlight the improvements after implementing the solution）}}.

Image type: Side-by-side comparison chart with "Before" and "After" columns.

Content:
- Title: "{{タイトル}}"
- Before (left): "{{左ラベル}}" — {{指標1}}, {{指標2}}, {{指標3}}
- After (right): "{{右ラベル}}" — {{指標1}}, {{指標2}}, {{指標3}}

Layout:
- Title at the top center.
- Two large columns side by side.
- Left column has a muted/gray tone, right column has a secondary/positive tone.
- Each metric is shown as a horizontal bar or large number with label.
- Arrows or indicators showing the improvement between before and after.

${STYLE_BASE}
- All numbers must be accurately rendered.
- Clean comparison style, similar to consulting firm presentations.
```

---

## 8. 写真風ビジュアル（ブログ・記事用）

ブログやWebメディア用のフォトリアルな画像。

```
Create a photorealistic editorial-style photograph.

Purpose: {{用途（例: Header image for a blog article about remote work productivity）}}.

Image type: Photorealistic editorial photograph, high-quality stock photo style.

Content:
- Scene: {{シーン描写（例: A modern open-plan office with diverse professionals collaborating around a large digital display showing data visualizations）}}
- Mood: {{ムード（例: Collaborative, innovative, bright and welcoming）}}
- Key elements: {{含めたい要素（例: laptops, whiteboards, natural light, greenery）}}

Layout:
- {{構図指示（例: Wide-angle shot from slightly above, main subjects in the center-right third）}}
- {{被写界深度（例: Shallow depth of field with the digital display in sharp focus）}}
- {{照明（例: Warm natural light from large windows on the left, supplemented by soft overhead lighting）}}

Visual Style:
- Photorealistic, editorial quality, suitable for a professional publication.
- Color temperature: {{色温度（例: Warm, natural）}}.
- Format: Landscape, 16:9 aspect ratio, 4K resolution.
- No watermarks, no stock photo logos.
- Modern, aspirational feel without being staged or artificial.
```

---

## プロンプト組み立てのチェックリスト

各プロンプトを書く前に以下を確認:

- [ ] **Purpose**: 用途を1文で明記したか
- [ ] **Image type**: 具体的な画像種別を指定したか（抽象的でないか）
- [ ] **Content**: テキスト・数値をすべて含めたか（ヒーロー画像を除く）
- [ ] **Style**: `STYLE_BASE` を付与したか、HEXカラーコードを指定したか
- [ ] **Layout**: 要素の配置・接続関係を詳細に記述したか
- [ ] **英語**: プロンプト本文は英語で記述したか（日本語コンテンツはそのまま）
- [ ] **解像度**: `16:9 aspect ratio, 4K resolution` を含めたか
