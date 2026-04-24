# Test Anti-Patterns（検出レシピ集）

test-quality-auditor が Phase 2 で使う具体的な grep パターンと、検出したときの判定基準・修正例。

---

## AP-1. 範囲判定 `expect([x, y]).toContain(status)`

HTTPステータスなど厳密に1値で判定すべき場面で、複数値を許容するアンチパターン。**失敗状態を合格扱いにする**。

### 検出

```bash
grep -rnE 'expect\(\[\s*[0-9]+\s*,\s*[0-9]+\s*\]\)' <test_dirs>
```

### 典型例

```typescript
// ❌ BAD: cases.test.ts:180
expect([201, 500]).toContain(response.status);

// ❌ BAD: api-rbac.spec.ts:227
expect([403, 500]).toContain(res.status());
```

### 判定

- 件数 0 → C-2: 3点
- 1件 → C-2: 2点（justify コメント無しなら 1点）
- 2件 → C-2: 1点
- 3件以上 → C-2: 0点

### 修正例

```typescript
// ✅ GOOD: 成功パスを単一値で確定
expect(response.status).toBe(201);
expect(mockClient._qb.insert).toHaveBeenCalledWith(...);

// ✅ エラーパスは別テストに分離
test("DB insert 失敗で 500 を返す", async () => {
  mockClient._qb.insert.mockRejectedValueOnce(new Error("insert failed"));
  const res = await POST(req);
  expect(res.status).toBe(500);
});
```

---

## AP-2. OR条件 `expect(a || b).toBeTruthy()`

複数条件のうち片方でも真なら合格になるパターン。**条件の誤組み合わせを検知不可**。

### 検出

```bash
grep -rnE 'expect\([^)]*\|\|[^)]*\)\.toBeTruthy' <test_dirs>
```

### 典型例

```typescript
// ❌ BAD: dashboard.spec.ts:51
expect(hasTable || hasEmpty, "案件テーブルまたは空状態").toBeTruthy();

// ❌ BAD: hearing-flow.spec.ts:177
expect(hasRed || hasGreen, "赤カードまたは緑カード").toBeTruthy();
```

### 判定

件数ベースでカウント。C-1 と C-5 に影響。

### 修正例

```typescript
// ✅ GOOD: 前提条件に応じて expect を分岐
if (await someCondition()) {
  await expect(dashboard.caseListTable).toBeVisible();
} else {
  await expect(dashboard.caseListEmpty).toContainText("案件がありません");
}
```

「どちらでも合格」は情報量ゼロ。「ここではどちらのはずだから、それを検証する」まで踏み込む。

---

## AP-3. OR合計判定 `expect(a + b).toBeGreaterThanOrEqual(1)`

複数要素の合計が1以上なら合格するパターン。**片方が 0 でも通る**。

### 検出

```bash
grep -rnE 'toBeGreaterThanOrEqual\(1\)' <test_dirs>
```

### 典型例

```typescript
// ❌ BAD: analysis.spec.ts:71
expect(gapCount + actionCount).toBeGreaterThanOrEqual(1);
```

### 修正例

```typescript
// ✅ GOOD: それぞれ個別に検証
expect(gapCount).toBeGreaterThanOrEqual(1);
expect(actionCount).toBeGreaterThanOrEqual(1);

// AI出力で量のブレを許容したい場合は、構造の存在を検証
await expect(analysisPage.gapSection).toBeVisible();
await expect(analysisPage.actionSection).toBeVisible();
```

---

## AP-4. 握りつぶし `.catch(() => {})`

Promise の失敗を無視するパターン。**テスト失敗が隠蔽される**。

### 検出

```bash
grep -rnE '\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)' <test_dirs>
grep -rnE '\.catch\(\s*\(\)\s*=>\s*(true|false|null)\s*\)' <test_dirs>
```

### 典型例

```typescript
// ❌ BAD: demo-qa-recording.spec.ts
await page.getByTestId("pdf-download-button").click({ force: true }).catch(() => {});
await page.getByTestId("resume-heading").waitFor({ state: "visible" }).catch(() => {});
```

### 判定

- テスト 1ファイル 1件まで: 減点なし（意図的なダイアログ回避等）
- ファイル内に 3件以上: C-3 の減点対象
- `expect` 数 > `.catch(() => {})` 数 × 2 でなければ「デモ収録候補」としてフラグ

### 修正例

