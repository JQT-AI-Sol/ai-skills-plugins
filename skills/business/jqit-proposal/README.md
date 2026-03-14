# JQIT Proposal Generator — Claude Code Skill

JQIT ブランドの提案書 PPTX を自動生成する Claude Code スキル。

白ヘッダー + JQIT赤サイドバー + ティールアクセントの統一デザインで、対話的に提案書スライドを作成します。

## 特徴

- **8種類のレイアウトテンプレート** — title / card-list / card-grid-2x2 / card-3col / flow-diagram / dark-checklist / two-column / timeline
- **JQITデザインシステム** — Navy / Teal / JQIT Red / Light Gray の6色パレットで統一
- **AI画像生成対応** — Gemini 3.1 Flash（`@google/genai` SDK）によるスライド用画像の自動生成（オプション）
- **pptxgenjs ベース** — HTML テンプレートから PPTX を生成

## インストール

```bash
# ユーザーレベル（全プロジェクトで使える）
git clone https://github.com/JQT-AI-Sol/claude-skill-jqit-proposal.git \
  ~/.claude/skills/jqit-proposal

# プロジェクトレベル（チーム共有）
git clone https://github.com/JQT-AI-Sol/claude-skill-jqit-proposal.git \
  .claude/skills/jqit-proposal
```

## 前提条件

- [Claude Code](https://claude.com/claude-code)
- Node.js（pptxgenjs 実行用）
- [document-skills](https://github.com/anthropics/skills) の pptx スキル（html2pptx 依存）
- Gemini API キー（AI画像生成を使う場合のみ）

## 使い方

Claude Code で以下のように呼び出します:

```
提案書を作って
タイトル: AI議事録システムのご提案
スライド: 表紙、課題、ソリューション、機能詳細、スケジュール、費用、次のステップ
```

### ワークフロー

1. **要件ヒアリング** — タイトル・構成・画像生成の要否を確認
2. **レイアウト選択** — 各スライドに最適なテンプレートを選択
3. **HTMLスライド生成** — テンプレートにコンテンツを流し込み
4. **画像生成**（オプション）— Gemini 3.1 Flash でスライド用画像を生成（5〜8枚）
5. **PPTX ビルド** — pptxgenjs + html2pptx で PPTX 出力
6. **検証** — 全スライドの表示を確認

## デザインシステム

### カラーパレット

| 名前 | HEX | 用途 |
|------|-----|------|
| Navy | `#1C2833` | ダーク背景、テキスト主色 |
| Teal | `#277884` | カードボーダー、ラベル |
| JQIT Red | `#D32F2F` | サイドバー、強調、CTA |
| Light Gray | `#FAFBFC` | ライト背景 |
| Mid Gray | `#5D6D7E` | 本文テキスト |
| Muted Gray | `#AAB7B8` | 補足情報 |

### レイアウト一覧

| レイアウト | 用途 |
|-----------|------|
| `title` | 表紙・中扉 |
| `card-list` | サマリー・会社紹介 |
| `card-grid-2x2` | 4項目の並列比較 |
| `card-3col` | 3機能の説明 |
| `flow-diagram` | システム構成・プロセス |
| `dark-checklist` | デモ紹介・次のステップ |
| `two-column` | スコープ内外・Before/After |
| `timeline` | スケジュール・ロードマップ |

## ファイル構成

```
.
├── README.md
├── SKILL.md                              # スキル本体（PPTX生成ワークフロー）
├── assets/
│   └── logo.png                          # JQITロゴ
├── docs/
│   ├── proposal-workflow.md              # 商談〜提案の全体ワークフロー
│   └── hearing-sheet.md                  # 初回ヒアリングチェックリスト
├── references/
│   └── layouts.md                        # 8種類のHTMLレイアウトテンプレート
└── scripts/
    ├── build-pptx-template.js            # PPTXビルドスクリプトのテンプレート
    └── generate-images-template.js       # 画像生成スクリプトのテンプレート
```

## ドキュメント

| ドキュメント | 対象者 | 内容 |
|-------------|--------|------|
| [商談〜提案ワークフロー](docs/proposal-workflow.md) | 営業・技術担当 | 案件受付→事前準備→初回商談→提案書作成→提出までの全プロセス |
| [ヒアリングシート](docs/hearing-sheet.md) | 商談担当者 | 初回商談で確認すべき項目チェックリスト + 商談メモテンプレート |

## カスタマイズ

- `assets/logo.png` — ロゴを自社のものに差し替え
- `references/layouts.md` — レイアウトのカラーやフォントサイズを調整
- `SKILL.md` のデザインシステムセクション — カラーパレットを変更

## ライセンス

MIT
