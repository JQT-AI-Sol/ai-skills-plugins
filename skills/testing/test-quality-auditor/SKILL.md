---
name: test-quality-auditor
description: >
  既存テストコードの品質・網羅性を JSTQB Foundation v4.0 および ATA v3.1.2 準拠で採点する監査スキル。
  対象技法は Black-box 4技法（同値分割・境界値・決定テーブル・状態遷移）、White-box（制御フロー/分岐）、
  Experience-based（エラー推測・探索的）、User Story/Use Case、およびリスクベーステストを網羅。
  要件 → テスト仕様 → 実テストコード の3層トレーサビリティを実ファイル突合で検証し、
  弱アサーション・握りつぶし・デモ収録の誤集計・非機能カバレッジ欠落などを検出する。
  以下の場合に使用：
  (1) 「テスト品質監査」「テストレビュー」「テスト網羅性チェック」
  (2) 「要件に対してテストが足りているか」「この指摘は正しいか」
  (3) /tdd の Gate 2.6 からの自動呼び出し
  プロジェクト固有情報は `.claude/test-audit.config.json` で外部化。未設定時はデフォルト値で動作。
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Write
  - TodoWrite
---

# Test Quality Auditor

既存テストコードの品質・網羅性を **JSTQB Foundation Level v4.0** および **Advanced Test Analyst v3.1.2** 準拠で採点し、**レビュアー自身が実ファイル突合で証明する** 監査スキル。テストレベル別（component/integration/system/acceptance）の評価、リスクベース網羅性、ISO/IEC 25010 非機能品質特性、Test Monitoring 指標（DDP/Flaky Rate）を統合採点する。

プロンプト外付けロールプレイで起きがちな「test ブロック存在 = 実装済み」の誤判定を、Iron Law で構造的に防ぐ。

## Iron Law: 突合の絶対原則

> **第一条**: 実ファイルを `Read` または `grep` で開いて目視せずに、テストの実装有無・品質を判定してはならない。
>
> **第二条**: テストレベルを区別せずに評価してはならない。component テストと e2e テストには異なる責務・異なるカバレッジ目標・異なる失敗許容があり、一律目標は **JSTQB FL §2.2 Test Levels** に反する。必ず `coverage_targets` のレベル別閾値で個別採点すること。

これらは推奨ではなく絶対規則。違反した場合、監査結果は破棄して最初からやり直す。

| 禁止パターン | 正しい手順 |
|---|---|
| test ブロックの存在だけで「実装済み」判定 | `grep -c "expect\|assert"` で**アサーション密度**を数値化し、`.catch(() => {})` 率も算出 |
| ファイル名で機能試験か判断 | 中身を Read し、アサーション有無・ `expect` 呼び出し・握りつぶしパターンを確認 |
| 「おそらく」「想定では」「一般的に」 | 行番号付きで実コードを引用する |
| サブエージェントの報告を鵜呑みにする | 主張が疑わしい箇所は自分で Read する |
| 全テストに単一の coverage_target を適用 | `coverage_targets` をレベル別に個別判定 |

**引用ルール**: 全ての判定に `path:line` 形式の出典を添える。例: `tests/e2e/demo-qa-recording.spec.ts:568-636`。

## レビュアー独立性レベル（JSTQB FL §1.4.4）

設定キー `reviewer_independence_level` で本スキルの動作モードが変わる。

| レベル | 独立性 | 説明 | スキル動作 |
|---|---|---|---|
| 1 | なし | 開発者が自分のコードを自分でテスト | **自己監査モード**。Phase 2 の AP-11〜14（設計技法不在）と F軸採点は参考値として出力するが、PASS/FAIL 判定に含めない |
| 2 | 同一チーム | 別の開発者がレビュー（同一チーム内） | **標準モード**。全 Phase を通常採点 |
| 3 | 別チーム | 独立テストチーム／QA チーム | **標準モード**＋ Phase 3.5 の Flaky Rate / DDP を必須化 |
| 4 | 別組織 | 外部監査・認証機関 | **厳格モード**。全項目に P0 閾値を適用、Iron Law 違反を自動 FAIL 扱い |

未設定時は Level 2（標準モード）。`/tdd` からの自動呼び出し時は強制的に Level 2 以上で動作する。

## 設定ファイル（プロジェクト側）

プロジェクトルートに `.claude/test-audit.config.json` を置く。未設定時は下記デフォルト値。

