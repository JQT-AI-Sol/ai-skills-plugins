# Audit Rubric（JSTQB Foundation v4.0 + ATA v3.1.2 準拠）

test-quality-auditor スキルが Phase 5 で使用する採点ルーブリック。各項目 0〜3点の4段階評価。

## 評価軸一覧

| 軸 | 配点 | Critical | 評価対象 | JSTQB 対応 |
|---|---|---|---|---|
| A. トレーサビリティ | 12点 | ✅ | 要件 → テスト仕様 → 実テストコードの3層接続 | FL §5.1.2 |
| B. 設計技法適用 | 21点 | — | Black-box + White-box + Experience-based + Use Case | FL §4 全章 |
| C. アサーション客観性 | 15点 | ✅ | 弱アサーション・握りつぶし・OR条件の不在 | ATA §5 |
| D. カバレッジ | 12点 | ✅ | テストレベル別（Component/Integration/System/Acceptance） | FL §2.2 |
| E. デモ収録分離 | 9点 | — | デモスクリプトと機能試験の明確な分離 | — |
| F. リスクベース網羅性 | 9点 | ✅ | Product Risk 特定・優先順位・軽減エビデンス | FL §5.2 / ATA §2 |

**満点 78点 / 合格ライン 63点（80%） / 条件付合格 47-62点（60-79%） / 不合格 46点以下**

Critical 軸（A, C, D, F）のいずれかが 0点 → スコアに関係なく FAIL。

---

## 軸 A. トレーサビリティ（12点、Critical）

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| A-1. 要件 → 仕様網羅率 | 3 | 未算出 or <60% | 60-79% | 80-94% | 95%以上 |
| A-2. 仕様 → 実装網羅率 | 3 | 未算出 or <50% | 50-69% | 70-89% | 90%以上 |
| A-3. `path:line` 引用の徹底 | 3 | 引用なし | 一部のみ | 主要判定のみ | 全判定に引用 |
| A-4. 未カバー機能のリスク分類 | 3 | 未分類 | High/Medium/Low のみ | リスク説明あり | リスク + 影響範囲 + 対応期限 |

**カウント方法**：
- 実装網羅率は「アサーション 0 件のテスト（形骸化）」を **未実装** として扱った後の数値
- 引用は `tests/e2e/foo.spec.ts:42` 形式。ファイル名のみ・セクション名は不可
- A-2 は「F-ID 直接参照率」と「内容ベース（ドメイン一致）率」の2指標を併記し、低い方を採点に採用

---

## 軸 B. 設計技法適用（21点）

JSTQB FL v4.0 §4 の Test Techniques 3分類（Black-box / White-box / Experience-based）+ Use Case Testing を網羅。

### B-1〜B-4: Black-box Techniques（FL §4.2）

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| B-1. 同値分割（§4.2.1） | 3 | 適用なし | 有効クラスのみ | 有効+無効の一部 | 全機能で有効・無効両方 |
| B-2. 境界値分析（§4.2.2） | 3 | 適用なし | 一部の上限/下限のみ | 上限+下限 | 上限±1・下限±1 の4点（2-value or 3-value BVA） |
| B-3. 決定テーブル（§4.2.3） | 3 | 未実施 | 単独条件のみ | 2条件組合せ | 全組合せ or RBAC matrix / `it.each` 活用 |
| B-4. 状態遷移テスト（§4.2.4） | 3 | 未実施 | 主遷移のみ | 主+異常遷移 | 全遷移 + 0-switch/1-switch カバレッジ |

### B-5: White-box Techniques（FL §4.3）

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| B-5. カバレッジ計測（§4.3.1〜4.3.3） | 3 | レポート未出力 | Statement のみ | Statement + Branch | Statement + Branch + Condition（MC/DC 相当） |

**検出手順**：
- `vitest run --coverage` または `npx playwright test --reporter=html` の出力確認
- `coverage/lcov-report/index.html` または `coverage-final.json` の存在と内容
- `.claude/test-audit.config.json` の `coverage_targets` と比較
- Istanbul / v8 どちらの provider でも可。3点は **branch coverage ≥ 80% かつ condition coverage が明示** が条件

### B-6: Experience-based Techniques（FL §4.4）

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| B-6. 経験ベーステスト（§4.4.1〜4.4.3） | 3 | 記録なし | Checklist のみ | Checklist + Error Guessing の痕跡 | Exploratory session notes + Error Guessing + Checklist の3本立て |

