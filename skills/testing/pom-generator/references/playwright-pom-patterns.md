# Playwright POM Patterns Reference

## Table of Contents
- [Class Structure Template](#class-structure-template)
- [Fixture Pattern](#fixture-pattern)
- [Locator Strategy Priority](#locator-strategy-priority)
- [Actions vs Assertions](#actions-vs-assertions)
- [Multi-Role Fixture Pattern](#multi-role-fixture-pattern)

## Class Structure Template

```typescript
import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for [PageName]
 * URL: /path
 */
export class SamplePage {
  readonly page: Page;
  // Locators as readonly properties
  readonly heading: Locator;
  readonly submitButton: Locator;
  readonly nameInput: Locator;
  readonly errorMessage: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    // Prefer getByRole > getByText > getByLabel > getByTestId > locator
    this.heading = page.getByRole("heading", { name: "Sample Page" });
    this.submitButton = page.getByRole("button", { name: "Submit" });
    this.nameInput = page.getByLabel("Name");
    this.errorMessage = page.locator('[role="alert"]');
    this.dataTable = page.getByTestId("data-table");
  }

  /** Navigate to this page */
  async goto() {
    await this.page.goto("/sample");
    await this.page.waitForLoadState("domcontentloaded");
  }

  /** Verify page loaded successfully (postcondition check) */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  /** Fill and submit the form */
  async submitForm(name: string) {
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }

  /** Dynamic locator for table rows */
  tableRow(text: string) {
    return this.dataTable.locator("tbody tr").filter({ hasText: text });
  }
}
```

## Fixture Pattern

Wrap POMs in Playwright fixtures for automatic setup/teardown:

```typescript
// e2e/fixtures/my-test.ts
import { test as base } from "@playwright/test";
import { SamplePage } from "../pages/sample-page";

export const test = base.extend<{ samplePage: SamplePage }>({
  samplePage: async ({ page }, use) => {
    const samplePage = new SamplePage(page);
    await samplePage.goto();
    await use(samplePage);
  },
});

export { expect } from "@playwright/test";
```

```typescript
// e2e/tests/sample.spec.ts
import { test } from "../fixtures/my-test"; // NOT from @playwright/test

test("should display data", async ({ samplePage }) => {
  await samplePage.expectLoaded();
  // test assertions here
});
```

## Locator Strategy Priority

Use locators in this priority order:

| Priority | Locator              | Use For                           | Example                                             |
|----------|----------------------|-----------------------------------|-----------------------------------------------------|
| 1        | `getByRole()`        | Interactive elements              | `page.getByRole("button", { name: "Submit" })`     |
| 2        | `getByText()`        | Non-interactive text              | `page.getByText("Welcome")`                        |
| 3        | `getByLabel()`       | Form controls with labels         | `page.getByLabel("Email")`                          |
| 4        | `getByPlaceholder()` | Inputs with placeholder           | `page.getByPlaceholder("Enter email")`              |
| 5        | `getByAltText()`     | Images                            | `page.getByAltText("User avatar")`                  |
| 6        | `getByTitle()`       | Elements with title               | `page.getByTitle("Settings")`                       |
| 7        | `getByTestId()`      | Explicit test contracts           | `page.getByTestId("submit-btn")`                    |
| 8        | `locator()`          | CSS/XPath (last resort)           | `page.locator('input#email')`                       |

### Chaining & Filtering

```typescript
// Narrow scope by chaining
await page
  .getByRole("listitem")
  .filter({ hasText: "Product 2" })
  .getByRole("button", { name: "Add to cart" })
  .click();
```

## Actions vs Assertions

- **Postcondition assertions IN the POM**: Validate an action completed (e.g., navigation after click)
- **Test assertions IN the spec file**: Validate the behavior being tested
- **Expose locators as readonly**: Let tests write their own assertions
- **Always use web-first assertions**: `await expect(locator).toBeVisible()` (NOT `expect(await locator.isVisible()).toBe(true)`)

## Multi-Role Fixture Pattern

For apps with authentication roles:

```typescript
import { test as base, type Page, type Locator } from "@playwright/test";

class AdminPage {
  constructor(public readonly page: Page) {}
  readonly heading = this.page.getByRole("heading", { name: "Admin" });
}

type MyFixtures = { adminPage: AdminPage; userPage: UserPage };

export const test = base.extend<MyFixtures>({
  adminPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: "playwright/.auth/admin.json",
    });
    await use(new AdminPage(await ctx.newPage()));
    await ctx.close();
  },
});
```