```json
{
  "requirements_doc":      "docs/01-requirements/requirements.md",
  "test_spec_doc":         "docs/04-testing/test-spec-functional.md",
  "non_functional_doc":    "docs/04-testing/test-spec-nonfunctional.md",
  "risk_matrix_doc":       "docs/03-project/risk-register.md",
  "test_dirs":             ["tests/unit", "tests/api", "tests/e2e"],
  "source_dirs":           ["src"],
  "test_id_pattern":       "F\\d+-\\d+",
  "coverage_targets": {
    "component":    80,
    "integration":  90,
    "system":       70,
    "acceptance":  100
  },
  "non_functional_coverage": {
    "performance": true,
    "security":    true,
    "usability":   false,
    "reliability": true
  },
  "reviewer_independence_level": 2,
  "demo_exclusion_globs":  ["**/demo-*recording*.spec.*", "**/demo-*.spec.*"],
  "weak_assertion_patterns": [
    "toBeTruthy\\(\\)$",
    "toBeFalsy\\(\\)$",
    "expect\\(\\[\\s*\\d+\\s*,\\s*\\d+\\s*\\]\\)",
    "\\|\\|\\s*\\).*toBeTruthy",
    "toBeGreaterThanOrEqual\\(1\\)$"
  ],
  "silenced_error_patterns": [
    "\\.catch\\(\\s*\\(\\)\\s*=>\\s*\\{\\s*\\}\\s*\\)",
    "\\.catch\\(\\s*\\(\\)\\s*=>\\s*(true|false|null)\\s*\\)"
  ]
}
```

- 旧 `coverage_target` (単一値) は後方互換のため、存在する場合は `coverage_targets.system` にマップ
- `reviewer_independence_level` は JSTQB FL §1.4.4 に基づくレベル 1〜4

## 起動時アクション

1. 「test-quality-auditor スキルを実行します」と宣言
2. `TodoWrite` で監査工程のチェックリストを作成:
   - Phase 0: 設定読み込み
   - Phase 1: トレーサビリティ監査
   - Phase 2: アサーション品質監査（AP-1〜14）
   - Phase 3: カバレッジ監査（テストレベル別）
   - Phase 3.5: Test Monitoring & 非機能品質
   - Phase 3.6: リスクベース網羅性
   - Phase 4: デモ収録分離チェック
   - Phase 5: 採点 & レポート生成
3. 各 Phase 完了時に TodoUpdate

## Phase 0: 前提の確定

以下を必ず実施してから他 Phase へ進む：

1. 設定ファイル読み込み（前節）
2. `git rev-parse --show-toplevel` でリポジトリルート取得、以降のパスは絶対パスに解決
3. `test_spec_doc` と `requirements_doc` の存在確認。無ければ **Phase 1 をスキップ**してユーザーに報告
4. `risk_matrix_doc` の存在確認。無ければ **Phase 3.6 をスキップ**（F軸は未評価として Critical 扱いで FAIL）
5. `test_dirs` の各ディレクトリの存在確認、`find` でテストファイル総数をカウント
6. Phase 0 サマリーを1行ログ: `[audit] root=... spec=found risk=found docs=4 tests=42 independence=2`

## Phase 1: トレーサビリティ監査（FL §5.1.2）

**目的**: 要件 → テスト仕様 → 実テストコード の3層が欠けなくつながっているか（Bidirectional Traceability）。

### 手順

1. **要件抽出**: `requirements_doc` を Read し、機能ID（`test_id_pattern` の親ID、例 `F\d+`）を抽出
2. **テスト仕様抽出**: `test_spec_doc` を Read し、各 `F\d+-\d+` ケースIDと概要を表に整理
3. **実テストコード抽出**: `grep -rnE '<test_id_pattern>' <test_dirs>` でテストコード内のID参照を網羅
4. **突合マトリックス生成**: 「要件機能 × 仕様ケース × 実装ケース」の3列表。各行に欠けを `MISSING` で記す

### アサーション密度チェック（重要）

「実装ケース」に分類する前に、以下を**必ず**確認：

```bash
# テストファイル内のアサーション数
grep -cE '\bexpect\(|\bassert\.|\.toBe|\.toEqual|\.toHaveBeenCalled' <file>

# 握りつぶし（silenced）の数
grep -cE '<silenced_error_patterns>' <file>
```

**判定ルール**:
- アサーション 0 件 → **実装なし** と分類（test ブロックが存在しても）
- 握りつぶし ≥ アサーションの 50% → **デモ収録候補**として警告

### 2指標の運用

仕様 → 実装網羅率は以下の **両方**を算出し、低い方を A-2 採点に採用：
- **F-ID 直接参照率**: テスト名/describe ブロックに `F\d+-\d+` が明記されている割合
- **内容ベース（ドメイン一致）率**: F-ID は無いが内容的にカバーしているケースの包含率

