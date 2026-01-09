# Kie.ai Model Pricing API

Unofficial documentation for the Kie.ai internal API used to fetch model pricing data.

## Base URL

```
https://api.kie.ai/client/v1/
```

## Endpoints

### Get Model Counts

Returns the total count of models by category.

```
GET /model-pricing/count
```

**Response:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "all": 231,
    "image": 64,
    "video": 151,
    "music": 16
  }
}
```

---

### Get Paginated Models

Returns a paginated list of model pricing data.

```
POST /model-pricing/page
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pageNum` | number | Yes | Page number (1-indexed) |
| `pageSize` | number | Yes | Items per page |
| `interfaceType` | string | No | Filter by type: `video`, `image`, `music` |

**Example Request:**
```json
{
  "pageNum": 1,
  "pageSize": 10,
  "interfaceType": "video"
}
```

**Response:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "records": [...],
    "total": 231
  }
}
```

**Record Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `modelDescription` | string | Human-readable model name/config |
| `interfaceType` | string | Category: `video`, `image`, `music` |
| `provider` | string | Model provider (e.g., ByteDance, Midjourney) |
| `creditPrice` | string | Price in Kie credits |
| `creditUnit` | string | Unit (e.g., "per video", "per request") |
| `usdPrice` | string | Price in USD |
| `falPrice` | string | Competitor price (Fal.ai) for comparison |
| `discountRate` | number | Discount percentage vs Fal.ai |
| `anchor` | string | Link to model page on Kie.ai |
| `discountPrice` | boolean | Whether discount pricing is active |

**Example Record:**
```json
{
  "modelDescription": "Seedance 1.5 Pro, 12s 720P with audio",
  "interfaceType": "video",
  "provider": "ByteDance",
  "creditPrice": "84.0",
  "creditUnit": " per video",
  "usdPrice": "0.42",
  "falPrice": "0.6221",
  "discountRate": 32.49,
  "anchor": "https://kie.ai/seedance-1-5-pro",
  "discountPrice": false
}
```

---

## Ordering

**Default order: Newest models first.**

- No explicit sort/order parameters exposed
- No timestamp or ID fields in response
- First page contains newest models (e.g., Seedance 1.5 Pro)
- Last pages contain older/established models (e.g., Midjourney)

To get newest models, simply use `pageNum: 1`.

---

## Usage Examples

### Fetch newest video models
```javascript
fetch('https://api.kie.ai/client/v1/model-pricing/page', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pageNum: 1,
    pageSize: 10,
    interfaceType: 'video'
  })
})
```

### Fetch all model counts
```javascript
fetch('https://api.kie.ai/client/v1/model-pricing/count')
```

---

## Other Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/user-info` | GET | Get current user info (requires auth) |

---

## Model Discovery

### LLMs.txt (Recommended)
The full model list is available at:
```
https://docs.kie.ai/llms.txt
```

### Individual Model Docs
Each model has docs at:
```
https://docs.kie.ai/market/{provider}/{model}.md
```

Example:
```bash
curl https://docs.kie.ai/market/google/nano-banana.md
```

---

## Available Models (73 endpoints)

