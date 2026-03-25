---
description: >
  TDDサイクル前のコードレビュー＆構造チェック（Gate 3）。
  ファイル肥大化チェック、ソースコードレビュー、DBレビューを実行し、
  テスト対象コードの品質を事前に確保する。
  /tdd から自動呼び出しされる。単独でも使用可能。
  「コード構造チェック」「テスト前レビュー」で発火。
---

# TDD Code Review（Gate 3: テスト前コードレビュー）

> **ロール**: Planner（レビュー方針策定）→ Generator（レビュースキル実行・`/security-review` 実行）→ Evaluator（Gate 3 スコアリング）

TDDサイクルに入る前に、変更対象コードの品質と構造を確認する。
テスト対象が不適切な構造のまま（肥大化、未分割）だとテスト自体が書きにくくなるため、ここで先に整理する。

---

## 1. ファイル肥大化・モジュール分割チェック

変更対象ファイルに対して `/decompose` の観点でチェックする。

**自動判定基準:**
- 変更対象ファイルが **300行超** → `/decompose` でモジュール分割を検討
- 1ファイルに **複数の責務**（API呼び出し + UI + バリデーション等）が混在 → 分割を推奨
- コンポーネント内に **ビジネスロジック** が直接書かれている → `src/lib/` への切り出しを推奨

**手順:**
1. `wc -l` で変更対象ファイルの行数を確認
2. 300行超のファイルがあれば `/decompose` を呼び出して分割を実施
3. 分割後にテストを書く（分割前のテストは書かない）

---

## 2. ソースコードレビュー

変更ファイルのパスに応じて、該当するレビュースキルを実行する。

| 変更パス | レビュースキル | 観点 |
|----------|--------------|------|
| `src/app/(authenticated)/**/*.tsx` | `/review-vercel-frontend` | UI/UX品質、React/Next.jsパフォーマンス、Webガイドライン準拠 |
| `src/components/**/*.tsx` | `/review-vercel-frontend` | 同上 |
| `src/app/api/**/*.ts` | `/review-python-backend` | API設計、セキュリティ、入力バリデーション、エラーハンドリング |
| `src/lib/**/*.ts` | `/review-python-backend` | コード品質、セキュリティパターン |

---

## 3. DBレビュー

DB関連の変更がある場合、`supabase-postgres-best-practices` の観点でチェックする。

| 変更パス | チェック観点 |
|----------|------------|
| `supabase/migrations/**` | スキーマ設計、インデックス、RLSポリシー、パフォーマンス |
| `src/lib/types.ts` | 型定義とDBスキーマの整合性 |
| `src/lib/database.types.ts` | Supabase生成型の最新性 |

---

## 4. セキュリティレビュー（`/security-review`）

全変更ファイルに対して、Claude Code ビルトインの `/security-review` を実行する。

**検出対象:**
- インジェクション（XSS、SQLi、コマンドインジェクション）
- 認証・認可の不備（認証バイパス、権限昇格）
- データ露出（PII漏洩、シークレットのハードコード、ログへの機密情報出力）
- CSRF / CORS 設定の不備
- RLS ポリシーの欠落・不適切な設定

**手順:**
1. `/security-review` を実行
2. 指摘があれば修正してから Gate 3 評価に進む
3. Critical 指摘が残っている場合、Gate 3 は自動 FAIL

---

## 5. スキップ条件

以下の場合はこのスキルをスキップする:
- テストコードのみの変更（`tests/**`）
- ドキュメントのみの変更（`docs/**`）
- 設定ファイルのみの変更（`*.config.*`）
- ユーザーが明示的にスキップを指示した場合

---

## Gate 3 評価（Evaluator）

構造チェック + ソースコードレビュー + DBレビューの総合評価。
詳細は `../tdd/references/quality-gates.md` Gate 3 参照。

| 評価項目 | 配点 |
|---------|------|
| `[CRITICAL]` ファイル行数チェック（300行以下） | 3 |
| 責務分離 | 3 |
| ビジネスロジックの配置 | 3 |
| `[CRITICAL]` Critical指摘ゼロ | 3 |
| レビュースキルの適切な選択 | 3 |
| `[CRITICAL]` `/security-review` 指摘ゼロ | 3 |
| RLSポリシー確認（DB変更時） | 3 |
| インデックス確認（DB変更時） | 3 |

**満点24点（DB変更なし18点）/ 合格ライン80%** — Critical項目0点で即FAIL

Gate 3 PASS後、`/tdd-test-writer`（RED→GREEN）へ進む。

---

## 関連スキル

| スキル | 役割 |
|--------|------|
| `/decompose` | ファイル肥大化チェック・モジュール分割 |
| `/review-vercel-frontend` | フロントエンドレビュー |
| `/review-python-backend` | バックエンドレビュー |
| `supabase-postgres-best-practices` | DBレビュー |