## Phase 2: アサーション品質監査（ATA §5）

`references/anti-patterns.md` の AP-1〜AP-14 を順に実プロジェクトに適用。

- AP-1〜AP-5: 弱アサーション（toContain 範囲・OR条件・toBeTruthy 空疎 等）
- AP-6: デモ収録の機能試験混入
- AP-7: モック戻り値のみ検証
- AP-8: 要件ID紐付け欠落
- AP-9: 境界値片側のみ
- AP-10: test.skip 放置
- **AP-11: Assertion Roulette**（1 test 内に無名 expect 多数）
- **AP-12: Test Interdependence**（beforeEach リセット欠落）
- **AP-13: Flaky Pattern**（waitForTimeout 濫用・retries:3）
- **AP-14: Missing Data-Driven**（it.each 未活用）

検出箇所は**全て**ファイル名・行番号・該当コード付きで出力。省略禁止。

## Phase 3: カバレッジ監査（FL §2.2 テストレベル別）

`coverage_targets` の各レベルで個別評価：

| レベル | 対応ディレクトリ | 目標 | 算出方法 |
|---|---|---|---|
| component | tests/unit/ | 80% | `vitest run --coverage` の statement coverage |
| integration | tests/api/ | 90% | 同上（API ルート対象のみ集計）|
| system | tests/e2e/ | 70% | 仕様ケース単位（形骸化除外後）|
| acceptance | tests/e2e/acceptance/ またはタグ `@acceptance` | 100% | クリティカルパス手動指定 |

各レベル個別に PASS/FAIL 判定、総合判定は「全レベル PASS」で PASS。

**形骸化テスト**: test ブロックは存在するが `expect` 数が 0、または `silenced_error_patterns` の比率が 50% を超えるもの。機能カバレッジの分子から除外。

## Phase 3.5: Test Monitoring & 非機能品質（FL §5.3 / ISO/IEC 25010）

### 監視指標の算出

- **DDP (Defect Detection Percentage)** = 検出欠陥 / (検出欠陥 + リリース後欠陥)。GitHub Issues の label 集計で代替
- **Flaky Rate** = 直近N回のリランで結果が変動したテスト数 / 総テスト数。CI ログ or `playwright-report/` から抽出
- **Test Execution Progress** = 実行済テスト数 / 計画テスト数

### 非機能試験仕様書との突合

`non_functional_coverage` で `true` のカテゴリのみ評価。ISO/IEC 25010 の 8 品質特性：

| 品質特性 | 評価例 |
|---|---|
| Functional Suitability | 機能試験で代替（軸A・B） |
| Performance Efficiency | LCP/FID/CLS・API応答時間・Lighthouse CI |
| Compatibility | ブラウザ/OS 互換性テスト |
| Usability | アクセシビリティ (axe)・キーボード操作 |
| Reliability | エラーハンドリング・リトライ・ロールバック |
| Security | 認証・認可・PII マスキング・CSP |
| Maintainability | コードレビュー・テスト保守性（本スキル本体）|
| Portability | 環境依存の切り分け |

## Phase 3.6: リスクベース網羅性（FL §5.2 / ATA §2）

1. `risk_matrix_doc` を Read し、Product Risk を High/Medium/Low に分類して抽出
2. 各リスク ID に対して、対応するテストケース（F-ID）を逆引き
3. High リスクに対するテスト不在は **P0 指摘**
4. F軸採点の入力として使用（F-1/F-2/F-3）

## Phase 4: デモ収録分離チェック

`demo_exclusion_globs` にマッチするファイルは **機能試験カウントから除外**。加えて：

1. マッチするファイルの `expect` 数と握りつぶし数を算出
2. マッチしないファイルで握りつぶし率が 50% を超える場合、「デモ収録ファイルに改名すべき」と警告
3. **デモ収録ファイルが機能試験の F-ID を test name に保持**している場合、E-2 を自動減点

## Phase 5: 採点 & レポート

`references/audit-rubric.md` の基準で採点（満点 78点、合格 63点）。出力は以下フォーマット：