### Video Models
| Provider | Model ID |
|----------|----------|
| ByteDance | `bytedance/seedance-1.5-pro` |
| ByteDance | `bytedance/v1-lite-image-to-video` |
| ByteDance | `bytedance/v1-lite-text-to-video` |
| ByteDance | `bytedance/v1-pro-fast-image-to-video` |
| ByteDance | `bytedance/v1-pro-image-to-video` |
| ByteDance | `bytedance/v1-pro-text-to-video` |
| Grok | `grok-imagine/image-to-video` |
| Grok | `grok-imagine/text-to-video` |
| Hailuo | `hailuo/02-image-to-video-pro` |
| Hailuo | `hailuo/02-image-to-video-standard` |
| Hailuo | `hailuo/02-text-to-video-pro` |
| Hailuo | `hailuo/02-text-to-video-standard` |
| Hailuo | `hailuo/2-3-image-to-video-pro` |
| Hailuo | `hailuo/2-3-image-to-video-standard` |
| Kling | `kling/image-to-video` |
| Kling | `kling/text-to-video` |
| Kling | `kling/motion-control` |
| Kling | `kling/ai-avatar-v1-pro` |
| Kling | `kling/v1-avatar-standard` |
| Kling | `kling/v2-1-master-image-to-video` |
| Kling | `kling/v2-1-master-text-to-video` |
| Kling | `kling/v2-1-pro` |
| Kling | `kling/v2-1-standard` |
| Sora | `sora2/sora-2-image-to-video` |
| Sora | `sora2/sora-2-text-to-video` |
| Sora | `sora2/sora-2-pro-image-to-video` |
| Sora | `sora2/sora-2-pro-text-to-video` |
| Sora | `sora2/sora-2-characters` |
| Sora | `sora2/sora-watermark-remover` |
| Sora | `sora-2-pro-storyboard/index` |
| Topaz | `topaz/video-upscale` |
| Wan | `wan/2-2-a14b-image-to-video-turbo` |
| Wan | `wan/2-2-a14b-text-to-video-turbo` |
| Wan | `wan/2-2-a14b-speech-to-video-turbo` |
| Wan | `wan/2-2-animate-move` |
| Wan | `wan/2-2-animate-replace` |
| Wan | `wan/2-6-image-to-video` |
| Wan | `wan/2-6-text-to-video` |
| Wan | `wan/2-6-video-to-video` |

### Image Models
| Provider | Model ID |
|----------|----------|
| Flux | `flux2/flex-image-to-image` |
| Flux | `flux2/flex-text-to-image` |
| Flux | `flux2/pro-image-to-image` |
| Flux | `flux2/pro-text-to-image` |
| Google | `google/imagen4` |
| Google | `google/imagen4-fast` |
| Google | `google/imagen4-ultra` |
| Google | `google/nano-banana` |
| Google | `google/nano-banana-edit` |
| Google | `google/pro-image-to-image` |
| GPT | `gpt-image/1.5-image-to-image` |
| GPT | `gpt-image/1.5-text-to-image` |
| Grok | `grok-imagine/image-to-image` |
| Grok | `grok-imagine/text-to-image` |
| Grok | `grok-imagine/upscale` |
| Ideogram | `ideogram/character` |
| Ideogram | `ideogram/character-edit` |
| Ideogram | `ideogram/character-remix` |
| Ideogram | `ideogram/v3-reframe` |
| Qwen | `qwen/image-edit` |
| Qwen | `qwen/image-to-image` |
| Qwen | `qwen/text-to-image` |
| Recraft | `recraft/crisp-upscale` |
| Recraft | `recraft/remove-background` |
| Seedream | `seedream/4.5-edit` |
| Seedream | `seedream/4.5-text-to-image` |
| Seedream | `seedream/seedream` |
| Seedream | `seedream/seedream-v4-edit` |
| Seedream | `seedream/seedream-v4-text-to-image` |
| Topaz | `topaz/image-upscale` |
| Z-Image | `z-image/z-image` |

### Audio/Music Models
| Provider | Model ID |
|----------|----------|
| ElevenLabs | `elevenlabs/audio-isolation` |
| ElevenLabs | `elevenlabs/sound-effect-v2` |
| ElevenLabs | `elevenlabs/speech-to-text` |
| ElevenLabs | `elevenlabs/text-to-speech-multilingual-v2` |
| ElevenLabs | `elevenlabs/text-to-speech-turbo-2-5` |
| Infinitalk | `infinitalk/from-audio` |

---

## Notes

- This is a Next.js application
- Homepage/market pages use SSR with static model data
- Pricing page dynamically fetches from API
- No authentication required for model pricing endpoints
- Compare pricing against Fal.ai via `falPrice` and `discountRate` fields
- Full model docs: `https://docs.kie.ai/llms.txt`
