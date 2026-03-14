/**
 * JQIT提案書 PPTX ビルドスクリプト テンプレート
 *
 * 使い方:
 *   1. このファイルを /tmp/pptx-slides/build-pptx.js にコピー
 *   2. SLIDES 配列を今回のスライドリストに合わせて編集
 *   3. テーブルなどの手動追加セクションを必要に応じて追加
 *   4. node build-pptx.js で実行
 *
 * 前提:
 *   - /tmp/pptx-slides/ に各スライドのHTMLファイルが配置済み
 *   - npm install pptxgenjs 済み
 */

const pptxgen = require('pptxgenjs');
const path = require('path');
const { globSync } = require('path').constructor === String ? require('glob') : { globSync: require('fs').globSync || (() => { throw new Error('glob not available'); }) };

// html2pptx のパスを動的に解決
function resolveHtml2pptx() {
  const fs = require('fs');
  const baseDir = '/Users/takahiromiyamoto/.claude/plugins/cache/anthropic-agent-skills/document-skills';
  const entries = fs.readdirSync(baseDir);
  for (const entry of entries) {
    const candidate = path.join(baseDir, entry, 'skills/pptx/scripts/html2pptx');
    try {
      require.resolve(candidate);
      return require(candidate);
    } catch {
      // try next
    }
  }
  throw new Error('html2pptx not found in document-skills cache');
}

const html2pptx = resolveHtml2pptx();

// ============================================================
// 設定: 提案書ごとに書き換えるセクション
// ============================================================

const CONFIG = {
  title: '提案書タイトル',       // PPTXメタデータ
  author: 'JQIT',
  company: 'JQIT',
  outputPath: '/tmp/proposal.pptx',  // 出力先
};

// スライドリスト（ファイル名を順番に列挙）
const SLIDES = [
  'slide01-title.html',
  'slide02-summary.html',
  'slide03-content.html',
  // ... 必要なスライドを追加
];

// スライドディレクトリ
const SLIDE_DIR = '/tmp/pptx-slides';

// ============================================================
// テーブル手動追加セクション
// スライドファイル名をキーにして、テーブルデータを定義
// ============================================================

const TABLE_INSERTS = {
  // 例: 費用テーブルを挿入する場合
  // 'slide11-cost.html': {
  //   colW: [2.2, 1.2, 3.5],
  //   border: { pt: 0.5, color: 'D8DFE8' },
  //   rows: [
  //     // ヘッダー行
  //     [
  //       { text: '項目', options: { fill: { color: '1B365D' }, color: 'FFFFFF', bold: true, fontSize: 10, align: 'center' } },
  //       { text: '金額', options: { fill: { color: '1B365D' }, color: 'FFFFFF', bold: true, fontSize: 10, align: 'center' } },
  //       { text: '備考', options: { fill: { color: '1B365D' }, color: 'FFFFFF', bold: true, fontSize: 10, align: 'center' } },
  //     ],
  //     // データ行
  //     [
  //       { text: 'テキスト整形機能', options: { fontSize: 9, color: '1B365D' } },
  //       { text: '2.5万円', options: { fontSize: 9, color: '1B365D', align: 'right' } },
  //       { text: 'LLM整形API追加', options: { fontSize: 8, color: '5A6A7A' } },
  //     ],
  //     // ... 追加行
  //     // 合計行
  //     [
  //       { text: '合計', options: { fontSize: 10, color: '1B365D', bold: true, fill: { color: 'F0F3F7' } } },
  //       { text: '50万円（税別）', options: { fontSize: 10, color: '2E5C8A', bold: true, align: 'right', fill: { color: 'F0F3F7' } } },
  //       { text: '', options: { fill: { color: 'F0F3F7' } } },
  //     ],
  //   ],
  // },
};

// ============================================================
// ビルド処理（通常は変更不要）
// ============================================================

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = CONFIG.author;
  pptx.company = CONFIG.company;
  pptx.title = CONFIG.title;

  for (const file of SLIDES) {
    console.log(`Processing ${file}...`);
    const result = await html2pptx(path.join(SLIDE_DIR, file), pptx);

    // テーブル手動挿入チェック
    if (TABLE_INSERTS[file] && result.placeholders.length > 0) {
      const p = result.placeholders[0];
      const tableConfig = TABLE_INSERTS[file];

      result.slide.addTable(tableConfig.rows, {
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        colW: tableConfig.colW,
        border: tableConfig.border || { pt: 0.5, color: 'D8DFE8' },
        valign: 'middle',
      });
    }
  }

  await pptx.writeFile({ fileName: CONFIG.outputPath });
  console.log(`Presentation saved to ${CONFIG.outputPath}`);
}

build().catch(console.error);
