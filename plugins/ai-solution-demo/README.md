# AI Solution Demo Plugin

顧客DX案件のAIソリューションデモを一気通貫で構築するプラグイン。

## 概要

ヒアリングメモ（memo.md）から以下のフェーズを順に実行し、デモ・提案書まで自動生成する：

| Phase | 内容 | 成果物 |
|-------|------|--------|
| 0 | 初期化 | WORKFLOW.md |
| 1 | 要件定義 | requirement.md |
| 2 | 設計 | screen-design.md, db-schema.md, api-design.md |
| 3 | 整合性レビュー | review-report.md |
| 4 | UI/UX設計 | ワイヤーフレーム, design-system.md |
| 5 | 実装 | Next.js + Supabaseアプリ |
| 6 | テスト+レビュー | E2Eテスト, code-review.md |
| 7 | デモ動画 | MP4 |
| 8 | マニュアル | PDF |
| 9 | 提案書 | PPTX |

## 同梱スキル

| スキル | 用途 |
|--------|------|
| ai-solution-demo | メインオーケストレーター |
| demo-recorder | デモ動画録画（Phase 7） |
| jqit-proposal | 提案書PPTX生成（Phase 9） |
| jqit-estimate | 見積書XLSX生成 |
| manual-generator | 操作マニュアルPDF（Phase 8） |
| image-generator | AI画像生成（提案書用） |

## 外部依存

以下のスキル・プラグインが別途必要です：

### 必須（`skills/` リポジトリから）
- `ui-ux-pro-max` — UI/UXデザイン（Phase 4）
- `pom-generator` — Playwright POM生成（Phase 6）

### 推奨（`skills/` リポジトリから）
- `brainstorming` — 要件ブレスト（Phase 1）
- `wireframe-prototyping` — ワイヤーフレーム（Phase 4）
- `e2e-testing` — E2Eテスト（Phase 6）

### プラグイン
- `document-skills` — doc-coauthoring, frontend-design, pptx, xlsx

## インストール

```bash
# プラグインのスキルをコピー
git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git /tmp/ai-skills-repo
cp -r /tmp/ai-skills-repo/plugins/ai-solution-demo/skills/* ~/.claude/skills/

# 必須の外部依存もインストール
cp -r /tmp/ai-skills-repo/skills/frontend/ui-ux-pro-max ~/.claude/skills/
cp -r /tmp/ai-skills-repo/skills/testing/pom-generator ~/.claude/skills/
```

## 使い方

```
/ai-solution-demo start my-project    # 新規プロジェクト初期化
/ai-solution-demo status              # 進捗確認
/ai-solution-demo phase 1             # Phase 1を実行
/ai-solution-demo hearing             # ヒアリングチェックリスト生成
```
