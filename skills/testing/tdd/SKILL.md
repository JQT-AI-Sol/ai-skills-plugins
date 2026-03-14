---
description: テスト駆動開発の統合スキル。変更内容を分析し、適切なテスト種別（単体/API統合/E2E）を判断、TDDサイクル（RED→GREEN→REFACTOR）で実装する。「テスト書いて」「TDD」「テスト追加」「品質チェック」で発火。
---

# TDD 統合スキル

テスト駆動開発のワークフローを実行する統合スキル。

---

## Section 1: コンテキスト分析

スキル起動時、まず変更内容を分析する。

```bash
# 1. 変更されたファイルを特定
git diff --name-only HEAD
git diff --name-only --staged
git status --short

# 2. 最近のコミットで変更されたファイル（未コミットがない場合）
git diff --name-only HEAD~1
```

変更ファイルのパスから、テストすべき対象を特定する。

---

## Section 2: テスト種別判定ロジック

変更ファイルのパスに基づき、必要なテスト種別を自動判定する。

| 変更パス | テスト種別 | テスト配置先 | ツール |
|---|---|---|---|
| `src/lib/**/*.ts` | 単体テスト | `tests/unit/` | Vitest |
| `src/app/api/**/*.ts` | API統合テスト | `tests/api/` | Vitest |
| `src/app/(authenticated)/**` | E2Eテスト | `tests/e2e/` | Playwright |
| `src/components/**` | E2Eテスト | `tests/e2e/` | Playwright |
| 複数パターンに該当 | 全該当種別 | 各配置先 | 両方 |

**判定ルール:**
1. 変更ファイルのパスをパターンマッチ
2. 該当する全てのテスト種別をリストアップ
3. 既存テストがあれば更新、なければ新規作成
4. ユーザーに判定結果を報告し、確認を取る

---

## Section 3: RED フェーズ（失敗テスト作成）

### 手順

1. テスト対象のコードを読み、公開APIを把握
2. AAA パターン（Arrange / Act / Assert）でテストを構造化
3. テストを書く（この時点で実装はまだない or 変更前）
4. テストを実行し、**失敗すること**を確認

### テスト設計チェックリスト

- [ ] 正常系: 期待どおりの入力で期待どおりの出力
- [ ] 境界値: 空文字、空配列、null、最大長
- [ ] 異常系: 不正入力、存在しないID、権限なし
- [ ] エッジケース: 同時実行、重複データ

### テンプレート（単体テスト）

```typescript
import { describe, it, expect } from "vitest";
import { targetFunction } from "@/lib/target-module";

describe("targetFunction", () => {
  it("正常な入力で期待結果を返す", () => {
    // Arrange
    const input = { /* テストデータ */ };

    // Act
    const result = targetFunction(input);

    // Assert
    expect(result).toEqual(/* 期待値 */);
  });

  it("不正な入力でエラーをスローする", () => {
    expect(() => targetFunction(null)).toThrow();
  });
});
```

### テンプレート（API統合テスト）

```typescript
import { describe, it, expect, vi } from "vitest";

describe("POST /api/endpoint", () => {
  it("正常なリクエストで200を返す", async () => {
    // Arrange
    const requestBody = { /* リクエストデータ */ };
    const request = new Request("http://localhost/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // Act
    const { POST } = await import("@/app/api/endpoint/route");
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("result");
  });
});
```

### テンプレート（E2Eテスト）

```typescript
import { test, expect } from "@playwright/test";

test("機能名: 正常フロー", async ({ page }) => {
  // Arrange
  await page.goto("/target-page");

  // Act
  await page.getByTestId("submit-button").click();

  // Assert
  await expect(page.getByTestId("result")).toBeVisible();
});
```

### RED フェーズ完了条件

- [ ] テストが**正しい理由で失敗**している（コンパイルエラーではなくアサーション失敗）
- [ ] テスト名が振る舞いを明確に記述している
- [ ] 1テスト = 1アサーション（原則）

---

## Section 4: GREEN フェーズ（最小実装）

### 手順

1. 失敗テストを通す**最小限のコード**を書く
2. テストを実行し、パスすることを確認
3. 他の既存テストが壊れていないことを確認

### ルール

- **YAGNI**: 今必要なコードだけ書く
- **テストバイパス禁止**: テストを修正してパスさせるのは禁止
- **一度に1テスト**: 複数テストを同時に通そうとしない

### GREEN フェーズ完了条件

- [ ] 新しいテストがパスしている
- [ ] 既存テストが壊れていない
- [ ] `npx vitest run` または `npm run test:e2e` が全パス

---

## Section 5: REFACTOR フェーズ（品質改善）

### チェックリスト

- [ ] 重複コードの除去
- [ ] 命名の改善（変数名、関数名が意図を表現しているか）
- [ ] 関数の分割（1関数1責任）
- [ ] テストコード自体の改善（共通セットアップの抽出など）
- [ ] 全テストがパスしたまま

### やらないこと（REFACTORフェーズ外）

- 新機能の追加
- パフォーマンス最適化（別タスクとして扱う）
- テストケースの追加（次のREDフェーズで行う）

---

## Section 6: テスト実行・検証

### 自動選択ロジック

テスト種別に応じて適切なコマンドを自動選択する。

```bash
# 単体テスト / API統合テスト → Vitest
npx vitest run

# 特定ファイルのみ
npx vitest run tests/unit/pii-masking.test.ts

# E2Eテスト → Playwright
npm run test:e2e

# 全テスト
npm run test
```

### 実行結果の検証

1. **全パス**: 次のフェーズへ進む
2. **失敗あり**: 失敗内容を分析
   - アサーション失敗 → 実装を修正（GREENフェーズ継続）
   - 環境エラー → 環境設定を修正
   - フレーキー → 根本原因を特定して修正

---

## Section 7: 失敗時の対応

テストが失敗し、原因が明らかでない場合は `/systematic-debugging` スキルに連携する。

### 連携手順

1. 失敗したテストの出力を記録
2. エラーメッセージとスタックトレースを保存
3. `/systematic-debugging` を呼び出し、以下を伝達:
   - 失敗テストのファイルパスと行番号
   - エラーメッセージ
   - 期待値と実際値の差分
   - 直近の変更内容

---

## Appendix: プロジェクト固有設定

### テスト3層の配置

```
tests/
├── unit/          # 単体テスト（Vitest）
│   └── *.test.ts
├── api/           # API統合テスト（Vitest）
│   └── *.test.ts
├── e2e/           # E2Eテスト（Playwright）
│   └── *.spec.ts
├── page-objects/  # POM（E2E用セレクタ管理）
├── manifests/     # 画面マニフェスト
└── helpers/       # テストヘルパー
```

### AI出力テスト

AI出力は非決定的。以下で検証する:
- **構造検証**: プロパティの存在、型、配列長
- **キーワード検証**: 出力に含まれるべきキーワードのパターンマッチ
- **量的検証**: 出力の長さ、項目数の範囲チェック

既存ヘルパー: `tests/helpers/ai-assertion.ts`

### E2Eテスト固有ルール

- UIセレクタは `data-testid` を使用
- Page Object Model は `tests/page-objects/` に配置
- 画面マニフェストは `tests/manifests/` に配置
- 既存の E2E 規約は `CLAUDE.md` の「E2Eテスト基盤」セクション参照

### カバレッジ基準

| 指標 | 基準値 |
|---|---|
| 行カバレッジ | 80% |
| 分岐カバレッジ | 75% |
| クリティカルパス（PII保護、認証、データ永続化） | 100% |
