# AI Agent Skills & Plugins

AIエージェント用のスキル・プラグインコレクション（JQIT社内用）。

## 構成

```
├── skills/          # 個別スキル（カテゴリ別）
│   ├── frontend/    # フロントエンド開発・レビュー
│   ├── backend/     # バックエンド開発・レビュー
│   ├── database/    # データベース最適化
│   ├── testing/     # テスト・TDD
│   ├── devops/      # デプロイ・インフラ
│   ├── ai-api/      # AI API連携
│   ├── content/     # ブログ・コンテンツ
│   ├── business/    # 提案書・見積書・契約
│   ├── media/       # 動画録画
│   └── maintenance/ # スキル管理・デバッグ・リファクタ
└── plugins/         # プラグイン（複数スキルのバンドル）
```

## スキル一覧

### frontend/ — フロントエンド

| スキル | 説明 | 種別 |
|--------|------|------|
| [review-vercel-frontend](skills/frontend/review-vercel-frontend/) | Next.js コードレビュー（UI/UX + パフォーマンス + ガイドライン準拠） | 複合 |
| [review-frontend](skills/frontend/review-frontend/) | Vue/Svelte/HTML コードレビュー | 複合 |
| [vercel-react-best-practices](skills/frontend/vercel-react-best-practices/) | React/Next.js パフォーマンス最適化 45ルール | 参照 |
| [ui-ux-pro-max](skills/frontend/ui-ux-pro-max/) | UI/UX デザイン 50スタイル・97パレット・57フォント | 参照 |
| [web-design-guidelines](skills/frontend/web-design-guidelines/) | Web Interface Guidelines 準拠チェック | 参照 |

### backend/ — バックエンド

| スキル | 説明 | 種別 |
|--------|------|------|
| [review-python-backend](skills/backend/review-python-backend/) | Python/FastAPI コードレビュー（API設計 + 非同期 + セキュリティ） | 複合 |
| [python-backend](skills/backend/python-backend/) | FastAPI/SQLAlchemy/JWT 開発ガイド | 参照 |
| [fastapi-async-patterns](skills/backend/fastapi-async-patterns/) | FastAPI 非同期パターン・並行処理 | 参照 |

### database/ — データベース

| スキル | 説明 |
|--------|------|
| [supabase-postgres-best-practices](skills/database/supabase-postgres-best-practices/) | Postgres パフォーマンス最適化・RLS・スキーマ設計 |

### testing/ — テスト

| スキル | 説明 | 種別 |
|--------|------|------|
| [tdd](skills/testing/tdd/) | TDD統合（変更分析 → テスト種別判定 → RED/GREEN/REFACTOR） | 複合 |
| [pom-generator](skills/testing/pom-generator/) | Playwright Page Object Model 生成・更新 | 単体 |

### devops/ — デプロイ

| スキル | 説明 |
|--------|------|
| [cloudflare-deploy](skills/devops/cloudflare-deploy/) | Cloudflare Workers/Pages デプロイ・wrangler CLI |

### ai-api/ — AI API連携

| スキル | 説明 |
|--------|------|
| [openai-api](skills/ai-api/openai-api/) | OpenAI API（Chat/Vision/Whisper/DALL-E）実装ガイド |
| [gemini-api](skills/ai-api/gemini-api/) | Google Gemini API モデル選択・実装ガイド |

### content/ — コンテンツ

| スキル | 説明 |
|--------|------|
| [tech-blog-writer](skills/content/tech-blog-writer/) | 技術ブログの対話的執筆支援 |
| [qiita-publish](skills/content/qiita-publish/) | Qiita CLI 記事投稿 |

### business/ — ビジネス

| スキル | 説明 |
|--------|------|
| [jqit-proposal](skills/business/jqit-proposal/) | JQIT提案書 PPTX 自動生成（8レイアウト + AI画像） |
| [jqit-estimate](skills/business/jqit-estimate/) | JQIT見積書 XLSX 自動生成 |
| [legal-review](skills/business/legal-review/) | 契約書リーガルチェック・DOCX赤入れ |

### media/ — メディア

| スキル | 説明 |
|--------|------|
| [demo-recorder](skills/media/demo-recorder/) | Playwright でWebアプリ操作を録画 → MP4 |

### maintenance/ — メンテナンス

| スキル | 説明 |
|--------|------|
| [skill-creator](skills/maintenance/skill-creator/) | スキルの新規作成ガイド（品質チェックリスト付き） |
| [skill-reviewer](skills/maintenance/skill-reviewer/) | スキルの品質レビュー・監査 |
| [decompose](skills/maintenance/decompose/) | 肥大化コードの機能分割リファクタリング |
| [systematic-debugging](skills/maintenance/systematic-debugging/) | 4フェーズデバッグ法（根本原因特定 → 修正） |
| [find-skills](skills/maintenance/find-skills/) | スキル探索・インストール支援 |
| [repo-skill-finder](skills/maintenance/repo-skill-finder/) | 社内リポジトリからスキル検索・インストール |
| [skill-uploader](skills/maintenance/skill-uploader/) | スキルをリポジトリにアップロード・カタログ自動更新 |

## プラグイン

| プラグイン | 説明 |
|-----------|------|
| [ai-solution-demo](plugins/ai-solution-demo/) | DX案件のデモ一気通貫構築（要件定義→設計→実装→動画→提案書） |

## インストール

### 特定のスキルだけ使う

```bash
git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git /tmp/skills-repo

# 使いたいスキルをコピー
cp -r /tmp/skills-repo/skills/testing/tdd ~/.claude/skills/
cp -r /tmp/skills-repo/skills/frontend/review-vercel-frontend ~/.claude/skills/
```

### カテゴリごとインストール

```bash
cp -r /tmp/skills-repo/skills/frontend/* ~/.claude/skills/
```

### プロジェクトレベルで共有（チーム向け）

```bash
cp -r /tmp/skills-repo/skills/testing/tdd .claude/skills/
git add .claude/skills/tdd
git commit -m "Add tdd skill"
```

## ライセンス

MIT（社内利用）
