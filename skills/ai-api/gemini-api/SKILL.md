---
name: gemini-api
description: >
  Google Gemini API guide for model selection, parameter configuration, and implementation.
  Use when: (1) Writing code that calls Gemini API (imports `google-genai`, `@google/genai`, or uses OpenAI-compatible endpoint),
  (2) Choosing between Gemini models (gemini-3.1-pro-preview, gemini-3-flash-preview, gemini-2.5-pro, gemini-2.5-flash),
  (3) Configuring API parameters (thinking budgets, temperature, structured output),
  (4) Using Gemini-specific features (function calling, search grounding, image generation, live API),
  (5) Migrating between Gemini model versions.
  Triggers: "gemini", "gemini api", "google ai", "generativelanguage", "gemini-3", "gemini-2.5".
  Primary stacks: Vercel/Next.js (TypeScript) and Python (FastAPI).
  DO NOT use for OpenAI/GPT models - use openai-api skill instead.
---

# Gemini API

Build AI applications using Google's Gemini APIs with Python or TypeScript SDKs.

## Quick Start

### Installation

```bash
# Python (Google GenAI SDK)
pip install google-genai

# Python (OpenAI-compatible)
pip install openai

# TypeScript/Node.js (Vercel AI SDK)
npm install @ai-sdk/google ai

# TypeScript/Node.js (Google GenAI SDK)
npm install @google/genai
```

### Client Setup

**Python (Google GenAI SDK):**
```python
from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")
# Or set GEMINI_API_KEY / GOOGLE_API_KEY env var
```

**Python (OpenAI-compatible):**
```python
from openai import OpenAI

client = OpenAI(
    api_key="GEMINI_API_KEY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
```

**TypeScript (Vercel AI SDK):**
```typescript
import { google } from "@ai-sdk/google";
// Uses GOOGLE_GENERATIVE_AI_API_KEY env var
```

**TypeScript (Google GenAI SDK):**
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });
```

## Generate Content

Basic content generation:

**Python:**
```python
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Explain quantum computing briefly."
)
print(response.text)
```

**TypeScript (Vercel AI SDK):**
```typescript
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const { text } = await generateText({
    model: google("gemini-3-flash-preview"),
    prompt: "Explain quantum computing briefly."
});
console.log(text);
```

**TypeScript (Google GenAI SDK):**
```typescript
const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain quantum computing briefly."
});
console.log(response.text);
```

### Streaming

**Python:**
```python
for chunk in client.models.generate_content_stream(
    model="gemini-3-flash-preview",
    contents="Tell me a story"
):
    print(chunk.text, end="")
```

**TypeScript (Vercel AI SDK):**
```typescript
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

const { textStream } = streamText({
    model: google("gemini-3-flash-preview"),
    prompt: "Tell me a story"
});
for await (const chunk of textStream) {
    process.stdout.write(chunk);
}
```

### Tool Use / Function Calling

**Python:**
```python
from google.genai import types

get_weather = types.FunctionDeclaration(
    name="get_weather",
    description="Get current weather for a location",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "location": types.Schema(type="STRING", description="City name")
        },
        required=["location"]
    )
)

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="What's the weather in Paris?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(function_declarations=[get_weather])]
    )
)

# Check for function call
part = response.candidates[0].content.parts[0]
if part.function_call:
    print(f"Call: {part.function_call.name}({part.function_call.args})")
```

**TypeScript (Vercel AI SDK):**
```typescript
import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";

const { text, toolResults } = await generateText({
    model: google("gemini-3-flash-preview"),
    prompt: "What's the weather in Paris?",
    tools: {
        getWeather: tool({
            description: "Get current weather for a location",
            parameters: z.object({
                location: z.string().describe("City name")
            }),
            execute: async ({ location }) => {
                return { temp: 22, condition: "sunny" };
            }
        })
    }
});
```

**Python (OpenAI-compatible):**
```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string", "description": "City name"}
            },
            "required": ["location"]
        }
    }
}]

response = client.chat.completions.create(
    model="gemini-3-flash-preview",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools
)

if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    # Execute function, then send result back
```

### Vision (Image Input)

**Python:**
```python
from google.genai import types
import base64

# From file
with open("image.jpg", "rb") as f:
    image_data = f.read()

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[
        types.Content(parts=[
            types.Part(text="What's in this image?"),
            types.Part(inline_data=types.Blob(
                mime_type="image/jpeg",
                data=image_data
            ))
        ])
    ]
)
print(response.text)
```

**TypeScript (Vercel AI SDK):**
```typescript
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs";

const imageData = fs.readFileSync("image.jpg");

