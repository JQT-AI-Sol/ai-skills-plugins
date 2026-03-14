# docx赤入れ実装ガイド

契約書docxにtracked changesを入れる際の技術的ノウハウ。

## 前提

docx編集には `document-skills:docx` スキルを使用する。
OOXMLのDocument Library（Python）でtracked changesを生成する。

## ワークフロー

```
1. unpack.py でdocxを展開
2. pandoc で全文markdownを取得（参照用）
3. grep で対象段落のXML位置を特定
4. Python編集スクリプトを作成・実行
5. pack.py でdocxに再パック
6. pandoc --track-changes=all で検証
```

## 重要な技術的注意点

### Entity Encoding
ASCII encodingのdocxでは日本語テキストがentity-encoded（`&#30002;` = 甲）。
- `contains=` 検索は decoded テキストで動作する（通常のテキストで検索OK）
- grepでXML中のテキストを検索する場合はentity-encoded形式で検索

### 段落レベル操作を推奨
run（w:r）レベルのテキスト操作は避ける。テキストが複数runに分割されている場合に失敗する。
代わりに段落（w:p）レベルで `suggest_deletion` + `insert_after` を使用。

### Bottom-to-Top処理
文書の下から上に向かって編集すること。上から編集するとline numberがずれる。

### 段落検索パターン
```python
# paraIdで特定（確実）
node = doc["word/document.xml"].get_node(tag="w:p", attrs={"w14:paraId": "0000002E"})

# テキスト内容で特定（便利だが一意性に注意）
node = doc["word/document.xml"].get_node(tag="w:p", contains="条（協")
```

### 編集パターン
```python
# 段落削除 + 新段落挿入
doc["word/document.xml"].suggest_deletion(old_para)
new_para = f'<w:p>{ppr}<w:r>{rpr}<w:t xml:space="preserve">{text}</w:t></w:r></w:p>'
doc["word/document.xml"].insert_after(old_para, DocxXMLEditor.suggest_paragraph(new_para))
```

### 書式テンプレート
```python
# 本文のrPr（Century 10.5pt）
brpr = '<w:rPr><w:rFonts w:ascii="Century" w:cs="Century" w:eastAsia="Century" w:hAnsi="Century"/><w:b w:val="0"/><w:i w:val="0"/><w:smallCaps w:val="0"/><w:strike w:val="0"/><w:color w:val="000000"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:u w:val="none"/><w:shd w:fill="auto" w:val="clear"/><w:vertAlign w:val="baseline"/></w:rPr>'

# インデント付き段落pPr
bppr = '<w:pPr><w:ind w:left="409" w:firstLine="0"/><w:rPr/></w:pPr>'

# 見出し段落pPr
hppr = '<w:pPr><w:rPr/></w:pPr>'

# 番号付きリストpPr
def num_ppr(numId):
    return f'<w:pPr>...<w:numPr><w:ilvl w:val="0"/><w:numId w:val="{numId}"/></w:numPr>...</w:pPr>'
```

### NDA特有の構造
NDAでは見出しと本文が `<w:br w:type="textWrapping"/>` で1つの `<w:p>` に結合されている。
```xml
<w:p>
  <w:r><w:rPr><w:b w:val="1"/></w:rPr><w:t>第1条（機密情報）</w:t></w:r>
  <w:r><w:br w:type="textWrapping"/><w:t>本文テキスト...</w:t></w:r>
</w:p>
```
