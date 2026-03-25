---
name: pom-generator
description: >
  Playwright Page Object Model (POM) の新規作成・既存POM更新スキル。プロジェクトのソースコードと
  Playwright MCPブラウザスナップショットを組み合わせて、ベストプラクティスに準拠したPOMクラスを生成する。
  以下の場合に使用：(1) 新しいページのPOMを作りたい (2) 既存POMをUIの変更に追随させたい
  (3) 「POMを作って」「POMを更新して」「Page Objectを生成」「ページオブジェクト作成」と言われた場合。
  TDDサイクル全体でテストを実装したい → /tdd を使うこと。
---

# POM Generator

Playwright POM（TypeScript）の新規作成と既存POM更新を行う。プロジェクトのソースコードとPlaywright MCPの両方を活用し、最適なロケータを選定する。

## Workflow

```
1. プロジェクト構造の検出
2. 対象ページの特定
3. ロケータ収集（MCP + ソースコード）
4. POM生成 or 更新
5. 確認
```

## Step 1: プロジェクト構造の検出

対象プロジェクトで以下を探索し、既存のPOM構造を把握する。

```bash
# 検索対象
playwright.config.ts        # Playwright設定
e2e/pages/ or tests/page-objects/  # 既存POMディレクトリ
e2e/fixtures/ or tests/fixtures/   # Fixture定義
```

**検出する情報:**
- POMファイルの配置ディレクトリ（`e2e/pages/`, `tests/page-objects/` 等）
- 既存POMのクラス命名規約（`LoginPage`, `login-page` 等）
- Fixture使用の有無
- `testIdAttribute` 設定（`data-testid`, `data-pw` 等）
- baseURL

既存POMがあればその規約に従う。なければ Playwright公式推奨パターンを使用。

## Step 2: 対象ページの特定

ユーザーに以下を確認する：

- **新規作成**: どのページ（URL パス）のPOMを作るか
- **更新**: どの既存POMファイルを更新するか

## Step 3: ロケータ収集

2つのソースを組み合わせてロケータを収集する。詳細は [references/locator-strategy.md](references/locator-strategy.md) を参照。

### 3a. Playwright MCP スナップショット（優先）

dev serverが起動中であれば、Playwright MCP を使用して実際のページを検査する。

1. `browser_navigate` で対象ページに遷移
2. `browser_snapshot` でアクセシビリティツリーを取得
3. ツリーからロール・名前・ラベルを抽出

**スナップショットからのロケータ生成ルール:**
- `button "Submit"` → `page.getByRole("button", { name: "Submit" })`
- `textbox "Email"` → `page.getByRole("textbox", { name: "Email" })`
- `heading "Settings" [level=1]` → `page.getByRole("heading", { name: "Settings" })`
- `link "Dashboard"` → `page.getByRole("link", { name: "Dashboard" })`

### 3b. ソースコード解析（補完）

プロジェクトのフロントエンドソース（TSX/JSX/Vue/HTML）を解析する。

```
検索対象:
- data-testid 属性
- aria-label / aria-labelledby
- role 属性
- <label> / htmlFor
- フォーム要素の name / id
```

### ロケータ優先順位

| 優先度 | ロケータ            | 使用場面                |
|--------|--------------------|-----------------------|
| 1      | `getByRole()`      | ボタン、リンク、見出し等  |
| 2      | `getByText()`      | 非インタラクティブテキスト |
| 3      | `getByLabel()`     | ラベル付きフォーム要素    |
| 4      | `getByPlaceholder()`| placeholder付きインプット |
| 5      | `getByAltText()`   | 画像                    |
| 6      | `getByTitle()`     | title属性              |
| 7      | `getByTestId()`    | data-testid属性        |
| 8      | `locator()`        | CSS/XPath（最終手段）    |

## Step 4: POM生成 / 更新

### 新規作成

POMテンプレートとパターンの詳細は [references/playwright-pom-patterns.md](references/playwright-pom-patterns.md) を参照。

以下の構造で生成する：

```typescript
import { type Page, type Locator, expect } from "@playwright/test";

export class [PageName]Page {
  readonly page: Page;
  // readonly locators...

  constructor(page: Page) {
    this.page = page;
    // locator assignments (getByRole preferred)
  }

  async goto() {
    await this.page.goto("/path");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectLoaded() {
    await expect(this.[mainElement]).toBeVisible();
  }

  // Action methods...
  // Dynamic locator methods (return Locator, not async)...
}
```

**生成ルール:**
- クラス名: `[PageName]Page`（PascalCase）
- ファイル名: プロジェクトの既存規約に従う（`LoginPage.ts` or `login-page.ts`）
- Locatorは`readonly`プロパティとしてコンストラクタで定義
- `goto()` メソッドは必須
- `expectLoaded()` メソッドを含める（ページ読み込み確認）
- アクションメソッドは操作単位でグループ化
- 動的ロケータ（パラメータ付き）はメソッドとして定義
- ポストコンディションassertionはPOM内、テストassertionはspec側

### 既存POM更新

1. 既存POMファイルを読む
2. Playwright MCPスナップショットとソースコードから現在のUI要素を収集
3. 差分を特定：
   - **追加**: 新しいUI要素 → locatorプロパティとアクションメソッドを追加
   - **変更**: セレクタの変更 → locator定義を更新
   - **削除**: 削除されたUI要素 → 該当プロパティとメソッドを削除（ただし使用箇所を確認）
4. 既存のコーディングスタイルを維持して更新

**更新時の注意:**
- 既存テストが壊れないか確認する（削除前にgrepでspec内の使用箇所をチェック）
- locator変更のみ行い、テストロジックは変えない
- 新しい要素は末尾に追加してdiffを最小化

## Step 5: 確認

生成・更新後に以下を確認：

1. TypeScriptの型エラーがないこと
2. 既存テストで使用中のlocatorが壊れていないこと（更新時）
3. ユーザーに結果を報告し、追加のアクションやメソッドが必要か確認

## References

- **[references/playwright-pom-patterns.md](references/playwright-pom-patterns.md)**: POMクラステンプレート、Fixtureパターン、マルチロールFixture等
- **[references/locator-strategy.md](references/locator-strategy.md)**: MCP/ソースコード両方のロケータ収集手法、UIパターン別ロケータ例
