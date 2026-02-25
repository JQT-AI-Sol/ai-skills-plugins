# レイアウトカタログ

JQIT提案書で使用する8つの再利用可能なレイアウトパターン。
各テンプレートのプレースホルダー（`{{...}}`）を実際のコンテンツに置換して使用する。

---

## 1. title — タイトルスライド

表紙や中扉に使用。ダーク背景 + JQIT赤サイドバー。

**使用例**: 表紙、セクション区切り

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; }
</style></head>
<body>
<!-- ダーク背景 -->
<div style="position: absolute; width: 720pt; height: 405pt; background: #1C2833;"></div>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>

<!-- CONFIDENTIALタグ（任意） -->
<div style="position: absolute; left: 40pt; top: 55pt;">
  <p style="color: #D32F2F; font-size: 11pt; letter-spacing: 2pt; margin: 0;">{{タグ}}</p>
</div>

<!-- メインタイトル -->
<div style="position: absolute; left: 40pt; top: 100pt; width: 640pt;">
  <h1 style="color: #FFFFFF; font-size: 30pt; font-weight: bold; line-height: 1.3; margin: 0;">{{タイトル}}</h1>
</div>

<!-- アクセントライン -->
<div style="position: absolute; left: 40pt; top: 195pt; width: 200pt; height: 3pt; background: #D32F2F;"></div>

<!-- サブタイトル -->
<div style="position: absolute; left: 40pt; top: 215pt; width: 500pt;">
  <p style="color: #AAB7B8; font-size: 14pt; margin: 0;">{{サブタイトル}}</p>
</div>

<!-- ボトム情報 -->
<div style="position: absolute; left: 40pt; bottom: 40pt;">
  <p style="color: #5D6D7E; font-size: 10pt; margin: 0 0 4pt 0;">{{日付}}</p>
  <p style="color: #5D6D7E; font-size: 10pt; margin: 0;">{{会社名}}</p>
</div>
<img src="logo.png" style="position: absolute; right: 30pt; bottom: 20pt; height: 20pt; opacity: 0.7;">
</body></html>
```

---

## 2. card-list — カードリスト

左ボーダー付きカードの縦積み。サマリー・概要・紹介に最適。

**使用例**: エグゼクティブサマリー、会社紹介、要点まとめ

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; background: #FAFBFC; }
</style></head>
<body>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>
<!-- 白ヘッダーバー -->
<div style="position: absolute; left: 0; top: 0; width: 720pt; height: 50pt; background: #FFFFFF; border-bottom: 2pt solid #1C2833;">
  <p style="color: #1C2833; font-size: 18pt; font-weight: bold; margin: 14pt 0 0 40pt;">{{ヘッダータイトル}}</p>
  <img src="logo.png" style="position: absolute; right: 20pt; top: 14pt; height: 22pt;">
</div>

<!-- カードリスト -->
<div style="position: absolute; left: 40pt; top: 62pt; width: 640pt;">

  <!-- カード（ティールボーダー） -->
  <div style="padding: 10pt 16pt; background: #FFFFFF; border-radius: 6pt; margin: 0 0 6pt 0; border-left: 4pt solid #277884;">
    <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 2pt 0;">{{ラベル1}}</p>
    <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{内容1}}</p>
  </div>

  <!-- カード（JQIT赤ボーダー = 強調） -->
  <div style="padding: 10pt 16pt; background: #FFFFFF; border-radius: 6pt; margin: 0 0 6pt 0; border-left: 4pt solid #D32F2F;">
    <p style="color: #D32F2F; font-size: 9pt; font-weight: bold; margin: 0 0 2pt 0;">{{ラベル2}}</p>
    <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{内容2}}</p>
  </div>

  <!-- 追加カードを必要に応じて繰り返し（最大5-6枚が目安） -->

</div>
</body></html>
```

**バリエーション**:
- 通常カード: `border-left: 4pt solid #277884;` + ラベル色 `#277884`
- 強調カード: `border-left: 4pt solid #D32F2F;` + ラベル色 `#D32F2F`

---

## 3. card-grid-2x2 — 2x2カードグリッド

2列×2行の番号付きカード。4項目の並列表示に最適。

