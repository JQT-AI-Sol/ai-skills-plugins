/**
 * AI画像生成スクリプト テンプレート
 *
 * Gemini 3.1 Flash Image Preview (NanoBanana Pro 2) を使用して画像を生成する。
 * @google/genai SDK + GEMINI_API_KEY で Google API に直接アクセス。
 * PICSLフレームワーク（Purpose + Image type + Content + Style + Layout）でプロンプトを構成する。
 *
 * 使い方:
 *   1. このファイルを /tmp/generated-images/generate-images.js にコピー
 *   2. COLORS をプロジェクトのカラーパレットに変更
 *   3. IMAGES 配列に生成したい画像のプロンプトを定義（PICSLフレームワークで構成）
 *   4. GEMINI_API_KEY 環境変数を設定
 *   5. node generate-images.js で実行
 *
 * 前提:
 *   - npm install @google/genai 済み
 *   - 環境変数 GEMINI_API_KEY が設定されている
 *
 * プロンプト設計ガイド（PICSLフレームワーク）:
 *   - P (Purpose): 画像の用途・対象を1文で明記
 *   - I (Image type): 画像の種類を具体的に指定（infographic, flow diagram, donut chart等）
 *   - C (Content): テキストデータを構造的に渡す（タイトル、項目名、数値すべて）
 *   - S (Style): STYLE_BASE を末尾に付与（配色・フォーマット・解像度）
 *   - L (Layout): 要素の配置・接続関係を詳細に指示
 *   - プロンプトは英語で記述（品質が高い）
 *   - テキストラベル・数値を積極的に含める（Gemini 3.1 Flashのテキスト描画精度が向上）
 *   - 抽象的な指示は避け、具体的なデータと配置指示を書く
 *
 * テンプレート参照: references/prompt-templates.md
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// ============================================================
// 設定: プロジェクトごとに書き換えるセクション
// ============================================================

const OUTPUT_DIR = '/tmp/generated-images';

// Gemini 3.1 Flash Image Preview（環境変数でオーバーライド可能）
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-image-preview';

// プロジェクトカラー定義（ここをプロジェクトに合わせて変更）
// 例: Corporate Navy パレット
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

// 生成する画像リスト（PICSLフレームワークで構成）
const IMAGES = [
  // ---- 例1: ヒーロー画像（表紙・バナー用） ----
  // {
  //   filename: 'gen-hero.png',
  //   prompt: `Create a professional business cover image.
  //
  // Purpose: Cover image for a corporate proposal presentation.
  //
  // Image type: Abstract hero visual for a presentation title slide.
  //
  // Content:
  // - Theme: "AIによる業務改善提案"
  // - This is a technology/business proposal, so the visual should convey innovation, trust, and professionalism.
  //
  // Layout:
  // - Design the composition so the main visual interest is centered or slightly right.
  // - Leave the left 20% relatively clean (it will be covered by text overlay).
  // - Use abstract geometric shapes, flowing lines, or subtle tech-themed elements.
  // - Incorporate secondary color (${COLORS.secondary}) glowing accents and accent color (${COLORS.accent}) highlights sparingly.
  //
  // ${STYLE_BASE}
  // - No text, no labels, no typography — this is a background hero image only.
  // - Mood: Sophisticated, forward-looking, high-tech.`,
  // },

  // ---- 例2: フロー図（プロセスダイアグラム） ----
  // {
  //   filename: 'gen-flow.png',
  //   prompt: `Create a professional process flow diagram as a presentation slide.
  //
  // Purpose: Illustrate the system architecture for a client proposal.
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
  // - Title "システム構成" at the top center in bold text.
  // - 3 large rounded-rectangle boxes arranged horizontally from left to right.
  // - Each box labeled with its step name.
  // - Inside or below each box, list the sub-items as small bullet points.
  // - Thick directional arrows connect each box to the next, colored in secondary (${COLORS.secondary}).
  // - Box headers use alternating colors: secondary (${COLORS.secondary}), primary (${COLORS.primary}), accent (${COLORS.accent}).
  //
  // ${STYLE_BASE}
  // - All text labels must be accurately rendered and clearly legible.
  // - Clean flowchart style, similar to McKinsey or consulting firm presentation diagrams.`,
  // },

  // ---- 例3: ドーナツチャート（費用内訳） ----
  // {
  //   filename: 'gen-cost.png',
  //   prompt: `Create a professional cost breakdown chart as a presentation slide.
  //
  // Purpose: Show budget allocation for the proposed project.
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
  // - Each segment is a different color: Secondary (${COLORS.secondary}), Primary (${COLORS.primary}), Accent (${COLORS.accent}), Muted (${COLORS.muted}).
  // - Each segment has a label line pointing outward with the category name and amount.
  // - The center of the donut displays the total sum "総額: 300万円".
  //
  // ${STYLE_BASE}
  // - All amounts and labels must be accurately rendered with correct numbers.
  // - Clean data visualization style, similar to corporate financial presentations.`,
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
    console.error('（~/.claude/.env に GEMINI_API_KEY=your_key を記載すると自動読み込み）');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  // 出力ディレクトリ確認
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (IMAGES.length === 0) {
    console.log('生成する画像がありません。IMAGES 配列にエントリを追加してください。');
    console.log('PICSLフレームワーク（Purpose + Image type + Content + Style + Layout）でプロンプトを構成してください。');
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
