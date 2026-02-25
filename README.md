# Claude Skills Collection

[Claude Code](https://claude.com/claude-code) 用のスキルコレクション。

## スキル一覧

| スキル | 説明 | 用途 |
|--------|------|------|
| [tech-blog-writer](./tech-blog-writer/) | 技術ブログの執筆支援 | スクショ・メモ・URLから対話的に技術記事を生成 |
| [jqit-proposal](./jqit-proposal/) | JQIT提案書PPTX生成 | 8種類のレイアウトテンプレートで提案書を自動生成 |

## インストール

### 全スキルをインストール

```bash
git clone https://github.com/JQT-AI-Sol/claude-skills.git /tmp/claude-skills-repo

# 使いたいスキルを個別にコピー
cp -r /tmp/claude-skills-repo/tech-blog-writer ~/.claude/skills/
cp -r /tmp/claude-skills-repo/jqit-proposal ~/.claude/skills/
```

### 特定のスキルだけインストール（sparse checkout）

```bash
git clone --filter=blob:none --sparse \
  https://github.com/JQT-AI-Sol/claude-skills.git /tmp/claude-skills-repo
cd /tmp/claude-skills-repo
git sparse-checkout set tech-blog-writer
cp -r tech-blog-writer ~/.claude/skills/
```

### プロジェクトレベルで共有（チーム向け）

```bash
# プロジェクトの .claude/skills/ にコピーしてコミット
cp -r /tmp/claude-skills-repo/tech-blog-writer .claude/skills/
git add .claude/skills/tech-blog-writer
git commit -m "Add tech-blog-writer skill"
```

## スキルの構成

各スキルは独立したディレクトリで、以下の構成を持ちます:

```
skill-name/
├── SKILL.md           # スキル定義（必須）
├── README.md          # 説明・使い方
├── references/        # 参照ドキュメント（任意）
├── scripts/           # ビルドスクリプト等（任意）
└── assets/            # 画像等のアセット（任意）
```

## ライセンス

MIT