```typescript
// ✅ GOOD: 失敗はテストとして fail させる
await page.getByTestId("pdf-download-button").click({ force: true });

// ✅ 想定内の失敗は expect でアサート
await expect(page.getByTestId("resume-heading")).toBeVisible({ timeout: 15_000 });

// ✅ 見つからない可能性がある場合は存在チェックを先に
const heading = page.getByTestId("resume-heading");
if (await heading.isVisible().catch(() => false)) {
  // ...
} else {
  test.skip(true, "resume-heading が存在しない環境");
}
```

---

## AP-5. 空疎な `toBeTruthy()` / `toBeDefined()`

「存在するかどうか」だけを見て、値の妥当性を検証しないパターン。

### 検出

```bash
grep -rnE '\.toBeTruthy\(\)$' <test_dirs>
grep -rnE '\.toBeDefined\(\)$' <test_dirs>
```

### 典型例

```typescript
// ❌ BAD: case-detail.spec.ts:133
const progressText = await caseDetail.getProgressText();
expect(progressText).toBeTruthy(); // 空文字・"0 / 0" でも通過
```

### 修正例

```typescript
// ✅ GOOD: パターンで検証
expect(progressText).toMatch(/^\d+ \/ \d+$/);

// ✅ 具体値で検証
expect(progressText).toBe("3 / 7");

// ✅ 範囲で検証
const [done, total] = progressText.split("/").map(s => Number(s.trim()));
expect(total).toBeGreaterThan(0);
expect(done).toBeLessThanOrEqual(total);
```

---

## AP-6. デモ収録の機能試験混入

`showCaption`・`waitForTimeout` 大量使用などは機能試験ではなくデモ収録スクリプト。カウントに混ざると機能カバレッジが過大評価される。

### 検出

```bash
# 機能試験ファイル内にデモAPIが多数
grep -rnE 'showCaption|scrollToBottom|await page\.waitForTimeout' \
  <test_dirs> --include='*.spec.ts' \
  | grep -v 'demo-' | awk -F: '{print $1}' | sort | uniq -c | sort -rn

# expect 数と比較
for f in $(find <test_dirs> -name "*.spec.ts"); do
  expects=$(grep -cE '\bexpect\(' "$f")
  silenced=$(grep -cE '\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)' "$f")
  echo "$f | expect=$expects | silenced=$silenced | ratio=$(( silenced * 100 / (expects + 1) ))%"
done
```

### 判定

- `silenced / expect > 50%` → デモ収録候補
- `expect == 0` → 機能試験として無効（形骸化）
- ファイル名が `demo_exclusion_globs` にマッチしない → E-2 減点

### 修正例

**ファイル分離**:

```
tests/e2e/
├── f12-testimony-matrix.spec.ts  # 機能試験（expectあり、握りつぶしなし）
└── demo-videos/
    └── f12-testimony-matrix.demo.ts  # デモ収録（showCaption等）
```

`playwright.config.ts` で project を分けると明確：

```typescript
projects: [
  { name: "functional", testMatch: /.*\.spec\.ts$/ },
  { name: "demo",       testMatch: /.*\.demo\.ts$/  },
],
```

---

## AP-7. モック戻り値の確認だけで実処理未検証

API統合テストで、モックアウトした関数の戻り値を確認しているだけのパターン。PII マスキング・認証・外部API呼び出し等が検証されない。

### 検出

```bash
# 同一テストファイルで vi.mock / jest.mock が多数定義されている箇所
grep -rnE '(vi|jest)\.mock\(' <test_dirs>

# そのテスト内で expect が戻り値のみに限定されていないか目視確認
```

### 典型例

```typescript
// ❌ BAD: ai.test.ts
vi.mock("@/lib/rag/search-guidelines", () => ({
  searchGuidelinesMultiQuery: vi.fn().mockResolvedValue([]),
}));

it("正常なリクエストで質問を返す", async () => {
  // モックを使っているだけで、PII マスキングやプロンプト構築は検証されない
  const response = await POST(request);
  expect(response.status).toBe(200);
});
```

### 判定

単独の数値化は困難。以下を指摘として記録：
- モック関数の呼び出し引数を `expect(mockFn).toHaveBeenCalledWith(...)` で検証しているか
- 検証していない → B-3（決定テーブル）や C-5（期待値の具体性）で減点

### 修正例

```typescript
// ✅ GOOD: モックの呼び出し引数を検証
it("LLM に渡されるプロンプトに PII がマスクされている", async () => {
  const llmMock = vi.fn().mockResolvedValue({ object: {} });
  vi.mocked(generateObject).mockImplementation(llmMock);

  await POST(requestWithPersons([
    { role: "victim", name: "田中太郎" },
  ]));

  const calledWith = llmMock.mock.calls[0][0].prompt;
  expect(calledWith).not.toContain("田中太郎");
  expect(calledWith).toContain("被害生徒A");
});
```

