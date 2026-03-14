---
name: qiita-publish
description: |
  Qiita CLIを使った記事の投稿スキル。
  CLIから下書きとしてアップロードし、公開はQiita Web上で手動で行う。
  以下の場合に使用：
  (1) Qiitaに記事を投稿したい
  (2) Qiita CLIのセットアップ
  (3) 記事のFront Matter設定
  注意: 画像はCLI経由でアップロードできない。Qiita Web上で追加する。
---

# Qiita CLI 記事投稿

Qiita CLIを使ってローカルから記事を下書きとして投稿する手順。
**公開はQiita Web上で手動で行う。**

## 前提条件

- Node.js 20.0.0以上
- Qiitaアカウント

## セットアップ（初回のみ）

### 1. インストール

```bash
npm install -g @qiita/qiita-cli
```

### 2. プロジェクト初期化

記事を管理するディレクトリで実行：

```bash
npx qiita init
```

### 3. トークン設定

1. https://qiita.com/settings/tokens/new でトークン発行
   - `read_qiita` と `write_qiita` にチェック
2. 認証ファイルを作成：

```bash
mkdir -p ~/.config/qiita-cli
```

`~/.config/qiita-cli/credentials.json` に以下を保存：

```json
{"default":"qiita","credentials":[{"name":"qiita","accessToken":"YOUR_TOKEN"}]}
```

## 記事の作成

### ディレクトリ構成

```
project/
├── public/
│   └── article.md    # 記事ファイル（ここに配置）
└── qiita.config.json
```

### Front Matter（必須）

```yaml
---
title: 記事タイトル
tags:
  - タグ1
  - タグ2
private: true
updated_at: ''
id: null
organization_url_name: null
slide: false
ignorePublish: false
---
```

**`private: true` で下書きとしてアップロード。公開はQiita Webで手動で行う。**

## 投稿コマンド

```bash
npx qiita publish 記事ファイル名（拡張子なし）
```

例：`public/article.md` を投稿する場合

```bash
npx qiita publish article
```

## 公開手順

1. CLIで `private: true` のまま投稿
2. https://qiita.com/mine にアクセス
3. 記事を開いて編集 → 公開設定を変更

## 制限事項

- **画像はCLI経由でアップロード不可**
  - Markdown内のローカル画像パスは削除しておく
  - Qiita Web上で画像を追加する

## よくあるエラー

| エラー | 原因 | 対処 |
|--------|------|------|
| `credentials.json not found` | 認証ファイルがない | セットアップ手順3を実行 |
| `is not found` | 記事がpublicディレクトリにない | `public/`に記事を配置 |
| `updated_atは文字列で...` | Front Matter形式エラー | 上記のFront Matter形式を使用 |