**検出手順**：
- `docs/04-testing/` 配下に `exploratory-*.md` / `checklist-*.md` / `error-guessing-*.md` の存在
- PR 本文または Issue コメントに "探索的テスト" "エラー推測" "チャーター" の記述
- テスト名に "edge case" "unusual" "negative" などの命名痕跡

### B-7: User Story / Use Case Testing（FL §4.2.5）

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| B-7. ユースケース網羅 | 3 | 未実施 | 主シナリオのみ | 主+代替シナリオ | 主+代替+例外の全フロー / acceptance criteria 100% 対応 |

**検出手順**：
- `tests/e2e/*.spec.ts` と `requirements_doc` の user story を突合
- 各ストーリーに対応する E2E スペックが存在するか（`requirement-id` タグまたは `describe` ブロック名で逆引き）
- 代替フロー・例外フローの test ブロック数をカウント

---

## 軸 C. アサーション客観性（15点、Critical）

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| C-1. 弱アサーション検出数 | 3 | 10件以上 | 5-9件 | 1-4件 | 0件 |
| C-2. 範囲判定 `[x,y].toContain()` | 3 | 3件以上 | 2件 | 1件 | 0件 |
| C-3. 握りつぶし `.catch(() => {})` | 3 | 10件以上 | 5-9件 | 1-4件 | 0件 |
| C-4. Assertion Roulette / OR合計判定 | 3 | 3件以上 or msg率<20% | 2件 | 1件 | 0件・msg率≥80% |
| C-5. 期待値の具体性 | 3 | `toBeTruthy`多用 | 一部具体的 | 多くが具体値 | 全て具体値・構造 |

**カウント手順**：
- `Bash` で `weak_assertion_patterns` を順に grep し件数を数える
- テストファイル数 ÷ 検出件数を「検出密度」として補助指標にする
- 意図的な握りつぶし（ダイアログ操作等）はコメントで justify されていれば減点対象から除外

---

## 軸 D. カバレッジ（12点、Critical）

JSTQB FL §2.2 の 4 テストレベル（Component / Integration / System / Acceptance）別に評価。

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| D-1. テストレベル別カバレッジ達成率 | 3 | いずれか未計測 | 1レベル達成 | 2〜3レベル達成 | 4レベル全て target 達成 |
| D-2. Test Independence（AP-12） | 3 | 実行順依存が常態 | 一部にリセット欠落 | 概ね beforeEach あり | 全ファイルに beforeEach + `vi.resetAllMocks` |
| D-3. Flaky 率（AP-13） | 3 | retries≥3 濫用 or waitForTimeout 11件以上 | 6-10件 | 3-5件 | 0-2件 |
| D-4. 形骸化テストの扱い | 3 | カウントに混入 | 部分的に除外 | 概ね除外 | 完全除外・再実装計画あり |

**参照する `.claude/test-audit.config.json`**：
```json
"coverage_targets": {
  "component":   80,
  "integration": 90,
  "system":      70,
  "acceptance": 100
}
```

達成率 = 実測値 / target。0.95 以上で該当レベル「達成」とみなす。

**形骸化テスト**: test ブロックは存在するが `expect` 数が 0、または `silenced_error_patterns` の比率が 50% を超えるもの。

---

## 軸 E. デモ収録分離（9点）

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| E-1. ファイル名規約 | 3 | 混在 | 一部分離 | ディレクトリ分離 | 命名規約+ディレクトリ |
| E-2. 機能試験への混入 | 3 | 多数混入 | 数件混入 | 境界曖昧 | 完全分離 |
| E-3. カバレッジ集計からの除外 | 3 | 未除外 | 手動除外 | glob 除外設定あり | 除外 + CI で自動検証 |

**判定基準**：
- `demo_exclusion_globs` 設定が存在するか
- 機能試験ファイルに `showCaption` `waitForTimeout` 等のデモ系APIが混入していないか
- デモファイル内に `expect` がどれだけ含まれるか（多すぎると分離が曖昧）
- **デモ収録ファイルが機能試験の F-ID を test name に保持している場合、E-2 を自動で 0〜1点**

---

## 軸 F. リスクベース網羅性（9点、Critical）

JSTQB FL §5.2 / ATA §2 に対応する Product Risk 管理の評価。

