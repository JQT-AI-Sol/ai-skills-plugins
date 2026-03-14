# Getting Started — はじめてのスキル導入ガイド

このガイドでは、AI Agent Skills & Plugins リポジトリのスキルを自分の環境にインストールして使い始めるまでの手順を説明します。

## 前提条件

- **Claude Code** がインストール済みであること（`claude` コマンドが使える状態）
- Git が使えること
- GitHub の `JQT-AI-Sol/ai-skills-plugins` リポジトリへのアクセス権があること

## 1. スキルとは？

スキルは、Claude Code の能力を拡張する指示ファイルです。`SKILL.md` という Markdown ファイルに「いつ・何を・どうやるか」を記述しておくと、Claude Code が自動的に読み込んで適切な場面で発動します。

例えば `tdd` スキルをインストールすると、「テスト書いて」と言うだけで TDD サイクル（RED→GREEN→REFACTOR）を自動的に実行してくれます。

## 2. インストール方法

### Step 1: リポジトリをクローン

```bash
git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git /tmp/ai-skills-repo
```

### Step 2: 使いたいスキルをコピー

スキルは `~/.claude/skills/` にコピーすると、全プロジェクトで使えるようになります。

```bash
# 例: TDD スキルをインストール
cp -r /tmp/ai-skills-repo/skills/testing/tdd ~/.claude/skills/

# 例: フロントエンドレビューをインストール
cp -r /tmp/ai-skills-repo/skills/frontend/review-vercel-frontend ~/.claude/skills/
```

### Step 3: Claude Code を再起動

新しいセッションを開始すると、インストールしたスキルが有効になります。

```bash
# 現在のセッションを終了して再度起動
claude
```

### 動作確認

Claude Code のセッション内で `/skills` と入力すると、インストール済みスキルの一覧が表示されます。

## 3. おすすめスキル（まず入れるべき3つ）

| スキル | コマンド | できること |
|--------|---------|-----------|
| `tdd` | `cp -r /tmp/ai-skills-repo/skills/testing/tdd ~/.claude/skills/` | テスト駆動開発を自動化 |
| `review-vercel-frontend` | `cp -r /tmp/ai-skills-repo/skills/frontend/review-vercel-frontend ~/.claude/skills/` | Next.js のコードレビュー |
| `systematic-debugging` | `cp -r /tmp/ai-skills-repo/skills/maintenance/systematic-debugging ~/.claude/skills/` | 体系的なバグ修正 |

## 4. スキルの探し方

### 方法A: README を見る

[README.md](../README.md) にカテゴリ別の全スキル一覧があります。

### 方法B: repo-skill-finder スキルを使う（おすすめ）

`repo-skill-finder` をインストールすると、Claude Code に「○○用のスキルある？」と聞くだけで検索・インストールできます。

```bash
# まず repo-skill-finder をインストール
cp -r /tmp/ai-skills-repo/skills/maintenance/repo-skill-finder ~/.claude/skills/

# Claude Code のセッション内で：
# 「フロントエンドのレビュースキルある？」→ 候補を提示してくれる
# 「それをインストールして」→ 自動でコピーしてくれる
```

## 5. カテゴリの見方

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

## 6. 複合スキルについて

一部のスキルは他のスキルを内部で参照します。複合スキルをインストールする場合は、依存先も一緒に入れてください。

| 複合スキル | 一緒にインストールするもの |
|-----------|------------------------|
| review-vercel-frontend | ui-ux-pro-max, vercel-react-best-practices, web-design-guidelines |
| review-frontend | ui-ux-pro-max, web-design-guidelines |
| review-python-backend | python-backend, fastapi-async-patterns |
| tdd | systematic-debugging |

```bash
# 例: review-vercel-frontend と依存スキルを一括インストール
cp -r /tmp/ai-skills-repo/skills/frontend/review-vercel-frontend ~/.claude/skills/
cp -r /tmp/ai-skills-repo/skills/frontend/ui-ux-pro-max ~/.claude/skills/
cp -r /tmp/ai-skills-repo/skills/frontend/vercel-react-best-practices ~/.claude/skills/
cp -r /tmp/ai-skills-repo/skills/frontend/web-design-guidelines ~/.claude/skills/
```

## 7. プロジェクト単位でスキルを共有する

チームメンバー全員に同じスキルを使ってもらいたい場合は、プロジェクトの `.claude/skills/` に配置して Git で共有します。

```bash
# プロジェクトのルートで実行
mkdir -p .claude/skills
cp -r /tmp/ai-skills-repo/skills/testing/tdd .claude/skills/
git add .claude/skills/tdd
git commit -m "Add tdd skill for team"
git push
```

これで、そのプロジェクトをクローンした全メンバーが自動的にスキルを利用できます。

## 8. プラグインの使い方

プラグインは、複数のスキルをまとめたパッケージです。

```bash
# ai-solution-demo プラグインのスキルを一括インストール
cp -r /tmp/ai-skills-repo/plugins/ai-solution-demo/skills/* ~/.claude/skills/

# 外部依存も追加
cp -r /tmp/ai-skills-repo/skills/frontend/ui-ux-pro-max ~/.claude/skills/
cp -r /tmp/ai-skills-repo/skills/testing/pom-generator ~/.claude/skills/
```

詳細は各プラグインの README を参照してください。

## 9. スキルの更新

リポジトリが更新されたら、最新版を取得して上書きコピーするだけです。

```bash
cd /tmp/ai-skills-repo && git pull

# 更新したいスキルを再コピー
cp -r /tmp/ai-skills-repo/skills/testing/tdd ~/.claude/skills/
```

## 10. 新しいスキルを作る・共有する

### スキルを作る

`skill-creator` スキルを使って、品質チェックリスト付きでスキルを作成できます。

```bash
cp -r /tmp/ai-skills-repo/skills/maintenance/skill-creator ~/.claude/skills/

# Claude Code のセッション内で：
# 「新しいスキルを作りたい」→ ガイドに沿って作成してくれる
```

### 作ったスキルをリポジトリに共有する

`skill-uploader` スキルを使うと、カタログ・README の更新まで自動化できます。

```bash
cp -r /tmp/ai-skills-repo/skills/maintenance/skill-uploader ~/.claude/skills/

# Claude Code のセッション内で：
# 「○○スキルをリポジトリにアップロードして」→ 自動でプッシュしてくれる
```

## トラブルシューティング

| 症状 | 対処法 |
|------|--------|
| スキルが発動しない | セッションを再起動する。`/skills` で一覧に表示されるか確認 |
| 「Permission denied」 | リポジトリのアクセス権を管理者に依頼 |
| 複合スキルが一部機能しない | 依存スキルがインストールされているか確認（上記の表を参照） |
| 古いスキルが残っている | `rm -rf ~/.claude/skills/<skill-name>` で削除してから再インストール |

## 質問・フィードバック

- スキルの不具合や改善提案は GitHub Issue で報告してください
- 新しいスキルのアイデアがあれば `skill-creator` で作成 → `skill-uploader` で共有
