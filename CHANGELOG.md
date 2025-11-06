# Changelog

All notable changes to the Ai-Imam project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project documentation (README, ARCHITECTURE, API, DEPLOYMENT, CONTRIBUTING)
- LICENSE file (MIT License)
- Security policy documentation

## [0.1.0] - 2024-11-06

### Added
- Initial application structure with React 19.2 and TypeScript
- Google Gemini 2.5 Pro API integration for fatwa generation
- Bilingual fatwa display (English and Arabic)
- Text-to-speech functionality with voice selection
- Real-time word highlighting during TTS playback
- Copy to clipboard functionality
- Responsive UI with mobile support
- Loading spinner with rotating messages
- Error handling with user-friendly messages
- Example prompts for user guidance
- Custom markdown renderer with support for bold/italic
- Language-aware word segmentation using Intl.Segmenter
- Vite build configuration with environment variable injection
- Support for RTL text direction in Arabic
- Accessible UI with ARIA labels and keyboard navigation

### Components
- `App.tsx` - Root application component with state management
- `PromptForm.tsx` - User input form
- `FatwaDisplay.tsx` - Bilingual fatwa renderer with TTS
- `LoadingSpinner.tsx` - Animated loading indicator
- `ErrorMessage.tsx` - Error display component
- `geminiService.ts` - API integration service

### Technical
- Vite 6.2 for fast builds and HMR
- TypeScript 5.8 with strict type checking
- React hooks for state management
- JSON schema validation for API responses
- Temperature setting of 0.5 for balanced AI output
- Comprehensive error handling with specific error types
- System instructions for scholarly tone

### Documentation
- JSDoc comments for all components and functions
- Inline code documentation
- Basic README with setup instructions

## Release Notes

### Version 0.1.0 - Initial Release

This is the first release of Ai-Imam, an AI-powered virtual Imam that delivers Islamic legal rulings (fatwas) in a scholarly style. The application provides a modern, accessible interface for asking questions about Islamic jurisprudence and receiving structured responses in both English and Arabic.

**Key Features:**
- AI-generated fatwas using Google Gemini 2.5 Pro
- Bilingual output with proper Arabic vocalization
- Text-to-speech with synchronized highlighting
- Mobile-responsive design
- Comprehensive error handling

**Known Limitations:**
- No fatwa history or persistence
- No user authentication
- Subject to Gemini API rate limits
- Requires active internet connection

**Browser Compatibility:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (TTS may have limited voices)

---

## How to Update This Changelog

When making changes to the project:

1. Add entries under `[Unreleased]` section
2. Group changes by type: Added, Changed, Deprecated, Removed, Fixed, Security
3. Use clear, user-friendly language
4. Link to relevant issues or PRs
5. When releasing, move unreleased changes to a new version section with date

### Change Type Definitions

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes

### Version Number Guidelines

Given a version number MAJOR.MINOR.PATCH:

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

### Example Entry

```markdown
## [1.0.0] - 2024-12-01

### Added
- User authentication with Google Sign-In (#45)
- Fatwa history page to view past queries (#47)
- Export fatwa as PDF feature (#50)

### Changed
- Improved error messages for network failures (#52)
- Updated UI with dark mode support (#48)

### Fixed
- Text-to-speech not working in Firefox (#55)
- Arabic text rendering issues on iOS (#56)

### Security
- Updated dependencies to fix security vulnerabilities (#60)
```

---

[Unreleased]: https://github.com/Brian125bot/ai_imam/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Brian125bot/ai_imam/releases/tag/v0.1.0
