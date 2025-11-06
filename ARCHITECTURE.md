# Architecture Documentation

## System Overview

Ai-Imam is a modern, single-page application (SPA) built with React and TypeScript that interfaces with Google's Gemini AI to generate Islamic legal rulings. The architecture follows a component-based design with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React Application                     │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │   App.tsx    │──│  Components  │              │  │
│  │  │   (Root)     │  │  - PromptForm│              │  │
│  │  │              │  │  - FatwaDisplay              │  │
│  │  │              │  │  - Loading   │              │  │
│  │  │              │  │  - Error     │              │  │
│  │  └──────┬───────┘  └──────────────┘              │  │
│  │         │                                          │  │
│  │         ▼                                          │  │
│  │  ┌──────────────┐                                 │  │
│  │  │   Services   │                                 │  │
│  │  │ (geminiService)                                │  │
│  │  └──────┬───────┘                                 │  │
│  └─────────┼──────────────────────────────────────────┘  │
└────────────┼──────────────────────────────────────────────┘
             │
             │ HTTPS
             ▼
┌─────────────────────────────────────────────────────────┐
│            Google Gemini API (External)                  │
│                  (gemini-2.5-pro)                        │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Application Layer

#### `App.tsx` - Root Component

**Responsibilities:**
- Application state management
- Orchestration of child components
- Loading message rotation
- Error handling coordination

**State Management:**
```typescript
{
  fatwa: Fatwa | null,           // Current fatwa response
  isLoading: boolean,             // Loading state flag
  error: string | null,           // Error message
  prompt: string,                 // User's current input
  currentPrompt: string,          // Prompt that generated current fatwa
  loadingMessage: string          // Dynamic loading message
}
```

**Key Features:**
- Uses React hooks (useState, useEffect, useCallback) for state management
- Implements loading message rotation with setInterval
- Provides example prompts for user guidance
- Handles form submission and API interaction

### 2. Component Layer

#### `PromptForm.tsx`

**Purpose:** User input interface

**Props:**
```typescript
{
  prompt: string,                 // Controlled input value
  onPromptChange: (value: string) => void,
  onSubmit: () => void,
  isLoading: boolean              // Disable during API calls
}
```

**Features:**
- Controlled textarea component
- Form validation (prevents empty submissions)
- Accessible with ARIA labels
- Disabled state during loading

#### `FatwaDisplay.tsx`

**Purpose:** Display and interact with generated fatwas

**Props:**
```typescript
{
  fatwa: Fatwa,                   // The fatwa object to display
  prompt: string                  // Original question
}
```

**Features:**
- Bilingual card layout (English + Arabic)
- Custom markdown renderer with syntax support
- Real-time text highlighting during TTS
- Voice selection for both languages
- Copy-to-clipboard functionality
- Intl.Segmenter for language-aware word splitting

**Advanced Features:**

1. **MarkdownRenderer Component**
   - Uses `Intl.Segmenter` API for proper word boundaries
   - Supports bold (`**text**`), italic (`*text*`), and combined formatting
   - Language-aware segmentation (handles Arabic diacritics correctly)
   - Fallback for older browsers using regex split

2. **Text-to-Speech Integration**
   - Uses Web Speech API (SpeechSynthesis)
   - Dynamic voice loading and selection
   - Word-level highlighting synchronized with speech
   - Proper cleanup on component unmount

3. **State Management**
   ```typescript
   {
     isCopied: boolean,           // Copy success feedback
     highlight: {                 // Current TTS position
       lang: 'english' | 'arabic',
       charIndex: number
     } | null,
     englishVoices: SpeechSynthesisVoice[],
     arabicVoices: SpeechSynthesisVoice[],
     selectedEnglishVoice: string,
     selectedArabicVoice: string
   }
   ```

#### `LoadingSpinner.tsx`

**Purpose:** Visual feedback during API calls

**Features:**
- Animated SVG (eight-pointed Islamic star)
- Linear gradient animation
- Dynamic message display from parent
- Semantic HTML with ARIA attributes