const { text } = await generateText({
    model: google("gemini-3-flash-preview"),
    messages: [{
        role: "user",
        content: [
            { type: "text", text: "What's in this image?" },
            { type: "image", image: imageData, mimeType: "image/jpeg" }
        ]
    }]
});
```

### Structured Outputs (JSON Mode)

**Python:**
```python
from google.genai import types
from pydantic import BaseModel

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Create a team meeting for tomorrow with Alice and Bob",
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=CalendarEvent
    )
)
import json
event = json.loads(response.text)
```

**TypeScript (Vercel AI SDK with Zod):**
```typescript
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const CalendarEvent = z.object({
    name: z.string(),
    date: z.string(),
    participants: z.array(z.string())
});

const { object } = await generateObject({
    model: google("gemini-3-flash-preview"),
    prompt: "Create a team meeting for tomorrow with Alice and Bob",
    schema: CalendarEvent
});
```

**Python (OpenAI-compatible):**
```python
response = client.chat.completions.create(
    model="gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Create a meeting for tomorrow"}],
    response_format={"type": "json_object"}
)
```

### Search Grounding

**Python:**
```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="What are the latest AI news today?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())]
    )
)
print(response.text)
# Access grounding metadata
if response.candidates[0].grounding_metadata:
    for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
        print(f"Source: {chunk.web.uri}")
```

## Models

### Generation Models

| Model | Best For |
|-------|----------|
| `gemini-3.1-pro-preview` | Latest flagship, maximum quality |
| `gemini-3.1-flash-lite-preview` | Fastest & cheapest, 380tok/s, classification/translation |
| `gemini-3-flash-preview` | Pro-level quality at Flash speed/price |

### Specialized Models

| Model | Purpose |
|-------|---------|
| `gemini-embedding-2-preview` | Multimodal embeddings (text, image, audio, video, PDF) |
| `text-embedding-004` | Text-only embeddings |
| `imagen-3.0-generate-002` | Image generation |

### Deprecated Models

| Old Model | Replacement |
|-----------|-------------|
| `gemini-3-pro-preview` | `gemini-3.1-pro-preview` |
| `gemini-2.5-pro` | `gemini-3.1-pro-preview` |
| `gemini-2.5-flash` | `gemini-3-flash-preview` |
| `gemini-2.5-flash-lite` | `gemini-3.1-flash-lite-preview` |
| `gemini-2.0-flash` | `gemini-3-flash-preview` |
| `gemini-2.0-flash-lite` | `gemini-3.1-flash-lite-preview` |

## Feature References

- **Advanced generation patterns (multi-turn, thinking, caching)**: See [references/advanced-generation.md](references/advanced-generation.md)
- **Multimodal input (video, audio, PDF, file upload)**: See [references/multimodal.md](references/multimodal.md)
- **Embeddings**: See [references/embeddings.md](references/embeddings.md)

## Error Handling

**Python (Google GenAI SDK):**
```python
from google.genai import errors

try:
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hello"
    )
except errors.ClientError as e:
    # 400/401/403/404 errors
    print(f"Client error: {e.code} - {e.message}")
except errors.ServerError as e:
    # 500/503 errors
    print(f"Server error: {e.code} - {e.message}")
except errors.TooManyRequestsError:
    # 429 rate limit - implement backoff/retry
    pass
```

**Python (OpenAI-compatible):**
```python
from openai import APIError, RateLimitError, APIConnectionError

try:
    response = client.chat.completions.create(...)
except RateLimitError:
    # Implement backoff/retry
    pass
except APIConnectionError:
    # Network issue
    pass
except APIError as e:
    print(f"API error: {e.status_code} - {e.message}")
```

**TypeScript (Google GenAI SDK):**
```typescript
try {
    const response = await ai.models.generateContent({...});
} catch (error) {
    if (error.status === 429) {
        // Rate limit - implement backoff/retry
    } else if (error.status === 400) {
        // Bad request - check parameters
    } else {
        console.error(`API error: ${error.status} - ${error.message}`);
    }
}
```

## Common Parameters

| Parameter | Description |
|-----------|-------------|
| `temperature` | 0-2, lower = deterministic, higher = creative |
| `maxOutputTokens` | Maximum response length |
| `topP` | Nucleus sampling (0-1) |
| `topK` | Top-K sampling (1-100) |
| `stopSequences` | Stop sequences to end generation (max 5) |
| `thinkingConfig.thinkingBudget` | Thinking token budget (model-dependent) |
| `responseMimeType` | `"text/plain"` or `"application/json"` for JSON mode |
| `responseSchema` | JSON Schema for structured output |
