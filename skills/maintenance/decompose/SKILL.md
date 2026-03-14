---
name: decompose
description: "肥大化したソースコードファイルを機能単位に分割するリファクタリングスキル。1000行超のファイルを300-500行の適切なモジュールに分解する。TypeScript（React/Next.js）とPython（FastAPI）の両方に対応。使用タイミング：(1) /decompose コマンドが呼ばれた場合 (2)「ファイルを分割したい」「モジュール分割」「リファクタリング」「ファイルが大きすぎる」と言われた場合 (3)「decompose」「分解」「切り出し」と言われた場合"
---

# Decompose — ファイル分割リファクタリング

肥大化したソースコードを機能単位のモジュールに分割する。

## ワークフロー

### Phase 1: 分析

対象ファイルを読み込み、以下を抽出する：

1. **構造マップの作成**
   - 全関数/クラス/コンポーネントの一覧（行番号付き）
   - 各要素の行数
   - 要素間の依存関係（import、関数呼び出し、型参照）

2. **責務の分類**
   - 各要素がどの責務に属するかをグルーピング
   - 言語別の分類基準は [references/decompose-patterns.md](references/decompose-patterns.md) を参照

3. **分析レポートの出力**

```
## 分析結果: <ファイル名> (<行数>行)

### 構造マップ
| # | 要素 | 種別 | 行数 | 依存先 |
|---|------|------|------|--------|
| 1 | UserForm | Component | 120 | useAuth, validateEmail |
| 2 | useAuth | Hook | 85 | authApi |
| ... | ... | ... | ... | ... |

### 責務グループ
- **認証**: useAuth, authApi, AuthContext (計250行)
- **フォーム**: UserForm, validateEmail, FormError (計180行)
- **API通信**: authApi, userApi (計150行)
```

### Phase 2: 分割プランの提示

分析結果をもとに分割プランを作成し、ユーザーに承認を求める。

```
## 分割プラン

### 現状
- `user-page.tsx` (1,200行) — 認証・フォーム・API・表示が混在

### 分割後
| ファイル | 内容 | 推定行数 |
|---------|------|---------|
| `components/UserForm.tsx` | フォームUI | 180行 |
| `hooks/useAuth.ts` | 認証ロジック | 250行 |
| `lib/api/user.ts` | API通信 | 150行 |
| `types/user.ts` | 型定義 | 60行 |
| `user-page.tsx` | ページ本体（import統合） | 350行 |

### 影響範囲
- このファイルをimportしている箇所: 3ファイル
- 変更が必要なimport: `dashboard.tsx`, `admin.tsx`

このプランで実行しますか？
```

**重要**: ユーザーの承認なしに分割を実行してはならない。

### Phase 3: 分割の実行

承認後、以下の順序で実行する：

1. **新規ファイルの作成** — 切り出す要素を新ファイルに書き出し、export を設定
2. **元ファイルの書き換え** — 切り出した要素を削除し、新ファイルからの import に置換
3. **エントリポイントの整備**
   - TypeScript: 必要に応じて `index.ts` (barrel export) を作成
   - Python: `__init__.py` を更新
4. **依存ファイルの更新** — 元ファイルを import していた外部ファイルの import パスを修正
5. **整合性チェック** — TypeScript なら `npx tsc --noEmit`、Python なら `python -c "import <module>"`

### Phase 4: 結果レポート

```
## 分割完了

### 作成/変更ファイル
- 新規: `components/UserForm.tsx` (180行)
- 新規: `hooks/useAuth.ts` (250行)
- 変更: `user-page.tsx` (1,200行 → 350行)
- 変更: `dashboard.tsx` (import更新)

### 整合性チェック
- TypeScript コンパイル: OK
```

## 分割の判断基準

- 目安: 1ファイル **300-500行**。超えたら分割を検討
- 分割の最小単位は**責務**。行数だけで機械的に分けない
- 密結合な要素は無理に分けない（分けると逆に複雑になる）
- 共有される型定義・定数は専用ファイルに切り出す
- テストファイルが存在する場合、テストも対応するファイルに分割する

## 言語別パターン

詳細は [references/decompose-patterns.md](references/decompose-patterns.md) を参照。