---

## AP-8. 要件IDとの紐付け欠落

テストが仕様書のどのケースをカバーしているか追えないパターン。

### 検出

```bash
# テスト仕様書から ID を抽出
grep -oE '<test_id_pattern>' <test_spec_doc> | sort -u > /tmp/spec_ids.txt

# テストコードから ID 参照を抽出
grep -rhoE '<test_id_pattern>' <test_dirs> | sort -u > /tmp/test_ids.txt

# 差分
comm -23 /tmp/spec_ids.txt /tmp/test_ids.txt  # 仕様にあるがテストにない
comm -13 /tmp/spec_ids.txt /tmp/test_ids.txt  # テストにあるが仕様にない
```

### 判定

- 仕様ID が全てテストコードの describe/it/test 名にある → A-2: 3点
- 80-94% → 2点
- 60-79% → 1点
- <60% → 0点

### 修正例

```typescript
// ✅ GOOD: テスト名に仕様IDを含める
test("F11-06: アクションプランセクションが常に表示される", async () => { ... });
test("F09-01: C4案件で重大事態アラートが表示される", async () => { ... });
```

---

## AP-9. 境界値の片側だけテスト

上限のみ・下限のみしかテストしていないパターン。

### 検出

数値引数・文字数上限などを持つ関数について、仕様書に書かれた境界値と実テストを突合。

### 典型例

```typescript
// ❌ BAD: 上限のみ
it("current_step=8 でエラーになる", () => { ... });

// 下限（0）と上限+1（8）の片方しかテストされていない
```

### 修正例

```typescript
// ✅ GOOD: 4点全てテスト
it("current_step=0 (下限-1) でエラー", () => { ... });
it("current_step=1 (下限)     で成功", () => { ... });
it("current_step=7 (上限)     で成功", () => { ... });
it("current_step=8 (上限+1) でエラー", () => { ... });
```

B-2（境界値分析）の採点に直結。

---

## AP-10. `test.skip` / `test.fixme` の放置

### 検出

```bash
grep -rnE '\b(test|it)\.(skip|fixme)\(' <test_dirs>
```

### 判定

- 各 skip にコメントで理由 + issue/ticket 番号が書かれているか
- 書かれていない → D-4（形骸化テストの扱い）で減点

### 修正例

```typescript
// ❌ BAD
test.skip("ヒアリング保存", async () => { ... });

// ✅ GOOD
test.skip("ヒアリング保存 — #123: DBロック問題で再現不可、修正後に有効化", async () => { ... });
```

---

## AP-11. Assertion Roulette（ATA v3.1.2 §5）

1つの `it`/`test` 内に**無名の expect が複数並び**、失敗時にどのアサーションが落ちたか特定できないパターン。Meszaros の xUnit Test Patterns で定義された古典的テストスメル。

### 検出

```bash
# 1 テストブロック内の expect 数を awk で数える（5件以上をフラグ）
awk '/^\s*(it|test)\(/{flag=1; count=0; line=NR; next}
     /^\s*\}\)/{if(flag && count>5) print FILENAME":"line" expects="count; flag=0}
     flag && /expect\(/{count++}' <test_dirs>/**/*.ts

# message 引数率（expect に第2引数でメッセージが付いているか）
grep -rnE 'expect\([^,]+,\s*"' <test_dirs> | wc -l  # 有message
grep -rnE 'expect\(' <test_dirs> | wc -l             # 全体
```

### 典型例

```typescript
// ❌ BAD: 1 test 内に無名 expect 8 個
it("ユーザー作成が成功する", async () => {
  const user = await createUser(data);
  expect(user).toBeDefined();
  expect(user.id).toBeTruthy();
  expect(user.name).toBe("田中");
  expect(user.email).toBe("a@b.c");
  expect(user.role).toBe("teacher");
  expect(user.createdAt).toBeTruthy();
  expect(user.school_id).toBe("s1");
  expect(db.users).toHaveLength(1); // ← どれで落ちたか分からない
});
```

### 判定

- 1 test 内 expect ≤ 3 かつ message 率 ≥ 80% → C-4: 3点
- expect 5-7 → C-4: 2点（message 引数で補えれば緩和）
- expect 8-10 → C-4: 1点
- expect 11 以上または message 率 < 20% → C-4: 0点

### 修正例

