# Embeddings Reference

## Table of Contents
- [Models](#models)
- [Gemini Embedding 2 (Multimodal)](#gemini-embedding-2-multimodal)
- [Text Embeddings](#text-embeddings)
- [Image Embeddings](#image-embeddings)
- [Batch Embeddings](#batch-embeddings)
- [Similarity Search](#similarity-search)
- [Dimensionality Reduction](#dimensionality-reduction)
- [Use Cases](#use-cases)
- [Best Practices](#best-practices)

## Models

| Model | Modalities | Default Dims | Max Dims | Max Input |
|-------|-----------|-------------|----------|-----------|
| `gemini-embedding-2-preview` | テキスト, 画像, 音声, 動画, PDF | 3,072 | 128-3,072 | 8,192 tokens |
| `text-embedding-004` | テキストのみ | 768 | 1-768 | 2,048 tokens |
| `embedding-001` | テキストのみ | 768 | 768 | 2,048 tokens (Legacy) |

> **注意**: `gemini-embedding-2-preview` と `text-embedding-004` のembedding空間は互換性がありません。モデル切り替え時は全データの再embedding が必要です。

## Gemini Embedding 2 (Multimodal)

Gemini API初のマルチモーダル embedding モデル。テキスト・画像・音声・動画・PDFを統一ベクトル空間に埋め込み、クロスモーダル検索が可能。

### 対応入力

| モダリティ | 制限 |
|-----------|------|
| テキスト | 最大 8,192 tokens |
| 画像 | 最大 6枚/リクエスト (PNG, JPEG) |
| 音声 | 最大 80秒 (MP3, WAV) |
| 動画 | 最大 128秒 (MP4, MOV; H264, H265, AV1, VP9) |
| PDF | 最大 6ページ |

### 推奨次元数

Matryoshka Representation Learning (MRL) により柔軟な次元数に対応。

| 次元数 | 用途 |
|--------|------|
| 3,072 (デフォルト) | 最高品質 |
| 1,536 | 品質とサイズのバランス |
| 768 | 軽量・高速 (pgvector等との互換性◎) |
| 128-512 | 超軽量、大規模データセット向け |

> **注意**: 3,072以外の次元数を使用する場合、正確なコサイン類似度計算のために正規化が推奨されます。

### タスクタイプ

`config.task_type` でembeddingを用途に最適化:

| タスクタイプ | 説明 |
|-------------|------|
| `SEMANTIC_SIMILARITY` | テキスト類似度評価 |
| `CLASSIFICATION` | カテゴリ分類 |
| `CLUSTERING` | 類似グループ化 |
| `RETRIEVAL_DOCUMENT` | ドキュメントインデックス用 |
| `RETRIEVAL_QUERY` | 検索クエリ用 |
| `CODE_RETRIEVAL_QUERY` | コード検索クエリ用 |
| `QUESTION_ANSWERING` | QAシステム用 |
| `FACT_VERIFICATION` | ファクトチェック用 |

## Image Embeddings

### Python

```python
from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

# From file bytes
with open("drawing.png", "rb") as f:
    image_bytes = f.read()

response = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents=[
        types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/png",
        ),
    ],
    config={"output_dimensionality": 768},
)
embedding = response.embeddings[0].values
print(f"Dimensions: {len(embedding)}")  # 768
```

```python
# From base64
import base64

with open("drawing.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

response = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents=[
        {
            "inline_data": {
                "mime_type": "image/png",
                "data": b64,
            },
        },
    ],
    config={"output_dimensionality": 768},
)
embedding = list(response.embeddings[0].values)
```

### TypeScript (Google GenAI SDK)

```typescript
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

// From base64
const base64Png = fs.readFileSync("drawing.png").toString("base64");

const response = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: [
        {
            inlineData: {
                mimeType: "image/png",
                data: base64Png,
            },
        },
    ],
    config: {
        outputDimensionality: 768,
    },
});

const values = response.embeddings[0].values;
console.log(`Dimensions: ${values.length}`);  // 768
```

### 複数画像の一括embedding

```python
# 最大6画像/リクエスト
images = ["img1.png", "img2.png", "img3.png"]
parts = []
for img_path in images:
    with open(img_path, "rb") as f:
        parts.append(types.Part.from_bytes(data=f.read(), mime_type="image/png"))

response = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents=parts,
    config={"output_dimensionality": 768},
)
embeddings = [e.values for e in response.embeddings]
```

## Text Embeddings

### Python

```python
response = client.models.embed_content(
    model="gemini-embedding-2-preview",  # or "text-embedding-004"
    contents="The quick brown fox jumps over the lazy dog"
)
embedding = response.embeddings[0].values
```

### TypeScript (Google GenAI SDK)

```typescript
const response = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: "The quick brown fox jumps over the lazy dog"
});
const embedding = response.embeddings[0].values;
```

### Python (OpenAI-compatible, text-embedding-004 only)

```python
from openai import OpenAI

client = OpenAI(
    api_key="GEMINI_API_KEY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.embeddings.create(
    model="text-embedding-004",
    input="The quick brown fox jumps over the lazy dog"
)
embedding = response.data[0].embedding
```

## Batch Embeddings

Embed multiple texts in one request:

**Python:**
```python
texts = [
    "First document about AI",
    "Second document about machine learning",
    "Third document about neural networks"
]

response = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents=texts,
    config={"output_dimensionality": 768},
)
embeddings = [e.values for e in response.embeddings]
```

> Batch APIを使うと非リアルタイム処理で50%コスト削減が可能。

## Similarity Search

Calculate cosine similarity between embeddings:

**Python:**
```python
import numpy as np

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Cross-modal search: テキストで画像を検索
query_emb = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents="矩形の板金パーツ、4つの穴",
    config={"output_dimensionality": 768},
).embeddings[0].values

similarities = [
    cosine_similarity(query_emb, img_emb)
    for img_emb in image_embeddings
]
most_similar_idx = np.argmax(similarities)
```

**TypeScript:**
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
}
```

## Dimensionality Reduction

Both `gemini-embedding-2-preview` and `text-embedding-004` support native dimension reduction:

**Python:**
```python
# gemini-embedding-2-preview: 128-3072
response = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents="Sample text",
    config={"output_dimensionality": 768}
)

# text-embedding-004: 1-768
response = client.models.embed_content(
    model="text-embedding-004",
    contents="Sample text",
    config={"output_dimensionality": 256}
)
```

## Use Cases

### 画像類似検索 (pgvector)

```python
# 1. 画像をembedding化してDBに保存
import base64
from supabase import create_client

supabase = create_client(url, key)

with open("drawing.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

response = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents=[{"inline_data": {"mime_type": "image/png", "data": b64}}],
    config={"output_dimensionality": 768},
)
embedding = list(response.embeddings[0].values)

supabase.table("embeddings").insert({
    "embedding": embedding,
    "image_path": "drawings/example.png",
}).execute()

# 2. クエリ画像で類似検索 (RPC)
result = supabase.rpc("search_similar", {
    "query_embedding": query_embedding,
    "match_threshold": 0.5,
    "match_count": 5,
}).execute()
```

### RAG (Retrieval-Augmented Generation)

```python
def rag_query(question: str):
    query_emb = client.models.embed_content(
        model="gemini-embedding-2-preview",
        contents=question,
        config={"output_dimensionality": 768},
    ).embeddings[0].values

    similarities = [cosine_similarity(query_emb, d) for d in doc_embeddings]
    top_indices = np.argsort(similarities)[-3:][::-1]
    context = "\n\n".join([docs[i] for i in top_indices])

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=f"Context:\n{context}\n\nQuestion: {question}",
        config=types.GenerateContentConfig(
            system_instruction="Answer based on the provided context only."
        )
    )
    return response.text
```

### クロスモーダル検索

```python
# テキストクエリで画像を検索（同一embedding空間）
text_emb = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents="赤い車",
    config={"output_dimensionality": 768},
).embeddings[0].values

# 画像embeddingとの類似度を計算
for img_emb in image_embeddings:
    score = cosine_similarity(text_emb, img_emb)
    # テキストと画像が同一空間にあるのでクロスモーダル検索が可能
```

## Best Practices

1. **モデル移行時は全データ再embedding** — embedding空間が異なるため部分更新不可
2. **画像は最大6枚/リクエスト** — 超える場合はバッチ分割
3. **次元数を統一** — クエリとドキュメントで同一の `output_dimensionality` を使用
4. **3,072以外の次元数では正規化** — MRLによる低次元化後は L2 正規化を推奨
5. **タスクタイプを指定** — `RETRIEVAL_DOCUMENT` / `RETRIEVAL_QUERY` 等で精度向上
6. **レート制限対策** — 無料枠は60RPM、大量処理は1秒間隔で実行
7. **Batch APIで50%コスト削減** — リアルタイム性不要ならBatch APIを使用
8. **chunk長は~500トークン** — 長文は重複ありでチャンク分割
