/**
 * JQIT提案書 画像生成スクリプト テンプレート
 *
 * Nano Banana Pro を使用して提案書スライド用の画像を生成する。
 *
 * 使い方:
 *   1. このファイルを /tmp/pptx-slides/generate-images.js にコピー
 *   2. IMAGES 配列に生成したい画像のプロンプトを定義
 *   3. GEMINI_API_KEY 環境変数を設定
 *   4. node generate-images.js で実行
 *
 * 前提:
 *   - npm install @google/genai 済み
 *   - 環境変数 GEMINI_API_KEY が設定されている
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// ============================================================
// 設定: 提案書ごとに書き換えるセクション
// ============================================================

const OUTPUT_DIR = '/tmp/pptx-slides';

// JQITブランドカラー（プロンプトに含めるための定数）
const BRAND = {
  navy: '#1C2833',
  teal: '#277884',
  jqitRed: '#D32F2F',
  lightGray: '#FAFBFC',
};

// 生成する画像リスト
const IMAGES = [
  // {
  //   filename: 'gen-solution-diagram.png',
  //   prompt: `AIシステムのアーキテクチャ図のプロフェッショナルなフラットイラストを作成してください。
  //     配色: ダークネイビー (${BRAND.navy}) 背景、ティール (${BRAND.teal}) のアクセント要素、JQIT赤 (${BRAND.jqitRed}) のハイライト。
  //     ビジネスプレゼンテーション向けのクリーンでミニマルなスタイル。
  //     横長フォーマット、16:9 アスペクト比。
  //     テキスト・ラベル・透かしなし。`,
  // },
  // {
  //   filename: 'gen-hero-image.png',
  //   prompt: `AI技術を活用した教育テクノロジーを表現する抽象的でプロフェッショナルなイラストを作成してください。
  //     配色: ネイビーブルー (${BRAND.navy})、ティールグリーン (${BRAND.teal})、JQIT赤 (${BRAND.jqitRed})。
  //     モダンなフラットデザイン、プレゼンテーションのタイトルスライドに適したスタイル。
  //     横長フォーマット、16:9 アスペクト比。
  //     テキスト・ラベル・透かしなし。`,
  // },
];

// ============================================================
// 画像生成処理（通常は変更不要）
// ============================================================

async function generateImage(ai, prompt, outputPath) {
  console.log(`  生成中: ${path.basename(outputPath)}...`);

  const response = await ai.models.generateContent({
    model: 'nano-banana-pro-preview',
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

  console.log(`${IMAGES.length} 枚の画像を生成します...\n`);

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