```typescript
// ✅ GOOD: プロパティ単位に it を分解 or 構造比較
describe("createUser", () => {
  it("ID・作成日時が自動採番される", async () => {
    const user = await createUser(data);
    expect(user.id).toMatch(/^user-\w+$/);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("入力値がそのまま反映される", async () => {
    const user = await createUser({ name: "田中", email: "a@b.c", role: "teacher" });
    expect(user).toMatchObject({ name: "田中", email: "a@b.c", role: "teacher" });
  });
});

// または message を必須にする
expect(user.name, "name should be preserved from input").toBe("田中");
```

---

## AP-12. Test Interdependence / Shared State（FL v4.0 §1.4.4）

`beforeEach` での state リセットが欠落、モジュールスコープ変数の汚染、DB/ファイル共有 state などで**テスト実行順に依存して結果が変わる**パターン。

### 検出

```bash
# モジュールスコープの変更可能変数を抽出（const 以外）
grep -rnE '^\s*(let|var)\s+\w+\s*=' <test_dirs>/**/*.ts | grep -v 'const'

# beforeEach / afterEach を持たないテストファイルを検出
find <test_dirs> -name "*.test.ts" -o -name "*.spec.ts" | while read f; do
  if ! grep -qE 'beforeEach|afterEach|vi\.resetAllMocks|vi\.resetModules' "$f"; then
    echo "MISSING_RESET: $f"
  fi
done
```

### 典型例

```typescript
// ❌ BAD: モジュールスコープで共有、リセットなし
let mockClient = createMockSupabase();

describe("cases", () => {
  it("作成できる", async () => {
    mockClient._qb.insert.mockResolvedValueOnce({ data: { id: "c1" } });
    // ...
  });

  it("一覧が取れる", async () => {
    // 前テストのモック状態が残っている可能性
    const result = await GET();
    expect(result.data).toHaveLength(1); // ← 順序依存
  });
});
```

### 判定

- 全テストファイルに `beforeEach` + リセット → D-2: 3点
- 一部にリセット欠落 → D-2: 2点
- `vi.resetAllMocks()` / `vi.resetModules()` が無く mock 状態が明示的に漏れる → D-2: 1点
- 実行順を前提にしたテスト（`it("ステップ1"); it("ステップ2 (前提: 1)")`）が存在 → D-2: 0点

### 修正例

```typescript
// ✅ GOOD: 各テストで独立した状態を保証
describe("cases", () => {
  let mockClient: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockClient = createMockSupabase();
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("作成できる", async () => {
    mockClient._qb.insert.mockResolvedValueOnce({ data: { id: "c1" } });
    // ...
  });
});
```

---

## AP-13. Flaky Pattern（ATA v3.1.2 §3 / FL v4.0 §5.1.3）

タイミング依存・乱数依存・外部API実叩き・リトライ濫用でテスト結果が非決定的になるパターン。

### 検出

```bash
# 固定時間待機（ms 指定が大きいもの）
grep -rnE 'waitForTimeout\(\s*[0-9]{4,}' <test_dirs>

# 乱数・実時刻依存
grep -rnE 'Math\.random|Date\.now\(\)' <test_dirs>

# retries 濫用
grep -rnE 'test\.(describe\.)?configure\(\s*\{\s*retries' <test_dirs>

# skip/only 濫用
grep -rnE '(it|test)\.(skip|only|fixme)\(' <test_dirs> | wc -l

# ネットワーク実叩き
grep -rnE 'fetch\(|axios\.|\.request\(' <test_dirs> | grep -v 'mock\|vi\.mock\|jest\.mock'
```

### 典型例

```typescript
// ❌ BAD: 固定時間待機 + retries 3 でフレークを隠蔽
test.describe.configure({ retries: 3 });

test("分析結果が表示される", async ({ page }) => {
  await page.click('[data-testid="analyze-button"]');
  await page.waitForTimeout(5000); // ← 環境依存
  await expect(page.locator(".result")).toBeVisible();
});
```

### 判定

- 大きい `waitForTimeout`（≥ 2000ms）が 0〜2件 → D-3: 3点
- 3〜5件 → D-3: 2点（`/` コメントで justify されていれば緩和）
- 6〜10件 → D-3: 1点
- 11件以上 or retries ≥ 3 が常態化 → D-3: 0点

### 修正例

```typescript
// ✅ GOOD: 条件ベースの待機
test("分析結果が表示される", async ({ page }) => {
  await page.click('[data-testid="analyze-button"]');
  await expect(page.locator(".result")).toBeVisible({ timeout: 30_000 });
});

// ✅ GOOD: 時刻凍結
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-01"));
});

// ✅ GOOD: expect.poll で条件ポーリング
await expect.poll(() => backgroundJob.status, { timeout: 10_000 }).toBe("completed");
```

