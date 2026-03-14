# 言語別分割パターン

## TypeScript / React / Next.js

### 責務の分類基準

| 責務カテゴリ | 切り出し先 | 例 |
|------------|----------|-----|
| UI コンポーネント | `components/<Name>.tsx` | フォーム、テーブル、モーダル |
| カスタムフック | `hooks/use<Name>.ts` | useAuth, useForm, useFetch |
| API 通信 | `lib/api/<domain>.ts` | fetchUsers, createOrder |
| 型定義 | `types/<domain>.ts` | User, Order, ApiResponse |
| 定数・設定 | `lib/constants.ts` or `config/` | ROUTES, API_BASE_URL |
| ユーティリティ | `lib/utils/<name>.ts` | formatDate, validateEmail |
| コンテキスト | `contexts/<Name>Context.tsx` | AuthContext, ThemeContext |
| ストア/状態管理 | `store/<name>.ts` | useUserStore (Zustand等) |

### barrel export (index.ts)

同一ディレクトリに3ファイル以上切り出した場合、`index.ts` を作成：

```typescript
// components/user/index.ts
export { UserForm } from './UserForm'
export { UserTable } from './UserTable'
export { UserAvatar } from './UserAvatar'
```

### Next.js App Router 固有

- `page.tsx` はルーティング用のみ。ロジックは別ファイルに
- Server Components と Client Components は別ファイルに分離
- Server Actions は `actions.ts` に切り出す
- `loading.tsx`, `error.tsx` はそのまま維持

## Python / FastAPI

### 責務の分類基準

| 責務カテゴリ | 切り出し先 | 例 |
|------------|----------|-----|
| ルーター/エンドポイント | `routers/<domain>.py` | user_router, order_router |
| Pydantic モデル | `schemas/<domain>.py` | UserCreate, UserResponse |
| DB モデル | `models/<domain>.py` | User, Order (SQLAlchemy) |
| ビジネスロジック | `services/<domain>.py` | UserService, AuthService |
| 依存性注入 | `dependencies/<name>.py` | get_db, get_current_user |
| ユーティリティ | `utils/<name>.py` | hash_password, send_email |
| 定数・設定 | `config.py` or `settings.py` | Settings (pydantic-settings) |
| 例外定義 | `exceptions.py` | NotFoundError, AuthError |

### __init__.py の整備

パッケージ化する場合、`__init__.py` で公開 API を明示：

```python
# services/__init__.py
from .user_service import UserService
from .auth_service import AuthService

__all__ = ["UserService", "AuthService"]
```

### FastAPI ルーター分割

巨大な `main.py` からルーターを分離：

```python
# main.py (分割後)
from fastapi import FastAPI
from routers import users, orders, auth

app = FastAPI()
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
```

## 共通ルール

### 分割しないケース

- **1ファイル300行以下** — 分割不要
- **全要素が密結合** — 分けるとかえって import 地獄になる
- **テスト用ヘルパー** — テストファイル内のヘルパーは同ファイルに残す

### 循環参照の回避

- 型定義は最も低レベルのモジュールに配置
- 双方向の依存が発生したら、共通インターフェースを `types/` に抽出
- Python: `TYPE_CHECKING` ガードで実行時の循環を回避

```python
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.user import User
```