| 項目 | 配点 | 0点 | 1点 | 2点 | 3点 |
|---|---|---|---|---|---|
| F-1. Product Risk 特定 | 3 | リスク一覧なし | 機能リスト止まり（impact/likelihood 未評価）| impact × likelihood の一方のみ評価 | High/Medium/Low の 2軸マトリクス完成・定期レビュー記録 |
| F-2. リスクに応じた優先順位付け | 3 | 優先度未設定 | High/Low の二値のみ | High 機能の優先割当が一部 | High リスク = P0 必須・実行順もリスク順・`@priority-high` タグ等で機械可読 |
| F-3. リスク軽減エビデンス | 3 | 逆引き不可 | 一部マッピング | 全 High リスクに対応テストあり（逆引き可）| 全 High → テスト → 実行結果の3層逆引き + 残存リスクの明示 |

### Critical 扱いの根拠

- **リスク未特定 = テスト戦略の根拠不在**（FL §5.2.2）
- **High リスク未テスト = 即座に業務リスク**
- **逆引き不可 = 軸A トレーサビリティ成立基盤を欠く**

**F軸が 0点 → 即 FAIL**。

### 検出手順

1. `risk_matrix_doc` (デフォルト `docs/03-project/risk-register.md`) の存在確認と、各リスクに impact / likelihood / priority 列があるか
2. risk-register と `tests/manifests/` / E2E `describe` ブロックの逆引き表の有無
3. CI 設定（`playwright.config.ts` の `grep` / `project` 設定）で High リスクが優先実行されているか
4. 残存リスク（unmitigated risk）がリリースノートまたは PR 本文に明記されているか

---

## 判定フロー

```
A-F 各軸のスコアを集計
  ↓
Critical 軸（A, C, D, F）に 0点あり？
  ├ Yes → FAIL（スコアに関係なく）
  └ No  → 総スコア計算
      ├ 63点以上 → PASS
      ├ 47-62点 → CONDITIONAL（P0 のみ修正して再評価、最大2回）
      └ 46点以下 → FAIL
```

---

## レポート出力テンプレート

```markdown
## 採点結果: {PASS|CONDITIONAL|FAIL} ({total}/78点)

| 軸 | スコア | 備考 |
|---|---|---|
| A. トレーサビリティ | {a}/12 | 要件×仕様 {x}% / 仕様×実装 {y}% |
| B. 設計技法 | {b}/21 | Black-box {bb}/12 / White-box {wb}/3 / Experience {xp}/3 / Use Case {uc}/3 |
| C. アサーション客観性 | {c}/15 | 弱アサーション検出 {n}件 |
| D. カバレッジ | {d}/12 | Component {dc}% / Integration {di}% / System {ds}% / Acceptance {da}% |
| E. デモ分離 | {e}/9 | デモファイル {k}件 / 混入 {j}件 |
| F. リスクベース網羅性 | {f}/9 | High リスク {hr}件 / 未カバー {uc}件 / 逆引き {yn} |

### Critical 判定
- A（トレーサビリティ）: {OK|CRITICAL_FAIL}
- C（アサーション）: {OK|CRITICAL_FAIL}
- D（カバレッジ）: {OK|CRITICAL_FAIL}
- F（リスク網羅）: {OK|CRITICAL_FAIL}

### JSTQB FL v4.0 対応表
- §2.2 Test Levels → 軸 D
- §4.2 Black-box → B-1〜B-4, B-7
- §4.3 White-box → B-5
- §4.4 Experience-based → B-6
- §5.2 Risk-based Testing → 軸 F
- §5.1.2 Bidirectional Traceability → 軸 A
- ATA §5 Test Code Review → 軸 C
```

---

## 減点ガイドライン（テクニック）

「ゼロ件なら満点」の単純加算を避けるため、以下の減点調整を行う：

1. **意図の明示**: コメントで `// 一時的に許容, TODO: #123` 等の justify があれば、弱アサーション 1件につき 0.5点 の減点緩和
2. **テスト総数との相対**: 検出件数 / テスト総数が 1% 未満なら該当項目の減点を 1段階抑制
3. **最近追加されたテスト**: `git log -p` で直近2週間以内の追加は「改善中」とみなし、減点を抑制（ただし Critical 軸 A/C/D/F のみ対象外）
4. **レビュアー独立性**: `reviewer_independence_level=1`（自己監査）の場合、B-6 と F軸の採点は参考値として出力し、PASS/FAIL 判定に含めない

これらの調整は採点者が適用を判断し、レポートに理由を明記する。
