# テストテンプレート集

TDDスキルの RED フェーズで使用するテンプレート。

---

## 単体テスト（Vitest）

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

---

## API統合テスト（Vitest）

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

---

## E2Eテスト（Playwright + POM）

E2Eテストは必ず POM 経由でページ操作する。直接 `page.getByTestId()` を使わない。

```typescript
import { test, expect } from "@playwright/test";
import { TargetPage } from "../page-objects/TargetPage";

test("機能名: 正常フロー", async ({ page }) => {
  // Arrange
  const targetPage = new TargetPage(page);
  await targetPage.goto();
  await targetPage.expectLoaded();

  // Act
  await targetPage.submitForm({ /* データ */ });

  // Assert
  await expect(targetPage.resultMessage).toBeVisible();
});
```

**POMが存在しない場合**: `/pom-generator` で先にPOMを生成してからテストを書く。

---

## AI出力テスト

AI出力は非決定的。以下で検証する:
- **構造検証**: プロパティの存在、型、配列長
- **キーワード検証**: 出力に含まれるべきキーワードのパターンマッチ
- **量的検証**: 出力の長さ、項目数の範囲チェック

既存ヘルパー: `tests/helpers/ai-assertion.ts`
