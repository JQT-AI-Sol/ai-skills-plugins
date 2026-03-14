# Multimodal Input Reference

## Table of Contents
- [Supported Input Types](#supported-input-types)
- [Image Input](#image-input)
- [Video Input](#video-input)
- [Audio Input](#audio-input)
- [PDF Input](#pdf-input)
- [File Upload API](#file-upload-api)
- [URL Context](#url-context)

## Supported Input Types

| Input Type | Supported Formats | Max Size (inline) | Notes |
|------------|-------------------|-------------------|-------|
| Image | JPEG, PNG, GIF, WebP, HEIC, HEIF | 20MB | Base64 inline or file upload |
| Video | MP4, MPEG, MOV, AVI, FLV, MKV, WebM | - | File upload required |
| Audio | WAV, MP3, AIFF, AAC, OGG, FLAC | 25MB (inline) | Base64 inline or file upload |
| PDF | PDF | 30MB | Inline or file upload |

## Image Input

**Python (base64 inline):**
```python
from google.genai import types
import pathlib

image_bytes = pathlib.Path("photo.jpg").read_bytes()

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[
        types.Content(parts=[
            types.Part(text="Describe this image in detail"),
            types.Part(inline_data=types.Blob(
                mime_type="image/jpeg",
                data=image_bytes
            ))
        ])
    ]
)
```

**Python (from URL):**
```python
from google.genai import types
import urllib.request

image_url = "https://example.com/photo.jpg"
image_data = urllib.request.urlopen(image_url).read()

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
```

**TypeScript (Vercel AI SDK):**
```typescript
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs";

// From file
const { text } = await generateText({
    model: google("gemini-3-flash-preview"),
    messages: [{
        role: "user",
        content: [
            { type: "text", text: "Describe this image" },
            { type: "image", image: fs.readFileSync("photo.jpg"), mimeType: "image/jpeg" }
        ]
    }]
});

// From URL
const { text: text2 } = await generateText({
    model: google("gemini-3-flash-preview"),
    messages: [{
        role: "user",
        content: [
            { type: "text", text: "Describe this image" },
            { type: "image", image: new URL("https://example.com/photo.jpg") }
        ]
    }]
});
```

**Multiple images:**
```python
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[
        types.Content(parts=[
            types.Part(text="Compare these two images"),
            types.Part(inline_data=types.Blob(mime_type="image/jpeg", data=image1_bytes)),
            types.Part(inline_data=types.Blob(mime_type="image/jpeg", data=image2_bytes))
        ])
    ]
)
```

## Video Input

Video requires file upload (too large for inline):

**Python:**
```python
import time

# Upload video
video_file = client.files.upload(
    file="video.mp4",
    config={"mime_type": "video/mp4"}
)

# Wait for processing
while video_file.state == "PROCESSING":
    time.sleep(5)
    video_file = client.files.get(name=video_file.name)

# Use in generation
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[
        types.Content(parts=[
            types.Part(text="Summarize what happens in this video"),
            types.Part(file_data=types.FileData(
                mime_type="video/mp4",
                file_uri=video_file.uri
            ))
        ])
    ]
)
```

**TypeScript:**
```typescript
// Upload video
const videoFile = await ai.files.upload({
    file: "video.mp4",
    config: { mimeType: "video/mp4" }
});

// Wait for processing
let file = videoFile;
while (file.state === "PROCESSING") {
    await new Promise(resolve => setTimeout(resolve, 5000));
    file = await ai.files.get({ name: file.name });
}

// Use in generation
const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{
        parts: [
            { text: "Summarize what happens in this video" },
            { fileData: { mimeType: "video/mp4", fileUri: file.uri } }
        ]
    }]
});
```

## Audio Input

**Python (inline, small files):**
```python
audio_bytes = pathlib.Path("audio.mp3").read_bytes()

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[
        types.Content(parts=[
            types.Part(text="Transcribe this audio"),
            types.Part(inline_data=types.Blob(
                mime_type="audio/mp3",
                data=audio_bytes
            ))
        ])
    ]
)
```

**Python (file upload, large files):**
```python
audio_file = client.files.upload(
    file="podcast.mp3",
    config={"mime_type": "audio/mp3"}
)

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[
        types.Content(parts=[
            types.Part(text="Summarize the key points discussed"),
            types.Part(file_data=types.FileData(
                mime_type="audio/mp3",
                file_uri=audio_file.uri
            ))
        ])
    ]
)
```

## PDF Input

**Python:**
```python
pdf_bytes = pathlib.Path("document.pdf").read_bytes()

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[
        types.Content(parts=[
            types.Part(text="Summarize this document"),
            types.Part(inline_data=types.Blob(
                mime_type="application/pdf",
                data=pdf_bytes
            ))
        ])
    ]
)
```

**TypeScript (Vercel AI SDK):**
```typescript
const { text } = await generateText({
    model: google("gemini-3-flash-preview"),
    messages: [{
        role: "user",
        content: [
            { type: "text", text: "Summarize this document" },
            { type: "file", data: fs.readFileSync("document.pdf"), mimeType: "application/pdf" }
        ]
    }]
});
```

## File Upload API

For large files or files that need processing (video):

**Python:**
```python
# Upload
uploaded = client.files.upload(
    file="large_file.pdf",
    config={"mime_type": "application/pdf", "display_name": "My Document"}
)
print(f"URI: {uploaded.uri}")
print(f"State: {uploaded.state}")

# List uploaded files
for f in client.files.list():
    print(f"{f.name}: {f.display_name} ({f.state})")

# Delete
client.files.delete(name=uploaded.name)
```

**REST:**
```bash
# Upload
curl -X POST "https://generativelanguage.googleapis.com/upload/v1beta/files?key=$API_KEY" \
  -H "X-Goog-Upload-Protocol: raw" \
  -H "Content-Type: application/pdf" \
  --data-binary @document.pdf

# List
curl "https://generativelanguage.googleapis.com/v1beta/files?key=$API_KEY"

# Delete
curl -X DELETE "https://generativelanguage.googleapis.com/v1beta/files/{file_name}?key=$API_KEY"
```

**File lifecycle:**
- Uploaded files expire after 48 hours
- Maximum 20GB per file
- Maximum 20GB total storage per project

## URL Context

Pass URLs for the model to fetch and analyze (supported models only):

**Python:**
```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Summarize the content of this page",
    config=types.GenerateContentConfig(
        tools=[types.Tool(url_context=types.UrlContext())]
    )
)
```

Supported on: gemini-3.1-pro-preview, gemini-3-flash-preview, gemini-2.5-pro, gemini-2.5-flash