#### `ErrorMessage.tsx`

**Purpose:** User-friendly error display

**Features:**
- Color-coded error presentation
- Icon-based visual feedback
- Accessible with proper ARIA roles

### 3. Service Layer

#### `geminiService.ts`

**Purpose:** Abstraction layer for Google Gemini API

**Exports:**
- `generateFatwa(prompt: string): Promise<Fatwa>`

**Key Features:**

1. **Schema Validation**
   ```typescript
   const fatwaSchema = {
     type: Type.OBJECT,
     properties: {
       englishFatwa: { type: Type.STRING, ... },
       arabicFatwa: { type: Type.STRING, ... }
     },
     required: ["englishFatwa", "arabicFatwa"]
   }
   ```

2. **System Instruction**
   - Sets AI persona as learned Imam
   - Defines tone and style requirements
   - Ensures consistent structure
   - Mandates bilingual responses

3. **Error Handling**
   - API key validation
   - Rate limit detection
   - Safety filter handling
   - Network error management
   - User-friendly error messages

4. **Configuration**
   - Model: `gemini-2.5-pro`
   - Temperature: `0.5` (balanced creativity/accuracy)
   - Response format: JSON with schema validation
   - MIME type: `application/json`

### 4. Type System

#### `types.ts`

Centralized type definitions ensure type safety across the application:

```typescript
export interface Fatwa {
  englishFatwa: string;   // Complete fatwa in formal English
  arabicFatwa: string;    // Complete fatwa in classical Arabic
}
```

## Data Flow

### User Query Flow

```
User Input
    ↓
PromptForm (controlled component)
    ↓
App.tsx (handleGenerateFatwa)
    ↓
geminiService.generateFatwa()
    ↓
Google Gemini API
    ↓
JSON Response (validated against schema)
    ↓
geminiService (parse & validate)
    ↓
App.tsx (setState with Fatwa)
    ↓
FatwaDisplay (render bilingual fatwa)
```

### Error Flow

```
Error Occurs (any layer)
    ↓
geminiService (catch & transform)
    ↓
User-friendly error message
    ↓
App.tsx (setError)
    ↓
ErrorMessage component (display)
```

### Loading State Flow

```
Submit Button Clicked
    ↓
App.tsx (setIsLoading: true)
    ↓
LoadingSpinner rendered
    ↓
useEffect starts message rotation
    ↓
API call completes
    ↓
App.tsx (setIsLoading: false)
    ↓
useEffect cleanup (stop rotation)
```

## State Management Strategy

### Local Component State

The application uses **React's built-in state management** (useState, useEffect) rather than external libraries like Redux. This is appropriate because:

1. **Simple State Structure**: State is primarily managed in `App.tsx`
2. **Limited Prop Drilling**: Maximum 2 levels of component nesting
3. **No Complex State Logic**: No need for reducers or actions
4. **Performance**: Callbacks are memoized with `useCallback`

### State Optimization

```typescript
// Memoized callback to prevent unnecessary re-renders
const handleGenerateFatwa = useCallback(async () => {
  // Implementation
}, [prompt]);

// Memoized markdown parsing in FatwaDisplay
const paragraphs = useMemo(() => {
  // Heavy parsing logic
}, [text, lang]);
```

## Performance Considerations

### Build-Time Optimizations

1. **Code Splitting**: Vite automatically splits code at dynamic imports
2. **Tree Shaking**: Unused exports are eliminated
3. **Minification**: Production builds are minified
4. **Asset Hashing**: Cache busting for static assets

### Runtime Optimizations

1. **Memoization**: Heavy computations are memoized
2. **Lazy State Updates**: Batch state updates when possible
3. **Cleanup Effects**: Proper cleanup in useEffect hooks
4. **Efficient Re-renders**: React.memo for pure components

### Network Optimization

1. **Single API Call**: One request per fatwa
2. **Structured Output**: JSON response reduces parsing overhead
3. **Error Recovery**: Graceful degradation on API failures

## Security Architecture

### API Key Management

