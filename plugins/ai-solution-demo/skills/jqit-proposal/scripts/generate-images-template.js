/**
 * JQIT提案書 画像生成スクリプト テンプレート
 *
 * Gemini 3.1 Flash Image Preview を使用して提案書スライド用の画像を生成する。
 * @google/genai SDK + GEMINI_API_KEY で Google API に直接アクセス。
 * ICSフレームワーク（Image type + Content + Style）でプロンプトを構成する。
 *
 * 使い方:
 *   1. このファイルを /tmp/pptx-slides/generate-images.js にコピー
 *   2. IMAGES 配列に生成したい画像のプロンプトを定義（ICSフレームワークで構成）
 *   3. GEMINI_API_KEY 環境変数を設定
 *   4. node generate-images.js で実行
 *
 * 前提:
 *   - npm install @google/genai 済み
 *   - 環境変数 GEMINI_API_KEY が設定されている
 *
 * プロンプト設計ガイド:
 *   - I (Image type): 画像の種類を具体的に指定（infographic, flow diagram, donut chart等）
 *   - C (Content): スライドの全テキストデータを構造的に渡す（タイトル、項目名、数値すべて）
 *   - S (Style): STYLE_BASE を末尾に付与（配色・フォーマット・解像度）
 *   - プロンプトは英語で記述（品質が高い）
 *   - テキストラベル・数値を積極的に含める（Gemini 3.1 Flashのテキスト描画精度が向上）
 *   - 抽象的な指示は避け、具体的なデータと配置指示を書く
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// ============================================================
// 設定: 提案書ごとに書き換えるセクション
// ============================================================

const OUTPUT_DIR = '/tmp/pptx-slides';

// Gemini 3.1 Flash Image Preview（旧 nano-banana-pro-preview からアップグレード）
const MODEL = 'gemini-3.1-flash-image-preview';

// JQITブランドカラー
const BRAND = {
  navy: '#1C2833',
  teal: '#277884',
  jqitRed: '#D32F2F',
  lightGray: '#FAFBFC',
};

// 共通スタイルブロック（全プロンプトの末尾に付与）
const STYLE_BASE = `
Visual Style:
- Color palette: Dark Navy (${BRAND.navy}), Teal (${BRAND.teal}), Accent Red (${BRAND.jqitRed}), Light Gray (${BRAND.lightGray}), White (#FFFFFF).
- Modern, clean, professional flat design suitable for a corporate proposal presentation.
- Format: Landscape, 16:9 aspect ratio, 4K resolution.
- Typography: Clean sans-serif font. All text labels must be clearly legible.
- No watermarks, no stock photo elements, no decorative borders.`;

// 生成する画像リスト（ICSフレームワークで構成）
const IMAGES = [
  // ---- 例1: 表紙ヒーロー画像（テキストなし・抽象ビジュアル） ----
  // {
  //   filename: 'gen-hero.png',
  //   prompt: `Create a professional business proposal cover image.
  //
  // Image type: Abstract hero visual for a presentation title slide.
  //
  // Content:
  // - Theme: "AIによる業務改善提案"
  // - This is a technology/business proposal, so the visual should convey innovation, trust, and professionalism.
  //
  // Layout:
  // - The image will be placed on the RIGHT HALF of a dark navy (${BRAND.navy}) slide.
  // - Design the composition so the main visual interest is centered or slightly right.
  // - Leave the left 20% relatively clean (it will be covered by text overlay).
  // - Use abstract geometric shapes, flowing lines, or subtle tech-themed elements.
  // - Incorporate teal (${BRAND.teal}) glowing accents and red (${BRAND.jqitRed}) highlights sparingly.
  //
  // ${STYLE_BASE}
  // - No text, no labels, no typography — this is a background hero image only.
  // - Mood: Sophisticated, forward-looking, high-tech.`,
  // },

  // ---- 例2: 3カラム機能紹介インフォグラフィック ----
  // {
  //   filename: 'gen-features.png',
  //   prompt: `Create a professional infographic slide showing a 3-column feature overview.
  //
  // Image type: Hub-and-spoke infographic with 3 feature columns.
  //
  // Content:
  // - Title: "主要機能"
  // - Three feature areas:
  //   Column 1: "データ収集" — アンケート分析, ログ連携, API連携
  //   Column 2: "AI分析" — 感情分析, パターン検出, リスクスコア算出
  //   Column 3: "レポート" — ダッシュボード, 自動レポート, アラート通知
  //
  // Layout:
  // - Title "主要機能" at the top center in bold white text on a navy (${BRAND.navy}) banner.
  // - Three equal-width columns arranged horizontally below the title.
  // - Each column has: a distinctive icon at the top, the feature name as a bold label, and 3 bullet points listed below.
  // - Columns are separated by thin vertical dividers or subtle spacing.
  // - Each column header uses teal (${BRAND.teal}) color. Bullet text in dark gray.
  //
  // ${STYLE_BASE}
  // - All text labels must be accurately rendered and clearly legible.
  // - Icons should be simple, flat-style, and relevant to each feature's theme.`,
  // },

  // ---- 例3: フロー図 ----
  // {
  //   filename: 'gen-flow.png',
  //   prompt: `Create a professional process flow diagram as a presentation slide.
  //
  // Image type: Horizontal step-by-step flow diagram with 3 stages.
  //
  // Content:
  // - Title: "システム構成"
  // - Process flow (left to right):
  //   Step 1: "データ収集" — アンケート, 出欠データ, 相談記録
  //   Step 2: "AI分析" — 感情分析, パターン検出, リスクスコア
  //   Step 3: "通知・対応" — アラート送信, 対応ガイド, フォローアップ
  //
  // Layout:
  // - Title at the top center in bold text.
  // - 3 large rounded-rectangle boxes arranged horizontally from left to right.
  // - Each box labeled with its step name: "データ収集", "AI分析", "通知・対応".
  // - Inside or below each box, list the sub-items as small bullet points.
  // - Thick directional arrows (▶) connect each box to the next, colored in teal (${BRAND.teal}).
  // - Box headers use alternating colors: teal (${BRAND.teal}), navy (${BRAND.navy}), red (${BRAND.jqitRed}).
  //
  // ${STYLE_BASE}
  // - All text labels must be accurately rendered and clearly legible.
  // - Clean flowchart style, similar to McKinsey or consulting firm presentation diagrams.`,
  // },

  // ---- 例4: ドーナツチャート（費用内訳） ----
  // {
  //   filename: 'gen-cost.png',
  //   prompt: `Create a professional cost breakdown chart as a presentation slide.
  //
  // Image type: Donut chart (ring chart) with labeled segments showing budget allocation.
  //
  // Content:
  // - Title: "概算費用"
  // - Budget breakdown:
  //   Segment 1: "人件費" = 120万円
  //   Segment 2: "システム構築" = 90万円
  //   Segment 3: "データ準備" = 50万円
  //   Segment 4: "運用支援" = 40万円
  //
  // Layout:
  // - Title "概算費用" at the top center in bold text.
  // - Large donut chart centered in the slide.
  // - Each segment is a different color: Teal (${BRAND.teal}), Navy (${BRAND.navy}), Red (${BRAND.jqitRed}), Gray (#5D6D7E).
  // - Each segment has a label line pointing outward with the category name and amount.
  // - The center of the donut displays the total sum "総額: 300万円".
  //
  // ${STYLE_BASE}
  // - All amounts and labels must be accurately rendered with correct numbers.
  // - Clean data visualization style, similar to corporate financial presentations.`,
  // },

  // ---- 例5: タイムライン / ガントチャート ----
  // {
  //   filename: 'gen-timeline.png',
  //   prompt: `Create a professional project timeline / Gantt chart as a presentation slide.
  //
  // Image type: Horizontal timeline with 3 phases, each containing task cards.
  //
  // Content:
  // - Title: "導入スケジュール"
  // - Phases:
  //   Phase 1: 1ヶ月目 (準備) — 要件定義, 設計
  //   Phase 2: 2-3ヶ月目 (開発) — 実装, テスト
  //   Phase 3: 4-6ヶ月目 (運用) — パイロット運用, 評価・改善
  //
  // Layout:
  // - Title at the top center.
  // - 3 horizontal rows, one per phase.
  // - Left side: colored phase label boxes.
  //   Phase colors: Teal (${BRAND.teal}), Navy (${BRAND.navy}), Red (${BRAND.jqitRed}).
  // - Right side: task cards arranged horizontally within each phase.
  // - A horizontal timeline axis runs across the top showing time progression.
  //
  // ${STYLE_BASE}
  // - All phase names, task labels must be clearly legible.
  // - Gantt chart / roadmap style similar to project management presentations.`,
  // },

  // ---- 例6: 2x2データビジュアライゼーション ----
  // {
  //   filename: 'gen-data-viz.png',
  //   prompt: `Create a professional data visualization slide with a 2x2 grid of charts.
  //
  // Image type: 2x2 grid of mini charts (bar, line, pie, metric card).
  //
  // Content:
  // - Title: "導入効果"
  // - Top-left: Bar chart — "業務効率" showing 30% improvement
  // - Top-right: Line chart — "コスト削減" showing downward trend over 6 months
  // - Bottom-left: Pie chart — "利用率" showing 85% adoption
  // - Bottom-right: Metric card — "ROI" showing "2.5x" in large text
  //
  // Layout:
  // - Title at the top center.
  // - 2x2 grid of equal-sized chart panels.
  // - Each panel has a subtle border and its own sub-title.
  //
  // ${STYLE_BASE}
  // - All numbers and labels must be accurately rendered.
  // - Dashboard-style layout similar to business intelligence reports.`,
  // },

  // ---- 例7: 比較チャート（2カラム） ----
  // {
  //   filename: 'gen-comparison.png',
  //   prompt: `Create a professional before/after comparison chart as a presentation slide.
  //
  // Image type: Side-by-side comparison chart with "Before" and "After" columns.
  //
  // Content:
  // - Title: "導入前後の比較"
  // - Before (left): "現状" — 手動作業80%, エラー率15%, 処理時間3日
  // - After (right): "導入後" — 自動化90%, エラー率2%, 処理時間2時間
  //
  // Layout:
  // - Title at the top center.
  // - Two large columns side by side.
  // - Left column has a muted/gray tone, right column has a teal/positive tone.
  // - Each metric is shown as a horizontal bar or large number with label.
  // - Arrows or indicators showing the improvement between before and after.
  //
  // ${STYLE_BASE}
  // - All numbers must be accurately rendered.
  // - Clean comparison style, similar to consulting firm presentations.`,
  // },
];

// ============================================================
// 画像生成処理（通常は変更不要）
// ============================================================

async function generateImage(ai, prompt, outputPath) {
  console.log(`  生成中: ${path.basename(outputPath)}...`);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ['image', 'text'],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync(outputPath, buffer);
      console.log(`  保存: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return;
    }
  }

  console.warn(`  警告: ${path.basename(outputPath)} の画像データが返されませんでした`);
}

async function main() {
  // APIキー確認
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('エラー: 環境変数 GEMINI_API_KEY が設定されていません。');
    console.error('設定方法: export GEMINI_API_KEY=your_key_here');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  // 出力ディレクトリ確認
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (IMAGES.length === 0) {
    console.log('生成する画像がありません。IMAGES 配列にエントリを追加してください。');
    return;
  }

  console.log(`${IMAGES.length} 枚の画像を生成します（モデル: ${MODEL}）...\n`);

  for (const img of IMAGES) {
    const outputPath = path.join(OUTPUT_DIR, img.filename);
    try {
      await generateImage(ai, img.prompt, outputPath);
    } catch (err) {
      console.error(`  エラー（${img.filename}）: ${err.message}`);
    }
  }

  console.log('\n完了!');
}

main().catch(console.error);
