# Skill Review Checklist

Anthropic公式ガイド + 54スキル監査経験に基づくチェックリスト。

## 1. Description品質（最重要 — 常にコンテキストに読み込まれる）

### 必須要件

| # | チェック項目 | 基準 | 重大度 |
|---|-----------|------|:------:|
| D1 | **[何をするか]が明記されている** | 1文目で具体的な機能を説明 | CRITICAL |
| D2 | **[いつ使うか]が明記されている** | トリガーフレーズが最低3つ | CRITICAL |
| D3 | **曖昧でない** | "Helps with projects" のような漠然とした説明はNG | CRITICAL |
| D4 | **技術用語だけでなくユーザー語彙** | ユーザーが実際に言うフレーズを含む | WARNING |

### 推奨要件

| # | チェック項目 | 基準 | 重大度 |
|---|-----------|------|:------:|
| D5 | **ネガティブトリガーがある** | 競合スキルがある場合は必須 | WARNING |
| D6 | **競合スキルへの誘導がある** | 「〇〇の場合は△△を使うこと」 | WARNING |
| D7 | **主要能力が列挙されている** | [What] + [When] + [Key capabilities] の構造 | INFO |

### Bad例（公式ガイドより）

```
# Too vague
description: Helps with projects.

# Missing triggers
description: Creates sophisticated multi-page documentation systems.

# Too technical, no user triggers
description: Implements the Project entity model with hierarchical relationships.
```

### Good例（公式ガイドより）

```
# Specific and actionable
description: Analyzes Figma design files and generates developer handoff
documentation. Use when user uploads .fig files, asks for "design specs",
"component documentation", or "design-to-code handoff".

# Includes trigger phrases
description: Manages Linear project workflows including sprint planning,
task creation, and status tracking. Use when user mentions "sprint",
"Linear tasks", "project planning", or asks to "create tickets".
```

---

## 2. SKILL.md本体の品質

| # | チェック項目 | 基準 | 重大度 |
|---|-----------|------|:------:|
| B1 | **500行以下** | skill-creator推奨。超える場合はreferences/に分離 | WARNING |
| B2 | **5,000語以下** | 公式ガイド推奨上限 | WARNING |
| B3 | **命令形/不定詞で記述** | "Validate the data" not "The data should be validated" | INFO |
| B4 | **具体的でアクショナブル** | コマンド例、期待出力を含む | WARNING |
| B5 | **エラーハンドリング記載** | よくある問題と解決策 | INFO |
| B6 | **ステップ構造** | Step 1, Step 2... で手順が明確 | INFO |

---

## 3. セキュリティ

| # | チェック項目 | 基準 | 重大度 |
|---|-----------|------|:------:|
| S1 | **frontmatterにXML角括弧`<>`がない** | プロンプトインジェクションリスク | CRITICAL |
| S2 | **nameに"claude"/"anthropic"が含まれない** | 予約語。使用禁止 | CRITICAL |
| S3 | **機密情報が埋め込まれていない** | APIキー、パスワード等 | CRITICAL |

---

## 4. 構造・Progressive Disclosure

| # | チェック項目 | 基準 | 重大度 |
|---|-----------|------|:------:|
| P1 | **references/に分離すべき内容がSKILL.mdに混在していない** | 300行超の参照資料は分離 | WARNING |
| P2 | **references/への参照リンクがSKILL.mdにある** | 分離した場合、いつ読むかを明記 | WARNING |
| P3 | **不要なexampleファイルが残っていない** | init後の掃除忘れ | INFO |
| P4 | **assets/に実際に使うファイルのみ** | 使わないファイルは削除 | INFO |

---

## 5. スキル競合

| # | チェック項目 | 基準 | 重大度 |
|---|-----------|------|:------:|
| C1 | **同じトリガーで発火する別スキルがない** | 競合検出 | CRITICAL |
| C2 | **競合がある場合、相互にネガティブトリガーがある** | 双方のdescriptionで排他制御 | CRITICAL |
| C3 | **旧バージョンスキルは明示的に非推奨** | 「旧バージョン」「通常は〇〇を使うこと」 | WARNING |

---

## 6. メタデータ（任意）

| # | チェック項目 | 基準 | 重大度 |
|---|-----------|------|:------:|
| M1 | **user-invocable設定が適切** | スラッシュコマンドで呼ぶスキルはtrue | INFO |
| M2 | **allowed-toolsが最小限** | 不要なツール権限を付与していない | INFO |
| M3 | **license記載（公開スキル）** | MIT, Apache-2.0等 | INFO |
| M4 | **compatibility記載** | 環境要件がある場合 | INFO |

---

## 重大度の定義

| 重大度 | 意味 | 対応 |
|:------:|------|------|
| **CRITICAL** | スキルが正しく発火しない、またはセキュリティリスク | 即座に修正 |
| **WARNING** | 品質・保守性に問題。将来トラブルの原因 | 修正推奨 |
| **INFO** | ベストプラクティスからの逸脱 | 余裕があれば対応 |