- API keys stored in environment variables (`.env.local`)
- Never committed to version control
- Injected at build time via Vite
- Not exposed in client-side code (processed by Vite)

### Content Security

1. **Input Validation**: Prevents empty submissions
2. **XSS Prevention**: React's built-in escaping
3. **Sanitized Output**: Markdown rendering uses dangerouslySetInnerHTML carefully
4. **API Response Validation**: Schema validation before rendering

### Safety Filters

The Gemini API includes built-in safety filters:
- Blocks harmful content
- Prevents misinformation propagation
- Handles inappropriate queries gracefully

## Browser Compatibility

### Required Features

- **ES2022**: Modern JavaScript features
- **React 19**: Latest React features
- **Web Speech API**: For text-to-speech (progressive enhancement)
- **Intl.Segmenter**: For proper word boundaries (with fallback)

### Graceful Degradation

```typescript
// Segmenter with fallback
const segmenter = window.Intl?.Segmenter 
  ? new Intl.Segmenter(lang, { granularity: 'word' })
  : null;

if (segmenter) {
  // Modern approach
} else {
  // Regex fallback
}
```

## Deployment Architecture

### Static Hosting (Recommended)

```
Vite Build
    ↓
dist/ directory
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── ...
    ↓
Deploy to:
- Netlify
- Vercel  
- GitHub Pages
- AWS S3 + CloudFront
```

### Environment Variables in Production

Different platforms handle environment variables differently:

- **Netlify**: Set in Dashboard → Site Settings → Environment
- **Vercel**: Set in Dashboard → Project Settings → Environment Variables
- **GitHub Pages**: Use GitHub Secrets in Actions

## Scalability Considerations

### Current Limitations

1. **No State Persistence**: Refresh clears history
2. **No User Accounts**: Anonymous usage only
3. **No Fatwa History**: Each session is isolated
4. **Rate Limits**: Subject to Gemini API limits

### Future Scalability Enhancements

1. **Add Database**: Store fatwa history (e.g., Firebase, Supabase)
2. **User Authentication**: Track personal fatwa collections
3. **Caching**: Cache common questions to reduce API calls
4. **Backend API**: Proxy requests through a backend to hide API keys
5. **Rate Limiting**: Implement client-side rate limiting

## Internationalization (i18n)

### Current Support

- **English**: UI and fatwa content
- **Arabic**: Fatwa content and some UI elements
- **Direction**: RTL support for Arabic text

### Future Enhancements

- Full UI translation
- Additional language support (Urdu, Turkish, etc.)
- Language detection based on user input
- Multi-language voice synthesis

## Testing Strategy

### Current State

No automated tests are currently implemented.

### Recommended Testing Approach

1. **Unit Tests**: Jest + React Testing Library
   - Component rendering
   - User interactions
   - State management

2. **Integration Tests**: 
   - API service mocking
   - Component integration
   - Error handling flows

3. **E2E Tests**: Playwright or Cypress
   - Complete user journeys
   - TTS functionality
   - Cross-browser compatibility

4. **Accessibility Tests**: axe-core
   - ARIA attributes
   - Keyboard navigation
   - Screen reader compatibility

## Monitoring and Observability

### Current State

Basic console logging for errors.

### Recommended Additions

1. **Error Tracking**: Sentry or LogRocket
2. **Analytics**: Google Analytics or Plausible
3. **Performance Monitoring**: Web Vitals
4. **User Behavior**: Hotjar or FullStory

## Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Make changes
# → Vite HMR updates browser

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

Recommended tools to add:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit checks

## Maintenance Considerations

### Dependency Updates

- Regular updates to React, Vite, TypeScript
- Monitor Gemini API changes and updates
- Check for security vulnerabilities with `npm audit`

### API Changes

Watch for:
- Gemini API version updates
- Schema changes
- New model releases
- Rate limit adjustments

### Browser API Updates

- Web Speech API improvements
- Intl.Segmenter adoption
- New CSS features for better styling

---

This architecture is designed to be simple, maintainable, and scalable while providing a solid foundation for an AI-powered Islamic educational tool.
