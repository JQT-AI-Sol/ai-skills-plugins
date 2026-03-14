# Getting Started — はじめてのスキル導入ガイド

このガイドでは、AI Agent Skills & Plugins リポジトリのスキルを自分の環境にインストールして使い始めるまでの手順を説明します。

## 前提条件

- **AIエージェントツール**がインストール済みであること（Claude Code、Cline、Cursor など）
- Git が使えること
- GitHub の `JQT-AI-Sol/ai-skills-plugins` リポジトリへのアクセス権があること

> **Note:** このガイドでは Claude Code を例に説明しますが、SKILL.md を読み込めるAIエージェントであれば同様に利用できます。ツールごとのスキル配置先は[スキル配置先の対応表](#スキル配置先の対応表)を参照してください。

## 1. スキルとは？

スキルは、AIエージェントの能力を拡張する指示ファイルです。`SKILL.md` という Markdown ファイルに「いつ・何を・どうやるか」を記述しておくと、エージェントが自動的に読み込んで適切な場面で発動します。

例えば `tdd` スキルをインストールすると、「テスト書いて」と言うだけで TDD サイクル（RED→GREEN→REFACTOR）を自動的に実行してくれます。

## 2. クイックスタート（最短3ステップ）

```bash
# Step 1: リポジトリをクローン
git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git ~/ai-skills-plugins

# Step 2: 使いたいスキルをコピー（例: TDD）
cp -r ~/ai-skills-plugins/skills/testing/tdd ~/.claude/skills/

# Step 3: AIエージェントを再起動（新しいセッションを開始）
```

これだけで使えます。

## 3. 一括セットアップ

よく使うスキルをまとめてインストールするスクリプトです。必要なものだけコメントを外して使ってください。

```bash
#!/bin/bash
REPO=~/ai-skills-plugins
DEST=~/.claude/skills

# リポジトリが未クローンならクローン、あれば最新化
[ -d "$REPO" ] && (cd "$REPO" && git pull) || git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git "$REPO"

# --- 必要なスキルのコメントを外してください ---

# 開発基盤（おすすめ）
cp -r "$REPO/skills/testing/tdd"                          "$DEST/"
cp -r "$REPO/skills/maintenance/systematic-debugging"     "$DEST/"
cp -r "$REPO/skills/maintenance/repo-skill-finder"        "$DEST/"

# フロントエンド（Next.js / React）
# cp -r "$REPO/skills/frontend/review-vercel-frontend"    "$DEST/"
# cp -r "$REPO/skills/frontend/ui-ux-pro-max"             "$DEST/"
# cp -r "$REPO/skills/frontend/vercel-react-best-practices" "$DEST/"
# cp -r "$REPO/skills/frontend/web-design-guidelines"     "$DEST/"

# フロントエンド（Vue / Svelte / HTML）
# cp -r "$REPO/skills/frontend/review-frontend"           "$DEST/"

# バックエンド（Python / FastAPI）
# cp -r "$REPO/skills/backend/review-python-backend"      "$DEST/"
# cp -r "$REPO/skills/backend/python-backend"             "$DEST/"
# cp -r "$REPO/skills/backend/fastapi-async-patterns"     "$DEST/"

# データベース
# cp -r "$REPO/skills/database/supabase-postgres-best-practices" "$DEST/"

# AI API
# cp -r "$REPO/skills/ai-api/openai-api"                  "$DEST/"
# cp -r "$REPO/skills/ai-api/gemini-api"                  "$DEST/"

# ビジネス
# cp -r "$REPO/skills/business/jqit-proposal"             "$DEST/"
# cp -r "$REPO/skills/business/jqit-estimate"             "$DEST/"
# cp -r "$REPO/skills/business/legal-review"              "$DEST/"

echo "インストール完了。AIエージェントを再起動してください。"
```

> **Tips:** このスクリプトをコピーして `setup-skills.sh` として保存し、`bash setup-skills.sh` で実行できます。

## 4. おすすめスキル（まず入れるべき3つ）

### tdd — テスト駆動開発

変更内容を分析し、適切なテスト種別を判断して RED→GREEN→REFACTOR サイクルで実装します。

```bash
cp -r ~/ai-skills-plugins/skills/testing/tdd ~/.claude/skills/
cp -r ~/ai-skills-plugins/skills/maintenance/systematic-debugging ~/.claude/skills/  # 依存
```

### review-vercel-frontend — Next.js コードレビュー

UI/UX + パフォーマンス + ガイドライン準拠を一括チェックします。

```bash
cp -r ~/ai-skills-plugins/skills/frontend/review-vercel-frontend ~/.claude/skills/
cp -r ~/ai-skills-plugins/skills/frontend/ui-ux-pro-max ~/.claude/skills/              # 依存
cp -r ~/ai-skills-plugins/skills/frontend/vercel-react-best-practices ~/.claude/skills/ # 依存
cp -r ~/ai-skills-plugins/skills/frontend/web-design-guidelines ~/.claude/skills/       # 依存
```

### repo-skill-finder — スキル検索・インストール

「○○用のスキルある？」と聞くだけで検索・インストールできます。

```bash
cp -r ~/ai-skills-plugins/skills/maintenance/repo-skill-finder ~/.claude/skills/
```

## 5. スキルの探し方

### 方法A: README を見る

[README.md](../README.md) にカテゴリ別の全スキル一覧があります。

### 方法B: repo-skill-finder スキルを使う（おすすめ）

`repo-skill-finder` をインストールしておくと、AIエージェントに話しかけるだけで**社内リポジトリから**スキルを検索・インストールできます。

```
あなた: 「社内にフロントエンドのレビュースキルある？」
AI:      → 社内カタログから候補を提示
あなた: 「それをインストールして」
AI:      → 自動でコピー
```

### find-skills と repo-skill-finder の使い分け

この2つのスキルは検索範囲が異なります。混同しないよう注意してください。

| スキル | 検索範囲 | 発動するキーワード |
|--------|---------|-------------------|
| **find-skills** | Web上の公開スキル（skills.sh） | 「スキルを探して」「○○のスキルある？」 |
| **repo-skill-finder** | JQIT社内リポジトリのみ | 「**社内**スキルを探して」「**JQIT**の○○スキル」「**リポジトリ**から検索」 |

`repo-skill-finder` は「社内」「JQIT」「リポジトリ」といった明示的なキーワードがある場合にのみ発動します。単に「スキルを探して」と言った場合は `find-skills`（Web検索）が動きます。

## 6. カテゴリ早見表

| カテゴリ | 対象 | 代表スキル |
|---------|------|-----------|
| `frontend/` | Next.js, React, Vue, Svelte | review-vercel-frontend, ui-ux-pro-max |
| `backend/` | Python, FastAPI | review-python-backend |
| `database/` | PostgreSQL, Supabase | supabase-postgres-best-practices |
| `testing/` | TDD, Playwright | tdd, pom-generator |
| `devops/` | Cloudflare | cloudflare-deploy |
| `ai-api/` | OpenAI, Gemini | openai-api, gemini-api |
| `content/` | 技術ブログ, Qiita | tech-blog-writer, qiita-publish |
| `business/` | 提案書, 見積書, 契約 | jqit-proposal, jqit-estimate, legal-review |
| `media/` | 動画録画 | demo-recorder |
| `maintenance/` | スキル管理, デバッグ | skill-creator, systematic-debugging |

## 7. 複合スキルの依存関係

一部のスキルは他のスキルを内部で参照します。複合スキルをインストールする場合は、依存先も一緒に入れてください。

| 複合スキル | 一緒にインストールするもの |
|-----------|------------------------|
| review-vercel-frontend | ui-ux-pro-max, vercel-react-best-practices, web-design-guidelines |
| review-frontend | ui-ux-pro-max, web-design-guidelines |
| review-python-backend | python-backend, fastapi-async-patterns |
| tdd | systematic-debugging |

## 8. プロジェクト単位でスキルを共有する

チームメンバー全員に同じスキルを使ってもらいたい場合は、プロジェクトの `.claude/skills/` に配置して Git で共有します。

```bash
# プロジェクトのルートで実行
mkdir -p .claude/skills
cp -r ~/ai-skills-plugins/skills/testing/tdd .claude/skills/
git add .claude/skills/tdd
git commit -m "Add tdd skill for team"
git push
```

これで、そのプロジェクトをクローンした全メンバーが自動的にスキルを利用できます。

## 9. プラグインの使い方

プラグインは、複数のスキルをまとめたパッケージです。

```bash
# ai-solution-demo プラグインのスキルを一括インストール
cp -r ~/ai-skills-plugins/plugins/ai-solution-demo/skills/* ~/.claude/skills/

# 外部依存も追加
cp -r ~/ai-skills-plugins/skills/frontend/ui-ux-pro-max ~/.claude/skills/
cp -r ~/ai-skills-plugins/skills/testing/pom-generator ~/.claude/skills/
```

詳細は各プラグインの [README](../plugins/ai-solution-demo/README.md) を参照してください。

## 10. スキルの更新

リポジトリを最新化して、上書きコピーするだけです。

```bash
cd ~/ai-skills-plugins && git pull

# 更新したいスキルを再コピー
cp -r ~/ai-skills-plugins/skills/testing/tdd ~/.claude/skills/
```

## 11. スキルの削除（アンインストール）

不要になったスキルはフォルダごと削除します。

```bash
# 例: tdd スキルを削除
rm -rf ~/.claude/skills/tdd

# 例: 全スキルをリセット（やり直したい場合）
rm -rf ~/.claude/skills/*
```

削除後、AIエージェントを再起動すると反映されます。

## 12. 新しいスキルを作る・共有する

### スキルを作る

`skill-creator` スキルを使って、品質チェックリスト付きでスキルを作成できます。

```bash
cp -r ~/ai-skills-plugins/skills/maintenance/skill-creator ~/.claude/skills/

# AIエージェントのセッション内で：
# 「新しいスキルを作りたい」→ ガイドに沿って作成してくれる
```

### 作ったスキルをリポジトリに共有する

`skill-uploader` スキルを使うと、カタログ・README の更新まで自動化できます。

```bash
cp -r ~/ai-skills-plugins/skills/maintenance/skill-uploader ~/.claude/skills/

# AIエージェントのセッション内で：
# 「○○スキルをリポジトリにアップロードして」→ 自動でプッシュしてくれる
```

## スキル配置先の対応表

| ツール | ユーザーレベル（全プロジェクト共通） | プロジェクトレベル |
|--------|----------------------------------|--------------------|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Cline | `~/.cline/skills/` | `.cline/skills/` |
| その他 | ツールのドキュメントを参照 | — |

> `cp` コマンドの `~/.claude/skills/` 部分を、使用ツールに合わせて読み替えてください。

## トラブルシューティング

| 症状 | 対処法 |
|------|--------|
| スキルが発動しない | セッションを再起動する。スキル一覧に表示されるか確認 |
| 「Permission denied」 | リポジトリのアクセス権を管理者に依頼 |
| 複合スキルが一部機能しない | 依存スキルがインストールされているか確認（[依存関係の表](#7-複合スキルの依存関係)を参照） |
| リポジトリが消えた | `~/ai-skills-plugins` にクローンし直す（`/tmp` に置いた場合は再起動で消えることがある） |

## 質問・フィードバック

- スキルの不具合や改善提案は GitHub Issue で報告してください
- 新しいスキルのアイデアがあれば `skill-creator` で作成 → `skill-uploader` で共有
