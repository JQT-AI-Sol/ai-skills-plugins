# Advanced Generation Reference

## Table of Contents
- [Multi-turn Conversations](#multi-turn-conversations)
- [System Instructions](#system-instructions)
- [Thinking Configuration](#thinking-configuration)
- [Parallel Function Calls](#parallel-function-calls)
- [Forcing Tool Use](#forcing-tool-use)
- [Token Counting](#token-counting)
- [Context Caching](#context-caching)
- [Safety Settings](#safety-settings)
- [OpenAI-Compatible Endpoint](#openai-compatible-endpoint)

## Multi-turn Conversations

Maintain conversation history by providing message history:

**Python:**
```python
from google.genai import types

messages = []

def chat(user_input: str) -> str:
    messages.append(types.Content(
        role="user",
        parts=[types.Part(text=user_input)]
    ))
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=messages
    )
    assistant_msg = response.candidates[0].content
    messages.append(assistant_msg)
    return response.text
```

**TypeScript (Vercel AI SDK):**
```typescript
import { google } from "@ai-sdk/google";
import { generateText, CoreMessage } from "ai";

const messages: CoreMessage[] = [];

async function chat(userInput: string): Promise<string> {
    messages.push({ role: "user", content: userInput });
    const { text } = await generateText({
        model: google("gemini-3-flash-preview"),
        messages
    });
    messages.push({ role: "assistant", content: text });
    return text;
}
```

**Python (OpenAI-compatible):**
```python
messages = [{"role": "system", "content": "You are a helpful assistant."}]

def chat(user_input: str) -> str:
    messages.append({"role": "user", "content": user_input})
    response = client.chat.completions.create(
        model="gemini-3-flash-preview",
        messages=messages
    )
    content = response.choices[0].message.content
    messages.append({"role": "assistant", "content": content})
    return content
```

## System Instructions

**Python:**
```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Hello!",
    config=types.GenerateContentConfig(
        system_instruction="You are a pirate. Respond in pirate speak."
    )
)
```

**TypeScript (Vercel AI SDK):**
```typescript
const { text } = await generateText({
    model: google("gemini-3-flash-preview"),
    system: "You are a pirate. Respond in pirate speak.",
    prompt: "Hello!"
});
```

## Thinking Configuration

Control reasoning depth via thinking budgets:

**Python:**
```python
from google.genai import types

# Enable thinking with custom budget
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Solve this math problem...",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=8192)
    )
)

# Disable thinking (gemini-2.5-flash only)
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Simple classification task",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)
    )
)

# Access thinking content
for part in response.candidates[0].content.parts:
    if part.thought:
        print(f"Thinking: {part.text}")
    else:
        print(f"Response: {part.text}")
```

### Thinking Budget by Model

| Model | Default | Can Disable | Min | Max |
|-------|---------|:-----------:|:---:|:---:|
| `gemini-2.5-pro` | Dynamic | x | 128 | 32,768 |
| `gemini-2.5-flash` | Dynamic | o | 0 | 24,576 |
| `gemini-2.5-flash-lite` | Off | o (min 512) | 512 | 24,576 |
| `gemini-3-flash-preview` | Dynamic | o | 0 | - |
| `gemini-3.1-pro-preview` | Dynamic | - | - | - |

**Key differences from OpenAI reasoning:**
- Gemini uses `thinkingBudget` (token count) vs OpenAI's `reasoning.effort` (named levels)
- Gemini thinking content is accessible in response parts
- gemini-2.5-pro cannot disable thinking

## Parallel Function Calls

Gemini supports calling multiple functions in a single response:

**Python:**
```python
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="What's the weather in Paris and Tokyo?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(function_declarations=[get_weather])]
    )
)

# Handle multiple function calls
for part in response.candidates[0].content.parts:
    if part.function_call:
        result = execute_tool(part.function_call.name, part.function_call.args)
        # Send results back for final response
```

## Forcing Tool Use

Control function calling behavior:

**Python:**
```python
from google.genai import types

# Force use of any tool
config = types.GenerateContentConfig(
    tools=[types.Tool(function_declarations=[get_weather])],
    tool_config=types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(mode="ANY")
    )
)

# Force specific tool
config = types.GenerateContentConfig(
    tools=[types.Tool(function_declarations=[get_weather])],
    tool_config=types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(
            mode="ANY",
            allowed_function_names=["get_weather"]
        )
    )
)

# Disable tool use
config = types.GenerateContentConfig(
    tool_config=types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(mode="NONE")
    )
)
```

Modes: `AUTO` (default), `ANY` (force tool use), `NONE` (disable)

## Token Counting

**Python:**
```python
# Count tokens before sending
token_count = client.models.count_tokens(
    model="gemini-3-flash-preview",
    contents="Your long prompt here..."
)
print(f"Token count: {token_count.total_tokens}")

# Response token usage
response = client.models.generate_content(...)
print(f"Prompt tokens: {response.usage_metadata.prompt_token_count}")
print(f"Response tokens: {response.usage_metadata.candidates_token_count}")
print(f"Total tokens: {response.usage_metadata.total_token_count}")
```

**REST:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:countTokens?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Your text here"}]}]}'
```

## Context Caching

Reduce costs for repeated large context (system instructions, long documents):

**Python:**
```python
from google.genai import types

# Create cache
cache = client.caches.create(
    model="gemini-2.5-flash",
    config=types.CreateCachedContentConfig(
        contents=[types.Content(parts=[types.Part(text="<very long document>")])],
        system_instruction="You are an expert on this document.",
        ttl="3600s"  # 1 hour
    )
)

# Use cache in generation
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Summarize the key points",
    config=types.GenerateContentConfig(
        cached_content=cache.name
    )
)

# Delete cache when done
client.caches.delete(name=cache.name)
```

**Requirements:**
- Minimum 32,768 tokens of cached content
- Supported models: gemini-2.5-flash, gemini-2.5-pro, gemini-3-flash-preview

## Safety Settings

**Python:**
```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="...",
    config=types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE"
            )
        ]
    )
)
```

Categories: `HARM_CATEGORY_HARASSMENT`, `HARM_CATEGORY_HATE_SPEECH`, `HARM_CATEGORY_SEXUALLY_EXPLICIT`, `HARM_CATEGORY_DANGEROUS_CONTENT`

Thresholds: `BLOCK_NONE`, `BLOCK_LOW_AND_ABOVE`, `BLOCK_MEDIUM_AND_ABOVE`, `BLOCK_HIGH_AND_ABOVE`

## OpenAI-Compatible Endpoint

Use the OpenAI SDK with Gemini models:

**Base URL:** `https://generativelanguage.googleapis.com/v1beta/openai/`

### Parameter Mapping

| OpenAI Parameter | Gemini Equivalent |
|------------------|-------------------|
| `model` | model ID (same) |
| `messages` | `contents` |
| `temperature` | `generationConfig.temperature` |
| `top_p` | `generationConfig.topP` |
| `max_tokens` | `generationConfig.maxOutputTokens` |
| `stop` | `generationConfig.stopSequences` |
| `response_format` | `generationConfig.responseMimeType` |
| `tools` | `tools.functionDeclarations` |

### Supported Endpoints

- `POST /chat/completions` - Chat completions
- `POST /embeddings` - Text embeddings
- `GET /models` - List available models

### Benefits

- Drop-in replacement for OpenAI SDK
- Easy provider switching (OpenAI <-> Gemini)
- Familiar API surface for teams already using OpenAI