---

## AP-14. Missing Data-Driven（ATA v3.1.2 §3）

同一テストロジックを異なる入力で複数本手書きしているパターン。`it.each` / `test.each` / parameterized で集約すべき。

### 検出

```bash
# 類似 test 名の集計（先頭 20 文字で集計）
grep -rhoE '(it|test)\("[^"]+"' <test_dirs> | \
  sed -E 's/.*"([^"]{1,20}).*/\1/' | sort | uniq -c | sort -rn | head -20

# it.each / test.each 使用回数
grep -rcE '(it|test)\.(each|for)' <test_dirs> | awk -F: '{s+=$2} END {print "each_total="s}'

# 同一 describe 内の類似 it（バリエーションが多いか）
awk '/^\s*describe\(/{d=$0; count=0} /^\s*it\(/{count++} /^\s*\}\)/{if(count>=5) print FILENAME": "d" it_count="count; d=""}' <test_dirs>/**/*.ts
```

### 典型例

```typescript
// ❌ BAD: 3本に分けて手書き
it("空文字で400を返す", async () => {
  const res = await POST({ email: "" });
  expect(res.status).toBe(400);
});
it("nullで400を返す", async () => {
  const res = await POST({ email: null });
  expect(res.status).toBe(400);
});
it("undefinedで400を返す", async () => {
  const res = await POST({ email: undefined });
  expect(res.status).toBe(400);
});
```

### 判定

- バリエーション 3 以上で `it.each` 未使用の箇所 1-2件 → B-3: 2点
- 3-5件 → B-3: 1点
- 6件以上 → B-3: 0点
- 全バリエーションが `it.each` / `test.each` で整理 → B-3: 3点

### 修正例

```typescript
// ✅ GOOD: it.each で集約
it.each([
  { input: "",         label: "空文字" },
  { input: null,       label: "null" },
  { input: undefined,  label: "undefined" },
])("emailが$labelの場合に400を返す", async ({ input }) => {
  const res = await POST({ email: input });
  expect(res.status).toBe(400);
});

// ✅ 境界値の4点を1つの it.each に
it.each([
  { step: 0, expect: "error" },
  { step: 1, expect: "ok" },
  { step: 7, expect: "ok" },
  { step: 8, expect: "error" },
])("step=$step で $expect", ({ step, expect: ex }) => { ... });
```

---

## 検出サマリのテンプレート

Phase 2 最終出力として以下の形式で整形：

```markdown
## アサーション品質監査 — 検出サマリ

| AP-ID | パターン | 検出数 | 該当ファイル (path:line) |
|---|---|---|---|
| AP-1 | `[x, y].toContain` | 2 | cases.test.ts:180, students.test.ts:196 |
| AP-2 | OR `toBeTruthy` | 2 | dashboard.spec.ts:51, hearing-flow.spec.ts:177 |
| AP-3 | `GreaterThanOrEqual(1)` | 1 | analysis.spec.ts:71 |
| AP-4 | `.catch(() => {})` | 24 | demo-qa-recording.spec.ts（22件集中→デモ確定）|
| AP-5 | `.toBeTruthy()` | 3 | case-detail.spec.ts:133, ... |
| AP-6 | デモAPI機能試験混入 | 1 | f12-testimony.spec.ts（showCaption検出） |
| AP-7 | モック戻り値のみ検証 | 2 | ai.test.ts（引数検証なし） |
| AP-8 | 仕様ID紐付け欠落 | 5 | 仕様 F09-03, F11-02 等がテスト未参照 |
| AP-9 | 境界値片側のみ | 3 | current_step 上限のみ、日数下限のみ |
| AP-10 | skip/fixme 放置 | 2 | hearing.spec.ts: 理由コメント無し |
| AP-11 | Assertion Roulette | 4 | user.test.ts:42 (expect=8, msg無し), ... |
| AP-12 | Test Interdependence | 3 | ai.test.ts（beforeEachリセット欠落）, ... |
| AP-13 | Flaky Pattern | 7 | waitForTimeout(3000)×5, retries:3×1, ... |
| AP-14 | Missing Data-Driven | 6 | validation.test.ts（空文字/null/undefined手書き×3）, ... |

**総検出数: {N}件** → C軸スコア: {a}/15 点、B軸スコア: {b}/15 点、D軸スコア: {c}/15 点
```
