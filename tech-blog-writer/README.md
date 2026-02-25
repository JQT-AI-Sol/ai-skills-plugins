# Tech Blog Writer — Claude Code Skill

技術ブログの執筆を対話的に支援する Claude Code スキル。

スクショ・メモ・参照 URL を渡すだけで、カジュアルで読みやすい技術記事を一緒に作れます。

## 特徴

- **対話的な構成設計** — 記事タイプ（チュートリアル / 体験記 / 比較レビュー / 問題解決 / ディープダイブ）に合わせた構成を提案
- **AI臭くない文体** — 禁止フレーズリストとスタイルガイドで自然な日本語を生成
- **比喩・テンプレート付き** — 導入・締めのパターン集、専門用語の比喩集を内蔵

## インストール

### Claude Code（推奨）

```bash
# ユーザーレベル（全プロジェクトで使える）
git clone https://github.com/JQT-AI-Sol/claude-skill-tech-blog-writer.git \
  ~/.claude/skills/tech-blog-writer

# プロジェクトレベル（チーム共有）
git clone https://github.com/JQT-AI-Sol/claude-skill-tech-blog-writer.git \
  .claude/skills/tech-blog-writer
```

### Cursor

`.cursor/rules/tech-blog-writer.mdc` として配置してください。
SKILL.md と references/ の内容を1ファイルにまとめ、以下の frontmatter を付けます：

```markdown
---
description: 技術ブログの執筆支援
globs:
alwaysApply: false
---
```

### その他のツール

| ツール | 配置先 |
|--------|--------|
| Windsurf | `.windsurfrules` に追記 |
| GitHub Copilot | `.github/copilot-instructions.md` に追記 |

## 使い方

Claude Code で以下のように呼び出します：

```
ブログを書きたい
トピック: Claude CodeでMCPサーバーを作った話
フォルダ: ~/blog-materials/mcp-server/
参照URL: https://modelcontextprotocol.io/docs
```

### ワークフロー

1. **資料収集** — トピック・スクショ・参照URLを確認
2. **資料読み込み** — フォルダ内ファイルとURLの内容を取得
3. **構成検討** — 記事タイプに合わせた構成案を提示
4. **タイトル作成** — 候補を3つ提示
5. **記事生成** — スタイルガイドに従って Markdown 記事を生成

## ファイル構成

```
.
├── README.md                          # このファイル
├── SKILL.md                           # スキル本体
└── references/
    ├── style-guide.md                 # 文体・表記ルール・禁止表現
    └── expression-patterns.md         # 比喩・導入/締めテンプレート
```

## カスタマイズ

- `references/style-guide.md` — 文体や禁止表現を自分好みに調整
- `references/expression-patterns.md` — 比喩や導入/締めパターンを追加

## ライセンス

MIT
