---
name: skill-uploader
description: >
  スキルを社内リポジトリ（JQT-AI-Sol/ai-skills-plugins）にアップロードするスキル。
  スキルのコピー、カタログ更新、README更新、コミット・プッシュまで一括実行する。
  以下の場合に使用：
  (1) 「スキルをリポジトリにアップロード」「スキルを共有」「skill upload」
  (2) 「リポジトリにスキルを追加したい」「社内スキルに登録」
  (3) 「カタログを更新」「READMEを更新」
  スキルの検索・インストールにはrepo-skill-finderを使うこと。
  スキルの新規作成にはskill-creatorを使うこと。
user-invocable: true
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Skill Uploader

スキルを社内リポジトリにアップロードし、カタログ・READMEを自動更新する。

## リポジトリ情報

- **GitHub**: `https://github.com/JQT-AI-Sol/ai-skills-plugins`
- **ローカルクローン**: `/tmp/ai-skills-repo`
- **構成**: `skills/<category>/<skill-name>/SKILL.md`

## カテゴリ

| カテゴリ | 内容 |
|---------|------|
| frontend | フロントエンド開発・レビュー |
| backend | バックエンド開発・レビュー |
| database | データベース最適化 |
| testing | テスト・TDD |
| devops | デプロイ・インフラ |
| ai-api | AI API連携 |
| content | ブログ・コンテンツ |
| business | 提案書・見積書・契約 |
| media | 動画・画像・音声 |
| maintenance | スキル管理・デバッグ・リファクタ |

## ワークフロー

### Step 1: 事前確認

1. アップロード対象のスキルを特定する

```bash
# ユーザーが指定したスキルのSKILL.mdを読み込む
cat ~/.claude/skills/<skill-name>/SKILL.md
```

2. SKILL.md の frontmatter から `name` と `description` を抽出
3. カテゴリをユーザーに確認（上記テーブルから選択）

### Step 2: リポジトリ準備

```bash
# クローンまたは最新化
if [ ! -d /tmp/ai-skills-repo ]; then
  git clone https://github.com/JQT-AI-Sol/ai-skills-plugins.git /tmp/ai-skills-repo
else
  cd /tmp/ai-skills-repo && git pull origin main
fi
```

### Step 3: スキルをコピー

```bash
# node_modules, __pycache__, .git を除外してコピー
rsync -a \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.git' \
  --exclude='*.pyc' \
  ~/.claude/skills/<skill-name>/ \
  /tmp/ai-skills-repo/skills/<category>/<skill-name>/
```

既にスキルが存在する場合は上書き確認をユーザーに行う。

### Step 4: カタログ更新（repo-skill-finder）

`/tmp/ai-skills-repo/skills/maintenance/repo-skill-finder/SKILL.md` 内の「スキルカタログ」テーブルに行を追加する。

**追加する行のフォーマット:**
```
| <category> | <skill-name> | <1行説明（60文字以内）> |
```

- テーブル内はカテゴリ名でソートされている
- 同じカテゴリの最後の行の後に挿入する
- 説明はSKILL.mdのdescriptionから1文目を抽出し、60文字以内に要約

**複合スキルの場合:**
「複合スキルの依存関係」テーブルにも行を追加する:
```
| <skill-name> | <依存スキル1>, <依存スキル2> |
```

### Step 5: README更新

`/tmp/ai-skills-repo/README.md` の該当カテゴリセクションのテーブルに行を追加する。

**追加する行のフォーマット:**
```
| [<skill-name>](skills/<category>/<skill-name>/) | <説明> |
```

- 該当カテゴリの最後の行の後に挿入
- カテゴリセクションが存在しない場合は新しいセクションを作成

### Step 6: コミット・プッシュ

```bash
cd /tmp/ai-skills-repo
git add -A
git commit -m "<skill-name> スキルを追加

カテゴリ: <category>
説明: <1行説明>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin main
```

### Step 7: 完了報告

以下をユーザーに報告:
- アップロードしたスキル名とカテゴリ
- 更新したファイル一覧（SKILL.md, README.md, repo-skill-finder/SKILL.md）
- GitHubのコミットURL

## 一括アップロード

複数スキルを同時にアップロードする場合:

1. Step 1-3 を各スキルで繰り返す
2. Step 4-5 でまとめてカタログ・README更新
3. Step 6 で1コミットにまとめる

## スキル削除

「スキルを削除」「リポジトリから外したい」と言われた場合:

1. `/tmp/ai-skills-repo/skills/<category>/<skill-name>/` を削除
2. repo-skill-finder のカタログから該当行を削除
3. README.md から該当行を削除
4. コミット・プッシュ

## 注意事項

- **機密情報チェック**: アップロード前に SKILL.md 内にAPIキー、パスワード、個人パスが含まれていないか確認する。`/Users/` で始まる絶対パスは警告を出す
- **SKILL.md必須**: SKILL.md が存在しないディレクトリはアップロードしない
- **サイズ確認**: 10MB超のスキルは警告を出す（大きいファイルがないか確認）