```markdown
# テスト品質監査レポート

## 総評
{PASS|CONDITIONAL|FAIL}: {score}/78点

## 軸スコア
| 軸 | スコア | 備考 |
|---|---|---|
| A. トレーサビリティ | {a}/12 | 要件×仕様 {x}% / 仕様×実装 {y}% |
| B. 設計技法 | {b}/21 | Black-box {bb}/12 / White-box {wb}/3 / Experience {xp}/3 / Use Case {uc}/3 |
| C. アサーション客観性 | {c}/15 | 弱アサーション検出 {n}件 |
| D. カバレッジ | {d}/12 | Comp {dc}% / Int {di}% / Sys {ds}% / Acc {da}% |
| E. デモ分離 | {e}/9 | デモファイル {k}件 / 混入 {j}件 |
| F. リスクベース網羅性 | {f}/9 | High リスク {hr}件 / 未カバー {uc}件 |

## Test Monitoring 指標
- DDP: {ddp}% / Flaky Rate: {fr}% / Progress: {tp}%

## 非機能品質網羅率（config で true のカテゴリのみ）
- Performance: {p}% / Security: {s}% / Reliability: {r}% / ...

## Critical 判定
- A: {OK|CRITICAL_FAIL} / C: {..} / D: {..} / F: {..}

## 優先度別修正推奨
P0（リリース前必須）: ...
P1（カバレッジ欠落）: ...
P2（設計品質）: ...
```

採点ルーブリックの詳細は `references/audit-rubric.md`、アンチパターンの grep レシピは `references/anti-patterns.md`。

## /tdd との連携（Gate 2.6）

`/tdd` の Section 2.5 完了後、Gate 2.6 として本スキルを自動呼び出しできる：
- Phase 0-5 を順次実行、Phase 5 の採点スコアを受け取る
- 63点以上 → Gate 2.6 PASS → `/tdd-code-review` へ
- 47-62点 → CONDITIONAL → P0 のみ修正して再評価（最大2回）
- 46点以下 → FAIL → ユーザーに報告、TDD フロー停止
- Critical 軸 0点 → 即 FAIL

単独起動時は Phase 5 のレポートを出力して終了。`/tdd` 連携時はスコアのみを JSON で返す：

```json
{ "score": 68, "max": 78, "verdict": "PASS", "critical_ok": true, "issues": [...] }
```

## 禁止事項

1. 実ファイルを開かずに判定する
2. 「おそらく」「一般的に」等の推測表現を使う
3. サブエージェントの報告を検証なしに採用する
4. デモ収録ファイルを機能カバレッジに算入する
5. テスト仕様書が存在しないのにトレーサビリティスコアを付ける（Phase 1 スキップ必須）
6. 単一 coverage_target を 4 テストレベルに一律適用する（Iron Law 第二条違反）
7. リスクマトリクスなしに F軸を満点評価する

## 他プロジェクトへの流用

本スキルはプロジェクト非依存。新規プロジェクトで使う場合：
1. `.claude/test-audit.config.json` をプロジェクトルートに作成（上記 schema）
2. `requirements_doc`・`test_spec_doc`・`risk_matrix_doc`・`test_dirs` をそのプロジェクトの配置に合わせる
3. `test_id_pattern` を仕様書のID命名規則に合わせる（例: `REQ-\d+`, `US-\d+` 等）
4. `coverage_targets` は JSTQB 推奨（component 80% / integration 90% / system 70% / acceptance 100%）を踏襲、プロジェクト固有の目標がある場合のみ上書き
5. `non_functional_coverage` は ISO/IEC 25010 の 8 特性から該当するものを `true` に
6. 設定なしでも `test_dirs` のデフォルト（`tests/`）があれば Phase 2-4 は動作する

## Appendix: JSTQB シラバス参照表

| 本スキル要素 | JSTQB 対応章 |
|---|---|
| Phase 1 トレーサビリティ | FL §5.1.2 Bidirectional Traceability |
| Phase 2 AP-1〜10 | ATA §5 Test Code Review |
| Phase 2 AP-11〜14 | ATA §3 Test Design Techniques / §5 Test Smells |
| Phase 3 テストレベル別 | FL §2.2 Test Levels (Component / Integration / System / Acceptance) |
| Phase 3.5 監視指標 | FL §5.3 Test Monitoring and Control |
| Phase 3.5 非機能品質 | ISO/IEC 25010 Product Quality Model |
| Phase 3.6 リスクベース | FL §5.2 Risk-Based Testing / ATA §2 |
| F軸（機能リスク重みづけ） | FL §5.2 Risk-Based Testing |
| Iron Law 第二条（レベル区別） | FL §2.2 Test Levels |
| レビュアー独立性レベル | FL §1.4.4 Independence of Testing |
| 設計技法（B-1〜B-4, B-7） | FL §4.2 Black-Box Test Techniques |
| White-box（B-5） | FL §4.3 White-Box Test Techniques |
| Experience-based（B-6） | FL §4.4 Experience-Based Test Techniques |

参考シラバス：
- ISTQB CTFL Syllabus v4.0（2023年リリース）
- ISTQB CT-TA (Advanced Test Analyst) Syllabus v3.1.2
- ISO/IEC 25010:2011 (Product Quality Model)
