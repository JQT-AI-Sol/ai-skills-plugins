---
name: repo-skill-finder
description: >
  JQIT社内リポジトリ（JQT-AI-Sol/ai-skills-plugins）からスキルを検索・インストールするスキル。
  以下の場合にのみ使用（「社内」「JQIT」「リポジトリ」等の明示的な指定が必要）：
  (1) 「社内スキルを探して」「JQITのスキルを探して」「リポジトリからスキルを検索」
  (2) 「社内に〇〇用のスキルある？」「JQITの〇〇スキル」
  (3) 「社内スキル一覧」「リポジトリのスキル一覧」
  (4) 「repo find」「repo-skill-finder」
  このスキルを使わないケース：
  - 「スキルを探して」「〇〇用のスキルある？」など社内を指定しない汎用的な検索 → find-skills を使う
  - skills.sh / npx skills でのWeb検索 → find-skills を使う
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
---

# Repo Skill Finder

社内リポジトリ `JQT-AI-Sol/ai-skills-plugins` からスキルを検索・インストールする。

## リポジトリ情報

- **GitHub**: `https://github.com/JQT-AI-Sol/ai-skills-plugins`
- **構成**: `skills/<category>/<skill-name>/SKILL.md`

## カテゴリ一覧

| カテゴリ | 内容 |
|---------|------|
| frontend | フロントエンド開発・レビュー（Next.js, Vue, UI/UX） |
| backend | バックエンド開発・レビュー（Python, FastAPI） |
| database | データベース最適化（Postgres, Supabase） |
| testing | テスト・TDD（Playwright, POM） |
| devops | デプロイ・インフラ（Cloudflare） |
| ai-api | AI API連携（OpenAI, Gemini） |
| content | ブログ・コンテンツ（技術ブログ, Qiita） |
| business | 提案書・見積書・契約（PPTX, XLSX, リーガル） |
| media | 動画録画（Playwright録画 → MP4） |
| maintenance | スキル管理・デバッグ・リファクタ |

## スキルカタログ

| カテゴリ | スキル | 説明 |
|---------|--------|------|
| frontend | review-vercel-frontend | Next.js コードレビュー（UI/UX + パフォーマンス + ガイドライン） |
| frontend | review-frontend | Vue/Svelte/HTML コードレビュー |
| frontend | vercel-react-best-practices | React/Next.js パフォーマンス最適化 45ルール |
| frontend | ui-ux-pro-max | UI/UX デザイン 50スタイル・97パレット・57フォント |
| frontend | web-design-guidelines | Web Interface Guidelines 準拠チェック |
| backend | review-python-backend | Python/FastAPI コードレビュー（API + 非同期 + セキュリティ） |
| backend | python-backend | FastAPI/SQLAlchemy/JWT 開発ガイド |
| backend | fastapi-async-patterns | FastAPI 非同期パターン・並行処理 |
| database | supabase-postgres-best-practices | Postgres パフォーマンス最適化・RLS・スキーマ設計 |
| testing | tdd | TDD統合（変更分析 → テスト種別判定 → RED/GREEN/REFACTOR） |
| testing | pom-generator | Playwright Page Object Model 生成・更新 |
| devops | cloudflare-deploy | Cloudflare Workers/Pages デプロイ・wrangler CLI |
| ai-api | openai-api | OpenAI API（Chat/Vision/Whisper/DALL-E）実装ガイド |
| ai-api | gemini-api | Google Gemini API モデル選択・実装ガイド |
| content | tech-blog-writer | 技術ブログの対話的執筆支援 |
| content | qiita-publish | Qiita CLI 記事投稿 |
| business | jqit-proposal | JQIT提案書 PPTX 自動生成（8レイアウト + AI画像） |
| business | jqit-estimate | JQIT見積書 XLSX 自動生成 |
| business | legal-review | 契約書リーガルチェック・DOCX赤入れ |
| media | demo-recorder | Playwright でWebアプリ操作録画 → MP4 |
| maintenance | skill-creator | スキルの新規作成ガイド（品質チェックリスト付き） |
| maintenance | skill-reviewer | スキルの品質レビュー・監査 |
| maintenance | decompose | 肥大化コードの機能分割リファクタリング |
| maintenance | systematic-debugging | 4フェーズデバッグ法（根本原因特定 → 修正） |
| maintenance | find-skills | Web上のスキル探索・インストール（skills.sh） |
| maintenance | repo-skill-finder | 社内リポジトリからスキル検索・インストール（このスキル） |
| maintenance | skill-uploader | スキルをリポジトリにアップロード・カタログ自動更新 |

## ワークフロー

### モード1: 検索（デフォルト）

ユーザーの要求からキーワードを特定し、上記カタログからマッチするスキルを提示する。

**手順:**

1. ユーザーの要求を分析し、関連するカテゴリ・キーワードを特定
2. スキルカタログから候補を絞り込む（カテゴリ、スキル名、説明で照合）
3. マッチしたスキルを一覧表示:

```
見つかったスキル:

📦 tdd (testing)
   TDD統合（変更分析 → テスト種別判定 → RED/GREEN/REFACTOR）

   インストール:
   git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git /tmp/ai-skills-repo 2>/dev/null
   cp -r /tmp/ai-skills-repo/skills/testing/tdd ~/.claude/skills/
```

4. 複数候補がある場合は全て提示し、ユーザーに選択させる

### モード2: カテゴリ一覧

「一覧」「カテゴリ」「どんなスキルがある」と聞かれたら、カテゴリ別の全スキル一覧を表示する。

### モード3: インストール

ユーザーがスキルを選択したら、以下のコマンドでインストールする:

```bash
# リポジトリをクローン（未クローンの場合）
if [ ! -d /tmp/ai-skills-repo ]; then
  git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git /tmp/ai-skills-repo
else
  cd /tmp/ai-skills-repo && git pull
fi

# スキルをコピー
cp -r /tmp/ai-skills-repo/skills/<category>/<skill-name> ~/.claude/skills/
```

**インストール後の案内:**
- 「インストールしました。新しいセッションで有効になります。」
- 複合スキルの場合、依存するスキルも一緒にインストールするか確認する

### モード4: 最新化

「スキルを更新」「最新版にしたい」と聞かれたら:

```bash
cd /tmp/ai-skills-repo && git pull

# 指定スキルを上書きコピー
cp -r /tmp/ai-skills-repo/skills/<category>/<skill-name> ~/.claude/skills/
```

## 複合スキルの依存関係

以下のスキルは他のスキルを内部で呼び出す。インストール時に依存先も案内する。

| 複合スキル | 依存先 |
|-----------|--------|
| review-vercel-frontend | ui-ux-pro-max, vercel-react-best-practices, web-design-guidelines |
| review-frontend | ui-ux-pro-max, web-design-guidelines |
| review-python-backend | python-backend, fastapi-async-patterns |
| tdd | systematic-debugging（テスト失敗時に連携） |

## マッチしない場合

カタログに該当スキルがない場合:

1. 「社内リポジトリには該当するスキルが見つかりませんでした」と伝える
2. `npx skills find <query>` でWeb上のスキルを検索するか提案する
3. skill-creator で新規作成を提案する
