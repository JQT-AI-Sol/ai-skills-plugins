---
name: skill-creator
description: >
  Claude Code スキルの新規作成・既存スキル更新ガイド。
  Anthropic公式ガイドに基づくベストプラクティスでスキルを設計・実装する。
  以下の場合に使用：
  (1) 「スキルを作りたい」「新しいスキルを作成」「skill create」
  (2) 「SKILL.mdを書きたい」「スキルのテンプレート」
  (3) 既存スキルを改善・リファクタリングしたい場合
  スキルのレビュー・監査にはskill-reviewerを使うこと。
user-invocable: true
---

# Skill Creator

Claude Code スキルの作成・更新ガイド。

## スキルとは

スキルはClaude Codeの能力を拡張するモジュール。特定ドメインの手順知識・ツール連携・参照資料をパッケージ化する。

### 構成

```
skill-name/
├── SKILL.md           # スキル定義（必須）
│   ├── YAML frontmatter（name, description）
│   └── Markdown本文（手順・ガイダンス）
├── scripts/           # 実行スクリプト（任意）
├── references/        # 参照ドキュメント（任意）
└── assets/            # テンプレート・画像等（任意）
```

## 設計原則

### 1. 簡潔であること

コンテキストウィンドウは共有資源。Claudeが既に知っている情報は書かない。冗長な説明より簡潔な例を優先する。

### 2. 自由度の設計

| レベル | 使う場面 | 例 |
|--------|---------|-----|
| 高（テキスト指示） | 複数アプローチが有効 | コードレビュー観点 |
| 中（擬似コード） | 推奨パターンあり | API呼び出し手順 |
| 低（具体スクリプト） | 手順が脆弱・要一貫性 | PDF変換、ビルド |

### 3. Progressive Disclosure

3段階でコンテキストを管理：

1. **メタデータ**（name + description）— 常にロード（~100語）
2. **SKILL.md本文** — トリガー時にロード（<5,000語）
3. **references/** — 必要に応じてロード（無制限）

SKILL.mdは **500行以下** に収め、超える場合はreferences/に分離する。

## 作成手順

### Step 1: 用途の明確化

スキルの具体的な使用例を理解する。以下を確認：

- このスキルは何をするか？
- ユーザーはどんな言葉でこのスキルを呼ぶか？
- 既存スキルと競合しないか？

### Step 2: 再利用資源の計画

各使用例を分析し、再利用すべき資源を特定する：

- **scripts/**: 毎回同じコードを書く作業 → スクリプト化
- **references/**: 毎回調べ直す情報 → ドキュメント化
- **assets/**: 毎回必要なファイル → テンプレート・画像等

### Step 3: スキルの初期化

ディレクトリとSKILL.mdを作成する：

```bash
SKILL_NAME="my-skill"
mkdir -p ~/.claude/skills/$SKILL_NAME/{scripts,references,assets}
cat > ~/.claude/skills/$SKILL_NAME/SKILL.md << 'EOF'
---
name: my-skill
description: >
  TODO: [何をするか]を1文目に。
  以下の場合に使用：
  (1) TODO: トリガーフレーズ1
  (2) TODO: トリガーフレーズ2
  (3) TODO: トリガーフレーズ3
  [競合スキル名]の場合は[別スキル]を使うこと。
---

# My Skill

TODO: 手順を記述

## Step 1: ...

## Step 2: ...
EOF
```

### Step 4: スキルの編集

#### Frontmatter（最重要）

descriptionはスキルの発火を決める唯一の情報。以下を必ず含める：

| 要素 | 必須 | 例 |
|------|:---:|-----|
| **何をするか**（1文目） | CRITICAL | 「Python/FastAPIバックエンドのコードレビュー」 |
| **いつ使うか**（3つ以上） | CRITICAL | 「(1) コードレビュー (2) APIチェック (3) .pyレビュー」 |
| **ネガティブトリガー** | 競合時必須 | 「フロントエンドにはreview-frontendを使うこと」 |

**Good例:**
```yaml
description: >
  Vercel/Next.jsフロントエンドのコードレビュー。
  UI/UXデザイン品質、Reactパフォーマンス最適化を一括チェック。
  以下の場合に使用：
  (1) 「フロントエンドをレビューして」
  (2) 「Reactのパフォーマンスチェック」
  (3) Vercelデプロイ前のコード品質チェック
  Next.js以外（Vue, Svelte等）にはreview-frontendを使うこと。
```

**Bad例:**
```yaml
# 曖昧すぎる
description: Helps with projects.

# トリガーフレーズなし
description: Creates sophisticated multi-page documentation systems.

# ユーザー語彙なし（技術用語のみ）
description: Implements the Project entity model with hierarchical relationships.
```

#### 本文

- **命令形** で記述（「データを検証する」not「データは検証されるべき」）
- **ステップ構造** で手順を明確に（Step 1, Step 2...）
- **コマンド例・期待出力** を含める
- references/への参照リンクと **いつ読むか** を明記

#### 品質チェックリスト

編集完了後、[references/quality-checklist.md](references/quality-checklist.md) の全項目を確認する。
特にCRITICAL項目（D1-D3, S1-S3, C1-C2）は必ずパスすること。

#### 設計パターン

複雑なワークフローやテンプレートを含む場合は以下を参照：

- **多段階プロセス**: [references/workflows.md](references/workflows.md)
- **出力フォーマット**: [references/output-patterns.md](references/output-patterns.md)

### Step 5: テスト

```bash
# スキルをインストール（既に ~/.claude/skills/ にある場合は不要）
cp -r /path/to/my-skill ~/.claude/skills/

# 新しいClaude Codeセッションで動作確認
# - トリガーフレーズで発火するか
# - 手順通りに動作するか
# - 競合スキルと衝突しないか
```

### Step 6: イテレーション

実際に使ってみて改善する：

1. スキルを実タスクで使用
2. 苦戦した点・非効率な点を特定
3. SKILL.mdや資源を更新
4. 再テスト

## 不要なファイル

以下は作成しない：
- README.md, CHANGELOG.md, INSTALLATION_GUIDE.md
- テスト手順書、ユーザー向けドキュメント
- スキルの開発過程の記録