**使用例**: 課題認識、メリット4選、比較ポイント

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; background: #FAFBFC; }
</style></head>
<body>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>
<!-- 白ヘッダーバー -->
<div style="position: absolute; left: 0; top: 0; width: 720pt; height: 50pt; background: #FFFFFF; border-bottom: 2pt solid #1C2833;">
  <p style="color: #1C2833; font-size: 18pt; font-weight: bold; margin: 14pt 0 0 40pt;">{{ヘッダータイトル}}</p>
  <img src="logo.png" style="position: absolute; right: 20pt; top: 14pt; height: 22pt;">
</div>

<!-- 2x2グリッド -->
<div style="position: absolute; left: 40pt; top: 58pt; width: 640pt; display: flex; flex-wrap: wrap; gap: 6pt;">

  <!-- カード1 -->
  <div style="width: 313pt; padding: 10pt; background: #FFFFFF; border-radius: 6pt; box-shadow: 1px 1px 4px rgba(0,0,0,0.08);">
    <p style="color: #1C2833; font-size: 11pt; font-weight: bold; margin: 0 0 4pt 0;">1. {{見出し1}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0 0 2pt 0;">{{説明1-1}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0;">{{説明1-2}}</p>
  </div>

  <!-- カード2 -->
  <div style="width: 313pt; padding: 10pt; background: #FFFFFF; border-radius: 6pt; box-shadow: 1px 1px 4px rgba(0,0,0,0.08);">
    <p style="color: #1C2833; font-size: 11pt; font-weight: bold; margin: 0 0 4pt 0;">2. {{見出し2}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0 0 2pt 0;">{{説明2-1}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0;">{{説明2-2}}</p>
  </div>

  <!-- カード3 -->
  <div style="width: 313pt; padding: 10pt; background: #FFFFFF; border-radius: 6pt; box-shadow: 1px 1px 4px rgba(0,0,0,0.08);">
    <p style="color: #1C2833; font-size: 11pt; font-weight: bold; margin: 0 0 4pt 0;">3. {{見出し3}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0 0 2pt 0;">{{説明3-1}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0;">{{説明3-2}}</p>
  </div>

  <!-- カード4 -->
  <div style="width: 313pt; padding: 10pt; background: #FFFFFF; border-radius: 6pt; box-shadow: 1px 1px 4px rgba(0,0,0,0.08);">
    <p style="color: #1C2833; font-size: 11pt; font-weight: bold; margin: 0 0 4pt 0;">4. {{見出し4}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0 0 2pt 0;">{{説明4-1}}</p>
    <p style="color: #5D6D7E; font-size: 9pt; margin: 0;">{{説明4-2}}</p>
  </div>

</div>
</body></html>
```

---

## 4. card-3col — 3カラムカード

3列の縦カード。機能紹介、3つのポイント説明に最適。

**使用例**: 機能詳細、3つの柱、サービス紹介

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; background: #FAFBFC; }
</style></head>
<body>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>
<!-- 白ヘッダーバー -->
<div style="position: absolute; left: 0; top: 0; width: 720pt; height: 50pt; background: #FFFFFF; border-bottom: 2pt solid #1C2833;">
  <p style="color: #1C2833; font-size: 18pt; font-weight: bold; margin: 14pt 0 0 40pt;">{{ヘッダータイトル}}</p>
  <img src="logo.png" style="position: absolute; right: 20pt; top: 14pt; height: 22pt;">
</div>

<!-- サブヘッダー（任意） -->
<div style="position: absolute; left: 40pt; top: 58pt;">
  <p style="color: #277884; font-size: 11pt; font-weight: bold; margin: 0;">{{サブヘッダー}}</p>
</div>

<!-- 3カラムカード -->
<div style="position: absolute; left: 40pt; top: 88pt; width: 640pt; display: flex; gap: 12pt;">

  <!-- カード1（ティールボーダー） -->
  <div style="flex: 1; padding: 16pt; background: #FFFFFF; border-radius: 6pt; border-top: 3pt solid #277884; box-shadow: 1px 1px 4px rgba(0,0,0,0.06);">
    <p style="color: #1C2833; font-size: 12pt; font-weight: bold; margin: 0 0 8pt 0; text-align: center;">{{カード1タイトル}}</p>
    <ul style="margin: 0; padding: 0 0 0 14pt;">
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0 0 4pt 0;">{{項目1-1}}</li>
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0 0 4pt 0;">{{項目1-2}}</li>
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0;">{{項目1-3}}</li>
    </ul>
  </div>

  <!-- カード2 -->
  <div style="flex: 1; padding: 16pt; background: #FFFFFF; border-radius: 6pt; border-top: 3pt solid #277884; box-shadow: 1px 1px 4px rgba(0,0,0,0.06);">
    <p style="color: #1C2833; font-size: 12pt; font-weight: bold; margin: 0 0 8pt 0; text-align: center;">{{カード2タイトル}}</p>
    <ul style="margin: 0; padding: 0 0 0 14pt;">
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0 0 4pt 0;">{{項目2-1}}</li>
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0 0 4pt 0;">{{項目2-2}}</li>
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0;">{{項目2-3}}</li>
    </ul>
  </div>

  <!-- カード3 -->
  <div style="flex: 1; padding: 16pt; background: #FFFFFF; border-radius: 6pt; border-top: 3pt solid #277884; box-shadow: 1px 1px 4px rgba(0,0,0,0.06);">
    <p style="color: #1C2833; font-size: 12pt; font-weight: bold; margin: 0 0 8pt 0; text-align: center;">{{カード3タイトル}}</p>
    <ul style="margin: 0; padding: 0 0 0 14pt;">
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0 0 4pt 0;">{{項目3-1}}</li>
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0 0 4pt 0;">{{項目3-2}}</li>
      <li style="color: #5D6D7E; font-size: 9pt; margin: 0;">{{項目3-3}}</li>
    </ul>
  </div>

</div>
</body></html>
```

**バリエーション**:
- ティールボーダー: `border-top: 3pt solid #277884;` — 通常
- JQIT赤ボーダー: `border-top: 3pt solid #D32F2F;` — 強調・アクション系

---

## 5. flow-diagram — フローダイアグラム

入力→処理→出力のフロー図。システム構成やプロセスの可視化に最適。

**使用例**: ソリューション概要、アーキテクチャ、データフロー

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; background: #FAFBFC; }
</style></head>
<body>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>
<!-- 白ヘッダーバー -->
<div style="position: absolute; left: 0; top: 0; width: 720pt; height: 50pt; background: #FFFFFF; border-bottom: 2pt solid #1C2833;">
  <p style="color: #1C2833; font-size: 18pt; font-weight: bold; margin: 14pt 0 0 40pt;">{{ヘッダータイトル}}</p>
  <img src="logo.png" style="position: absolute; right: 20pt; top: 14pt; height: 22pt;">
</div>

<div style="position: absolute; left: 40pt; top: 65pt; width: 640pt;">

  <!-- 入力ボックス -->
  <div style="padding: 10pt 14pt; background: #FFFFFF; border-radius: 6pt; border: 1pt solid #D5DBDB; text-align: center;">
    <p style="color: #5D6D7E; font-size: 11pt; margin: 0;"><b>{{入力ラベル}}</b></p>
  </div>

  <!-- 矢印 -->
  <div style="text-align: center; margin: 2pt 0;">
    <p style="color: #277884; font-size: 14pt; margin: 0;">▼</p>
  </div>

  <!-- システムボックス（ダーク背景） -->
  <div style="padding: 14pt; background: #1C2833; border-radius: 8pt;">
    <p style="color: #FFFFFF; font-size: 13pt; font-weight: bold; margin: 0 0 10pt 0; text-align: center;">{{システム名}}</p>
    <!-- 機能タグ群 -->
    <div style="display: flex; gap: 8pt; justify-content: center; flex-wrap: wrap;">
      <div style="padding: 8pt 12pt; background: #277884; border-radius: 4pt;">
        <p style="color: #FFFFFF; font-size: 9pt; margin: 0;">{{機能1}}</p>
      </div>
      <div style="padding: 8pt 12pt; background: #277884; border-radius: 4pt;">
        <p style="color: #FFFFFF; font-size: 9pt; margin: 0;">{{機能2}}</p>
      </div>
      <div style="padding: 8pt 12pt; background: #277884; border-radius: 4pt;">
        <p style="color: #FFFFFF; font-size: 9pt; margin: 0;">{{機能3}}</p>
      </div>
      <!-- JQIT赤タグ（特に強調したい機能） -->
      <div style="padding: 8pt 12pt; background: #D32F2F; border-radius: 4pt;">
        <p style="color: #FFFFFF; font-size: 9pt; margin: 0;">{{機能4（強調）}}</p>
      </div>
    </div>
    <!-- 補足テキスト -->
    <div style="display: flex; gap: 10pt; margin-top: 10pt; justify-content: center;">
      <p style="color: #AAB7B8; font-size: 9pt; margin: 0;">{{補足1}}</p>
      <p style="color: #AAB7B8; font-size: 9pt; margin: 0;">|</p>
      <p style="color: #AAB7B8; font-size: 9pt; margin: 0;">{{補足2}}</p>
    </div>
  </div>

  <!-- 矢印 -->
  <div style="text-align: center; margin: 2pt 0;">
    <p style="color: #277884; font-size: 14pt; margin: 0;">▼</p>
  </div>

  <!-- 出力ボックス -->
  <div style="padding: 10pt 14pt; background: #FFFFFF; border-radius: 6pt; border: 1pt solid #D5DBDB; text-align: center;">
    <p style="color: #5D6D7E; font-size: 11pt; margin: 0;">{{出力ラベル}}</p>
  </div>

  <!-- ボトムカード群（任意: メリット・ポイント） -->
  <div style="margin-top: 12pt; display: flex; gap: 10pt;">
    <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 6pt; border-top: 3pt solid #277884;">
      <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{ポイント1タイトル}}</p>
      <p style="color: #5D6D7E; font-size: 8pt; margin: 0;">{{ポイント1説明}}</p>
    </div>
    <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 6pt; border-top: 3pt solid #277884;">
      <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{ポイント2タイトル}}</p>
      <p style="color: #5D6D7E; font-size: 8pt; margin: 0;">{{ポイント2説明}}</p>
    </div>
    <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 6pt; border-top: 3pt solid #277884;">
      <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{ポイント3タイトル}}</p>
      <p style="color: #5D6D7E; font-size: 8pt; margin: 0;">{{ポイント3説明}}</p>
    </div>
  </div>

</div>
</body></html>
```

---

## 6. dark-checklist — ダークチェックリスト

ダーク背景にチェックリストやステップを表示。デモ紹介、次のアクションに最適。

**使用例**: デモ紹介、次のステップ、アクションプラン

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; }
</style></head>
<body>
<!-- ダーク背景 -->
<div style="position: absolute; width: 720pt; height: 405pt; background: #1A3C50;"></div>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>

<div style="position: absolute; left: 40pt; top: 40pt; width: 640pt;">
  <!-- タグ -->
  <p style="color: #D32F2F; font-size: 11pt; letter-spacing: 2pt; margin: 0 0 6pt 0;">{{タグ}}</p>
  <!-- タイトル -->
  <h1 style="color: #FFFFFF; font-size: 24pt; font-weight: bold; margin: 0 0 6pt 0;">{{タイトル}}</h1>
  <!-- サブテキスト -->
  <p style="color: #AAB7B8; font-size: 11pt; margin: 0 0 20pt 0;">{{サブテキスト}}</p>

  <!-- セクション見出し（任意） -->
  <p style="color: #FFFFFF; font-size: 12pt; font-weight: bold; margin: 0 0 12pt 0;">{{セクション見出し}}</p>

  <!-- チェックリスト項目 -->
  <div style="display: flex; align-items: flex-start; gap: 10pt; margin: 0 0 10pt 0;">
    <span style="color: #D32F2F; font-size: 14pt;">&#10003;</span>
    <p style="color: #FFFFFF; font-size: 11pt; margin: 0;">{{チェック項目1}}</p>
  </div>
  <div style="display: flex; align-items: flex-start; gap: 10pt; margin: 0 0 10pt 0;">
    <span style="color: #D32F2F; font-size: 14pt;">&#10003;</span>
    <p style="color: #FFFFFF; font-size: 11pt; margin: 0;">{{チェック項目2}}</p>
  </div>
  <div style="display: flex; align-items: flex-start; gap: 10pt; margin: 0 0 10pt 0;">
    <span style="color: #D32F2F; font-size: 14pt;">&#10003;</span>
    <p style="color: #FFFFFF; font-size: 11pt; margin: 0;">{{チェック項目3}}</p>
  </div>

  <!-- 区切り線 -->
  <div style="width: 640pt; height: 1pt; background: rgba(255,255,255,0.2); margin: 20pt 0 12pt 0;"></div>

  <!-- ボトムテキスト -->
  <p style="color: #D32F2F; font-size: 11pt; font-weight: bold;">{{ボトムテキスト}}</p>
</div>
<img src="logo.png" style="position: absolute; right: 30pt; bottom: 20pt; height: 20pt; opacity: 0.7;">
</body></html>
```

**ステップバリエーション** (番号付き):
チェックマークの代わりに番号サークルを使用:
```html
<div style="display: flex; align-items: flex-start; gap: 12pt; margin: 0 0 14pt 0;">
  <div style="width: 28pt; height: 28pt; background: #277884; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
    <p style="color: #FFFFFF; font-size: 13pt; font-weight: bold; margin: 0;">1</p>
  </div>
  <div>
    <p style="color: #FFFFFF; font-size: 13pt; font-weight: bold; margin: 0 0 3pt 0;">{{ステップタイトル}}</p>
    <p style="color: #AAB7B8; font-size: 10pt; margin: 0;">{{ステップ説明}}</p>
  </div>
</div>
```

---

## 7. two-column — 2カラム比較

左右2カラムで情報を対照的に表示。スコープ内外、Before/After、比較に最適。

**使用例**: PoCスコープ、比較表、左右対照

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; background: #FAFBFC; }
</style></head>
<body>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>
<!-- 白ヘッダーバー -->
<div style="position: absolute; left: 0; top: 0; width: 720pt; height: 50pt; background: #FFFFFF; border-bottom: 2pt solid #1C2833;">
  <p style="color: #1C2833; font-size: 18pt; font-weight: bold; margin: 14pt 0 0 40pt;">{{ヘッダータイトル}}</p>
  <img src="logo.png" style="position: absolute; right: 20pt; top: 14pt; height: 22pt;">
</div>

<div style="position: absolute; left: 40pt; top: 58pt; width: 640pt;">

  <!-- 説明テキスト（任意） -->
  <div style="padding: 8pt 12pt; background: #277884; border-radius: 6pt; margin: 0 0 10pt 0;">
    <p style="color: #FFFFFF; font-size: 10pt; font-weight: bold; margin: 0 0 3pt 0;">{{説明タイトル}}</p>
    <p style="color: #D5F5F0; font-size: 9pt; margin: 0;">{{説明テキスト}}</p>
  </div>

  <!-- 2カラム -->
  <div style="display: flex; gap: 12pt;">

    <!-- 左カラム（メイン） -->
    <div style="flex: 1;">
      <p style="color: #277884; font-size: 11pt; font-weight: bold; margin: 0 0 6pt 0;">{{左カラムタイトル}}</p>

      <div style="padding: 7pt 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB; margin: 0 0 4pt 0;">
        <p style="color: #1C2833; font-size: 9pt; font-weight: bold; margin: 0 0 1pt 0;">{{左項目1タイトル}}</p>
        <p style="color: #5D6D7E; font-size: 8pt; margin: 0;">{{左項目1説明}}</p>
      </div>
      <div style="padding: 7pt 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB; margin: 0 0 4pt 0;">
        <p style="color: #1C2833; font-size: 9pt; font-weight: bold; margin: 0 0 1pt 0;">{{左項目2タイトル}}</p>
        <p style="color: #5D6D7E; font-size: 8pt; margin: 0;">{{左項目2説明}}</p>
      </div>
      <!-- 追加項目... -->
    </div>

    <!-- 右カラム（サブ/対照） -->
    <div style="flex: 1;">
      <p style="color: #AAB7B8; font-size: 11pt; font-weight: bold; margin: 0 0 6pt 0;">{{右カラムタイトル}}</p>

      <div style="padding: 7pt 10pt; background: #F8F9FA; border-radius: 4pt; border: 1pt solid #EAECEE; margin: 0 0 4pt 0;">
        <p style="color: #AAB7B8; font-size: 9pt; margin: 0;">{{右項目1}}</p>
      </div>
      <div style="padding: 7pt 10pt; background: #F8F9FA; border-radius: 4pt; border: 1pt solid #EAECEE; margin: 0 0 4pt 0;">
        <p style="color: #AAB7B8; font-size: 9pt; margin: 0;">{{右項目2}}</p>
      </div>
      <!-- 追加項目... -->
    </div>

  </div>
</div>
</body></html>
```

---

## 8. timeline — タイムライン

横方向のタイムライン。スケジュール、ロードマップ、フェーズ説明に最適。

**使用例**: 開発スケジュール、プロジェクトロードマップ

```html
<!DOCTYPE html>
<html><head><style>
html { background: #ffffff; }
body { width: 720pt; height: 405pt; margin: 0; padding: 0; font-family: Arial, sans-serif; background: #FAFBFC; }
</style></head>
<body>
<!-- JQIT赤サイドバー -->
<div style="position: absolute; left: 0; top: 0; width: 8pt; height: 405pt; background: #D32F2F;"></div>
<!-- 白ヘッダーバー -->
<div style="position: absolute; left: 0; top: 0; width: 720pt; height: 50pt; background: #FFFFFF; border-bottom: 2pt solid #1C2833;">
  <p style="color: #1C2833; font-size: 18pt; font-weight: bold; margin: 14pt 0 0 40pt;">{{ヘッダータイトル}}</p>
  <img src="logo.png" style="position: absolute; right: 20pt; top: 14pt; height: 22pt;">
</div>

<div style="position: absolute; left: 40pt; top: 68pt; width: 640pt;">
  <p style="color: #5D6D7E; font-size: 11pt; margin: 0 0 14pt 0;">{{サブテキスト}}</p>

  <!-- タイムライン行1 -->
  <div style="display: flex; gap: 12pt; margin: 0 0 12pt 0;">
    <!-- 期間ラベル -->
    <div style="width: 80pt; padding: 12pt 10pt; border-radius: 6pt; text-align: center; background: #277884;">
      <p style="color: #FFFFFF; font-size: 13pt; font-weight: bold; margin: 0;">{{期間1}}</p>
      <p style="color: #D5F5F0; font-size: 9pt; margin: 4pt 0 0 0;">{{期間1サブ}}</p>
    </div>
    <!-- タスクカード群 -->
    <div style="flex: 1; display: flex; gap: 6pt;">
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク1-1ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク1-1内容}}</p>
      </div>
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク1-2ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク1-2内容}}</p>
      </div>
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク1-3ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク1-3内容}}</p>
      </div>
    </div>
  </div>

  <!-- タイムライン行2 -->
  <div style="display: flex; gap: 12pt; margin: 0 0 12pt 0;">
    <div style="width: 80pt; padding: 12pt 10pt; border-radius: 6pt; text-align: center; background: #1C2833;">
      <p style="color: #FFFFFF; font-size: 13pt; font-weight: bold; margin: 0;">{{期間2}}</p>
      <p style="color: #AAB7B8; font-size: 9pt; margin: 4pt 0 0 0;">{{期間2サブ}}</p>
    </div>
    <div style="flex: 1; display: flex; gap: 6pt;">
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク2-1ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク2-1内容}}</p>
      </div>
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #277884; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク2-2ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク2-2内容}}</p>
      </div>
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #D32F2F; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク2-3ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク2-3内容}}</p>
      </div>
    </div>
  </div>

  <!-- タイムライン行3（JQIT赤） -->
  <div style="display: flex; gap: 12pt; margin: 0;">
    <div style="width: 80pt; padding: 12pt 10pt; border-radius: 6pt; text-align: center; background: #D32F2F;">
      <p style="color: #FFFFFF; font-size: 13pt; font-weight: bold; margin: 0;">{{期間3}}</p>
      <p style="color: #FDE8E4; font-size: 9pt; margin: 4pt 0 0 0;">{{期間3サブ}}</p>
    </div>
    <div style="flex: 1; display: flex; gap: 6pt;">
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #D32F2F; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク3-1ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク3-1内容}}</p>
      </div>
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #D32F2F; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク3-2ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク3-2内容}}</p>
      </div>
      <div style="flex: 1; padding: 10pt; background: #FFFFFF; border-radius: 4pt; border: 1pt solid #D5DBDB;">
        <p style="color: #D32F2F; font-size: 9pt; font-weight: bold; margin: 0 0 3pt 0;">{{タスク3-3ラベル}}</p>
        <p style="color: #2C3E50; font-size: 10pt; margin: 0;">{{タスク3-3内容}}</p>
      </div>
    </div>
  </div>

</div>
</body></html>
```

**色バリエーション**（期間ラベル）:
- ティール: `background: #277884;` — Phase 1
- ネイビー: `background: #1C2833;` — Phase 2
- JQIT赤: `background: #D32F2F;` — 最終Phase / 強調

---

## レイアウト選択ガイド

| スライドの目的 | 推奨レイアウト |
|---------------|---------------|
| 表紙 | title |
| サマリー / 要点 | card-list |
| 4つの課題 / メリット | card-grid-2x2 |
| 3つの機能 / ポイント | card-3col |
| システム構成 / プロセス | flow-diagram |
| デモ紹介 / CTA | dark-checklist |
| スコープ内外 / 比較 | two-column |
| スケジュール | timeline |
| 次のステップ | dark-checklist（ステップバリエーション） |
| 会社紹介 | card-list |
| セキュリティ | card-list |
| 費用 | card-list + テーブル（placeholder） |
