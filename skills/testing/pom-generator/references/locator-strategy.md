# Locator Strategy Guide

## Table of Contents
- [Playwright MCP Inspection](#playwright-mcp-inspection)
- [Source Code Analysis](#source-code-analysis)
- [Hybrid Strategy Decision Tree](#hybrid-strategy-decision-tree)
- [Common UI Pattern Locators](#common-ui-pattern-locators)

## Playwright MCP Inspection

Use Playwright MCP `browser_snapshot` to capture the accessibility tree of the running page. This reveals:
- Role-based selectors (buttons, links, headings, form elements)
- Visible text content
- ARIA labels and relationships
- Interactive element states

### Snapshot Analysis Workflow

1. Navigate to the target page with `browser_navigate`
2. Take a snapshot with `browser_snapshot`
3. Parse the accessibility tree to extract:
   - All interactive elements (role + name)
   - Form fields (label associations)
   - Navigation structure
   - Data display regions

### Example: Extracting Locators from Snapshot

Snapshot output:
```
- button "Submit Form" [ref=s12]
- textbox "Email address" [ref=s15]
- heading "User Settings" [level=1]
- link "Go to Dashboard" [ref=s22]
```

Maps to:
```typescript
this.submitButton = page.getByRole("button", { name: "Submit Form" });
this.emailInput = page.getByRole("textbox", { name: "Email address" });
this.heading = page.getByRole("heading", { name: "User Settings", level: 1 });
this.dashboardLink = page.getByRole("link", { name: "Go to Dashboard" });
```

## Source Code Analysis

Analyze the project source (TSX/JSX/HTML/Vue) to find:

### data-testid Attributes
```bash
# Search for data-testid in source
grep -r 'data-testid=' src/ app/ components/
```
Maps to: `page.getByTestId("value")`

### ARIA Labels and Roles
```bash
# Search for aria attributes
grep -r 'aria-label\|aria-labelledby\|role=' src/ app/ components/
```

### Form Labels
```bash
# Search for label elements and htmlFor
grep -r '<label\|htmlFor=' src/ app/ components/
```

### Link and Button Text
```bash
# Search for interactive element text
grep -r '<button\|<a ' src/ app/ components/
```

## Hybrid Strategy Decision Tree

Choose the locator discovery method based on context:

```
Has running dev server?
├─ Yes → Use Playwright MCP snapshot (most accurate)
│        └─ Also read source for data-testid attributes
└─ No → Analyze source code only
         ├─ Has data-testid? → getByTestId
         ├─ Has aria-label? → getByRole/getByLabel
         ├─ Has visible text? → getByRole with name / getByText
         └─ CSS only → locator() (flag for improvement)
```

### When to Prefer MCP Snapshot
- Page has dynamic rendering (SSR, CSR, hydration)
- Components use UI libraries (shadcn/ui, MUI, Radix) that generate complex DOM
- Actual rendered text differs from source (i18n, computed values)

### When to Prefer Source Analysis
- No dev server available
- Static pages with minimal JavaScript
- Need to discover data-testid attributes
- Understanding component structure and props

## Common UI Pattern Locators

### Navigation
```typescript
this.navbar = page.getByRole("navigation");
this.menuItem = (name: string) => page.getByRole("menuitem", { name });
this.breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
```

### Forms
```typescript
this.emailInput = page.getByLabel("Email");
this.passwordInput = page.getByLabel("Password");
this.submitButton = page.getByRole("button", { name: "Submit" });
this.selectOption = page.getByRole("combobox", { name: "Category" });
this.checkbox = page.getByRole("checkbox", { name: "Agree to terms" });
```

### Tables
```typescript
this.table = page.getByRole("table");
this.headerCells = page.getByRole("columnheader");
this.rows = page.getByRole("row");
this.cell = (row: number, col: number) =>
  page.getByRole("row").nth(row).getByRole("cell").nth(col);
```

### Dialogs / Modals
```typescript
this.dialog = page.getByRole("dialog");
this.dialogTitle = page.getByRole("dialog").getByRole("heading");
this.closeButton = page.getByRole("dialog").getByRole("button", { name: "Close" });
this.confirmButton = page.getByRole("dialog").getByRole("button", { name: "Confirm" });
```

### Lists
```typescript
this.list = page.getByRole("list");
this.listItems = page.getByRole("listitem");
this.listItemByText = (text: string) => page.getByRole("listitem").filter({ hasText: text });
```

### Tabs
```typescript
this.tabList = page.getByRole("tablist");
this.tab = (name: string) => page.getByRole("tab", { name });
this.tabPanel = page.getByRole("tabpanel");
```
