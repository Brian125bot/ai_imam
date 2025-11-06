# API Documentation

## Overview

This document provides detailed information about the Google Gemini API integration in Ai-Imam and how the application communicates with the AI model to generate fatwas.

## Table of Contents

- [Service Layer](#service-layer)
- [API Configuration](#api-configuration)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Best Practices](#best-practices)

## Service Layer

### `geminiService.ts`

The primary module responsible for all Gemini API interactions.

#### Main Function

```typescript
async function generateFatwa(prompt: string): Promise<Fatwa>
```

**Parameters:**
- `prompt` (string): The user's question about Islamic jurisprudence

**Returns:**
- `Promise<Fatwa>`: A promise that resolves to a Fatwa object with bilingual content

**Throws:**
- `Error`: With user-friendly message describing the failure

#### Usage Example

```typescript
import { generateFatwa } from './services/geminiService';

try {
  const fatwa = await generateFatwa("What is the ruling on fasting while traveling?");
  console.log(fatwa.englishFatwa);
  console.log(fatwa.arabicFatwa);
} catch (error) {
  console.error(error.message);
}
```

## API Configuration

### Model Selection

**Model:** `gemini-2.5-pro`

This model is chosen for its:
- Superior language understanding
- Ability to handle complex theological concepts
- Support for multiple languages (English and Arabic)
- Consistent structured output

### Configuration Parameters

```typescript
{
  model: "gemini-2.5-pro",
  contents: prompt,                    // User's question
  config: {
    systemInstruction: string,         // AI persona and guidelines
    responseMimeType: "application/json",
    responseSchema: fatwaSchema,       // JSON structure definition
    temperature: 0.5                   // Balance between creativity and accuracy
  }
}
```

#### Temperature Setting

**Value:** 0.5 (moderate)

- **Lower (0.0 - 0.3)**: More deterministic, factual responses
- **Current (0.5)**: Balanced approach suitable for scholarly content
- **Higher (0.7 - 1.0)**: More creative, varied responses

The temperature of 0.5 provides a good balance for generating scholarly fatwas that are accurate yet naturally written.

## Request Format

### System Instruction

The system instruction defines the AI's role and output requirements:

```typescript
const systemInstruction = `
You are a distinguished and learned Imam, an expert in Islamic jurisprudence (Fiqh). 
Your task is to issue a fatwa in response to the user's query. 

The fatwa must be delivered with the gravity, wisdom, and beautiful prose befitting 
a classical scholar. It must be structured clearly and presented in two languages: 
classical Arabic and formal English. 

The tone should be authoritative yet compassionate, rooted in traditional Islamic 
scholarship. 

Start each response with 'In the name of Allah, the Most Gracious, the Most Merciful.' 
and end with 'And Allah knows best.' in both languages.
`;
```

**Key Requirements:**
- Scholarly, authoritative tone
- Compassionate approach
- Bilingual output (Arabic + English)
- Consistent opening and closing phrases
- Grounded in Islamic tradition

### Response Schema

The schema ensures structured, predictable responses:

```typescript
const fatwaSchema = {
  type: Type.OBJECT,
  properties: {
    englishFatwa: {
      type: Type.STRING,
      description: "The complete fatwa text in formal, scholarly English."
    },
    arabicFatwa: {
      type: Type.STRING,
      description: "The complete fatwa text in classical, scholarly Arabic, properly vocalized."
    }
  },
  required: ["englishFatwa", "arabicFatwa"]
};
```

**Benefits:**
- Guarantees presence of both language versions
- Validates structure before parsing
- Reduces parsing errors
- Consistent data format

## Response Format

### Successful Response

```typescript
interface Fatwa {
  englishFatwa: string;
  arabicFatwa: string;
}
```

**Example Response:**

```json
{
  "englishFatwa": "In the name of Allah, the Most Gracious, the Most Merciful.\n\nRegarding your inquiry about fasting while traveling...\n\n...And Allah knows best.",
  "arabicFatwa": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nفِيمَا يَتَعَلَّقُ بِسُؤَالِكَ عَنِ الصِّيَامِ فِي السَّفَرِ...\n\n...وَاللَّهُ أَعْلَمُ"
}
```

### Response Structure

Both `englishFatwa` and `arabicFatwa` typically include:

1. **Opening Invocation**
   - English: "In the name of Allah, the Most Gracious, the Most Merciful."
   - Arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"

2. **Context and Question Acknowledgment**
   - Restatement or acknowledgment of the question

3. **Islamic Legal Analysis**
   - Evidence from Quran and Hadith
   - Scholarly opinions from different schools
   - Reasoning (Qiyas) if applicable

4. **Ruling Statement**
   - Clear, direct answer to the question
   - Conditions or exceptions if relevant

5. **Closing Statement**
   - English: "And Allah knows best."
   - Arabic: "وَاللَّهُ أَعْلَمُ"

### Response Processing

The service performs several validation steps:

```typescript
// 1. Check finish reason
if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
  // Handle special cases (SAFETY, RECITATION, etc.)
}

// 2. Validate response text
if (!jsonText) {
  throw new Error("Empty response");
}

// 3. Parse JSON
const parsedResponse = JSON.parse(jsonText);

// 4. Validate structure
if (!parsedResponse.englishFatwa || !parsedResponse.arabicFatwa) {
  throw new Error("Invalid structure");
}

// 5. Return typed response
return parsedResponse as Fatwa;
```

## Error Handling

### Error Types

#### 1. API Key Errors

**Cause:** Missing or invalid API key

**Detection:**
```typescript
if (!apiKey) {
  throw new Error("API key is missing. Please ensure it is configured correctly.");
}
```

**User Message:**
- "API key is missing. Please ensure it is configured correctly."
- "The provided API key is invalid. Please check your configuration."

#### 2. Rate Limit Errors

**Cause:** Exceeded API rate limits

**Detection:**
```typescript
if (errorMessage.includes('rate limit exceeded')) {
  userFriendlyMessage = "The service is currently busy due to high demand...";
}
```

**User Message:**
- "The service is currently busy due to high demand. Please wait a moment and try again."

#### 3. Safety Filters

**Cause:** Content blocked by Gemini's safety filters

**Detection:**
```typescript
if (finishReason === 'SAFETY') {
  throw new Error("The response was blocked due to safety concerns...");
}
```

**User Message:**
- "The response was blocked due to safety concerns. Please modify your question."

#### 4. Recitation Policy

**Cause:** Content blocked due to data recitation

**Detection:**
```typescript
if (finishReason === 'RECITATION') {
  throw new Error("The response was blocked due to a data recitation policy...");
}
```

**User Message:**
- "The response was blocked due to a data recitation policy. Please try a different question."

#### 5. Network Errors

**Cause:** Connection issues, timeouts

**Detection:**
```typescript
if (error instanceof TypeError) {
  userFriendlyMessage = "A network error occurred. Please check your internet connection...";
}
```

**User Message:**
- "A network error occurred. Please check your internet connection and try again."

#### 6. Server Errors

**Cause:** Internal Gemini API issues

**Detection:**
```typescript
if (errorMessage.includes('500') || errorMessage.includes('internal error')) {
  userFriendlyMessage = "The AI service is experiencing internal issues...";
}
```

**User Message:**
- "The AI service is experiencing internal issues. Please try again later."

### Error Handling Flow

```
API Call
    ↓
Error Occurs
    ↓
Caught in try/catch
    ↓
Error Type Detection
    ↓
User-Friendly Message Generation
    ↓
Error Thrown with Message
    ↓
Caught in App.tsx
    ↓
Displayed via ErrorMessage Component
```

## Rate Limiting

### Gemini API Limits

**Free Tier:**
- 60 requests per minute (RPM)
- 1,500 requests per day (RPD)
- 1 million tokens per minute (TPM)

**Paid Tiers:**
- Varies by plan
- Higher RPM and RPD
- Increased token limits

### Handling Rate Limits

The application provides user-friendly messages when rate limits are hit:

```typescript
if (errorMessage.includes('rate limit exceeded')) {
  userFriendlyMessage = 
    "The service is currently busy due to high demand. " +
    "Please wait a moment and try again.";
}
```

### Client-Side Rate Limiting (Future Enhancement)

Implement client-side rate limiting to prevent hitting API limits:

```typescript
class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private window: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    return this.requests.length < this.limit;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}

// Usage
const limiter = new RateLimiter(60, 60000); // 60 requests per minute

if (!limiter.canMakeRequest()) {
  throw new Error("Please wait before making another request.");
}
```

## Best Practices

### 1. Environment Variable Management

```bash
# .env.local (never commit this file)
GEMINI_API_KEY=your_actual_api_key_here
```

```javascript
// .gitignore
.env.local
*.local
```

### 2. Error Handling

Always wrap API calls in try/catch blocks:

```typescript
try {
  const fatwa = await generateFatwa(prompt);
  // Handle success
} catch (error) {
  // Handle error
  console.error('Fatwa generation failed:', error);
  // Show user-friendly message
}
```

### 3. Timeout Implementation

Consider adding timeouts for long-running requests:

```typescript
const timeoutMs = 30000; // 30 seconds

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
});

const result = await Promise.race([
  generateFatwa(prompt),
  timeoutPromise
]);
```

### 4. Retry Logic

Implement exponential backoff for transient errors:

```typescript
async function generateFatwaWithRetry(
  prompt: string, 
  maxRetries = 3
): Promise<Fatwa> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateFatwa(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 5. Request Validation

Validate input before making API calls:

```typescript
function validatePrompt(prompt: string): boolean {
  // Check minimum length
  if (prompt.trim().length < 10) {
    throw new Error('Question is too short. Please provide more details.');
  }
  
  // Check maximum length (avoid token limits)
  if (prompt.length > 1000) {
    throw new Error('Question is too long. Please be more concise.');
  }
  
  return true;
}
```

### 6. Response Caching

Cache common questions to reduce API calls:

```typescript
const cache = new Map<string, Fatwa>();

async function getCachedFatwa(prompt: string): Promise<Fatwa> {
  const cacheKey = prompt.trim().toLowerCase();
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  
  const fatwa = await generateFatwa(prompt);
  cache.set(cacheKey, fatwa);
  
  return fatwa;
}
```

### 7. Monitoring API Usage

Track API calls for monitoring and debugging:

```typescript
let apiCallCount = 0;
let apiCallErrors = 0;

async function generateFatwaWithMetrics(prompt: string): Promise<Fatwa> {
  apiCallCount++;
  const startTime = Date.now();
  
  try {
    const result = await generateFatwa(prompt);
    const duration = Date.now() - startTime;
    
    console.log(`API call successful. Duration: ${duration}ms`);
    return result;
  } catch (error) {
    apiCallErrors++;
    throw error;
  }
}
```

## API Security

### API Key Protection

**Never expose API keys in:**
- Client-side code (hardcoded)
- Version control (Git)
- Browser console logs
- Error messages

**Best Practices:**
1. Use environment variables
2. Load keys at build time
3. Consider backend proxy for production
4. Rotate keys regularly
5. Set up usage alerts in Google Cloud Console

### Backend Proxy Pattern (Recommended for Production)

```typescript
// Backend endpoint
app.post('/api/generate-fatwa', async (req, res) => {
  const { prompt } = req.body;
  
  // API key is stored on server, not exposed to client
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    const fatwa = await generateFatwa(prompt, apiKey);
    res.json(fatwa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Frontend calls backend instead of Gemini directly
const fatwa = await fetch('/api/generate-fatwa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt })
}).then(res => res.json());
```

## Testing

### Unit Testing the Service

```typescript
import { describe, it, expect, vi } from 'vitest';
import { generateFatwa } from './geminiService';

describe('geminiService', () => {
  it('should generate a fatwa with valid prompt', async () => {
    const result = await generateFatwa('What is the ruling on fasting?');
    
    expect(result).toHaveProperty('englishFatwa');
    expect(result).toHaveProperty('arabicFatwa');
    expect(result.englishFatwa).toContain('In the name of Allah');
    expect(result.arabicFatwa).toContain('بِسْمِ اللَّهِ');
  });

  it('should throw error with empty prompt', async () => {
    await expect(generateFatwa('')).rejects.toThrow();
  });

  it('should handle API errors gracefully', async () => {
    // Mock API failure
    vi.mock('@google/genai');
    
    await expect(generateFatwa('test')).rejects.toThrow();
  });
});
```

### Integration Testing

```typescript
describe('API Integration', () => {
  it('should complete full request/response cycle', async () => {
    const prompt = 'Explain the pillars of Islam';
    const fatwa = await generateFatwa(prompt);
    
    // Verify response structure
    expect(typeof fatwa.englishFatwa).toBe('string');
    expect(typeof fatwa.arabicFatwa).toBe('string');
    
    // Verify content quality
    expect(fatwa.englishFatwa.length).toBeGreaterThan(100);
    expect(fatwa.arabicFatwa.length).toBeGreaterThan(100);
  });
});
```

---

This API documentation should be updated as the Gemini API evolves or when new features are added to the service layer.
