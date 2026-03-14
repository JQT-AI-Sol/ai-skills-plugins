---
name: cloudflare-deploy
description: |
  Cloudflare Workers/Pagesへのデプロイとwrangler CLI操作ガイド。
  Next.js + OpenNextプロジェクトのCloudflareデプロイ、環境変数(secrets)の設定、
  wranglerコマンドの使い方を提供。以下の場合に使用：
  (1) Cloudflare Workersへのデプロイ
  (2) wrangler CLIでの環境変数・シークレット設定
  (3) Next.js + @opennextjs/cloudflareのビルド・デプロイ
  (4) Cloudflareプロジェクトの管理・トラブルシューティング
---

# Cloudflare Deploy Skill

## クイックスタート

### ビルド＆デプロイ（ローカルから）

```bash
npm run cf:build && npx wrangler deploy
```

### 環境変数（Secrets）の設定

```bash
# ログイン（初回のみ）
npx wrangler login

# シークレット設定（wrangler.jsoncがあると失敗する場合は一時退避）
mv wrangler.jsonc wrangler.jsonc.bak
npx wrangler secret put API_KEY_NAME --name プロジェクト名
mv wrangler.jsonc.bak wrangler.jsonc
```

## プロジェクト設定

### wrangler.jsonc（Workers用）

```jsonc
{
  "name": "project-name",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "main": ".open-next/worker.js",
  "assets": {
    "directory": ".open-next/assets",
    "binding": "STATIC_ASSETS"  // "ASSETS"は予約語なので使用不可
  }
}
```

### open-next.config.ts

```typescript
const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
```

### package.json scripts

```json
{
  "scripts": {
    "cf:build": "npx @opennextjs/cloudflare build",
    "deploy": "npm run cf:build && npx wrangler deploy"
  }
}
```

## wrangler CLIコマンド

### 認証

```bash
npx wrangler login      # ブラウザでログイン
npx wrangler whoami     # ログイン状態確認
npx wrangler logout     # ログアウト
```

### デプロイ管理

```bash
npx wrangler deploy                           # デプロイ
npx wrangler deployments list --name NAME     # デプロイ履歴
npx wrangler rollback --name NAME             # ロールバック
```

### シークレット管理

```bash
npx wrangler secret put SECRET_NAME --name PROJECT_NAME   # 設定
npx wrangler secret list --name PROJECT_NAME              # 一覧
npx wrangler secret delete SECRET_NAME --name PROJECT_NAME # 削除
```

## トラブルシューティング

### "ASSETS" binding エラー

```
The name 'ASSETS' is reserved in Pages projects
```

→ `wrangler.jsonc` の `assets.binding` を `"STATIC_ASSETS"` に変更

### wrangler.jsonc と Workers/Pages の競合

`pages_build_output_dir` があるとPagesとして認識される。
Workersとして使う場合は削除して `main` と `assets` を使用。

### シークレット設定時の競合

wrangler.jsonc が存在すると `wrangler secret` コマンドが失敗することがある。
一時的に退避してからコマンドを実行。

### Cloudflare Pages ビルドエラー

Pagesのビルド環境で問題が発生する場合、ローカルビルド＋Workersデプロイを推奨：

```bash
npm run cf:build && npx wrangler deploy
```

## GitHub Actions CI/CD（推奨）

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run cf:build

      - name: Deploy to Cloudflare Workers
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### セットアップ手順

1. **Cloudflare APIトークン作成**
   - https://dash.cloudflare.com/profile/api-tokens
   - 「Cloudflare Workers を編集する」テンプレートを使用

2. **GitHub Secretsに設定**
   - リポジトリ → Settings → Secrets → Actions → Repository secrets
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 作成したトークン

3. **mainブランチにプッシュで自動デプロイ**

## Workers vs Pages

| 項目 | Workers | Pages |
|------|---------|-------|
| デプロイ方法 | `wrangler deploy` | Git連携 |
| ビルド | ローカル/GitHub Actions | Cloudflare環境 |
| 設定 | `main`, `assets` | `pages_build_output_dir` |
| 推奨 | ◎ Next.js + OpenNext | △ 静的サイト |

Next.js + OpenNextの場合、**Workers + GitHub Actions CI/CD**を推奨。
